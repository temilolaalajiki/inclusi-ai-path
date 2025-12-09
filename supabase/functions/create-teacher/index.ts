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

    // Ensure requester has admin role only
    const { data: roleData, error: roleFetchError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requester.id)
      .single();

    if (roleFetchError || !roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only admins can create teachers.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { firstName, lastName, email } = await req.json();

    // Validate input
    if (!firstName || !lastName || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create auth user for the teacher
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authCreateError) {
      console.error('Auth creation error:', authCreateError);
      throw authCreateError;
    }
    if (!authData?.user?.id) throw new Error('Failed to create user');

    const teacherUserId = authData.user.id;

    console.log('Teacher user created:', teacherUserId);

    // Profile is automatically created by the handle_new_user trigger
    // Update the profile to include the email
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ email })
      .eq('id', teacherUserId);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      // Non-critical error, continue with role assignment
    }

    // Assign teacher role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: teacherUserId, role: 'teacher' });
    
    if (roleInsertError) {
      console.error('Role assignment error:', roleInsertError);
      throw roleInsertError;
    }

    console.log('Teacher role assigned successfully');

    return new Response(
      JSON.stringify({ success: true, teacherId: teacherUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-teacher:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
