import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for web calls
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the requesting user via the Bearer token
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requester }, error: getUserError } = await supabaseAdmin.auth.getUser(token);

    if (getUserError || !requester) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure requester has teacher or admin role
    const { data: roleData, error: roleFetchError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requester.id)
      .single();

    if (roleFetchError || !roleData || (roleData.role !== 'teacher' && roleData.role !== 'admin')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { firstName, lastName, email, age, grade, learningChallenges, accessibilityNeeds } = await req.json();

    // Create auth user for the learner
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authCreateError) throw authCreateError;
    if (!authData?.user?.id) throw new Error('Failed to create user');

    const learnerUserId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ id: learnerUserId, first_name: firstName, last_name: lastName });
    if (profileError) throw profileError;

    // Assign learner role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: learnerUserId, role: 'learner' });
    if (roleInsertError) throw roleInsertError;

    // Create learner record
    const { error: learnerInsertError } = await supabaseAdmin
      .from('learners')
      .insert({
        user_id: learnerUserId,
        teacher_id: requester.id,
        demographics: { age, grade },
        learning_challenges: learningChallenges,
        accessibility_needs: accessibilityNeeds,
      });
    if (learnerInsertError) throw learnerInsertError;

    return new Response(
      JSON.stringify({ success: true, learnerId: learnerUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-learner:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
