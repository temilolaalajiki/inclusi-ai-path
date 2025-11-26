import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nigerian-specific language options
const NIGERIAN_LANGUAGES = [
  'English', 'Hausa', 'Yoruba', 'Igbo', 'Fulfulde', 'Kanuri', 
  'Tiv', 'Ibibio', 'Edo', 'Ijaw', 'Nupe', 'Efik'
];

// Nigerian states
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { learnerId } = await req.json();

    if (!learnerId) {
      throw new Error('learnerId is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get learner data
    const { data: learner, error: learnerError } = await supabaseClient
      .from('learners')
      .select('*, profiles!learners_user_id_fkey(first_name, last_name)')
      .eq('id', learnerId)
      .single();

    if (learnerError) throw learnerError;

    // Check if context data already exists
    const { data: existingContext } = await supabaseClient
      .from('nigerian_learning_contexts')
      .select('id')
      .eq('learner_id', learnerId)
      .maybeSingle();

    const { data: existingDemo } = await supabaseClient
      .from('learner_demographics')
      .select('id')
      .eq('learner_id', learnerId)
      .maybeSingle();

    const { data: existingAccess } = await supabaseClient
      .from('accessibility_profiles')
      .select('id')
      .eq('learner_id', learnerId)
      .maybeSingle();

    const updates = [];

    // Create default Nigerian learning context if doesn't exist
    if (!existingContext) {
      const contextData = {
        learner_id: learnerId,
        primary_language: 'English',
        home_languages: ['English'],
        language_proficiency: {
          english: 'intermediate',
          home_language: 'fluent'
        },
        resource_constraints: ['limited_textbooks', 'internet_access'],
        cultural_considerations: ['multilingual_household'],
        community_support_level: 'moderate'
      };

      const { error: contextError } = await supabaseClient
        .from('nigerian_learning_contexts')
        .insert(contextData);

      if (contextError) throw contextError;
      updates.push('context');
    }

    // Create default demographics if doesn't exist
    if (!existingDemo) {
      const demoData = {
        learner_id: learnerId,
        location_type: 'urban',
        access_to_technology: 'limited',
        has_electricity: false,
        has_internet_access: false
      };

      const { error: demoError } = await supabaseClient
        .from('learner_demographics')
        .insert(demoData);

      if (demoError) throw demoError;
      updates.push('demographics');
    }

    // Create accessibility profile based on existing needs if doesn't exist
    if (!existingAccess) {
      const accessData = {
        learner_id: learnerId,
        visual_needs: learner.accessibility_needs?.filter((n: string) => 
          ['screen_reader', 'high_contrast', 'large_text'].includes(n)
        ) || [],
        cognitive_needs: learner.learning_challenges || [],
        language_support_needs: ['multilingual_support'],
        assistive_devices_needed: ['basic_calculator', 'writing_aids'],
        environmental_accommodations: ['quiet_space', 'adequate_lighting']
      };

      const { error: accessError } = await supabaseClient
        .from('accessibility_profiles')
        .insert(accessData);

      if (accessError) throw accessError;
      updates.push('accessibility');
    }

    console.log(`Nigerian context analysis complete for learner ${learnerId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        learnerId,
        updates,
        message: updates.length > 0 
          ? `Created ${updates.join(', ')} profile(s)` 
          : 'All profiles already exist'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-nigerian-context:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
