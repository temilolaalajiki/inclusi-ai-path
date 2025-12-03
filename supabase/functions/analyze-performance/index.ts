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

    // Get all learners with low performance (average score < 50)
    const { data: learners, error: learnersError } = await supabaseClient
      .from('learners')
      .select(`
        id,
        user_id,
        teacher_id,
        learning_challenges,
        accessibility_needs,
        profiles!learners_user_id_fkey(first_name, last_name)
      `);

    if (learnersError) throw learnersError;

    const interventions = [];

    for (const learner of learners || []) {
      // Get performance records for this learner
      const { data: performance, error: perfError } = await supabaseClient
        .from('performance_records')
        .select('score, subject, assessment_date')
        .eq('learner_id', learner.id)
        .order('assessment_date', { ascending: false })
        .limit(5);

      if (perfError) throw perfError;

      if (!performance || performance.length === 0) continue;

      // Calculate average score
      const avgScore = performance.reduce((sum, p) => sum + p.score, 0) / performance.length;

      // Check if intervention is needed
      if (avgScore < 50) {
        const profile = learner.profiles as any;
        const learnerName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';
        
        // Check if intervention already exists
        const { data: existingRec } = await supabaseClient
          .from('recommendations')
          .select('id')
          .eq('learner_id', learner.id)
          .eq('recommendation_type', 'performance_intervention')
          .eq('status', 'pending')
          .maybeSingle();

        if (!existingRec) {
          // Create intervention recommendation
          const { error: insertError } = await supabaseClient
            .from('recommendations')
            .insert({
              learner_id: learner.id,
              teacher_id: learner.teacher_id,
              recommendation_type: 'performance_intervention',
              title: `Low Performance Alert: ${learnerName}`,
              description: `${learnerName} has an average score of ${avgScore.toFixed(1)}% across recent assessments. Immediate intervention recommended.`,
              priority: avgScore < 30 ? 'high' : 'medium',
              status: 'pending',
              intervention_triggered: true
            });

          if (insertError) {
            console.error('Error creating intervention:', insertError);
          } else {
            interventions.push({
              learner_id: learner.id,
              learner_name: learnerName,
              avg_score: avgScore,
              subjects: performance.map(p => p.subject),
              teacher_id: learner.teacher_id
            });

            // Send notification to teacher
            if (learner.teacher_id) {
              await supabaseClient
                .from('notifications')
                .insert({
                  user_id: learner.teacher_id,
                  title: `Low Performance Alert: ${learnerName}`,
                  message: `${learnerName} has an average score of ${avgScore.toFixed(1)}% and requires attention.`,
                  type: avgScore < 30 ? 'alert' : 'warning',
                  category: 'performance',
                  related_learner_id: learner.id
                });
            }
          }
        }
      }
    }

    console.log(`Created ${interventions.length} low performance interventions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        interventions_created: interventions.length,
        interventions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-performance:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
