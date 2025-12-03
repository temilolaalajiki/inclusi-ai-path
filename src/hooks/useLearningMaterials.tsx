import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LearningMaterial {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'document' | 'article' | 'external_link';
  subject: string;
  grade_level: string;
  file_url: string | null;
  external_url: string | null;
  content_text: string | null;
  metadata: Record<string, any>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialInput {
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'article' | 'external_link';
  subject: string;
  grade_level: string;
  file_url?: string;
  external_url?: string;
  content_text?: string;
  metadata?: Record<string, any>;
  is_published?: boolean;
}

export const useLearningMaterials = (teacherId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: ['learning-materials', teacherId],
    queryFn: async () => {
      let query = supabase
        .from('learning_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LearningMaterial[];
    },
    enabled: !!teacherId,
  });

  const createMaterial = useMutation({
    mutationFn: async (input: CreateMaterialInput & { teacher_id: string }) => {
      const { data, error } = await supabase
        .from('learning_materials')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
      toast({ title: 'Material created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create material', description: error.message, variant: 'destructive' });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LearningMaterial> & { id: string }) => {
      const { data, error } = await supabase
        .from('learning_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
      toast({ title: 'Material updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update material', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
      toast({ title: 'Material deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete material', description: error.message, variant: 'destructive' });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { data, error } = await supabase
        .from('learning_materials')
        .update({ is_published })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-materials'] });
      toast({ title: data.is_published ? 'Material published' : 'Material unpublished' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update material', description: error.message, variant: 'destructive' });
    },
  });

  const uploadFile = async (file: File, teacherId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${teacherId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('learning-content')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('learning-content')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  return {
    materials: materialsQuery.data || [],
    isLoading: materialsQuery.isLoading,
    error: materialsQuery.error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    togglePublish,
    uploadFile,
  };
};
