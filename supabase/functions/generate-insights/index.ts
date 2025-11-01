import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rule-based insights fallback
function generateFallbackInsights(systemData: any): any {
  const { learners, performance, recommendations, feedback } = systemData;

  // Calculate basic metrics
  const totalLearners = learners?.length || 0;
  const avgPerformance = performance?.length > 0
    ? performance.reduce((sum: number, p: any) => sum + Number(p.score), 0) / performance.length
    : 0;

  // Identify common challenges
  const challengeCounts: Record<string, number> = {};
  learners?.forEach((l: any) => {
    l.learning_challenges?.forEach((c: string) => {
      challengeCounts[c] = (challengeCounts[c] || 0) + 1;
    });
  });

  const topChallenges = Object.entries(challengeCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([challenge, count]) => ({ challenge, count }));

  // Recommendation effectiveness
  const implementedRecs = recommendations?.filter((r: any) => r.status === 'implemented').length || 0;
  const totalRecs = recommendations?.length || 0;
  const implementationRate = totalRecs > 0 ? (implementedRecs / totalRecs) * 100 : 0;

  // Feedback analysis
  const helpfulFeedback = feedback?.filter((f: any) => f.rating === 'helpful').length || 0;
  const totalFeedback = feedback?.length || 1;
  const satisfactionRate = (helpfulFeedback / totalFeedback) * 100;

  return {
    summary: {
      total_learners: totalLearners,
      average_performance: Math.round(avgPerformance),
      implementation_rate: Math.round(implementationRate),
      satisfaction_rate: Math.round(satisfactionRate)
    },
    trends: [
      {
        category: 'Common Challenges',
        insight: `Top learning challenges: ${topChallenges.map(t => t.challenge).join(', ')}`,
        recommendation: 'Focus professional development on supporting these specific challenges'
      },
      {
        category: 'Performance',
        insight: avgPerformance < 70 
          ? 'System-wide performance needs improvement' 
          : 'Overall performance is satisfactory',
        recommendation: avgPerformance < 70 
          ? 'Implement targeted intervention programs and increase support resources'
          : 'Continue current strategies while monitoring for regression'
      },
      {
        category: 'Recommendation Effectiveness',
        insight: `${Math.round(implementationRate)}% of recommendations have been implemented`,
        recommendation: implementationRate < 50 
          ? 'Provide more training and support for teachers to implement recommendations'
          : 'Maintain current implementation support while gathering effectiveness data'
      }
    ],
    priorities: [
      {
        area: 'Professional Development',
        action: 'Train teachers on evidence-based strategies for top 3 learning challenges',
        impact: 'high'
      },
      {
        area: 'Resource Allocation',
        action: 'Invest in assistive technology and accessibility tools',
        impact: 'high'
      },
      {
        area: 'Monitoring',
        action: 'Establish regular check-ins to track recommendation implementation',
        impact: 'medium'
      }
    ]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch aggregated system data
    const [
      { data: learners },
      { data: performance },
      { data: recommendations },
      { data: feedback }
    ] = await Promise.all([
      supabase.from('learners').select('*'),
      supabase.from('performance_records').select('*'),
      supabase.from('recommendations').select('*'),
      supabase.from('feedback').select('*')
    ]);

    const systemData = { learners, performance, recommendations, feedback };
    console.log('Fetched system data for insights');

    let insights = null;
    let useAI = true;

    try {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        console.log('LOVABLE_API_KEY not found, using fallback');
        useAI = false;
      }

      if (useAI) {
        const systemPrompt = `You are an educational data analyst. Analyze system-wide data to identify trends, patterns, and actionable insights for administrators to improve educational outcomes.`;

        // Calculate key metrics for the prompt
        const totalLearners = learners?.length || 0;
        const challengeDistribution = learners?.reduce((acc: any, l: any) => {
          l.learning_challenges?.forEach((c: string) => {
            acc[c] = (acc[c] || 0) + 1;
          });
          return acc;
        }, {});

        const avgScore = (performance && performance.length > 0)
          ? performance.reduce((sum: number, p: any) => sum + Number(p.score), 0) / performance.length
          : 0;

        const recsByType = recommendations?.reduce((acc: any, r: any) => {
          acc[r.recommendation_type] = (acc[r.recommendation_type] || 0) + 1;
          return acc;
        }, {});

        const userPrompt = `Analyze this educational system data and generate actionable insights:

System Overview:
- Total Learners: ${totalLearners}
- Average Performance: ${avgScore.toFixed(1)}%
- Total Recommendations: ${recommendations?.length || 0}
- Total Feedback Entries: ${feedback?.length || 0}

Learning Challenge Distribution:
${Object.entries(challengeDistribution || {}).map(([k, v]) => `- ${k}: ${v} students`).join('\n')}

Recommendation Types:
${Object.entries(recsByType || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Feedback Sentiment:
- Helpful: ${feedback?.filter((f: any) => f.rating === 'helpful').length || 0}
- Not Helpful: ${feedback?.filter((f: any) => f.rating === 'not_helpful').length || 0}

Provide insights on:
1. Overall trends and patterns
2. Areas requiring immediate attention
3. Strategic priorities for improvement`;

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
                  name: 'generate_insights',
                  description: 'Generate system-wide educational insights',
                  parameters: {
                    type: 'object',
                    properties: {
                      summary: {
                        type: 'object',
                        properties: {
                          total_learners: { type: 'number' },
                          average_performance: { type: 'number' },
                          implementation_rate: { type: 'number' },
                          satisfaction_rate: { type: 'number' }
                        }
                      },
                      trends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            category: { type: 'string' },
                            insight: { type: 'string' },
                            recommendation: { type: 'string' }
                          }
                        }
                      },
                      priorities: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            area: { type: 'string' },
                            action: { type: 'string' },
                            impact: { type: 'string', enum: ['low', 'medium', 'high'] }
                          }
                        }
                      }
                    },
                    required: ['summary', 'trends', 'priorities']
                  }
                }
              }
            ],
            tool_choice: { type: 'function', function: { name: 'generate_insights' } }
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
            insights = JSON.parse(toolCall.function.arguments);
          }
        }
      }
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      useAI = false;
    }

    if (!useAI || !insights) {
      console.log('Using rule-based fallback for insights');
      insights = generateFallbackInsights(systemData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        source: useAI ? 'ai' : 'fallback',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
