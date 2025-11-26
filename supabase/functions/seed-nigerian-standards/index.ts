import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WAEC/NECO curriculum standards for major subjects
const CURRICULUM_STANDARDS = [
  {
    code: 'WAEC-MATH-SS3',
    name: 'WAEC Mathematics SS3',
    examination_body: 'WAEC',
    subject: 'Mathematics',
    grade_level: 'SS3',
    learning_objectives: [
      'Master algebraic operations and equations',
      'Understand geometry and mensuration',
      'Apply trigonometry to real-world problems',
      'Solve problems involving statistics and probability'
    ],
    competency_areas: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Calculus Basics'],
    assessment_criteria: {
      theory: 40,
      practical: 30,
      continuous_assessment: 30
    }
  },
  {
    code: 'WAEC-ENG-SS3',
    name: 'WAEC English Language SS3',
    examination_body: 'WAEC',
    subject: 'English',
    grade_level: 'SS3',
    learning_objectives: [
      'Demonstrate proficiency in written English',
      'Comprehend and analyze literary texts',
      'Communicate effectively in spoken English',
      'Apply grammar rules correctly'
    ],
    competency_areas: ['Reading Comprehension', 'Essay Writing', 'Grammar', 'Literature', 'Oral English'],
    assessment_criteria: {
      essay: 40,
      comprehension: 30,
      grammar: 20,
      oral: 10
    }
  },
  {
    code: 'NECO-MATH-SS3',
    name: 'NECO Mathematics SS3',
    examination_body: 'NECO',
    subject: 'Mathematics',
    grade_level: 'SS3',
    learning_objectives: [
      'Solve complex mathematical problems',
      'Apply mathematical concepts to daily life',
      'Demonstrate numerical and logical reasoning',
      'Use mathematical tools and technology'
    ],
    competency_areas: ['Number and Numeration', 'Algebraic Processes', 'Geometry and Mensuration', 'Statistics and Probability'],
    assessment_criteria: {
      objective: 40,
      theory: 60
    }
  },
  {
    code: 'WAEC-BIO-SS3',
    name: 'WAEC Biology SS3',
    examination_body: 'WAEC',
    subject: 'Biology',
    grade_level: 'SS3',
    learning_objectives: [
      'Understand living organisms and their environment',
      'Apply scientific methods in biological studies',
      'Demonstrate knowledge of human biology',
      'Understand genetics and evolution'
    ],
    competency_areas: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology'],
    assessment_criteria: {
      theory: 50,
      practical: 30,
      continuous_assessment: 20
    }
  }
];

// State education policies
const STATE_POLICIES = [
  {
    state: 'Lagos',
    policy_name: 'Lagos State Inclusive Education Policy',
    policy_type: 'ACCESSIBILITY',
    description: 'Ensures all learners, including those with disabilities, have equal access to quality education',
    implementation_guidelines: 'Schools must provide assistive devices, trained special education teachers, and accessible infrastructure',
    effective_date: '2020-01-01',
    requirements: {
      teacher_training: 'Mandatory annual training on inclusive education',
      infrastructure: 'Ramps, accessible toilets, adapted classrooms',
      resources: 'Braille materials, sign language interpreters'
    }
  },
  {
    state: 'Kano',
    policy_name: 'Kano State Mother Tongue Education Initiative',
    policy_type: 'CURRICULUM',
    description: 'Promotes use of Hausa as medium of instruction in early grades',
    implementation_guidelines: 'Primary 1-3 to use Hausa, gradual transition to English',
    effective_date: '2019-09-01',
    requirements: {
      materials: 'Hausa language textbooks for all subjects',
      teacher_training: 'Teachers must be proficient in Hausa',
      assessment: 'Early grade assessments in Hausa'
    }
  },
  {
    state: 'FCT',
    policy_name: 'FCT Basic Education Assessment Framework',
    policy_type: 'ASSESSMENT',
    description: 'Standardized continuous assessment for FCT basic education',
    implementation_guidelines: 'Regular assessments throughout the term, weighted scoring system',
    effective_date: '2021-01-01',
    requirements: {
      frequency: 'Minimum 3 assessments per term',
      weighting: '40% continuous assessment, 60% examination',
      record_keeping: 'Digital records required'
    }
  }
];

