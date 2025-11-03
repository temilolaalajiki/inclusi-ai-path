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
  const [dateRange, setDateRange] = useState({ startDate: '2024-01-01', endDate: new Date().toISOString() });
  const [teacherEngagement, setTeacherEngagement] = useState({ rate: 0, active: 0, total: 0 });
  const [predictiveTrend, setPredictiveTrend] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, [dateRange]);

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

      // Use aggregate analytics edge function for advanced metrics
      const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('aggregate-analytics', {
        body: { startDate: dateRange.startDate, endDate: dateRange.endDate }
      });

      if (analyticsError) {
        console.error('Analytics error:', analyticsError);
        // Fall back to basic data if analytics fails
        const { data: performanceData } = await supabase
          .from('performance_records')
          .select('score')
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);

        const avgScore = performanceData && performanceData.length > 0
          ? performanceData.reduce((sum, record) => sum + Number(record.score), 0) / performanceData.length
          : 0;

        const needingSupport = performanceData?.filter(p => Number(p.score) < 70).length || 0;
        const onTrack = (performanceData?.length || 0) - needingSupport;

        setMetrics({
          totalLearners: learnersCount || 0,
          totalTeachers: teachersCount || 0,
          avgProgress: Math.round(avgScore),
          accessibilityScore: 92,
          learnersNeedingSupport: needingSupport,
          learnersOnTrack: onTrack
        });
      } else {
        // Use analytics data
        const { data: performanceData } = await supabase
          .from('performance_records')
          .select('score')
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate);

        const needingSupport = performanceData?.filter(p => Number(p.score) < 70).length || 0;
        const onTrack = (performanceData?.length || 0) - needingSupport;

        setMetrics({
          totalLearners: learnersCount || 0,
          totalTeachers: teachersCount || 0,
          avgProgress: analyticsData.avgProgress,
          accessibilityScore: 92,
          learnersNeedingSupport: needingSupport,
          learnersOnTrack: onTrack
        });

        setBarriers(analyticsData.barriers || []);
        setInterventions(analyticsData.interventions || []);
        setTeacherEngagement(analyticsData.teacherEngagement || { rate: 0, active: 0, total: 0 });
        setPredictiveTrend(analyticsData.predictiveTrend || 0);
      }
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

  const exportToPDF = async () => {
    toast({
      title: 'Generating PDF...',
      description: 'Please wait while we prepare your report.'
    });
    // PDF export will be handled in the component with jsPDF
  };

  const exportToExcel = () => {
    toast({
      title: 'Generating Excel...',
      description: 'Please wait while we prepare your spreadsheet.'
    });
    // Excel export will be handled in the component with XLSX
  };

  const generateWeeklyReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: 'Weekly Report Generated!',
        description: 'The report has been created successfully.'
      });

      return data;
    } catch (error: any) {
      console.error('Error generating weekly report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate weekly report.',
        variant: 'destructive'
      });
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
    refetch: fetchAdminData,
    dateRange,
    setDateRange,
    teacherEngagement,
    predictiveTrend,
    exportToPDF,
    exportToExcel,
    generateWeeklyReport
  };
}
