import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating weekly report...');

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Fetch all data
    const { data: learners } = await supabase
      .from('learners')
      .select('*');

    const { data: teachers } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'teacher');

    const { data: performance } = await supabase
      .from('performance_records')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: recommendations } = await supabase
      .from('recommendations')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const { data: feedback } = await supabase
      .from('feedback')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Calculate metrics
    const avgScore = performance && performance.length > 0
      ? performance.reduce((sum, p) => sum + Number(p.score), 0) / performance.length
      : 0;

    const recommendationsImplemented = recommendations?.filter(r => r.status === 'implemented').length || 0;
    const implementationRate = recommendations && recommendations.length > 0
      ? (recommendationsImplemented / recommendations.length) * 100
      : 0;

    const positiveFeedback = feedback?.filter(f => f.rating === 'helpful').length || 0;
    const feedbackRate = feedback && feedback.length > 0
      ? (positiveFeedback / feedback.length) * 100
      : 0;

    // Generate report
    const report = {
      reportId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalLearners: learners?.length || 0,
        totalTeachers: teachers?.length || 0,
        avgPerformance: Math.round(avgScore),
        newRecommendations: recommendations?.length || 0,
        implementationRate: Math.round(implementationRate),
        feedbackSatisfaction: Math.round(feedbackRate)
      },
      highlights: [
        {
          metric: 'Performance Trend',
          value: avgScore >= 70 ? 'Positive' : 'Needs Attention',
          description: `Average score: ${Math.round(avgScore)}%`
        },
        {
          metric: 'Recommendation Adoption',
          value: `${Math.round(implementationRate)}%`,
          description: `${recommendationsImplemented} of ${recommendations?.length || 0} implemented`
        },
        {
          metric: 'User Satisfaction',
          value: `${Math.round(feedbackRate)}%`,
          description: `${positiveFeedback} positive responses`
        }
      ]
    };

    // Store report in database (you can create a reports table for this)
    // For now, just return it
    console.log('Weekly report generated successfully');

    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error generating weekly report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});