// Assessment frameworks
const ASSESSMENT_FRAMEWORKS = [
  {
    name: 'WAEC Standard Grading System',
    framework_type: 'SUMMATIVE',
    examination_body: 'WAEC',
    grade_levels: ['SS1', 'SS2', 'SS3'],
    subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'],
    grading_scale: {
      'A1': { min: 75, max: 100, grade_point: 1 },
      'B2': { min: 70, max: 74, grade_point: 2 },
      'B3': { min: 65, max: 69, grade_point: 3 },
      'C4': { min: 60, max: 64, grade_point: 4 },
      'C5': { min: 55, max: 59, grade_point: 5 },
      'C6': { min: 50, max: 54, grade_point: 6 },
      'D7': { min: 45, max: 49, grade_point: 7 },
      'E8': { min: 40, max: 44, grade_point: 8 },
      'F9': { min: 0, max: 39, grade_point: 9 }
    },
    pass_mark: 40,
    excellence_mark: 75,
    assessment_components: ['Theory Paper 1', 'Theory Paper 2', 'Practical/Alternative to Practical'],
    weighting: {
      theory_1: 40,
      theory_2: 40,
      practical: 20
    }
  },
  {
    name: 'NECO Grading System',
    framework_type: 'SUMMATIVE',
    examination_body: 'NECO',
    grade_levels: ['SS3'],
    subjects: ['All SSCE Subjects'],
    grading_scale: {
      'A': { min: 75, max: 100, description: 'Excellent' },
      'B': { min: 60, max: 74, description: 'Very Good' },
      'C': { min: 50, max: 59, description: 'Good' },
      'D': { min: 45, max: 49, description: 'Pass' },
      'E': { min: 40, max: 44, description: 'Pass' },
      'F': { min: 0, max: 39, description: 'Fail' }
    },
    pass_mark: 40,
    excellence_mark: 75,
    assessment_components: ['Objective', 'Essay/Theory'],
    weighting: {
      objective: 40,
      theory: 60
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let insertedStandards = 0;
    let insertedPolicies = 0;
    let insertedFrameworks = 0;

    // Seed curriculum standards
    for (const standard of CURRICULUM_STANDARDS) {
      const { data: existing } = await supabaseClient
        .from('curriculum_standards')
        .select('id')
        .eq('code', standard.code)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabaseClient
          .from('curriculum_standards')
          .insert(standard);

        if (!error) insertedStandards++;
      }
    }

    // Seed state policies
    for (const policy of STATE_POLICIES) {
      const { data: existing } = await supabaseClient
        .from('state_education_policies')
        .select('id')
        .eq('state', policy.state)
        .eq('policy_name', policy.policy_name)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabaseClient
          .from('state_education_policies')
          .insert(policy);

        if (!error) insertedPolicies++;
      }
    }

    // Seed assessment frameworks
    for (const framework of ASSESSMENT_FRAMEWORKS) {
      const { data: existing } = await supabaseClient
        .from('assessment_frameworks')
        .select('id')
        .eq('name', framework.name)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabaseClient
          .from('assessment_frameworks')
          .insert(framework);

        if (!error) insertedFrameworks++;
      }
    }

    console.log(`Seeded: ${insertedStandards} standards, ${insertedPolicies} policies, ${insertedFrameworks} frameworks`);

    return new Response(
      JSON.stringify({ 
        success: true,
        inserted: {
          standards: insertedStandards,
          policies: insertedPolicies,
          frameworks: insertedFrameworks
        },
        message: 'Nigerian education standards seeded successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding standards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
