import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Clock, Award, Loader2, Users, AlertTriangle, Eye, Ear, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrainingResource {
  id: string;
  title: string;
  description: string;
  duration: string;
  target_skills: string[];
  resource_url: string;
  difficulty_level: string;
}

interface TrainingRecommendation {
  training_id: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  resource?: TrainingResource;
}

interface StudentNeedsSummary {
  totalStudents: number;
  learningChallenges: Record<string, number>;
  accessibilityNeeds: Record<string, number>;
}

export function TrainingRecommendations() {
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);
  const [studentNeeds, setStudentNeeds] = useState<StudentNeedsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadStudentNeeds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: learners, error } = await supabase
        .from('learners')
        .select('id, learning_challenges, accessibility_needs')
        .eq('teacher_id', user.id);

      if (error) throw error;

      const learningChallenges: Record<string, number> = {};
      const accessibilityNeeds: Record<string, number> = {};

      learners?.forEach(learner => {
        learner.learning_challenges?.forEach((challenge: string) => {
          learningChallenges[challenge] = (learningChallenges[challenge] || 0) + 1;
        });
        learner.accessibility_needs?.forEach((need: string) => {
          accessibilityNeeds[need] = (accessibilityNeeds[need] || 0) + 1;
        });
      });

      setStudentNeeds({
        totalStudents: learners?.length || 0,
        learningChallenges,
        accessibilityNeeds
      });
    } catch (error) {
      console.error('Error loading student needs:', error);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('recommend-training', {
        body: { teacherId: user.id }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      
      toast({
        title: 'Recommendations Loaded',
        description: `Found ${data.recommendations?.length || 0} training recommendations for you.`
      });
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load training recommendations.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (trainingTitle: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('teacher_training')
        .insert({
          teacher_id: user.id,
          training_title: trainingTitle,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Training Marked Complete',
        description: `Successfully marked "${trainingTitle}" as completed.`
      });

      await loadRecommendations();
    } catch (error: any) {
      console.error('Error marking training complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark training as complete.',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNeedIcon = (need: string) => {
    const lowerNeed = need.toLowerCase();
    if (lowerNeed.includes('visual') || lowerNeed.includes('blind') || lowerNeed.includes('sight')) {
      return <Eye className="h-3 w-3" />;
    }
    if (lowerNeed.includes('hearing') || lowerNeed.includes('deaf') || lowerNeed.includes('auditory')) {
      return <Ear className="h-3 w-3" />;
    }
    return <Brain className="h-3 w-3" />;
  };

  useEffect(() => {
    loadStudentNeeds();
    loadRecommendations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Professional Development
            </CardTitle>
            <CardDescription>
              Personalized training recommendations based on your teaching patterns
            </CardDescription>
          </div>
          <Button onClick={loadRecommendations} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Student Needs Summary */}
        {studentNeeds && studentNeeds.totalStudents > 0 && (
          <Card className="bg-muted/50 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Your Students' Needs Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Based on {studentNeeds.totalStudents} assigned student{studentNeeds.totalStudents !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Learning Challenges */}
                {Object.keys(studentNeeds.learningChallenges).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Learning Challenges
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(studentNeeds.learningChallenges)
                        .sort(([, a], [, b]) => b - a)
                        .map(([challenge, count]) => (
                          <Badge key={challenge} variant="outline" className="text-xs">
                            {challenge} ({count})
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Accessibility Needs */}
                {Object.keys(studentNeeds.accessibilityNeeds).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                      Accessibility Needs
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(studentNeeds.accessibilityNeeds)
                        .sort(([, a], [, b]) => b - a)
                        .map(([need, count]) => (
                          <Badge key={need} variant="outline" className="text-xs flex items-center gap-1">
                            {getNeedIcon(need)}
                            {need} ({count})
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {Object.keys(studentNeeds.learningChallenges).length === 0 && 
                 Object.keys(studentNeeds.accessibilityNeeds).length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-2">
                    No specific learning challenges or accessibility needs recorded for your students yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {loading && recommendations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No training recommendations available yet. Keep working with your learners to get personalized suggestions.
          </p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Recommended Training</h3>
            {recommendations.map((rec, index) => (
              <Card key={index} className="border-l-4" style={{
                borderLeftColor: rec.priority === 'high' ? 'hsl(var(--destructive))' : rec.priority === 'medium' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
              }}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{rec.resource?.title || rec.training_id}</h3>
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                          {rec.resource && (
                            <Badge className={getDifficultyColor(rec.resource.difficulty_level)}>
                              {rec.resource.difficulty_level}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>

                    {rec.resource && (
                      <>
                        <p className="text-sm">{rec.resource.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {rec.resource.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            {rec.resource.target_skills.length} skills
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {rec.resource.target_skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          {rec.resource.resource_url && (
                            <Button size="sm" asChild>
                              <a 
                                href={rec.resource.resource_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Start Course
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsCompleted(rec.resource!.title)}
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}