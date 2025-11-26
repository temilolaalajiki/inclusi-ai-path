import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import { CreateLearnerForm } from "@/components/CreateLearnerForm";
import { CreateTeacherForm } from "@/components/CreateTeacherForm";
import { StudentListTable } from "@/components/StudentListTable";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { TeacherListTable } from "@/components/TeacherListTable";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, TrendingUp, Download, AlertTriangle, CheckCircle, FileDown, FileSpreadsheet, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminData } from "@/hooks/useAdminData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LearnerWithProgress } from "@/hooks/useTeacherData";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { LoadingScreen } from "@/components/LoadingScreen";

const AdminDashboard = () => {
  const { 
    metrics, 
    barriers, 
    interventions, 
    loading, 
    insights, 
    insightsLoading, 
    generateInsights,
    dateRange,
    setDateRange,
    teacherEngagement,
    predictiveTrend,
    generateWeeklyReport
  } = useAdminData();
  
  const [learners, setLearners] = useState<LearnerWithProgress[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<LearnerWithProgress | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [learnersLoading, setLearnersLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLearners();
    fetchTeachers();
  }, []);

  const fetchLearners = async () => {
    setLearnersLoading(true);
    try {
      const { data: learnersData, error } = await supabase
        .from('learners')
        .select(`
          *,
          performance_records(*),
          recommendations(*)
        `);

      if (error) throw error;

      // Fetch profiles separately
      if (learnersData && learnersData.length > 0) {
        const userIds = learnersData.map(l => l.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        // Merge profiles with learners
        const enrichedLearners = learnersData.map(learner => ({
          ...learner,
          profiles: profilesData?.find(p => p.id === learner.user_id) || null
        }));

        setLearners(enrichedLearners as any || []);
      } else {
        setLearners([]);
      }
    } catch (error: any) {
      console.error('Error fetching learners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learners data.',
        variant: 'destructive'
      });
    } finally {
      setLearnersLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (rolesData && rolesData.length > 0) {
        const teacherIds = rolesData.map(r => r.user_id);
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', teacherIds);

        // Fetch email addresses from auth.users
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        
        const emailMap = new Map<string, string>();
        if (!usersError && users) {
          users.forEach((user: any) => {
            emailMap.set(user.id, user.email || 'N/A');
          });
        }

        const { data: learnersCount } = await supabase
          .from('learners')
          .select('teacher_id');

        const teachersWithDetails = profilesData?.map(profile => {
            const assignedCount = learnersCount?.filter(l => l.teacher_id === profile.id).length || 0;
            
            return {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: emailMap.get(profile.id) || 'N/A',
              assigned_learners_count: assignedCount
            };
          }) || [];

        setTeachers(teachersWithDetails);
      }
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleViewStudent = (student: LearnerWithProgress) => {
    setSelectedStudent(student);
    setDetailsDialogOpen(true);
  };

  const handleAnalyze = async (learnerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-learner', {
        body: { learnerId }
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete!',
        description: 'Learner analysis has been generated successfully.'
      });

      fetchLearners();
    } catch (error: any) {
      console.error('Error analyzing learner:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze learner.',
        variant: 'destructive'
      });
    }
  };

  const handleSuggestInterventions = async (learnerId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('suggest-interventions', {
        body: { learnerId }
      });

      if (error) throw error;

      toast({
        title: 'Interventions Suggested!',
        description: 'New intervention recommendations have been created.'
      });

      fetchLearners();
    } catch (error: any) {
      console.error('Error suggesting interventions:', error);
      toast({
        title: 'Error',
        description: 'Failed to suggest interventions.',
        variant: 'destructive'
      });
    }
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const element = document.getElementById('dashboard-content');
    
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`admin-report-${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Metrics sheet
    const metricsData = [
      ['Metric', 'Value'],
      ['Total Learners', metrics.totalLearners],
      ['Active Teachers', metrics.totalTeachers],
      ['Average Progress', `${metrics.avgProgress}%`],
      ['Accessibility Score', metrics.accessibilityScore],
      ['Learners Needing Support', metrics.learnersNeedingSupport],
      ['Learners On Track', metrics.learnersOnTrack]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Metrics');
    
    // Barriers sheet
    const barriersData = [['Barrier', 'Count'], ...barriers.map(b => [b.name, b.value])];
    const ws2 = XLSX.utils.aoa_to_sheet(barriersData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Barriers');
    
    // Interventions sheet
    const interventionsData = [
      ['Type', 'Count', 'Success Rate'],
      ...interventions.map(i => [i.type, i.count, `${i.successRate.toFixed(2)}%`])
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(interventionsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Interventions');
    
    XLSX.writeFile(wb, `admin-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDateRangeChange = (range: string) => {
    const endDate = new Date().toISOString();
    let startDate = '';
    
    switch (range) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'year':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = '2024-01-01';
    }
    
    setDateRange({ startDate, endDate });
  };

  if (loading || learnersLoading) {
    return <LoadingScreen />;
  }

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted))'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8" id="dashboard-content">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Administrator Analytics
              </h1>
              <p className="text-muted-foreground text-lg">System-wide insights and reporting</p>
            </div>
            <div className="flex gap-2">
              <Select onValueChange={handleDateRangeChange} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportPDF} variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button onClick={generateWeeklyReport}>
                <Download className="h-4 w-4 mr-2" />
                Weekly Report
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
            <p className="text-muted-foreground">System-wide analysis and recommendations</p>
          </div>
          <Button onClick={generateInsights} disabled={insightsLoading}>
            {insightsLoading ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>

        {insights && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Key Trends</h3>
                <div className="space-y-3">
                  {insights.trends?.map((trend: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-primary pl-4">
                      <p className="font-medium">{trend.category}</p>
                      <p className="text-sm text-muted-foreground">{trend.insight}</p>
                      <p className="text-sm text-primary mt-1">→ {trend.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Strategic Priorities</h3>
                <div className="space-y-2">
                  {insights.priorities?.map((priority: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant={priority.impact === 'high' ? 'default' : 'secondary'}>
                        {priority.impact}
                      </Badge>
                      <div>
                        <p className="font-medium">{priority.area}</p>
                        <p className="text-sm text-muted-foreground">{priority.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Total Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{metrics.totalLearners}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in system</p>
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
              <div className="text-3xl font-bold text-primary">{metrics.totalTeachers}</div>
              <p className="text-xs text-muted-foreground mt-1">Teaching staff</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-success" />
                Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{metrics.avgProgress}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
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
              <div className="text-3xl font-bold text-success">{metrics.accessibilityScore}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="barriers">Barriers</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Learners Needing Support</p>
                      <p className="text-2xl font-bold text-warning">{metrics.learnersNeedingSupport}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Learners On Track</p>
                      <p className="text-2xl font-bold text-success">{metrics.learnersOnTrack}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Teacher Engagement</CardTitle>
                  <CardDescription>Active teachers using AI recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary mb-2">{teacherEngagement.rate}%</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {teacherEngagement.active} of {teacherEngagement.total} teachers actively using AI insights
                  </p>
                  {predictiveTrend !== 0 && (
                    <div className="mt-2 p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground">
                        Trend: {predictiveTrend > 0 ? '↑' : '↓'} {Math.abs(predictiveTrend)}% per week
                      </p>
                    </div>
                  )}
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
                      <span className="text-sm">Total Learners</span>
                      <span className="font-semibold">{metrics.totalLearners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Teachers</span>
                      <span className="font-semibold">{metrics.totalTeachers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Performance</span>
                      <span className="font-semibold">{metrics.avgProgress}%</span>
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
                      data={barriers}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {barriers.map((entry, index) => (
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
                  {barriers.slice(0, 2).length > 0 ? (
                    barriers.slice(0, 2).map((barrier, index) => (
                      <div key={index} className="p-4 border border-warning/50 rounded-lg bg-warning/5">
                        <h4 className="font-semibold mb-1">Address {barrier.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {barrier.value} students require support for this challenge
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No significant priority areas identified
                    </p>
                  )}
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
                  <BarChart data={interventions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="successRate" fill="hsl(var(--primary))" name="Success Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Most Common</CardTitle>
                </CardHeader>
                <CardContent>
                  {interventions.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-primary mb-1">
                        {interventions[0]?.type || 'N/A'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {interventions[0]?.count || 0} recommendations
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Highest Success</CardTitle>
                </CardHeader>
                <CardContent>
                  {interventions.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-success mb-1">
                        {Math.round(interventions.reduce((max, i) => i.successRate > max ? i.successRate : max, 0))}%
                      </div>
                      <p className="text-sm text-muted-foreground">Success rate</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Total Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary mb-1">{interventions.length}</div>
                  <p className="text-sm text-muted-foreground">Intervention types</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Learners
                </CardTitle>
                <CardDescription>View and manage all learners in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {learnersLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading learners...</p>
                ) : (
                  <StudentListTable 
                    learners={learners}
                    onViewStudent={handleViewStudent}
                    onAnalyze={handleAnalyze}
                    onSuggestInterventions={handleSuggestInterventions}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  All Teachers
                </CardTitle>
                <CardDescription>View all teachers and their assigned learners</CardDescription>
              </CardHeader>
              <CardContent>
                <TeacherListTable teachers={teachers} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <CreateTeacherForm 
                onSuccess={() => {
                  // Refresh dashboard data if needed
                }}
              />
              
              <CreateLearnerForm 
                onSuccess={() => {
                  // Refresh dashboard data if needed
                }}
                onBulkUploadClick={() => {
                  // Handle bulk upload
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <StudentDetailsDialog
        student={selectedStudent}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onUpdate={fetchLearners}
      />

      <EnhancedAccessibilityToolbar />
    </div>
  );
};

export default AdminDashboard;
