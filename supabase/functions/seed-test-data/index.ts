import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify admin role
async function verifyAdminRole(supabaseClient: any, authHeader: string | null): Promise<{ isAdmin: boolean; userId: string | null; error: string | null }> {
  if (!authHeader) {
    return { isAdmin: false, userId: null, error: 'No authorization header provided' };
  }

  const token = authHeader.replace('Bearer ', '');
  
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError || !user) {
    return { isAdmin: false, userId: null, error: 'Invalid authentication token' };
  }

  // Check if user has admin role
  const { data: roleData, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleError) {
    return { isAdmin: false, userId: user.id, error: 'Error checking user role' };
  }

  if (!roleData) {
    return { isAdmin: false, userId: user.id, error: 'User does not have admin privileges' };
  }

  return { isAdmin: true, userId: user.id, error: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // SECURITY: Verify the requester is an authenticated admin
    const authHeader = req.headers.get('Authorization');
    const { isAdmin, error: authError } = await verifyAdminRole(supabaseClient, authHeader);

    if (!isAdmin) {
      console.error('Unauthorized seed-test-data attempt:', authError);
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified, starting comprehensive test data seeding...');

    // Get first teacher for assignment
    const { data: teachers } = await supabaseClient
      .from('profiles')
      .select('id')
      .limit(1);

    if (!teachers || teachers.length === 0) {
      throw new Error('No teachers found. Please create a teacher first.');
    }

    const teacherId = teachers[0].id;

    // Create diverse learner profiles
    const learnerProfiles = [
      {
        email: 'ada.lagos@test.com',
        firstName: 'Ada',
        lastName: 'Okonkwo',
        demographics: {
          location_type: 'urban',
          state: 'Lagos',
          lga: 'Ikeja',
          family_income_bracket: 'middle',
          has_internet_access: true,
          has_electricity: true,
          primary_language: 'Yoruba',
          learning_challenges: ['None'],
          accessibility_needs: ['None']
        }
      },
      {
        email: 'emeka.kano@test.com',
        firstName: 'Emeka',
        lastName: 'Nwankwo',
        demographics: {
          location_type: 'rural',
          state: 'Kano',
          lga: 'Kano Municipal',
          family_income_bracket: 'low',
          has_internet_access: false,
          has_electricity: false,
          primary_language: 'Hausa',
          learning_challenges: ['Visual Impairment'],
          accessibility_needs: ['Screen Reader', 'Large Print Materials']
        }
      },
      {
        email: 'blessing.enugu@test.com',
        firstName: 'Blessing',
        lastName: 'Okafor',
        demographics: {
          location_type: 'semi-urban',
          state: 'Enugu',
          lga: 'Enugu North',
          family_income_bracket: 'middle',
          has_internet_access: true,
          has_electricity: true,
          primary_language: 'Igbo',
          learning_challenges: ['Hearing Impairment'],
          accessibility_needs: ['Sign Language Support', 'Captions']
        }
      },
      {
        email: 'fatima.sokoto@test.com',
        firstName: 'Fatima',
        lastName: 'Ibrahim',
        demographics: {
          location_type: 'rural',
          state: 'Sokoto',
          lga: 'Sokoto South',
          family_income_bracket: 'low',
          has_internet_access: false,
          has_electricity: false,
          primary_language: 'Hausa',
          learning_challenges: ['None'],
          accessibility_needs: ['None']
        }
      },
      {
        email: 'chinedu.rivers@test.com',
        firstName: 'Chinedu',
        lastName: 'Eze',
        demographics: {
          location_type: 'urban',
          state: 'Rivers',
          lga: 'Port Harcourt',
          family_income_bracket: 'high',
          has_internet_access: true,
          has_electricity: true,
          primary_language: 'English',
          learning_challenges: ['Dyslexia'],
          accessibility_needs: ['Extended Time', 'Audio Materials']
        }
      }
    ];

    const createdLearners = [];

    for (const profile of learnerProfiles) {
      console.log(`Creating learner: ${profile.firstName} ${profile.lastName}`);
      
      // Create user
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
        email: profile.email,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: {
          first_name: profile.firstName,
          last_name: profile.lastName
        }
      });

      if (authError) {
        console.error(`Failed to create user ${profile.email}:`, authError);
        continue;
      }

      // Insert learner role
      await supabaseClient.from('user_roles').insert({
        user_id: authUser.user.id,
        role: 'learner'
      });

      // Create learner record
      const { data: learner } = await supabaseClient
        .from('learners')
        .insert({
          user_id: authUser.user.id,
          teacher_id: teacherId,
          learning_challenges: profile.demographics.learning_challenges,
          accessibility_needs: profile.demographics.accessibility_needs
        })
        .select()
        .single();

      if (learner) {
        // Create demographics
        await supabaseClient.from('learner_demographics').insert({
          learner_id: learner.id,
          location_type: profile.demographics.location_type,
          state: profile.demographics.state,
          lga: profile.demographics.lga,
          family_income_bracket: profile.demographics.family_income_bracket,
          has_internet_access: profile.demographics.has_internet_access,
          has_electricity: profile.demographics.has_electricity,
          household_size: 5,
          distance_to_school_km: profile.demographics.location_type === 'rural' ? 10 : 3,
          meals_per_day: 2
        });

        // Create Nigerian learning context
        await supabaseClient.from('nigerian_learning_contexts').insert({
          learner_id: learner.id,
          primary_language: profile.demographics.primary_language,
          home_languages: [profile.demographics.primary_language, 'English'],
          resource_constraints: profile.demographics.has_internet_access ? [] : ['No Internet', 'Limited Electricity'],
          community_support_level: profile.demographics.location_type === 'urban' ? 'high' : 'moderate'
        });

        // Create accessibility profile if needed
        if (profile.demographics.accessibility_needs.length > 0 && profile.demographics.accessibility_needs[0] !== 'None') {
          await supabaseClient.from('accessibility_profiles').insert({
            learner_id: learner.id,
            visual_needs: profile.demographics.learning_challenges.includes('Visual Impairment') ? ['Screen Magnification', 'High Contrast'] : [],
            auditory_needs: profile.demographics.learning_challenges.includes('Hearing Impairment') ? ['Captions', 'Visual Alerts'] : [],
            cognitive_needs: profile.demographics.learning_challenges.includes('Dyslexia') ? ['Text-to-Speech', 'Simplified Instructions'] : [],
            assistive_devices_needed: profile.demographics.accessibility_needs
          });
        }

        // Create performance records with varying scores
        const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];
        const baseScore = profile.demographics.family_income_bracket === 'high' ? 75 : 
                          profile.demographics.family_income_bracket === 'middle' ? 65 : 55;
        
        for (const subject of subjects) {
          const score = baseScore + Math.floor(Math.random() * 20) - 10;
          await supabaseClient.from('performance_records').insert({
            learner_id: learner.id,
            subject,
            score,
            assessment_date: new Date().toISOString().split('T')[0],
            grade_level: 'JSS2'
          });
        }

        // Create attendance records (last 30 days)
        const attendanceRate = profile.demographics.location_type === 'rural' ? 0.7 : 0.9;
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const status = Math.random() < attendanceRate ? 'present' : 'absent';
          
          await supabaseClient.from('attendance_records').insert({
            learner_id: learner.id,
            date: date.toISOString().split('T')[0],
            status
          });
        }

        // Create user consent
        await supabaseClient.from('user_data_consent').insert({
          user_id: authUser.user.id,
          analytics_consent: true,
          ai_processing_consent: true,
          demographic_sharing_consent: true,
          research_participation_consent: true,
          consent_date: new Date().toISOString()
        });

        createdLearners.push(learner);
        console.log(`Successfully created learner: ${profile.firstName} ${profile.lastName}`);
      }
    }

    // Generate recommendations for each learner
    console.log('Generating AI recommendations...');
    for (const learner of createdLearners) {
      try {
        await supabaseClient.functions.invoke('analyze-learner', {
          body: { learnerId: learner.id }
        });
        console.log(`Generated recommendations for learner ${learner.id}`);
      } catch (error) {
        console.error(`Failed to generate recommendations for learner ${learner.id}:`, error);
      }
    }

    // Calculate equity metrics
    console.log('Calculating equity metrics...');
    try {
      await supabaseClient.functions.invoke('calculate-equity-metrics', {
        body: {}
      });
      console.log('Equity metrics calculated successfully');
    } catch (error) {
      console.error('Failed to calculate equity metrics:', error);
    }

    console.log(`Test data seeding complete! Created ${createdLearners.length} learners.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        learners_created: createdLearners.length,
        message: 'Test data seeding complete with diverse learner profiles'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding test data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
