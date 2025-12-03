import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaterialProgress {
  id: string;
  material_id: string;
  learner_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percent: number;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  learner_id: string;
  answers: Record<string, string>;
  score: number | null;
  max_score: number | null;
  started_at: string;
  completed_at: string | null;
}

export const useLearnerContent = (learnerId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available materials for learner's grade
  const materialsQuery = useQuery({
    queryKey: ['learner-materials', learnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_materials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!learnerId,
  });

  // Fetch available quizzes for learner's grade
  const quizzesQuery = useQuery({
    queryKey: ['learner-quizzes', learnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!learnerId,
  });

  // Fetch material progress
  const progressQuery = useQuery({
    queryKey: ['material-progress', learnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_progress')
        .select('*')
        .eq('learner_id', learnerId);

      if (error) throw error;
      return data as MaterialProgress[];
    },
    enabled: !!learnerId,
  });

  // Fetch quiz attempts
  const attemptsQuery = useQuery({
    queryKey: ['quiz-attempts', learnerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('learner_id', learnerId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!learnerId,
  });

  // Update material progress
  const updateProgress = useMutation({
    mutationFn: async ({ materialId, status, progressPercent }: { 
      materialId: string; 
      status: 'not_started' | 'in_progress' | 'completed';
      progressPercent: number;
    }) => {
      const { data: existing } = await supabase
        .from('material_progress')
        .select('id')
        .eq('material_id', materialId)
        .eq('learner_id', learnerId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('material_progress')
          .update({
            status,
            progress_percent: progressPercent,
            last_accessed_at: new Date().toISOString(),
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('material_progress')
          .insert({
            material_id: materialId,
            learner_id: learnerId,
            status,
            progress_percent: progressPercent,
            last_accessed_at: new Date().toISOString(),
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-progress'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update progress', description: error.message, variant: 'destructive' });
    },
  });

  // Start quiz attempt
  const startQuizAttempt = useMutation({
    mutationFn: async (quizId: string) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          learner_id: learnerId,
          answers: {},
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as QuizAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to start quiz', description: error.message, variant: 'destructive' });
    },
  });

  // Submit quiz attempt
  const submitQuizAttempt = useMutation({
    mutationFn: async ({ attemptId, answers, score, maxScore }: {
      attemptId: string;
      answers: Record<string, string>;
      score: number;
      maxScore: number;
    }) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score,
          max_score: maxScore,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return data as QuizAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts'] });
      toast({ title: 'Quiz submitted successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to submit quiz', description: error.message, variant: 'destructive' });
    },
  });

  // Get quiz questions
  const getQuizQuestions = async (quizId: string) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  };

  return {
    materials: materialsQuery.data || [],
    quizzes: quizzesQuery.data || [],
    progress: progressQuery.data || [],
    attempts: attemptsQuery.data || [],
    isLoading: materialsQuery.isLoading || quizzesQuery.isLoading,
    updateProgress,
    startQuizAttempt,
    submitQuizAttempt,
    getQuizQuestions,
  };
};
