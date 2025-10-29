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

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const students = [
    { 
      id: 1, 
      name: "Emma Johnson", 
      progress: 85, 
      needs: ["Visual learning support", "Additional reading time"],
      status: "On Track"
    },
    { 
      id: 2, 
      name: "Michael Chen", 
      progress: 72, 
      needs: ["Dyslexia support", "Text-to-speech tools"],
      status: "Needs Support"
    },
    { 
      id: 3, 
      name: "Sarah Williams", 
      progress: 92, 
      needs: ["Advanced challenges", "Peer tutoring opportunities"],
      status: "Excellent"
    },
    { 
      id: 4, 
      name: "James Rodriguez", 
      progress: 78, 
      needs: ["Math support", "One-on-one sessions"],
      status: "On Track"
    },
  ];

  const aiInsights = [
    {
      type: "recommendation",
      title: "Increase Visual Aids",
      description: "3 students show improved engagement with visual learning materials. Consider incorporating more diagrams and infographics.",
      priority: "medium",
    },
    {
      type: "alert",
      title: "Reading Time Extension Needed",
      description: "2 students with dyslexia would benefit from extended reading time on assessments.",
      priority: "high",
    },
    {
      type: "success",
      title: "Peer Learning Success",
      description: "Group activities have shown 25% improvement in comprehension scores.",
      priority: "low",
    },
  ];

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
              <div className="text-3xl font-bold text-primary">24</div>
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
              <div className="text-3xl font-bold text-success">82%</div>
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
              <div className="text-3xl font-bold text-warning">5</div>
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
              <div className="text-3xl font-bold text-success">19</div>
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
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: CSV, Excel. Include student name, grades, and learning needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Recent AI Analysis
                  </CardTitle>
                  <CardDescription>Latest recommendations from the AI system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2 mb-1">
                          <Badge 
                            variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "default" : "secondary"}
                          >
                            {insight.priority}
                          </Badge>
                          <h4 className="font-semibold text-sm flex-1">{insight.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">View All Insights</Button>
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
                  {students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <Badge variant={
                            student.status === "Excellent" ? "default" : 
                            student.status === "On Track" ? "secondary" : "outline"
                          } className="mt-1">
                            {student.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between mb-1 text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Learning Needs:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.needs.map((need, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "default" : "secondary"}
                          >
                            {insight.priority} priority
                          </Badge>
                          <Badge variant="outline">{insight.type}</Badge>
                        </div>
                        <Button size="sm" variant="ghost">Dismiss</Button>
                      </div>
                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark as Implemented
                        </Button>
                        <Button size="sm" variant="outline">Provide Feedback</Button>
                      </div>
                    </div>
                  ))}
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
