import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import { BookOpen, TrendingUp, Lightbulb, ThumbsUp, ThumbsDown, Award, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLearnerData } from "@/hooks/useLearnerData";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LearnerAttendanceView } from "@/components/LearnerAttendanceView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const LearnerDashboard = () => {
  const { user } = useAuth();
  const { learner, performance, recommendations, loading, submitFeedback } = useLearnerData(user?.id);
  const [activeTab, setActiveTab] = useState("progress");

  if (loading) {
    return <LoadingScreen />;
  }

  if (!learner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Learner Profile</CardTitle>
              <CardDescription>Please contact your teacher to set up your learner profile.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate subject progress from performance records
  const subjectProgress = performance.reduce((acc, record) => {
    if (!acc[record.subject]) {
      acc[record.subject] = { total: 0, count: 0 };
    }
    acc[record.subject].total += Number(record.score);
    acc[record.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const subjects = Object.entries(subjectProgress).map(([name, data]) => {
    const progress = Math.round(data.total / data.count);
    return {
      name,
      progress,
      status: progress >= 85 ? 'Excellent' : progress >= 70 ? 'On Track' : 'Needs Support'
    };
  });

  const avgProgress = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome Back, Student!
            </h1>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              Level 5 Learner
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">Your personalized learning journey continues</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{avgProgress}%</div>
              <Progress value={avgProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {avgProgress >= 85 ? 'Excellent work!' : avgProgress >= 70 ? 'Keep up the great work!' : 'You can do it!'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{subjects.length}</div>
              <p className="text-sm text-muted-foreground">Subjects in progress</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{recommendations.length}</div>
              <p className="text-sm text-muted-foreground">Personalized suggestions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="progress">Progress & Performance</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Subject Progress</CardTitle>
                  <CardDescription>Your performance across all subjects</CardDescription>
                </CardHeader>
...
              </Card>
            </div>

            <ProgressTimeline performance={performance} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            {learner && <LearnerAttendanceView learnerId={learner.id} />}
          </TabsContent>
        </Tabs>
      </div>

      <EnhancedAccessibilityToolbar />
    </div>
  );
};

export default LearnerDashboard;
