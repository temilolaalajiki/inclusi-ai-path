import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LearnerWithProgress {
  id: string;
  user_id: string;
  teacher_id: string | null;
  learning_challenges: string[];
  accessibility_needs: string[];
  profiles: {
    first_name: string;
    last_name: string;
  };
  performance_records: Array<{
    subject: string;
    score: number;
    assessment_date: string;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
  }>;
}

export function useTeacherData(userId: string | undefined) {
  const [learners, setLearners] = useState<LearnerWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchTeacherData();
  }, [userId]);

  const fetchTeacherData = async () => {
    try {
      // Fetch learners assigned to this teacher (base rows only)
      const { data: learnersData, error: learnersError } = await supabase
        .from('learners')
        .select('*')
        .eq('teacher_id', userId);

      if (learnersError) throw learnersError;

      const learners = learnersData || [];
      if (learners.length === 0) {
        setLearners([]);
        return;
      }

      // Collect ids for related lookups
      const learnerIds = learners.map((l: any) => l.id);
      const userIds = learners.map((l: any) => l.user_id);

      // Fetch related data in parallel to avoid FK-dependent joins
      const [profilesRes, perfRes, recsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds as string[]),
        supabase
          .from('performance_records')
          .select('learner_id, subject, score, assessment_date')
          .in('learner_id', learnerIds as string[]),
        supabase
          .from('recommendations')
          .select('learner_id, id, title, description, priority, status')
          .in('learner_id', learnerIds as string[]),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (perfRes.error) throw perfRes.error;
      if (recsRes.error) throw recsRes.error;

      const profilesByUserId = new Map(
        (profilesRes.data || []).map(p => [p.id, { first_name: p.first_name, last_name: p.last_name }])
      );

      const perfByLearnerId = new Map<string, Array<{subject: string; score: number; assessment_date: string}>>();
      (perfRes.data || []).forEach((r: any) => {
        const arr = perfByLearnerId.get(r.learner_id) || [];
        arr.push({ subject: r.subject, score: Number(r.score), assessment_date: r.assessment_date });
        perfByLearnerId.set(r.learner_id, arr);
      });

      const recsByLearnerId = new Map<string, Array<{id: string; title: string; description: string; priority: string; status: string}>>();
      (recsRes.data || []).forEach((r: any) => {
        const arr = recsByLearnerId.get(r.learner_id) || [];
        arr.push({ id: r.id, title: r.title, description: r.description, priority: r.priority, status: r.status });
        recsByLearnerId.set(r.learner_id, arr);
      });

      const combined = learners.map((l: any) => ({
        ...l,
        profiles: profilesByUserId.get(l.user_id) || { first_name: '', last_name: '' },
        performance_records: perfByLearnerId.get(l.id) || [],
        recommendations: recsByLearnerId.get(l.id) || [],
      }));

      setLearners(combined as any);
    } catch (error: any) {
      console.error('Error fetching teacher data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadCSV = async (file: File) => {
    try {
      // Parse CSV and insert data
      const text = await file.text();
      const rows = text.split('\n').slice(1); // Skip header
      
      const insertPromises = rows.map(async (row) => {
        const [name, subject, score, date] = row.split(',');
        if (!name || !subject || !score) return;

        // Find or create learner
        const [firstName, ...lastNameParts] = name.trim().split(' ');
        const lastName = lastNameParts.join(' ');

        // This is simplified - in production, you'd need to handle user creation
        // and learner creation more carefully
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('first_name', firstName)
          .eq('last_name', lastName)
          .maybeSingle();

        if (profileData) {
          const { data: learnerData } = await supabase
            .from('learners')
            .select('id')
            .eq('user_id', profileData.id)
            .maybeSingle();

          if (learnerData) {
            await supabase
              .from('performance_records')
              .insert({
                learner_id: learnerData.id,
                subject: subject.trim(),
                score: parseFloat(score),
                assessment_date: date?.trim() || new Date().toISOString().split('T')[0]
              });
          }
        }
      });

      await Promise.all(insertPromises);

      toast({
        title: 'Success!',
        description: 'Student data has been uploaded.'
      });

      fetchTeacherData();
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload CSV. Please check the format and try again.',
        variant: 'destructive'
      });
    }
  };

  const updateRecommendationStatus = async (recommendationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .update({ status, implemented_at: status === 'implemented' ? new Date().toISOString() : null })
        .eq('id', recommendationId);

      if (error) throw error;

      toast({
        title: 'Updated!',
        description: 'Recommendation status has been updated.'
      });

      fetchTeacherData();
    } catch (error: any) {
      console.error('Error updating recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recommendation status.',
        variant: 'destructive'
      });
    }
  };

  const analyzeStudent = async (learnerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-learner', {
        body: { learnerId }
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete!',
        description: `Generated ${data.recommendations?.length || 0} new recommendations using ${data.source === 'ai' ? 'AI' : 'rule-based analysis'}.`
      });

      fetchTeacherData();
    } catch (error: any) {
      console.error('Error analyzing student:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze student. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const suggestInterventions = async (learnerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('suggest-interventions', {
        body: { learnerId }
      });

      if (error) throw error;

      toast({
        title: 'Interventions Generated!',
        description: `Created ${data.interventions?.length || 0} intervention strategies using ${data.source === 'ai' ? 'AI' : 'rule-based analysis'}.`
      });

      fetchTeacherData();
    } catch (error: any) {
      console.error('Error generating interventions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate interventions. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return {
    learners,
    loading,
    uploadCSV,
    updateRecommendationStatus,
    analyzeStudent,
    suggestInterventions,
    refetch: fetchTeacherData
  };
}
