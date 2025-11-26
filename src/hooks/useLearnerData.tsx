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

export function useLearnerData(userId: string | undefined) {
  const [learner, setLearner] = useState<any>(null);
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nigerianContext, setNigerianContext] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [accessibilityProfile, setAccessibilityProfile] = useState<any>(null);
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

        // Fetch performance records
        const { data: performanceData, error: performanceError } = await supabase
          .from('performance_records')
          .select('*')
          .eq('learner_id', learnerData.id)
          .order('assessment_date', { ascending: false });

        if (performanceError) throw performanceError;
        setPerformance(performanceData || []);

        // Fetch recommendations
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('recommendations')
          .select('*')
          .eq('learner_id', learnerData.id)
          .order('created_at', { ascending: false });

        if (recommendationsError) throw recommendationsError;
        setRecommendations(recommendationsData || []);

        // Fetch Nigerian learning context
        const { data: contextData } = await supabase
          .from('nigerian_learning_contexts')
          .select('*')
          .eq('learner_id', learnerData.id)
          .maybeSingle();
        setNigerianContext(contextData);

        // Fetch demographics
        const { data: demoData } = await supabase
          .from('learner_demographics')
          .select('*')
          .eq('learner_id', learnerData.id)
          .maybeSingle();
        setDemographics(demoData);

        // Fetch accessibility profile
        const { data: accessData } = await supabase
          .from('accessibility_profiles')
          .select('*')
          .eq('learner_id', learnerData.id)
          .maybeSingle();
        setAccessibilityProfile(accessData);
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
    loading,
    submitFeedback,
    refetch: fetchLearnerData
  };
}
