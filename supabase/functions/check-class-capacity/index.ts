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

    // Update class counts
    const { error: updateError } = await supabaseClient.rpc('update_class_counts');
    if (updateError) throw updateError;

    // Get overcrowded classes
    const { data: overcrowded, error: overcrowdedError } = await supabaseClient
      .rpc('get_overcrowded_classes');

    if (overcrowdedError) throw overcrowdedError;

    const alerts = [];

    for (const classData of overcrowded || []) {
      // Get teacher info
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', classData.teacher_id)
        .single();

      const teacherName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';

      // Check if alert already exists
      const { data: existingRec } = await supabaseClient
        .from('recommendations')
        .select('id')
        .eq('teacher_id', classData.teacher_id)
        .eq('recommendation_type', 'capacity_alert')
        .eq('status', 'pending')
        .maybeSingle();

      if (!existingRec) {
        // Get learners to suggest redistribution
        const { data: learners } = await supabaseClient
          .from('learners')
          .select('id, profiles!learners_user_id_fkey(first_name, last_name)')
          .eq('teacher_id', classData.teacher_id)
          .limit(classData.overflow);

        const learnerNames = learners?.map((l: any) => 
          `${l.profiles.first_name} ${l.profiles.last_name}`
        ).join(', ') || '';

        // Create capacity alert
        const { error: insertError } = await supabaseClient
          .from('recommendations')
          .insert({
            teacher_id: classData.teacher_id,
            learner_id: null,
            recommendation_type: 'capacity_alert',
            title: `Class Overcrowding Alert: ${teacherName}`,
            description: `Class is at ${classData.utilization_rate}% capacity (${classData.current_count}/${classData.max_capacity}). ${classData.overflow} learner(s) exceed capacity. Consider redistributing: ${learnerNames}`,
            priority: classData.overflow > 5 ? 'high' : 'medium',
            status: 'pending'
          });

        if (insertError) {
          console.error('Error creating capacity alert:', insertError);
        } else {
          alerts.push({
            teacher_id: classData.teacher_id,
            teacher_name: teacherName,
            current_count: classData.current_count,
            max_capacity: classData.max_capacity,
            overflow: classData.overflow
          });
        }
      }
    }

    console.log(`Created ${alerts.length} capacity alerts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_created: alerts.length,
        alerts 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-class-capacity:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
