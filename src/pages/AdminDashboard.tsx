import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ManagementSection } from "@/components/ManagementSection";
import { StudentListTable } from "@/components/StudentListTable";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { TeacherListTable } from "@/components/TeacherListTable";
import { NigerianEducationOverview } from "@/components/NigerianEducationOverview";
import { BiasMonitoringDashboard } from "@/components/BiasMonitoringDashboard";
import { TeacherAnalyticsDashboard } from "@/components/TeacherAnalyticsDashboard";
import { PendingLearnersTable } from "@/components/PendingLearnersTable";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, TrendingUp, Download, AlertTriangle, CheckCircle, FileDown, FileSpreadsheet, Calendar, Brain, UserCheck, Eye, BarChart3, ShieldAlert, Scale, Settings, UserPlus, LayoutDashboard } from "lucide-react";
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
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSidebar, SidebarMenuItem } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";

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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [performanceAnalysisResults, setPerformanceAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const menuItems: SidebarMenuItem[] = [
    { title: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, value: "dashboard" },
    { title: "Learners", icon: <Users className="h-4 w-4" />, value: "users" },
    { title: "Teachers", icon: <BookOpen className="h-4 w-4" />, value: "teachers" },
    { 
      title: "Requests", 
      icon: <UserPlus className="h-4 w-4" />, 
      value: "requests",
      subItems: [
        { title: "Pending", value: "pending" },
        { title: "All Learners", value: "all-learners" },
      ]
    },
    { title: "Management", icon: <Settings className="h-4 w-4" />, value: "management" },
    { 
      title: "Reports", 
      icon: <BarChart3 className="h-4 w-4" />, 
      value: "reports",
      subItems: [
        { title: "Interventions", value: "interventions" },
        { title: "Barriers", value: "barriers" },
        { title: "Trends", value: "trends" },
        { title: "Teacher Analytics", value: "analytics" },
        { title: "AI Insights", value: "ai-insights" },
      ]
    },
    { title: "Standards", icon: <BookOpen className="h-4 w-4" />, value: "standards" },
   // { title: "Equity", icon: <Scale className="h-4 w-4" />, value: "equity" },
  ];

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

      if (learnersData && learnersData.length > 0) {
        const userIds = learnersData.map(l => l.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

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
          .select('id, first_name, last_name, email')
          .in('id', teacherIds);

        const { data: learnersCount } = await supabase
          .from('learners')
          .select('teacher_id');

        const teachersWithDetails = profilesData?.map(profile => {
            const assignedCount = learnersCount?.filter(l => l.teacher_id === profile.id).length || 0;
            
            return {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email || '',
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

  const handlePerformanceAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setPerformanceAnalysisResults(null);
      
      toast({
        title: 'Analyzing Performance...',
        description: 'Checking for learners needing intervention.'
      });

      const { data, error } = await supabase.functions.invoke('analyze-performance');

      if (error) throw error;

      setPerformanceAnalysisResults(data);
      
      toast({
        title: 'Performance Analysis Complete',
        description: `Created ${data.interventions_created} low performance interventions.`
      });

      fetchLearners();
    } catch (error: any) {
      console.error('Error analyzing performance:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze performance.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapacityCheck = async () => {
    try {
      toast({
        title: 'Checking Class Capacity...',
        description: 'Analyzing class sizes and overcrowding.'
      });

      const { data, error } = await supabase.functions.invoke('check-class-capacity');

      if (error) throw error;

      toast({
        title: 'Capacity Check Complete',
        description: `Created ${data.alerts_created} capacity alerts.`
      });

      fetchLearners();
    } catch (error: any) {
      console.error('Error checking capacity:', error);
      toast({
        title: 'Error',
        description: 'Failed to check class capacity.',
        variant: 'destructive'
      });
    }
  };

  const handleVisualMaterialsRecommendation = async () => {
    try {
      toast({
        title: 'Generating Recommendations...',
        description: 'Analyzing visual impairment support needs.'
      });

      const { data, error } = await supabase.functions.invoke('recommend-visual-materials');

      if (error) throw error;

      toast({
        title: 'Recommendations Complete',
        description: `Created ${data.recommendations_created} visual material recommendations.`
      });

      fetchLearners();
    } catch (error: any) {
      console.error('Error recommending visual materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to recommend visual materials.',
        variant: 'destructive'
      });
    }
  };

  const seedNigerianStandards = async () => {
    try {
      toast({
        title: 'Seeding Standards...',
        description: 'Loading WAEC/NECO curriculum standards and policies.'
      });

      const { data, error } = await supabase.functions.invoke('seed-nigerian-standards');

      if (error) throw error;

      toast({
        title: 'Standards Seeded Successfully',
        description: `Added ${data.inserted.standards} standards, ${data.inserted.policies} policies, ${data.inserted.frameworks} frameworks.`
      });
    } catch (error: any) {
      console.error('Error seeding standards:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed Nigerian standards.',
        variant: 'destructive'
      });
    }
  };

  const seedTestData = async () => {
    try {
      toast({
        title: 'Starting Test Data Seeding',
        description: 'Creating 5 diverse learner profiles with performance, attendance, and demographics...',
      });

      const { data, error } = await supabase.functions.invoke('seed-test-data');
      
      if (error) throw error;
      
      toast({
        title: 'Test Data Seeded Successfully!',
        description: `Created ${data?.learners_created || 0} learners with complete profiles, recommendations, and equity metrics.`,
      });

      fetchLearners();
      fetchTeachers();
    } catch (error: any) {
      console.error('Error seeding test data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed test data. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const calculateEquityMetrics = async () => {
    try {
      toast({
        title: 'Calculating Equity Metrics...',
        description: 'Analyzing resource distribution and bias.'
      });

      const { data, error } = await supabase.functions.invoke('calculate-equity-metrics');

      if (error) throw error;

      toast({
        title: 'Equity Analysis Complete',
        description: `Calculated ${data.metrics_calculated} metrics. Bias score: ${(data.bias_score * 100).toFixed(1)}%`
      });
    } catch (error: any) {
      console.error('Error calculating equity:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate equity metrics.',
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
    
    const barriersData = [['Barrier', 'Count'], ...barriers.map(b => [b.name, b.value])];
    const ws2 = XLSX.utils.aoa_to_sheet(barriersData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Barriers');
    
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

  const headerStats = [
    { title: "Total Learners", value: metrics.totalLearners, icon: <Users className="h-5 w-5" />, variant: "default" as const },
    { title: "Active Teachers", value: metrics.totalTeachers, icon: <BookOpen className="h-5 w-5" />, variant: "default" as const },
    { title: "Avg Progress", value: `${metrics.avgProgress}%`, icon: <TrendingUp className="h-5 w-5" />, variant: "success" as const },
    { title: "Accessibility", value: metrics.accessibilityScore, icon: <CheckCircle className="h-5 w-5" />, variant: "success" as const },
  ];

  const quickActions = [
    { label: isAnalyzing ? "Analyzing..." : "Analyze Performance", icon: <Brain className="h-4 w-4" />, onClick: handlePerformanceAnalysis, disabled: isAnalyzing },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6" id="dashboard-content">
            <DashboardHeader
              welcomeMessage="Welcome, Administrator"
              subtitle="System-wide insights and reporting"
              stats={headerStats}
            />

            <div className="flex flex-wrap gap-2 mb-4">
              {/* <Select onValueChange={handleDateRangeChange} defaultValue="all">
                <SelectTrigger className="w-[180px] bg-background">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select> */}
              {/* <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button> */}
              {/* <Button onClick={handleExportExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button> */}
              {/* <Button onClick={generateWeeklyReport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Weekly Report
              </Button> */}
              {/* <Button onClick={generateInsights} disabled={insightsLoading} size="sm">
                <Brain className="h-4 w-4 mr-2" />
                {insightsLoading ? 'Generating...' : 'Generate Insights'}
              </Button> */}
            </div>

            <QuickActionsCard
              title="AI-Powered Action(s)"
              description="System-wide analysis and recommendations"
              actions={quickActions}
            />

            {insights && (
              <Card>
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

            <div className="grid gap-6 md:grid-cols-2">
              <ChartCard title="Teacher Engagement" description="Active teachers using AI recommendations">
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
              </ChartCard>

              <ChartCard title="System Metrics" description="Key performance indicators">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Learners Needing Support</p>
                      <p className="text-xl font-bold text-warning">{metrics.learnersNeedingSupport}</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Learners On Track</p>
                      <p className="text-xl font-bold text-success">{metrics.learnersOnTrack}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        );

      case "pending":
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Pending Learner Assignments
              </CardTitle>
              <CardDescription>
                Learners who have completed their profile but haven't been assigned to a teacher yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingLearnersTable 
                onAssignmentComplete={() => {
                  fetchLearners();
                  fetchTeachers();
                }} 
              />
            </CardContent>
          </Card>
        );

      case "all-learners":
      case "users":
        return (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Learners
              </CardTitle>
              <CardDescription>View and manage all learners in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentListTable 
                learners={learners}
                onViewStudent={handleViewStudent}
                onAnalyze={handleAnalyze}
                onSuggestInterventions={handleSuggestInterventions}
              />
            </CardContent>
          </Card>
        );

      case "teachers":
        return (
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
        );

      case "management":
        return (
          <ManagementSection 
            onTeacherCreated={() => fetchTeachers()} 
            onLearnerCreated={() => fetchLearners()} 
          />
        );

      case "barriers":
        return (
          <div className="space-y-6">
            <ChartCard title="Common Accessibility Barriers" description="Distribution of learning challenges across the institution">
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
            </ChartCard>

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
          </div>
        );

      case "interventions":
        return (
          <div className="space-y-6">
            <ChartCard title="Intervention Success Rates" description="Effectiveness of different support strategies">
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
            </ChartCard>

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
          </div>
        );

      case "trends":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Teacher Engagement" description="Active teachers using AI recommendations">
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
            </ChartCard>

            <ChartCard title="System Usage" description="Platform engagement metrics">
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
            </ChartCard>
          </div>
        );

      case "analytics":
        return <TeacherAnalyticsDashboard />;

      case "ai-insights":
        return (
          <div className="space-y-6">
            <QuickActionsCard
              title="AI-Powered Actions"
              description="Run system-wide analysis and generate insights"
              actions={quickActions}
            />
            
            {/* Performance Analysis Results */}
            {isAnalyzing && (
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Analyzing learner performance data...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {performanceAnalysisResults && !isAnalyzing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Performance Analysis Results
                  </CardTitle>
                  <CardDescription>
                    {performanceAnalysisResults.interventions_created > 0
                      ? `Found ${performanceAnalysisResults.interventions_created} learner(s) requiring intervention`
                      : 'All learners are performing above the intervention threshold'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {performanceAnalysisResults.interventions && performanceAnalysisResults.interventions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {performanceAnalysisResults.interventions.map((intervention: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-warning/5 border-warning/30">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">{intervention.learner_name}</h4>
                              <Badge variant={intervention.avg_score < 30 ? "destructive" : "secondary"}>
                                {intervention.avg_score.toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                <span>Average Score: {intervention.avg_score.toFixed(1)}%</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {intervention.subjects?.slice(0, 3).map((subject: string, sIdx: number) => (
                                  <Badge key={sIdx} variant="outline" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                                {intervention.subjects?.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{intervention.subjects.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-3"
                              onClick={() => {
                                const student = learners.find(l => l.id === intervention.learner_id);
                                if (student) {
                                  handleViewStudent(student);
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-2">Summary</h4>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-destructive">
                              {performanceAnalysisResults.interventions.filter((i: any) => i.avg_score < 30).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Critical (&lt;30%)</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-warning">
                              {performanceAnalysisResults.interventions.filter((i: any) => i.avg_score >= 30 && i.avg_score < 50).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Low (30-50%)</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold">
                              {performanceAnalysisResults.interventions_created}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Flagged</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="font-medium">All Clear!</p>
                      <p className="text-sm text-muted-foreground">
                        No learners currently require performance intervention.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {insights && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Insights</CardTitle>
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
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "standards":
        return <NigerianEducationOverview />;

      case "equity":
        return <BiasMonitoringDashboard />;

      default:
        return null;
    }
  };

  const sidebar = (
    <DashboardSidebar
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName="Administrator"
      userRole="Admin"
    />
  );

  return (
    <>
      <DashboardLayout
        sidebar={sidebar}
        title="Administrator Dashboard"
        subtitle="System-wide insights and reporting"
      >
        {renderContent()}
      </DashboardLayout>

      <StudentDetailsDialog
        student={selectedStudent}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onUpdate={fetchLearners}
      />
    </>
  );
};

export default AdminDashboard;
