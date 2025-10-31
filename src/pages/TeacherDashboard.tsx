import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, Upload, Brain, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherData } from "@/hooks/useTeacherData";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { learners, loading, uploadCSV, updateRecommendationStatus } = useTeacherData(user?.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCSV(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalStudents = learners.length;
  const avgProgress = learners.length > 0
    ? Math.round(
        learners.reduce((sum, learner) => {
          const avg = learner.performance_records.length > 0
            ? learner.performance_records.reduce((s, p) => s + Number(p.score), 0) / learner.performance_records.length
            : 0;
          return sum + avg;
        }, 0) / learners.length
      )
    : 0;
  
  const needSupport = learners.filter(l => 
    l.performance_records.some(p => Number(p.score) < 70)
  ).length;
  
  const onTrack = totalStudents - needSupport;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage your students and access AI-powered insights</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-success" />
                Avg. Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{avgProgress}%</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4 text-warning" />
                Need Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{needSupport}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-success" />
                On Track
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{onTrack}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Upload Student Data</CardTitle>
                  <CardDescription>Import student information and assessment results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop CSV file or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: CSV. Include student name, subject, score, and date columns.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Recent Recommendations
                  </CardTitle>
                  <CardDescription>Latest recommendations for your students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learners.flatMap(l => l.recommendations || []).slice(0, 2).length > 0 ? (
                      learners.flatMap(l => l.recommendations || []).slice(0, 2).map((rec) => (
                        <div key={rec.id} className="p-3 border rounded-lg">
                          <div className="flex items-start gap-2 mb-1">
                            <Badge 
                              variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                            >
                              {rec.priority}
                            </Badge>
                            <h4 className="font-semibold text-sm flex-1">{rec.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recommendations yet
                      </p>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("insights")}>
                      View All Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student List</CardTitle>
                    <CardDescription>View and manage individual student profiles</CardDescription>
                  </div>
                  <Input placeholder="Search students..." className="max-w-xs" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learners.length > 0 ? (
                    learners.slice(0, 5).map((learner) => {
                      const avgScore = learner.performance_records.length > 0
                        ? Math.round(
                            learner.performance_records.reduce((sum, p) => sum + Number(p.score), 0) /
                            learner.performance_records.length
                          )
                        : 0;
                      const status = avgScore >= 85 ? 'Excellent' : avgScore >= 70 ? 'On Track' : 'Needs Support';
                      
                      return (
                        <div key={learner.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">
                                {learner.profiles?.first_name} {learner.profiles?.last_name}
                              </h4>
                              <Badge variant={
                                status === "Excellent" ? "default" : 
                                status === "On Track" ? "secondary" : "outline"
                              } className="mt-1">
                                {status}
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline">View Details</Button>
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex justify-between mb-1 text-sm">
                              <span className="text-muted-foreground">Overall Progress</span>
                              <span className="font-medium">{avgScore}%</span>
                            </div>
                            <Progress value={avgScore} />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Learning Needs:</p>
                            <div className="flex flex-wrap gap-2">
                              {[...(learner.learning_challenges || []), ...(learner.accessibility_needs || [])].map((need, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {need}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No students assigned yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>Evidence-based recommendations to improve inclusive education</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learners.flatMap(l => l.recommendations || []).length > 0 ? (
                    learners.flatMap(l => l.recommendations || []).map((rec) => (
                      <div key={rec.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                            >
                              {rec.priority} priority
                            </Badge>
                            <Badge 
                              variant={rec.status === "implemented" ? "default" : "outline"}
                            >
                              {rec.status}
                            </Badge>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-2">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => updateRecommendationStatus(rec.id, 'implemented')}
                            disabled={rec.status === 'implemented'}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Mark as Implemented
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recommendations yet. Add recommendations for your students.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AccessibilityToolbar />
    </div>
  );
};

export default TeacherDashboard;
