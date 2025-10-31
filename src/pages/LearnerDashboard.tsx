import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { BookOpen, TrendingUp, Lightbulb, ThumbsUp, ThumbsDown, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLearnerData } from "@/hooks/useLearnerData";

const LearnerDashboard = () => {
  const { user } = useAuth();
  const { learner, performance, recommendations, loading, submitFeedback } = useLearnerData(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
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

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Your performance across all subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.name}</span>
                      <Badge 
                        variant={subject.status === "Excellent" ? "default" : subject.status === "On Track" ? "secondary" : "outline"}
                      >
                        {subject.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={subject.progress} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">{subject.progress}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No performance data yet. Keep learning!
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions to improve your learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">{rec.recommendation_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-3"
                            onClick={() => submitFeedback(rec.id, 'helpful')}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Helpful
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-3"
                            onClick={() => submitFeedback(rec.id, 'not_helpful')}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Not Helpful
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recommendations yet. Your teacher will provide personalized suggestions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AccessibilityToolbar />
    </div>
  );
};

export default LearnerDashboard;
