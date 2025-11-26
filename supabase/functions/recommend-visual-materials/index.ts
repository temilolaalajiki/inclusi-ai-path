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

    // Get learners with visual impairment needs
    const { data: learners, error: learnersError } = await supabaseClient
      .from('learners')
      .select(`
        id,
        user_id,
        teacher_id,
        accessibility_needs,
        learning_challenges,
        profiles!learners_user_id_fkey(first_name, last_name)
      `)
      .contains('accessibility_needs', ['screen_reader', 'high_contrast', 'large_text']);

    if (learnersError) throw learnersError;

    const recommendations = [];

    for (const learner of learners || []) {
      const profile = learner.profiles as any;
      const learnerName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';
      
      // Determine specific material recommendations based on needs
      const needs = learner.accessibility_needs || [];
      const materials = [];
      
      if (needs.includes('screen_reader')) {
        materials.push('Audio textbooks', 'Screen reader compatible PDFs', 'Audio descriptions for visual content');
      }
      if (needs.includes('high_contrast')) {
        materials.push('High-contrast printed materials', 'Enlarged diagrams with bold outlines');
      }
      if (needs.includes('large_text')) {
        materials.push('Large-print textbooks (18pt+)', 'Magnification tools', 'Tactile graphics');
      }

      // Check if similar recommendation already exists
      const { data: existingRec } = await supabaseClient
        .from('recommendations')
        .select('id')
        .eq('learner_id', learner.id)
        .eq('recommendation_type', 'visual_materials')
        .eq('status', 'pending')
        .maybeSingle();

      if (!existingRec && materials.length > 0) {
        // Create material recommendation
        const { error: insertError } = await supabaseClient
          .from('recommendations')
          .insert({
            learner_id: learner.id,
            teacher_id: learner.teacher_id,
            recommendation_type: 'visual_materials',
            title: `Enhanced Visual Support Materials: ${learnerName}`,
            description: `Recommended materials for visual accessibility: ${materials.join(', ')}. Consider implementing these materials to improve learning outcomes.`,
            priority: 'medium',
            status: 'pending'
          });

        if (insertError) {
          console.error('Error creating material recommendation:', insertError);
        } else {
          recommendations.push({
            learner_id: learner.id,
            learner_name: learnerName,
            accessibility_needs: needs,
            materials
          });
        }
      }
    }

    console.log(`Created ${recommendations.length} visual material recommendations`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations_created: recommendations.length,
        recommendations 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in recommend-visual-materials:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
