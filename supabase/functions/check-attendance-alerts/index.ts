import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all learners with their teacher assignments
    const { data: learners, error: learnersError } = await supabase
      .from('learners')
      .select('id, teacher_id, user_id')
      .not('teacher_id', 'is', null);

    if (learnersError) throw learnersError;

    const interventions: any[] = [];

    // Check attendance for each learner
    for (const learner of learners || []) {
      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', learner.user_id)
        .single();
      // Get attendance records from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('learner_id', learner.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (attendanceError) {
        console.error(`Error fetching attendance for learner ${learner.id}:`, attendanceError);
        continue;
      }

      const totalDays = attendanceRecords?.length || 0;
      const presentDays = attendanceRecords?.filter(r => r.status === 'present' || r.status === 'late').length || 0;
      const absentDays = attendanceRecords?.filter(r => r.status === 'absent').length || 0;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

      // Check if intervention is needed (attendance < 75%)
      if (attendanceRate < 75 && totalDays >= 5) {
        // Check if we already have a recent attendance recommendation
        const { data: existingRec } = await supabase
          .from('recommendations')
          .select('id')
          .eq('learner_id', learner.id)
          .eq('recommendation_type', 'attendance_intervention')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .single();

        // Only create new recommendation if one doesn't exist
        if (!existingRec) {
          const learnerName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Student';
          
          let priority = 'medium';
          let description = `${learnerName} has an attendance rate of ${attendanceRate.toFixed(1)}% over the last 30 days (${absentDays} absences out of ${totalDays} days tracked).`;

          if (attendanceRate < 50) {
            priority = 'high';
            description += ' This is critically low and requires immediate intervention. Consider scheduling a parent meeting and investigating underlying causes.';
          } else if (attendanceRate < 65) {
            priority = 'high';
            description += ' This requires prompt attention. Consider reaching out to parents and identifying barriers to attendance.';
          } else {
            description += ' Monitor attendance closely and consider early intervention to prevent further decline.';
          }

          description += '\n\nRecommended actions:\n';
          description += '• Contact parents/guardians to discuss attendance\n';
          description += '• Identify and address barriers to attendance\n';
          description += '• Develop an attendance improvement plan\n';
          description += '• Provide additional support for catching up on missed work\n';
          description += '• Monitor daily and follow up regularly';

          const intervention = {
            learner_id: learner.id,
            teacher_id: learner.teacher_id,
            title: `Low Attendance Alert: ${attendanceRate.toFixed(1)}% attendance rate`,
            description,
            recommendation_type: 'attendance_intervention',
            priority,
            status: 'pending'
          };

          interventions.push(intervention);
        }
      }
    }

    // Insert all interventions
    if (interventions.length > 0) {
      const { error: insertError } = await supabase
        .from('recommendations')
        .insert(interventions);

      if (insertError) {
        console.error('Error inserting interventions:', insertError);
        throw insertError;
      }

      console.log(`Created ${interventions.length} attendance intervention(s)`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        interventionsCreated: interventions.length,
        message: `Checked attendance for ${learners?.length || 0} learners, created ${interventions.length} intervention(s)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-attendance-alerts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});