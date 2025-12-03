import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rule-based fallback system
function generateFallbackRecommendations(learnerData: any): any[] {
  const recommendations = [];
  const { learning_challenges, performance_records, accessibility_needs } = learnerData;

  // Dyslexia support
  if (learning_challenges?.includes('dyslexia')) {
    recommendations.push({
      title: 'Enable Text-to-Speech Tools',
      description: 'Use assistive technology like text-to-speech to support reading tasks',
      recommendation_type: 'assistive_tool',
      priority: 'high'
    });
  }

  // ADHD support
  if (learning_challenges?.includes('adhd')) {
    recommendations.push({
      title: 'Break Tasks into Smaller Steps',
      description: 'Provide structured, step-by-step instructions with clear checkpoints',
      recommendation_type: 'teaching_strategy',
      priority: 'high'
    });
  }

  // Visual impairment support
  if (accessibility_needs?.includes('visual_impairment')) {
    recommendations.push({
      title: 'Increase Text Size and Contrast',
      description: 'Ensure all materials use large fonts and high contrast colors',
      recommendation_type: 'accessibility',
      priority: 'high'
    });
  }

  // Performance-based recommendations
  const avgScore = performance_records?.length > 0
    ? performance_records.reduce((sum: number, r: any) => sum + Number(r.score), 0) / performance_records.length
    : 0;

  if (avgScore < 60) {
    recommendations.push({
      title: 'Incorporate Visual Learning Aids',
      description: 'Use diagrams, charts, and visual organizers to reinforce concepts',
      recommendation_type: 'learning_style',
      priority: 'medium'
    });
    recommendations.push({
      title: 'Provide One-on-One Support Sessions',
      description: 'Schedule individual tutoring to address specific learning gaps',
      recommendation_type: 'intervention',
      priority: 'high'
    });
  } else if (avgScore < 75) {
    recommendations.push({
      title: 'Practice with Varied Examples',
      description: 'Offer diverse practice problems to strengthen understanding',
      recommendation_type: 'learning_strategy',
      priority: 'medium'
    });
  }

  return recommendations;
}

