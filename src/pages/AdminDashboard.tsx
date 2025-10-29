import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, TrendingUp, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const progressData = [
    { month: 'Jan', progress: 65 },
    { month: 'Feb', progress: 70 },
    { month: 'Mar', progress: 75 },
    { month: 'Apr', progress: 78 },
    { month: 'May', progress: 82 },
    { month: 'Jun', progress: 85 },
  ];

  const barriersData = [
    { name: 'Visual Impairment', value: 15 },
    { name: 'Dyslexia', value: 28 },
    { name: 'ADHD', value: 22 },
    { name: 'Hearing Impairment', value: 12 },
    { name: 'Motor Skills', value: 18 },
    { name: 'Other', value: 5 },
  ];

  const interventionData = [
    { intervention: 'Text-to-Speech', success: 92 },
    { intervention: 'Visual Aids', success: 88 },
    { intervention: 'Extended Time', success: 85 },
    { intervention: 'Peer Support', success: 78 },
    { intervention: 'One-on-One', success: 95 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Administrator Analytics
              </h1>
              <p className="text-muted-foreground text-lg">System-wide insights and reporting</p>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Total Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,247</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Active Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">87</div>
              <p className="text-xs text-muted-foreground mt-1">Across 15 departments</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-success" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">87%</div>
              <p className="text-xs text-muted-foreground mt-1">Intervention effectiveness</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4 text-success" />
                Accessibility Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">92</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="barriers">Barriers</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Learner Progress Trends</CardTitle>
                <CardDescription>Average progress across all learners over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Progress (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Teacher Engagement</CardTitle>
                  <CardDescription>Active teachers using AI recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary mb-2">78%</div>
                  <p className="text-sm text-muted-foreground mb-4">68 of 87 teachers actively using AI insights</p>
                  <Button variant="outline" className="w-full">View Details</Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>System Usage</CardTitle>
                  <CardDescription>Platform engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Active Users</span>
                      <span className="font-semibold">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Weekly Reports Generated</span>
                      <span className="font-semibold">234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">AI Recommendations</span>
                      <span className="font-semibold">1,456</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="barriers" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Common Accessibility Barriers</CardTitle>
                <CardDescription>Distribution of learning challenges across the institution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={barriersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {barriersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Priority Areas
                </CardTitle>
                <CardDescription>Areas requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border border-warning/50 rounded-lg bg-warning/5">
                    <h4 className="font-semibold mb-1">Increase Dyslexia Support Resources</h4>
                    <p className="text-sm text-muted-foreground">28% of students require specialized dyslexia interventions</p>
                  </div>
                  <div className="p-4 border border-warning/50 rounded-lg bg-warning/5">
                    <h4 className="font-semibold mb-1">ADHD Accommodation Training</h4>
                    <p className="text-sm text-muted-foreground">Teacher training needed for better ADHD support strategies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Intervention Success Rates</CardTitle>
                <CardDescription>Effectiveness of different support strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={interventionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="intervention" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success" fill="hsl(var(--primary))" name="Success Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Top Performing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success mb-1">One-on-One Sessions</div>
                  <p className="text-sm text-muted-foreground">95% success rate</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Most Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-1">Text-to-Speech</div>
                  <p className="text-sm text-muted-foreground">Used by 342 learners</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Best Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary mb-1">Visual Aids</div>
                  <p className="text-sm text-muted-foreground">High impact, low cost</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AccessibilityToolbar />
    </div>
  );
};

export default AdminDashboard;
