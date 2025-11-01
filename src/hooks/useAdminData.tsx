import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminMetrics {
  totalLearners: number;
  totalTeachers: number;
  avgProgress: number;
  accessibilityScore: number;
  learnersNeedingSupport: number;
  learnersOnTrack: number;
}

export interface BarrierData {
  name: string;
  value: number;
}

export interface InterventionData {
  type: string;
  count: number;
  successRate: number;
}

export function useAdminData() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalLearners: 0,
    totalTeachers: 0,
    avgProgress: 0,
    accessibilityScore: 0,
    learnersNeedingSupport: 0,
    learnersOnTrack: 0
  });
  const [barriers, setBarriers] = useState<BarrierData[]>([]);
  const [interventions, setInterventions] = useState<InterventionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch total learners
      const { count: learnersCount } = await supabase
        .from('learners')
        .select('*', { count: 'exact', head: true });

      // Fetch total teachers
      const { count: teachersCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

      // Fetch all performance records to calculate average
      const { data: performanceData } = await supabase
        .from('performance_records')
        .select('score');

      const avgScore = performanceData && performanceData.length > 0
        ? performanceData.reduce((sum, record) => sum + Number(record.score), 0) / performanceData.length
        : 0;

      // Fetch learners with their challenges to analyze barriers
      const { data: learnersData } = await supabase
        .from('learners')
        .select('learning_challenges, accessibility_needs');

      // Analyze barriers
      const barriersMap: { [key: string]: number } = {};
      learnersData?.forEach(learner => {
        [...(learner.learning_challenges || []), ...(learner.accessibility_needs || [])].forEach(challenge => {
          barriersMap[challenge] = (barriersMap[challenge] || 0) + 1;
        });
      });

      const barriersArray = Object.entries(barriersMap).map(([name, value]) => ({
        name,
        value
      }));

      // Fetch recommendations by type to analyze interventions
      const { data: recommendationsData } = await supabase
        .from('recommendations')
        .select('recommendation_type, status');

      const interventionsMap: { [key: string]: { count: number; implemented: number } } = {};
      recommendationsData?.forEach(rec => {
        if (!interventionsMap[rec.recommendation_type]) {
          interventionsMap[rec.recommendation_type] = { count: 0, implemented: 0 };
        }
        interventionsMap[rec.recommendation_type].count++;
        if (rec.status === 'implemented') {
          interventionsMap[rec.recommendation_type].implemented++;
        }
      });

      const interventionsArray = Object.entries(interventionsMap).map(([type, data]) => ({
        type,
        count: data.count,
        successRate: data.count > 0 ? (data.implemented / data.count) * 100 : 0
      }));

      // Calculate learners needing support vs on track
      const needingSupport = performanceData?.filter(p => Number(p.score) < 70).length || 0;
      const onTrack = (performanceData?.length || 0) - needingSupport;

      setMetrics({
        totalLearners: learnersCount || 0,
        totalTeachers: teachersCount || 0,
        avgProgress: Math.round(avgScore),
        accessibilityScore: 92, // This would be calculated based on various factors
        learnersNeedingSupport: needingSupport,
        learnersOnTrack: onTrack
      });

      setBarriers(barriersArray);
      setInterventions(interventionsArray);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {}
      });

      if (error) throw error;

      setInsights(data.insights);
      
      toast({
        title: 'Insights Generated!',
        description: `Analysis complete using ${data.source === 'ai' ? 'AI' : 'rule-based analysis'}.`
      });
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  return {
    metrics,
    barriers,
    interventions,
    loading,
    insights,
    insightsLoading,
    generateInsights,
    refetch: fetchAdminData
  };
}
