import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  teacher_id: string;
  material_id: string | null;
  title: string;
  description: string | null;
  subject: string;
  grade_level: string;
  time_limit_minutes: number | null;
  pass_score: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  material_id?: string;
  time_limit_minutes?: number;
  pass_score?: number;
  is_published?: boolean;
}

export interface CreateQuestionInput {
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  points?: number;
  order_index?: number;
}

export const useQuizzes = (teacherId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const quizzesQuery = useQuery({
    queryKey: ['quizzes', teacherId],
    queryFn: async () => {
      let query = supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Quiz[];
    },
    enabled: !!teacherId,
  });

  const getQuizWithQuestions = async (quizId: string): Promise<Quiz | null> => {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) throw quizError;

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    return { ...quiz, questions: questions as QuizQuestion[] } as Quiz;
  };

  const createQuiz = useMutation({
    mutationFn: async (input: CreateQuizInput & { teacher_id: string }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create quiz', description: error.message, variant: 'destructive' });
    },
  });

  const updateQuiz = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Quiz> & { id: string }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update quiz', description: error.message, variant: 'destructive' });
    },
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Quiz deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete quiz', description: error.message, variant: 'destructive' });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { data, error } = await supabase
        .from('quizzes')
        .update({ is_published })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: data.is_published ? 'Quiz published' : 'Quiz unpublished' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update quiz', description: error.message, variant: 'destructive' });
    },
  });

  // Question mutations
  const createQuestion = useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          ...input,
          options: input.options || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Question added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add question', description: error.message, variant: 'destructive' });
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuizQuestion> & { id: string }) => {
      const { data, error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update question', description: error.message, variant: 'destructive' });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({ title: 'Question deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete question', description: error.message, variant: 'destructive' });
    },
  });

  return {
    quizzes: quizzesQuery.data || [],
    isLoading: quizzesQuery.isLoading,
    error: quizzesQuery.error,
    getQuizWithQuestions,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    togglePublish,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
};
