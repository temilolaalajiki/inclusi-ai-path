import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceRecord {
  id: string;
  subject: string;
  score: number;
  assessment_date: string;
  notes?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  recommendation_type: string;
  priority: string;
  status: string;
  created_at: string;
}

export interface MaterialProgress {
  id: string;
  material_id: string;
  progress_percent: number;
  status: string;
  last_accessed_at: string | null;
  completed_at: string | null;
  material?: {
    id: string;
    title: string;
    subject: string;
    grade_level: string;
    content_type: string;
  };
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number | null;
  max_score: number | null;
  started_at: string;
  completed_at: string | null;
  quiz?: {
    id: string;
    title: string;
    subject: string;
    grade_level: string;
    pass_score: number;
  };
}

export interface LearnerStats {
  overallProgress: number;
  activeCourses: number;
  completedMaterials: number;
  completedQuizzes: number;
  averageQuizScore: number;
  materialsInProgress: MaterialProgress[];
  recentQuizAttempts: QuizAttempt[];
}

export function useLearnerData(userId: string | undefined) {
  const [learner, setLearner] = useState<any>(null);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nigerianContext, setNigerianContext] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [accessibilityProfile, setAccessibilityProfile] = useState<any>(null);
  const [materialProgress, setMaterialProgress] = useState<MaterialProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<LearnerStats>({
    overallProgress: 0,
    activeCourses: 0,
    completedMaterials: 0,
    completedQuizzes: 0,
    averageQuizScore: 0,
    materialsInProgress: [],
    recentQuizAttempts: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchLearnerData();
  }, [userId]);

  const fetchLearnerData = async () => {
    try {
      // Fetch learner profile
      const { data: learnerData, error: learnerError } = await supabase
        .from('learners')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (learnerError) throw learnerError;

      if (learnerData) {
        setLearner(learnerData);

        // Fetch all data in parallel
        const [
          performanceResult,
          recommendationsResult,
          contextResult,
          demoResult,
          accessResult,
          materialProgressResult,
          quizAttemptsResult
        ] = await Promise.all([
          // Performance records
          supabase
            .from('performance_records')
            .select('*')
            .eq('learner_id', learnerData.id)
            .order('assessment_date', { ascending: false }),
          
          // Recommendations
          supabase
            .from('recommendations')
            .select('*')
            .eq('learner_id', learnerData.id)
            .order('created_at', { ascending: false }),
          
          // Nigerian learning context
          supabase
            .from('nigerian_learning_contexts')
            .select('*')
            .eq('learner_id', learnerData.id)
            .maybeSingle(),
          
          // Demographics
          supabase
            .from('learner_demographics')
            .select('*')
            .eq('learner_id', learnerData.id)
            .maybeSingle(),
          
          // Accessibility profile
          supabase
            .from('accessibility_profiles')
            .select('*')
            .eq('learner_id', learnerData.id)
            .maybeSingle(),
          
          // Material progress with material details
          supabase
            .from('material_progress')
            .select(`
              *,
              material:learning_materials(id, title, subject, grade_level, content_type)
            `)
            .eq('learner_id', learnerData.id)
            .order('last_accessed_at', { ascending: false }),
          
          // Quiz attempts with quiz details
          supabase
            .from('quiz_attempts')
            .select(`
              *,
              quiz:quizzes(id, title, subject, grade_level, pass_score)
            `)
            .eq('learner_id', learnerData.id)
            .order('started_at', { ascending: false })
        ]);

        if (performanceResult.error) throw performanceResult.error;
        setPerformance(performanceResult.data || []);

        if (recommendationsResult.error) throw recommendationsResult.error;
        
        setNigerianContext(contextResult.data);
        setDemographics(demoResult.data);
        setAccessibilityProfile(accessResult.data);

        const materials = (materialProgressResult.data || []) as MaterialProgress[];
        const quizzes = (quizAttemptsResult.data || []) as QuizAttempt[];
        
        setMaterialProgress(materials);
        setQuizAttempts(quizzes);

        // Calculate stats
        const completedMaterials = materials.filter(m => m.status === 'completed').length;
        const inProgressMaterials = materials.filter(m => m.status === 'in_progress');
        const completedQuizzes = quizzes.filter(q => q.completed_at !== null);
        
        // Calculate average material progress
        const avgMaterialProgress = materials.length > 0
          ? materials.reduce((sum, m) => sum + m.progress_percent, 0) / materials.length
          : 0;
        
        // Calculate average quiz score
        const completedQuizScores = completedQuizzes.filter(q => q.score !== null && q.max_score !== null);
        const avgQuizScore = completedQuizScores.length > 0
          ? completedQuizScores.reduce((sum, q) => sum + ((q.score! / q.max_score!) * 100), 0) / completedQuizScores.length
          : 0;
        
        // Calculate overall progress (weighted average of materials and quizzes)
        const materialWeight = 0.6;
        const quizWeight = 0.4;
        const overallProgress = materials.length > 0 || completedQuizzes.length > 0
          ? Math.round(
              (materials.length > 0 ? avgMaterialProgress * materialWeight : 0) +
              (completedQuizzes.length > 0 ? avgQuizScore * quizWeight : 0)
            )
          : 0;

        // Generate dynamic recommendations based on progress
        const dynamicRecommendations = generateRecommendations(
          materials,
          quizzes,
          recommendationsResult.data || []
        );
        setRecommendations(dynamicRecommendations);

        setStats({
          overallProgress,
          activeCourses: inProgressMaterials.length + materials.filter(m => m.status === 'not_started').length,
          completedMaterials,
          completedQuizzes: completedQuizzes.length,
          averageQuizScore: Math.round(avgQuizScore),
          materialsInProgress: inProgressMaterials,
          recentQuizAttempts: quizzes.slice(0, 5),
        });
      }
    } catch (error: any) {
      console.error('Error fetching learner data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (
    materials: MaterialProgress[],
    quizzes: QuizAttempt[],
    existingRecs: Recommendation[]
  ): Recommendation[] => {
    const dynamicRecs: Recommendation[] = [...existingRecs];

    // Check for incomplete materials
    const incompleteMaterials = materials.filter(m => m.status === 'in_progress' && m.progress_percent < 50);
    if (incompleteMaterials.length > 0) {
      const material = incompleteMaterials[0];
      if (!dynamicRecs.find(r => r.title.includes('Continue learning'))) {
        dynamicRecs.unshift({
          id: `rec-material-${material.id}`,
          title: `Continue learning: ${material.material?.title || 'Material'}`,
          description: `You're ${material.progress_percent}% through this material. Keep going to complete it!`,
          recommendation_type: 'learning',
          priority: 'high',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Check for low quiz scores
    const failedQuizzes = quizzes.filter(q => 
      q.completed_at && 
      q.score !== null && 
      q.max_score !== null && 
      q.quiz?.pass_score &&
      (q.score / q.max_score * 100) < q.quiz.pass_score
    );
    if (failedQuizzes.length > 0) {
      const quiz = failedQuizzes[0];
      const scorePercent = quiz.score && quiz.max_score ? Math.round((quiz.score / quiz.max_score) * 100) : 0;
      if (!dynamicRecs.find(r => r.title.includes('Retake quiz'))) {
        dynamicRecs.unshift({
          id: `rec-quiz-${quiz.id}`,
          title: `Retake quiz: ${quiz.quiz?.title || 'Quiz'}`,
          description: `You scored ${scorePercent}% (pass score: ${quiz.quiz?.pass_score}%). Review the material and try again.`,
          recommendation_type: 'assessment',
          priority: 'medium',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Check for materials not started
    const notStartedMaterials = materials.filter(m => m.status === 'not_started');
    if (notStartedMaterials.length > 0 && materials.filter(m => m.status === 'completed').length > 0) {
      const material = notStartedMaterials[0];
      if (!dynamicRecs.find(r => r.title.includes('Start new material'))) {
        dynamicRecs.unshift({
          id: `rec-start-${material.id}`,
          title: `Start new material: ${material.material?.title || 'Material'}`,
          description: `Ready for something new? This ${material.material?.subject || 'subject'} material is waiting for you.`,
          recommendation_type: 'learning',
          priority: 'low',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Praise for completed materials
    const recentlyCompleted = materials.filter(m => 
      m.status === 'completed' && 
      m.completed_at && 
      new Date(m.completed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    if (recentlyCompleted.length > 0 && !dynamicRecs.find(r => r.recommendation_type === 'achievement')) {
      dynamicRecs.unshift({
        id: `rec-achievement-${Date.now()}`,
        title: 'Great progress!',
        description: `You've completed ${recentlyCompleted.length} material(s) this week. Keep up the excellent work!`,
        recommendation_type: 'achievement',
        priority: 'low',
        status: 'completed',
        created_at: new Date().toISOString(),
      });
    }

    return dynamicRecs.slice(0, 10); // Limit to 10 recommendations
  };

  const submitFeedback = async (recommendationId: string, rating: 'helpful' | 'not_helpful', comment?: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          recommendation_id: recommendationId,
          user_id: userId,
          rating,
          comment
        });

      if (error) throw error;

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded.'
      });
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return {
    learner,
    performance,
    recommendations,
    nigerianContext,
    demographics,
    accessibilityProfile,
    materialProgress,
    quizAttempts,
    stats,
    loading,
    submitFeedback,
    refetch: fetchLearnerData
  };
}
