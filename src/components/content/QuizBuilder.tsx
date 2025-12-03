import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Loader2, FileQuestion, ArrowLeft, Sparkles } from 'lucide-react';
import { useQuizzes, Quiz, QuizQuestion } from '@/hooks/useQuizzes';
import { useLearningMaterials } from '@/hooks/useLearningMaterials';
import { QuizQuestionEditor } from './QuizQuestionEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const SUBJECTS = ['Mathematics', 'English', 'Science', 'Social Studies', 'Civic Education', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'];
const GRADES = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  material_id: z.string().optional(),
  time_limit_minutes: z.number().min(1).max(180).optional(),
  pass_score: z.number().min(0).max(100).default(50),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface QuizBuilderProps {
  teacherId: string;
  quiz?: Quiz;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuizBuilder = ({ teacherId, quiz, onSuccess, onCancel }: QuizBuilderProps) => {
  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { materials } = useLearningMaterials(teacherId);
  const { createQuiz, updateQuiz, getQuizWithQuestions, createQuestion, updateQuestion, deleteQuestion } = useQuizzes(teacherId);

  const handleGenerateWithAI = async () => {
    const subject = form.getValues('subject');
    const gradeLevel = form.getValues('grade_level');
    const materialId = form.getValues('material_id');

    if (!subject || !gradeLevel) {
      toast({
        title: 'Missing information',
        description: 'Please select a subject and grade level first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const selectedMaterial = materialId ? materials.find(m => m.id === materialId) : null;
      
      const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
        body: {
          materialContent: selectedMaterial?.content_text || selectedMaterial?.description,
          materialTitle: selectedMaterial?.title || `${subject} Quiz`,
          subject,
          gradeLevel,
          questionCount: 5,
        },
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        const newQuestions: Partial<QuizQuestion>[] = data.questions.map((q: any, index: number) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          points: q.points || 1,
          order_index: questions.length + index,
        }));

        setQuestions([...questions, ...newQuestions]);
        toast({
          title: 'Questions generated',
          description: `Added ${newQuestions.length} AI-generated questions`,
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate questions',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz?.title || '',
      description: quiz?.description || '',
      subject: quiz?.subject || '',
      grade_level: quiz?.grade_level || '',
      material_id: quiz?.material_id || '',
      time_limit_minutes: quiz?.time_limit_minutes || undefined,
      pass_score: quiz?.pass_score || 50,
      is_published: quiz?.is_published || false,
    },
  });

  // Load existing questions when editing
  useEffect(() => {
    const loadQuiz = async () => {
      if (quiz?.id) {
        setIsLoadingQuiz(true);
        try {
          const fullQuiz = await getQuizWithQuestions(quiz.id);
          if (fullQuiz?.questions) {
            setQuestions(fullQuiz.questions);
          }
        } catch (error) {
          console.error('Error loading quiz:', error);
        } finally {
          setIsLoadingQuiz(false);
        }
      }
    };
    loadQuiz();
  }, [quiz?.id]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1,
        order_index: questions.length,
      },
    ]);
  };

  const handleSaveQuestion = (index: number, questionData: Partial<QuizQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...questionData };
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Update order indices
    newQuestions.forEach((q, i) => {
      q.order_index = i;
    });
    setQuestions(newQuestions);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      let quizId = quiz?.id;

      const quizData = {
        title: values.title,
        description: values.description,
        subject: values.subject,
        grade_level: values.grade_level,
        pass_score: values.pass_score,
        is_published: values.is_published,
        teacher_id: teacherId,
        material_id: values.material_id || null,
        time_limit_minutes: values.time_limit_minutes || null,
      };

      if (quiz?.id) {
        await updateQuiz.mutateAsync({ id: quiz.id, ...quizData });
      } else {
        const newQuiz = await createQuiz.mutateAsync(quizData);
        quizId = newQuiz.id;
      }

      // Save questions
      if (quizId) {
        for (const question of questions) {
          if (question.question_text?.trim()) {
            if (question.id) {
              // Update existing question
              await updateQuestion.mutateAsync({
                id: question.id,
                question_text: question.question_text,
                question_type: question.question_type,
                options: question.options,
                correct_answer: question.correct_answer,
                points: question.points,
                order_index: question.order_index,
              });
            } else {
              // Create new question
              await createQuestion.mutateAsync({
                quiz_id: quizId,
                question_text: question.question_text,
                question_type: question.question_type || 'multiple_choice',
                options: question.options as string[],
                correct_answer: question.correct_answer || '',
                points: question.points || 1,
                order_index: question.order_index || 0,
              });
            }
          }
        }

        // Delete removed questions
        if (quiz?.questions) {
          const currentQuestionIds = questions.filter(q => q.id).map(q => q.id);
          const questionsToDelete = quiz.questions.filter(q => !currentQuestionIds.includes(q.id));
          for (const q of questionsToDelete) {
            await deleteQuestion.mutateAsync(q.id);
          }
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const isSubmitting = createQuiz.isPending || updateQuiz.isPending;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  if (isLoadingQuiz) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>{quiz ? 'Edit Quiz' : 'Create Quiz'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter quiz title" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the quiz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <FormField
                  control={form.control}
                  name="material_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Material (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {materials.filter(m => m.is_published).map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="time_limit_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (minutes, optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={180}
                          placeholder="No time limit"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pass_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pass Score (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Quiz</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Make this quiz available to learners
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      {questions.length} question{questions.length !== 1 ? 's' : ''} • {totalPoints} total points
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleGenerateWithAI}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Generate with AI
                    </Button>
                    <Button type="button" variant="outline" onClick={handleAddQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>

                {questions.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No questions added yet</p>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleGenerateWithAI}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Generate with AI
                        </Button>
                        <Button type="button" variant="outline" onClick={handleAddQuestion}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <QuizQuestionEditor
                        key={question.id || `new-${index}`}
                        question={question}
                        index={index}
                        onSave={(data) => handleSaveQuestion(index, data)}
                        onDelete={() => handleDeleteQuestion(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-3 justify-end">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {quiz ? 'Update Quiz' : 'Create Quiz'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
