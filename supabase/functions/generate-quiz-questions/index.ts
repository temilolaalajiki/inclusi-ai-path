import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialContent, materialTitle, subject, gradeLevel, questionCount = 5 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating quiz questions for:', materialTitle);

    const systemPrompt = `You are an expert educational content creator specializing in Nigerian curriculum standards. 
Generate quiz questions that are appropriate for the given grade level and subject.
Questions should test comprehension, application, and critical thinking.
For multiple choice questions, provide 4 options with one correct answer.
For true/false questions, provide the statement and whether it's true or false.`;

    const userPrompt = `Generate ${questionCount} quiz questions based on the following learning material:

Title: ${materialTitle}
Subject: ${subject}
Grade Level: ${gradeLevel}

Content:
${materialContent || 'No specific content provided - generate general questions for this subject and grade level.'}

Generate a mix of multiple choice and true/false questions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_questions',
              description: 'Generate quiz questions based on learning material',
              parameters: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question_text: { type: 'string', description: 'The question text' },
                        question_type: { type: 'string', enum: ['multiple_choice', 'true_false'], description: 'Type of question' },
                        options: { 
                          type: 'array', 
                          items: { type: 'string' },
                          description: 'Answer options (4 for multiple choice, 2 for true/false)'
                        },
                        correct_answer: { type: 'string', description: 'The correct answer' },
                        points: { type: 'number', description: 'Points for this question (1-5)' }
                      },
                      required: ['question_text', 'question_type', 'options', 'correct_answer', 'points']
                    }
                  }
                },
                required: ['questions']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_questions' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract questions from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ questions: parsed.questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No questions generated');

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
