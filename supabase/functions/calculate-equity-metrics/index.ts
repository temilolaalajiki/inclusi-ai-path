import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];

    // Get all learners with their demographics
    const { data: learners } = await supabaseClient
      .from('learners')
      .select(`
        id,
        learner_demographics(location_type, family_income_bracket, has_internet_access),
        nigerian_learning_contexts(primary_language)
      `);

    if (!learners) throw new Error('Failed to fetch learners');

    // Get all recommendations
    const { data: recommendations } = await supabaseClient
      .from('recommendations')
      .select('learner_id, priority, status');

    // Calculate metrics by location
    const locationMetrics = new Map<string, any>();
    const languageMetrics = new Map<string, any>();

    for (const learner of learners) {
      const demo = (learner.learner_demographics as any)?.[0];
      const context = (learner.nigerian_learning_contexts as any)?.[0];
      
      // Location metrics
      if (demo?.location_type) {
        const location = demo.location_type;
        if (!locationMetrics.has(location)) {
          locationMetrics.set(location, {
            total_learners: 0,
            recommendations_count: 0,
            high_priority_count: 0,
            implemented_count: 0
          });
        }
        const locMetric = locationMetrics.get(location);
        locMetric.total_learners++;
        
        const learnerRecs = recommendations?.filter(r => r.learner_id === learner.id) || [];
        locMetric.recommendations_count += learnerRecs.length;
        locMetric.high_priority_count += learnerRecs.filter(r => r.priority === 'high').length;
        locMetric.implemented_count += learnerRecs.filter(r => r.status === 'implemented').length;
      }

      // Language metrics
      if (context?.primary_language) {
        const language = context.primary_language;
        if (!languageMetrics.has(language)) {
          languageMetrics.set(language, {
            total_learners: 0,
            recommendations_count: 0,
            high_priority_count: 0,
            implemented_count: 0
          });
        }
        const langMetric = languageMetrics.get(language);
        langMetric.total_learners++;
        
        const learnerRecs = recommendations?.filter(r => r.learner_id === learner.id) || [];
        langMetric.recommendations_count += learnerRecs.length;
        langMetric.high_priority_count += learnerRecs.filter(r => r.priority === 'high').length;
        langMetric.implemented_count += learnerRecs.filter(r => r.status === 'implemented').length;
      }
    }

    // Insert or update metrics
    const metricsToInsert = [];

    for (const [location, metrics] of locationMetrics.entries()) {
      metricsToInsert.push({
        metric_date: today,
        demographic_category: 'location',
        demographic_value: location,
        total_learners: metrics.total_learners,
        recommendations_count: metrics.recommendations_count,
        avg_recommendation_priority: metrics.high_priority_count / Math.max(metrics.recommendations_count, 1),
        interventions_implemented: metrics.implemented_count,
        success_rate: metrics.implemented_count / Math.max(metrics.recommendations_count, 1),
        resource_allocation_score: (metrics.recommendations_count / metrics.total_learners) / 5 // normalized
      });
    }

    for (const [language, metrics] of languageMetrics.entries()) {
      metricsToInsert.push({
        metric_date: today,
        demographic_category: 'language',
        demographic_value: language,
        total_learners: metrics.total_learners,
        recommendations_count: metrics.recommendations_count,
        avg_recommendation_priority: metrics.high_priority_count / Math.max(metrics.recommendations_count, 1),
        interventions_implemented: metrics.implemented_count,
        success_rate: metrics.implemented_count / Math.max(metrics.recommendations_count, 1),
        resource_allocation_score: (metrics.recommendations_count / metrics.total_learners) / 5
      });
    }

    // Upsert metrics
    for (const metric of metricsToInsert) {
      await supabaseClient
        .from('equity_metrics')
        .upsert(metric, { 
          onConflict: 'metric_date,demographic_category,demographic_value' 
        });
    }

    // Calculate bias score (standard deviation of resource allocation)
    const allocationScores = metricsToInsert.map(m => m.resource_allocation_score);
    const mean = allocationScores.reduce((a, b) => a + b, 0) / allocationScores.length;
    const variance = allocationScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allocationScores.length;
    const stdDev = Math.sqrt(variance);
    const biasScore = 1 - Math.min(stdDev * 2, 1); // Higher score = less bias

    // Create compliance check
    const status = biasScore > 0.8 ? 'passed' : biasScore > 0.6 ? 'flagged' : 'failed';
    await supabaseClient
      .from('ethical_compliance_checks')
      .insert({
        check_type: 'bias_audit',
        status,
        findings: {
          bias_score: biasScore,
          standard_deviation: stdDev,
          metrics_analyzed: metricsToInsert.length
        }
      });

    console.log(`Calculated equity metrics: ${metricsToInsert.length} entries, bias score: ${biasScore.toFixed(2)}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        metrics_calculated: metricsToInsert.length,
        bias_score: biasScore,
        compliance_status: status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating equity metrics:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
