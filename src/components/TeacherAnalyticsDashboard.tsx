import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, TrendingUp, Users, CheckCircle } from "lucide-react";

interface TeacherMetrics {
  teacher_id: string;
  teacher_name: string;
  total_learners: number;
  avg_learner_performance: number;
  recommendations_given: number;
  recommendations_implemented: number;
  feedback_provided: number;
  training_completed: number;
  training_total: number;
  engagement_score: number;
}

export function TeacherAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<TeacherMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherMetrics();
  }, []);

  const fetchTeacherMetrics = async () => {
    try {
      setLoading(true);

      // Fetch all teachers with their profiles
      const { data: teacherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "teacher");

      if (rolesError) throw rolesError;

      const teacherIds = teacherRoles?.map((r) => r.user_id) || [];

      // Fetch profiles for teachers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", teacherIds);

      if (profilesError) throw profilesError;

      // Fetch metrics for each teacher
      const metricsPromises = profiles?.map(async (profile) => {
        // Learner count and performance
        const { data: learners, error: learnersError } = await supabase
          .from("learners")
          .select(`
            id,
            performance_records(score)
          `)
          .eq("teacher_id", profile.id);

        if (learnersError) throw learnersError;

        const totalLearners = learners?.length || 0;
        const allScores = learners?.flatMap(l => 
          (l.performance_records as any[])?.map(pr => pr.score) || []
        ) || [];
        const avgPerformance = allScores.length > 0 
          ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
          : 0;

        // Recommendations
        const { data: recommendations, error: recsError } = await supabase
          .from("recommendations")
          .select("status")
          .eq("teacher_id", profile.id);

        if (recsError) throw recsError;

        const totalRecs = recommendations?.length || 0;
        const implementedRecs = recommendations?.filter(r => r.status === "completed").length || 0;

        // Feedback
        const { data: feedback, error: feedbackError } = await supabase
          .from("feedback")
          .select("id")
          .eq("user_id", profile.id);

        if (feedbackError) throw feedbackError;

        const feedbackCount = feedback?.length || 0;

        // Training
        const { data: training, error: trainingError } = await supabase
          .from("teacher_training")
          .select("completed")
          .eq("teacher_id", profile.id);

        if (trainingError) throw trainingError;

        const trainingTotal = training?.length || 0;
        const trainingCompleted = training?.filter(t => t.completed).length || 0;

        // Calculate engagement score (0-100)
        const engagementScore = Math.round(
          ((implementedRecs / Math.max(totalRecs, 1)) * 30) +
          ((feedbackCount / Math.max(totalLearners, 1)) * 20) +
          ((trainingCompleted / Math.max(trainingTotal, 1)) * 30) +
          (Math.min(totalLearners / 30, 1) * 20)
        );

        return {
          teacher_id: profile.id,
          teacher_name: `${profile.first_name} ${profile.last_name}`,
          total_learners: totalLearners,
          avg_learner_performance: Math.round(avgPerformance * 10) / 10,
          recommendations_given: totalRecs,
          recommendations_implemented: implementedRecs,
          feedback_provided: feedbackCount,
          training_completed: trainingCompleted,
          training_total: trainingTotal,
          engagement_score: engagementScore
        };
      }) || [];

      const metricsData = await Promise.all(metricsPromises);
      setMetrics(metricsData.sort((a, b) => b.engagement_score - a.engagement_score));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading teacher metrics",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">High</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };

  const overallMetrics = {
    totalTeachers: metrics.length,
    avgEngagement: Math.round(metrics.reduce((sum, m) => sum + m.engagement_score, 0) / Math.max(metrics.length, 1)),
    avgTrainingCompletion: Math.round((metrics.reduce((sum, m) => sum + m.training_completed, 0) / 
      Math.max(metrics.reduce((sum, m) => sum + m.training_total, 0), 1)) * 100),
    avgLearnerOutcome: Math.round(metrics.reduce((sum, m) => sum + m.avg_learner_performance, 0) / Math.max(metrics.length, 1) * 10) / 10
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgEngagement}%</div>
            <Progress value={overallMetrics.avgEngagement} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgTrainingCompletion}%</div>
            <Progress value={overallMetrics.avgTrainingCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Learner Score</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgLearnerOutcome}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Overview</CardTitle>
          <CardDescription>Detailed metrics for each teacher</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Learners</TableHead>
                    <TableHead>Recommendations</TableHead>
                    <TableHead>Feedback Given</TableHead>
                    <TableHead>Engagement Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.teacher_id}>
                      <TableCell className="font-medium">{metric.teacher_name}</TableCell>
                      <TableCell>{metric.total_learners}</TableCell>
                      <TableCell>
                        {metric.recommendations_implemented} / {metric.recommendations_given}
                      </TableCell>
                      <TableCell>{metric.feedback_provided}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEngagementBadge(metric.engagement_score)}
                          <span className="text-sm text-muted-foreground">{metric.engagement_score}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="training" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Training Completed</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const completionRate = Math.round((metric.training_completed / Math.max(metric.training_total, 1)) * 100);
                    return (
                      <TableRow key={metric.teacher_id}>
                        <TableCell className="font-medium">{metric.teacher_name}</TableCell>
                        <TableCell>
                          {metric.training_completed} / {metric.training_total}
                        </TableCell>
                        <TableCell>{completionRate}%</TableCell>
                        <TableCell>
                          <Progress value={completionRate} className="w-24" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="outcomes" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Total Learners</TableHead>
                    <TableHead>Avg Performance</TableHead>
                    <TableHead>Recommendations Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const impactRate = metric.recommendations_given > 0 
                      ? Math.round((metric.recommendations_implemented / metric.recommendations_given) * 100)
                      : 0;
                    return (
                      <TableRow key={metric.teacher_id}>
                        <TableCell className="font-medium">{metric.teacher_name}</TableCell>
                        <TableCell>{metric.total_learners}</TableCell>
                        <TableCell>
                          <Badge variant={metric.avg_learner_performance >= 70 ? "default" : "secondary"}>
                            {metric.avg_learner_performance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={impactRate} className="w-24" />
                            <span className="text-sm text-muted-foreground">{impactRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
