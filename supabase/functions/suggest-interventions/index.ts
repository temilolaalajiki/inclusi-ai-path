import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rule-based intervention fallback
function generateFallbackInterventions(learnerData: any): any[] {
  const interventions = [];
  const { learning_challenges, recommendations, feedback } = learnerData;

  // Identify patterns from feedback
  const negativeRecs = recommendations?.filter((r: any) => 
    feedback?.some((f: any) => f.recommendation_id === r.id && f.rating === 'not_helpful')
  );

  if (negativeRecs?.length > 0) {
    interventions.push({
      title: 'Review and Adjust Current Strategies',
      description: 'Several recommendations received negative feedback. Consider alternative approaches tailored to student preferences.',
      recommendation_type: 'intervention',
      priority: 'high'
    });
  }

  // ADHD-specific interventions
  if (learning_challenges?.includes('adhd')) {
    interventions.push({
      title: 'Implement Movement Breaks',
      description: 'Schedule short 5-minute movement breaks every 20 minutes during instruction',
      recommendation_type: 'teaching_strategy',
      priority: 'high'
    });
    interventions.push({
      title: 'Use Visual Timers',
      description: 'Provide visual countdown timers to help with time management and task completion',
      recommendation_type: 'assistive_tool',
      priority: 'medium'
    });
  }

  // Autism spectrum support
  if (learning_challenges?.includes('autism')) {
    interventions.push({
      title: 'Create Structured Routines',
      description: 'Establish predictable daily schedules with visual schedules and clear transitions',
      recommendation_type: 'teaching_strategy',
      priority: 'high'
    });
  }

  // General intervention strategies
  interventions.push({
    title: 'Peer Mentoring Program',
    description: 'Pair student with a peer mentor for collaborative learning and social support',
    recommendation_type: 'intervention',
    priority: 'medium'
  });

  return interventions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { learnerId } = await req.json();
    
    if (!learnerId) {
      throw new Error('learnerId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch comprehensive learner data including feedback
    const { data: learnerData, error: learnerError } = await supabase
      .from('learners')
      .select(`
        *,
        profiles!learners_user_id_fkey(first_name, last_name),
        performance_records(subject, score, assessment_date),
        recommendations(id, title, description, status, created_at),
        feedback:feedback(recommendation_id, rating, comment)
      `)
      .eq('id', learnerId)
      .single();

    if (learnerError) throw learnerError;

    console.log('Fetched learner data for interventions:', learnerData);

    let interventions = [];
    let useAI = true;

    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.log('LOVABLE_API_KEY not found, using fallback');
        useAI = false;
      }

      if (useAI) {
        const systemPrompt = `You are an educational intervention specialist. Generate personalized, evidence-based intervention strategies for students with diverse learning needs. Focus on practical, actionable strategies teachers can implement.`;

        const feedbackSummary = learnerData.feedback?.map((f: any) => 
          `${f.rating}: ${f.comment || 'No comment'}`
        ).join('\n') || 'No feedback yet';

        const userPrompt = `Generate 3-5 intervention strategies for this student:

Student Profile:
- Learning Challenges: ${learnerData.learning_challenges?.join(', ') || 'None'}
- Accessibility Needs: ${learnerData.accessibility_needs?.join(', ') || 'None'}

Current Recommendations (${learnerData.recommendations?.length || 0}):
${learnerData.recommendations?.slice(0, 5).map((r: any) => 
  `- ${r.title} (${r.status})`
).join('\n') || 'None'}

Feedback History:
${feedbackSummary}

Recent Performance:
${learnerData.performance_records?.slice(-3).map((r: any) => 
  `- ${r.subject}: ${r.score}%`
).join('\n') || 'No data'}

Suggest intervention strategies that build on successful recommendations and address areas where previous suggestions were not helpful.`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            tools: [
              {
                type: 'function',
                function: {
                  name: 'generate_interventions',
                  description: 'Generate personalized intervention strategies',
                  parameters: {
                    type: 'object',
                    properties: {
                      interventions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            recommendation_type: { 
                              type: 'string',
                              enum: ['assistive_tool', 'teaching_strategy', 'intervention', 'learning_strategy']
                            },
                            priority: { 
                              type: 'string', 
                              enum: ['low', 'medium', 'high'] 
                            }
                          },
                          required: ['title', 'description', 'recommendation_type', 'priority'],
                          additionalProperties: false
                        }
                      }
                    },
                    required: ['interventions'],
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'generate_interventions' } }
          }),
        });

        if (response.status === 429 || response.status === 402) {
          console.log('Rate limit or payment error, using fallback');
          useAI = false;
        } else if (!response.ok) {
          const errorText = await response.text();
          console.error('AI API error:', response.status, errorText);
          useAI = false;
        } else {
          const aiResult = await response.json();
          const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            const parsed = JSON.parse(toolCall.function.arguments);
            interventions = parsed.interventions || [];
          }
        }
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      useAI = false;
    }

    if (!useAI || interventions.length === 0) {
      console.log('Using rule-based fallback for interventions');
      interventions = generateFallbackInterventions(learnerData);
    }

    // Store interventions as recommendations
    const interventionsToInsert = interventions.map((int: any) => ({
      learner_id: learnerId,
      teacher_id: learnerData.teacher_id,
      title: int.title,
      description: int.description,
      recommendation_type: int.recommendation_type,
      priority: int.priority,
      status: 'pending'
    }));

    const { data: insertedInts, error: insertError } = await supabase
      .from('recommendations')
      .insert(interventionsToInsert)
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        interventions: insertedInts,
        source: useAI ? 'ai' : 'fallback'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-interventions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
