import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { BookOpen, TrendingUp, Lightbulb, ThumbsUp, ThumbsDown, Award } from "lucide-react";

const LearnerDashboard = () => {
  const recommendations = [
    {
      title: "Try Visual Learning Tools",
      description: "Based on your recent progress, visual aids like diagrams and charts could help you understand complex topics better.",
      category: "Learning Style",
      icon: Lightbulb,
    },
    {
      title: "Practice Active Reading",
      description: "Break down reading materials into smaller sections and summarize each part to improve comprehension.",
      category: "Study Strategy",
      icon: BookOpen,
    },
    {
      title: "Use Text-to-Speech",
      description: "Listen to your study materials while reviewing notes to reinforce learning through multiple senses.",
      category: "Assistive Tool",
      icon: TrendingUp,
    },
  ];

  const subjects = [
    { name: "Mathematics", progress: 78, status: "On Track" },
    { name: "Science", progress: 85, status: "Excellent" },
    { name: "Language Arts", progress: 72, status: "Needs Support" },
    { name: "Social Studies", progress: 90, status: "Excellent" },
  ];

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
              <div className="text-4xl font-bold text-primary mb-2">81%</div>
              <Progress value={81} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">Keep up the great work!</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">4</div>
              <p className="text-sm text-muted-foreground">Subjects in progress</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">12</div>
              <p className="text-sm text-muted-foreground">Badges earned this month</p>
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
              {subjects.map((subject) => (
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
              ))}
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
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <rec.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-8 px-3">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-3">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Not Helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <AccessibilityToolbar />
    </div>
  );
};

export default LearnerDashboard;
