import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload, Video, FileText, Link, BookOpen, Loader2 } from 'lucide-react';
import { useLearningMaterials, LearningMaterial } from '@/hooks/useLearningMaterials';

const SUBJECTS = ['Mathematics', 'English', 'Science', 'Social Studies', 'Civic Education', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'];
const GRADES = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
const CONTENT_TYPES = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'article', label: 'Article', icon: BookOpen },
  { value: 'external_link', label: 'External Link', icon: Link },
] as const;

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content_type: z.enum(['video', 'document', 'article', 'external_link']),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  external_url: z.string().url().optional().or(z.literal('')),
  content_text: z.string().optional(),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface LearningMaterialFormProps {
  teacherId: string;
  material?: LearningMaterial;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LearningMaterialForm = ({ teacherId, material, onSuccess, onCancel }: LearningMaterialFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { createMaterial, updateMaterial, uploadFile } = useLearningMaterials(teacherId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: material?.title || '',
      description: material?.description || '',
      content_type: material?.content_type || 'article',
      subject: material?.subject || '',
      grade_level: material?.grade_level || '',
      external_url: material?.external_url || '',
      content_text: material?.content_text || '',
      is_published: material?.is_published || false,
    },
  });

  const contentType = form.watch('content_type');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        form.setError('root', { message: 'File size must be less than 50MB' });
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
      let fileUrl = material?.file_url || null;

      // Upload file if selected
      if (file && (contentType === 'video' || contentType === 'document')) {
        fileUrl = await uploadFile(file, teacherId);
      }

      const materialData = {
        title: values.title,
        description: values.description,
        content_type: values.content_type,
        subject: values.subject,
        grade_level: values.grade_level,
        is_published: values.is_published,
        teacher_id: teacherId,
        file_url: fileUrl,
        external_url: values.external_url || null,
        content_text: values.content_text || null,
        metadata: file ? { file_name: file.name, file_size: file.size } : {},
      };

      if (material) {
        await updateMaterial.mutateAsync({ id: material.id, ...materialData });
      } else {
        await createMaterial.mutateAsync(materialData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving material:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = createMaterial.isPending || updateMaterial.isPending || isUploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{material ? 'Edit Learning Material' : 'Create Learning Material'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter material title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the material" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADES.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload for Video/Document */}
            {(contentType === 'video' || contentType === 'document') && (
              <div className="space-y-2">
                <FormLabel>Upload File</FormLabel>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={contentType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {contentType === 'video' ? 'MP4, WebM up to 50MB' : 'PDF, DOC, DOCX, PPT up to 50MB'}
                    </p>
                  </label>
                </div>
                {material?.file_url && !file && (
                  <p className="text-sm text-muted-foreground">Current file: {material.metadata?.file_name || 'Uploaded file'}</p>
                )}
              </div>
            )}

            {/* External URL for External Link */}
            {contentType === 'external_link' && (
              <FormField
                control={form.control}
                name="external_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>External URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/resource" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Rich Text for Article */}
            {contentType === 'article' && (
              <FormField
                control={form.control}
                name="content_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your article content here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Material</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this material visible to learners
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {material ? 'Update Material' : 'Create Material'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
