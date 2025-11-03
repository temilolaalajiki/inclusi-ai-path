import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    const { startDate, endDate } = await req.json();

    console.log('Aggregating analytics data...', { startDate, endDate });

    // Aggregate progress data
    const { data: performanceData } = await supabase
      .from('performance_records')
      .select('score, created_at')
      .gte('created_at', startDate || '2024-01-01')
      .lte('created_at', endDate || new Date().toISOString());

    const avgProgress = performanceData && performanceData.length > 0
      ? performanceData.reduce((sum, record) => sum + Number(record.score), 0) / performanceData.length
      : 0;

    // Identify barriers
    const { data: learnersData } = await supabase
      .from('learners')
      .select('learning_challenges, accessibility_needs');

    const barriersMap: { [key: string]: number } = {};
    learnersData?.forEach(learner => {
      [...(learner.learning_challenges || []), ...(learner.accessibility_needs || [])].forEach(challenge => {
        barriersMap[challenge] = (barriersMap[challenge] || 0) + 1;
      });
    });

    const barriers = Object.entries(barriersMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Measure effectiveness
    const { data: recommendationsData } = await supabase
      .from('recommendations')
      .select('recommendation_type, status, created_at')
      .gte('created_at', startDate || '2024-01-01')
      .lte('created_at', endDate || new Date().toISOString());

    const interventionsMap: { [key: string]: { count: number; implemented: number } } = {};
    recommendationsData?.forEach(rec => {
      if (!interventionsMap[rec.recommendation_type]) {
        interventionsMap[rec.recommendation_type] = { count: 0, implemented: 0 };
      }
      interventionsMap[rec.recommendation_type].count++;
      if (rec.status === 'implemented') {
        interventionsMap[rec.recommendation_type].implemented++;
      }
    });

    const interventions = Object.entries(interventionsMap).map(([type, data]) => ({
      type,
      count: data.count,
      successRate: data.count > 0 ? (data.implemented / data.count) * 100 : 0
    }));

    // Teacher engagement
    const { data: teacherData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'teacher');

    const { data: activeTeachers } = await supabase
      .from('recommendations')
      .select('teacher_id')
      .not('teacher_id', 'is', null)
      .gte('created_at', startDate || '2024-01-01')
      .lte('created_at', endDate || new Date().toISOString());

    const uniqueActiveTeachers = new Set(activeTeachers?.map(t => t.teacher_id) || []).size;
    const totalTeachers = teacherData?.length || 0;
    const engagementRate = totalTeachers > 0 ? (uniqueActiveTeachers / totalTeachers) * 100 : 0;

    // Predictive trends (simple linear regression)
    const trend = performanceData && performanceData.length > 1 ? calculateTrend(performanceData) : 0;

    return new Response(
      JSON.stringify({
        avgProgress: Math.round(avgProgress),
        barriers,
        interventions,
        teacherEngagement: {
          rate: Math.round(engagementRate),
          active: uniqueActiveTeachers,
          total: totalTeachers
        },
        predictiveTrend: trend,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error aggregating analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateTrend(data: any[]): number {
  if (data.length < 2) return 0;
  
  const points = data.map((d, i) => ({ x: i, y: Number(d.score) }));
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return Math.round(slope * 10) / 10; // Round to 1 decimal
}