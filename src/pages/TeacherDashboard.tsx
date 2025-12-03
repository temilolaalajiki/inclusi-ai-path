import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import { Progress } from "@/components/ui/progress";
import { Users, Brain, TrendingUp, AlertCircle, CheckCircle2, Calendar, LayoutDashboard, GraduationCap, Lightbulb } from "lucide-react";
import { MobileTabs, MobileTabsList, MobileTabsContent } from "@/components/ui/mobile-tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherData, LearnerWithProgress } from "@/hooks/useTeacherData";
import { supabase } from "@/integrations/supabase/client";
import { TrainingRecommendations } from "@/components/TrainingRecommendations";
import { StudentListTable } from "@/components/StudentListTable";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { AttendanceAnalytics } from "@/components/AttendanceAnalytics";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<LearnerWithProgress | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const { user, userProfile } = useAuth();
  const { learners, loading, updateRecommendationStatus, analyzeStudent, suggestInterventions, refetch } = useTeacherData(user?.id);

  const getDisplayName = () => {
    if (userProfile?.firstName) {
      return `${userProfile.firstName}${userProfile.lastName ? ' ' + userProfile.lastName : ''}`;
    }
    return user?.email?.split('@')[0] || 'Teacher';
  };

  // Set up real-time updates for learners
  useEffect(() => {
    const channel = supabase
      .channel('learners-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learners'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Fetch attendance records
  const fetchAttendanceRecords = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .in('learner_id', learners.map(l => l.id))
      .order('date', { ascending: false });

    if (!error && data) {
      setAttendanceRecords(data);
    }
  };

  useEffect(() => {
    if (learners.length > 0) {
      fetchAttendanceRecords();
    }
  }, [learners, user?.id]);

  const handleViewStudent = (student: LearnerWithProgress) => {
    setSelectedStudent(student);
    setStudentDialogOpen(true);
  };

  if (loading) {
    return <LoadingScreen />;
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
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Welcome, {getDisplayName()}
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg">Manage your students and access AI-powered insights</p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Users className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Total</span> Students
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-primary">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="hidden sm:inline">Avg.</span> Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-success">{avgProgress}%</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <AlertCircle className="h-4 w-4 text-warning" />
                Need Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-warning">{needSupport}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <CheckCircle2 className="h-4 w-4 text-success" />
                On Track
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-2xl md:text-3xl font-bold text-success">{onTrack}</div>
            </CardContent>
          </Card>
        </div>

        <MobileTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <MobileTabsList
            value={activeTab}
            onValueChange={setActiveTab}
            tabs={[
              { value: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
              { value: "students", label: "Students", icon: <GraduationCap className="h-4 w-4" /> },
              { value: "attendance", label: "Attendance", icon: <Calendar className="h-4 w-4" /> },
              { value: "insights", label: "AI Insights", icon: <Brain className="h-4 w-4" /> },
              { value: "training", label: "Training", icon: <Lightbulb className="h-4 w-4" /> },
            ]}
          />

          <MobileTabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
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
          </MobileTabsContent>

          <MobileTabsContent value="students" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Student List</CardTitle>
                <CardDescription>View and manage all student profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentListTable
                  learners={learners}
                  onViewStudent={handleViewStudent}
                  onAnalyze={analyzeStudent}
                  onSuggestInterventions={suggestInterventions}
                />
              </CardContent>
            </Card>
          </MobileTabsContent>

          <MobileTabsContent value="insights" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>Evidence-based recommendations to improve inclusive education</CardDescription>
              </CardHeader>
              <CardContent>
...
              </CardContent>
            </Card>
          </MobileTabsContent>

          <MobileTabsContent value="training" className="space-y-6">
            <TrainingRecommendations />
          </MobileTabsContent>

          <MobileTabsContent value="attendance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AttendanceTracker 
                learners={learners}
                onAttendanceRecorded={fetchAttendanceRecords}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" aria-hidden="true" />
                    Attendance Overview
                  </CardTitle>
                  <CardDescription>
                    Track and analyze attendance patterns
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <AttendanceAnalytics 
              learners={learners}
              attendanceRecords={attendanceRecords}
            />
          </MobileTabsContent>
        </MobileTabs>
      </div>

      <StudentDetailsDialog
        student={selectedStudent}
        open={studentDialogOpen}
        onOpenChange={setStudentDialogOpen}
        onUpdate={refetch}
      />

      <EnhancedAccessibilityToolbar />
    </div>
  );
};

export default TeacherDashboard;
