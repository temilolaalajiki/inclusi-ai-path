import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LearnerWithProgress {
  id: string;
  user_id: string;
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
      // Fetch learners assigned to this teacher
      const { data, error } = await supabase
        .from('learners')
        .select(`
          *,
          profiles!learners_user_id_fkey(first_name, last_name),
          performance_records(subject, score, assessment_date),
          recommendations(id, title, description, priority, status)
        `)
        .eq('teacher_id', userId);

      if (error) throw error;
      setLearners(data as any || []);
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

  return {
    learners,
    loading,
    uploadCSV,
    updateRecommendationStatus,
    refetch: fetchTeacherData
  };
}
