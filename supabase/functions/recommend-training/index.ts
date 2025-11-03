import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rule-based training recommendations
function generateFallbackRecommendations(teacherData: any): any[] {
  const recommendations = [];
  const { usedInterventions, ineffectiveTypes, learnerChallenges } = teacherData;

  // Analyze most used intervention types
  const interventionCounts: Record<string, number> = {};
  usedInterventions?.forEach((rec: any) => {
    interventionCounts[rec.recommendation_type] = (interventionCounts[rec.recommendation_type] || 0) + 1;
  });

  // Recommend training for underused intervention types
  const lowUsageTypes = Object.entries(interventionCounts)
    .filter(([_, count]) => (count as number) < 3)
    .map(([type]) => type);

  if (lowUsageTypes.includes('assistive_tool')) {
    recommendations.push({
      training_id: 'accessibility-tools',
      reason: 'Low usage of assistive technology interventions',
      priority: 'high'
    });
  }

  // Recommend training based on ineffective recommendations
  if (ineffectiveTypes?.includes('teaching_strategy')) {
    recommendations.push({
      training_id: 'differentiation-advanced',
      reason: 'Teaching strategies showing low effectiveness',
      priority: 'high'
    });
  }

  // Recommend training based on common learner challenges
  const challengeCounts: Record<string, number> = {};
  learnerChallenges?.forEach((challenge: string) => {
    challengeCounts[challenge] = (challengeCounts[challenge] || 0) + 1;
  });

  if (challengeCounts['dyslexia'] && challengeCounts['dyslexia'] >= 2) {
    recommendations.push({
      training_id: 'dyslexia-support',
      reason: 'Multiple students with dyslexia in your class',
      priority: 'high'
    });
  }

  if (challengeCounts['adhd'] && challengeCounts['adhd'] >= 2) {
    recommendations.push({
      training_id: 'adhd-management',
      reason: 'Multiple students with ADHD requiring support',
      priority: 'high'
    });
  }

  // Always recommend visual learning techniques
  if (!interventionCounts['learning_style'] || interventionCounts['learning_style'] < 5) {
    recommendations.push({
      training_id: 'visual-learning',
      reason: 'Enhance visual learning strategies',
      priority: 'medium'
    });
  }

  return recommendations.slice(0, 5);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teacherId } = await req.json();

    if (!teacherId) {
      throw new Error('teacherId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch teacher's learners and their data
    const { data: learners } = await supabase
      .from('learners')
      .select(`
        id,
        learning_challenges,
        accessibility_needs,
        recommendations(
          id, 
          recommendation_type, 
          status,
          created_at
        ),
        feedback:feedback(rating)
      `)
      .eq('teacher_id', teacherId);

    // Fetch teacher's training history
    const { data: completedTraining } = await supabase
      .from('teacher_training')
      .select('training_title')
      .eq('teacher_id', teacherId)
      .eq('completed', true);

    console.log('Fetched teacher data for recommendations');

    // Analyze teacher's intervention patterns
    const usedInterventions = learners?.flatMap(l => l.recommendations || []) || [];
    const learnerChallenges = learners?.flatMap(l => [...(l.learning_challenges || []), ...(l.accessibility_needs || [])]) || [];
    
    // Find ineffective intervention types
    const ineffectiveTypes: string[] = [];
    const typeEffectiveness: Record<string, { total: number; negative: number }> = {};
    
    learners?.forEach(learner => {
      learner.recommendations?.forEach((rec: any) => {
        if (!typeEffectiveness[rec.recommendation_type]) {
          typeEffectiveness[rec.recommendation_type] = { total: 0, negative: 0 };
        }
        typeEffectiveness[rec.recommendation_type].total++;
        
        const negativeFeedback = learner.feedback?.some((f: any) => f.rating === 'not_helpful');
        if (negativeFeedback) {
          typeEffectiveness[rec.recommendation_type].negative++;
        }
      });
    });

    Object.entries(typeEffectiveness).forEach(([type, stats]) => {
      if (stats.total > 0 && (stats.negative / stats.total) > 0.5) {
        ineffectiveTypes.push(type);
      }
    });

    const teacherData = {
      usedInterventions,
      ineffectiveTypes,
      learnerChallenges,
      completedTraining: completedTraining?.map(t => t.training_title) || []
    };

    let trainingRecommendations = [];
    let useAI = true;

    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.log('LOVABLE_API_KEY not found, using fallback');
        useAI = false;
      }

      if (useAI) {
        const systemPrompt = `You are a professional development advisor for teachers. Analyze teacher performance data and recommend relevant training courses to improve their effectiveness with diverse learners.`;

        const userPrompt = `Analyze this teacher's data and recommend 3-5 professional development courses:

Intervention Usage:
${Object.entries(usedInterventions.reduce((acc: any, rec: any) => {
  acc[rec.recommendation_type] = (acc[rec.recommendation_type] || 0) + 1;
  return acc;
}, {})).map(([type, count]) => `- ${type}: ${count} times`).join('\n')}

Learner Challenges (frequency):
${Object.entries(learnerChallenges.reduce((acc: any, ch: string) => {
  acc[ch] = (acc[ch] || 0) + 1;
  return acc;
}, {})).map(([ch, count]) => `- ${ch}: ${count} students`).join('\n')}

Ineffective Intervention Types:
${ineffectiveTypes.length > 0 ? ineffectiveTypes.join(', ') : 'None identified'}

Already Completed Training:
${teacherData.completedTraining.join(', ') || 'None'}

Recommend training that addresses skill gaps and improves effectiveness.`;

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
                  name: 'recommend_training',
                  description: 'Recommend professional development training',
                  parameters: {
                    type: 'object',
                    properties: {
                      recommendations: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            training_id: { 
                              type: 'string',
                              enum: ['dyslexia-support', 'adhd-management', 'visual-learning', 'accessibility-tools', 'differentiation-advanced']
                            },
                            reason: { type: 'string' },
                            priority: { type: 'string', enum: ['low', 'medium', 'high'] }
                          },
                          required: ['training_id', 'reason', 'priority']
                        }
                      }
                    },
                    required: ['recommendations']
                  }
                }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'recommend_training' } }
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
            trainingRecommendations = parsed.recommendations || [];
          }
        }
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      useAI = false;
    }

    if (!useAI || trainingRecommendations.length === 0) {
      console.log('Using rule-based fallback for training recommendations');
      trainingRecommendations = generateFallbackRecommendations(teacherData);
    }

    // Map training IDs to actual training resources
    const trainingIds = trainingRecommendations.map((r: any) => {
      const idMap: Record<string, string> = {
        'dyslexia-support': 'Supporting Students with Dyslexia',
        'adhd-management': 'ADHD: Classroom Management Strategies',
        'visual-learning': 'Visual Learning Techniques',
        'accessibility-tools': 'Accessibility Tools and Technology',
        'differentiation-advanced': 'Differentiated Instruction Advanced'
      };
      return idMap[r.training_id] || r.training_id;
    });

    const { data: trainingResources } = await supabase
      .from('training_resources')
      .select('*')
      .in('title', trainingIds);

    const enrichedRecommendations = trainingRecommendations.map((rec: any) => {
      const resource = trainingResources?.find(t => 
        t.title.includes(rec.training_id.replace(/-/g, ' '))
      );
      return {
        ...rec,
        resource
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: enrichedRecommendations,
        source: useAI ? 'ai' : 'fallback',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in recommend-training:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});