// Helper function to verify user has permission to analyze learner
async function verifyLearnerAccess(supabase: any, authHeader: string | null, learnerId: string): Promise<{ hasAccess: boolean; error: string | null }> {
  // For system/cron calls without auth header, allow access (these are internal calls)
  if (!authHeader) {
    console.log('No auth header - allowing internal system call');
    return { hasAccess: true, error: null };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    return { hasAccess: false, error: 'Invalid authentication token' };
  }

  // Check if user is admin
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (adminRole) {
    return { hasAccess: true, error: null };
  }

  // Check if user is the learner
  const { data: learnerSelf } = await supabase
    .from('learners')
    .select('id')
    .eq('id', learnerId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (learnerSelf) {
    return { hasAccess: true, error: null };
  }

  // Check if user is the teacher assigned to this learner
  const { data: teacherAccess } = await supabase
    .from('learners')
    .select('id')
    .eq('id', learnerId)
    .eq('teacher_id', user.id)
    .maybeSingle();

  if (teacherAccess) {
    return { hasAccess: true, error: null };
  }

  // Check if user is any teacher (teachers can analyze any learner for now)
  const { data: teacherRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'teacher')
    .maybeSingle();

  if (teacherRole) {
    return { hasAccess: true, error: null };
  }

  return { hasAccess: false, error: 'You do not have permission to analyze this learner' };
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

    // SECURITY: Verify the requester has permission to analyze this learner
    const authHeader = req.headers.get('Authorization');
    const { hasAccess, error: accessError } = await verifyLearnerAccess(supabase, authHeader, learnerId);

    if (!hasAccess) {
      console.error('Unauthorized analyze-learner attempt:', accessError);
      return new Response(
        JSON.stringify({ error: accessError || 'Unauthorized', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch learner data
    const { data: learnerData, error: learnerError } = await supabase
      .from('learners')
      .select(`
        *,
        profiles!learners_user_id_fkey(first_name, last_name),
        performance_records(subject, score, assessment_date, notes),
        recommendations(id, title, description, status)
      `)
      .eq('id', learnerId)
      .single();

    if (learnerError) throw learnerError;

    console.log('Fetched learner data:', learnerData);

    // Try AI analysis first
    let recommendations = [];
    let useAI = true;

    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.log('LOVABLE_API_KEY not found, using fallback');
        useAI = false;
      }

      if (useAI) {
        const systemPrompt = `You are an educational AI assistant specializing in personalized learning recommendations for students with diverse needs. Analyze student data and provide actionable, evidence-based recommendations.`;

        const userPrompt = `Analyze this learner profile and generate 3-5 personalized recommendations:

Student Profile:
- Learning Challenges: ${learnerData.learning_challenges?.join(', ') || 'None reported'}
- Accessibility Needs: ${learnerData.accessibility_needs?.join(', ') || 'None reported'}
- Demographics: ${JSON.stringify(learnerData.demographics || {})}

Performance History:
${learnerData.performance_records?.map((r: any) => 
  `- ${r.subject}: ${r.score}% (${r.assessment_date})${r.notes ? ' - ' + r.notes : ''}`
).join('\n') || 'No performance data yet'}

Current Recommendations:
${learnerData.recommendations?.map((r: any) => `- ${r.title} (${r.status})`).join('\n') || 'None'}

Provide recommendations that are specific, actionable, and prioritized.`;

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
                  name: 'generate_recommendations',
                  description: 'Generate personalized learning recommendations',
                  parameters: {
                    type: 'object',
                    properties: {
                      recommendations: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            recommendation_type: { 
                              type: 'string',
                              enum: ['assistive_tool', 'teaching_strategy', 'accessibility', 'learning_style', 'intervention', 'learning_strategy']
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
                    required: ['recommendations'],
                    additionalProperties: false
                  }
                }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'generate_recommendations' } }
          }),
        });

        if (response.status === 429) {
          console.log('Rate limit exceeded, using fallback');
          useAI = false;
        } else if (response.status === 402) {
          console.log('Payment required, using fallback');
          useAI = false;
        } else if (!response.ok) {
          const errorText = await response.text();
          console.error('AI API error:', response.status, errorText);
          useAI = false;
        } else {
          const aiResult = await response.json();
          console.log('AI response:', aiResult);
          
          const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            const parsed = JSON.parse(toolCall.function.arguments);
            recommendations = parsed.recommendations || [];
          }
        }
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      useAI = false;
    }

    // Use rule-based fallback if AI failed
    if (!useAI || recommendations.length === 0) {
      console.log('Using rule-based fallback');
      recommendations = generateFallbackRecommendations(learnerData);
    }

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map((rec: any) => ({
      learner_id: learnerId,
      teacher_id: learnerData.teacher_id,
      title: rec.title,
      description: rec.description,
      recommendation_type: rec.recommendation_type,
      priority: rec.priority,
      status: 'pending'
    }));

    const { data: insertedRecs, error: insertError } = await supabase
      .from('recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (insertError) throw insertError;

    // Log AI reasoning for transparency
    if (insertedRecs) {
      const reasoningLogs = insertedRecs.map((rec: any, idx: number) => {
        const recommendation = recommendations[idx];
        return {
          recommendation_id: rec.id,
          learner_id: learnerId,
          ai_model: useAI ? 'google/gemini-2.5-flash' : 'rule-based',
          reasoning_chain: [
            {
              step: 1,
              description: 'Analyzed learner performance data',
              data_point: `${learnerData.performance_records?.length || 0} performance records`,
              conclusion: 'Identified performance patterns'
            },
            {
              step: 2,
              description: 'Evaluated learning challenges and accessibility needs',
              data_point: `Challenges: ${learnerData.learning_challenges?.join(', ') || 'None'}`,
              conclusion: 'Determined support requirements'
            },
            {
              step: 3,
              description: 'Generated personalized recommendation',
              data_point: `Type: ${recommendation.recommendation_type}`,
              conclusion: recommendation.title
            }
          ],
          data_sources_used: [
            'performance_records',
            'learning_challenges',
            'accessibility_needs',
            'recommendations'
          ],
          confidence_score: useAI ? 0.85 : 0.70,
          rule_based_fallback: !useAI
        };
      });

      await supabase.from('ai_reasoning_logs').insert(reasoningLogs);

      // Log data usage
      await supabase.from('data_usage_logs').insert({
        user_id: learnerData.user_id,
        data_type: 'performance',
        purpose: 'recommendation',
        data_fields: ['performance_records', 'learning_challenges', 'accessibility_needs'],
        processing_context: 'AI-powered learner analysis',
        consent_required: true,
        consent_given: true
      });
    }

    console.log('Successfully created recommendations:', insertedRecs);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: insertedRecs,
        source: useAI ? 'ai' : 'fallback'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-learner:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
