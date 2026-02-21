import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Brain, TrendingUp, AlertCircle, CheckCircle2, Calendar, LayoutDashboard, GraduationCap, Lightbulb, BookOpen, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherData, LearnerWithProgress } from "@/hooks/useTeacherData";
import { supabase } from "@/integrations/supabase/client";
import { TrainingRecommendations } from "@/components/TrainingRecommendations";
import { StudentListTable } from "@/components/StudentListTable";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { AttendanceAnalytics } from "@/components/AttendanceAnalytics";
import { TeacherContentManager } from "@/components/content/TeacherContentManager";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSidebar, SidebarMenuItem } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { TeacherFeedbackDialog } from "@/components/TeacherFeedbackDialog";
import { AddExternalLearnerForm } from "@/components/AddExternalLearnerForm";
import { LearnerRecommendationPanel } from "@/components/LearnerRecommendationPanel";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedStudent, setSelectedStudent] = useState<LearnerWithProgress | null>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [feedbackStudent, setFeedbackStudent] = useState<LearnerWithProgress | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const { learners, loading, updateRecommendationStatus, analyzeStudent, suggestInterventions, refetch } = useTeacherData(user?.id);

  const getDisplayName = () => {
    if (userProfile?.firstName) {
      return `${userProfile.firstName}${userProfile.lastName ? ' ' + userProfile.lastName : ''}`;
    }
    return user?.email?.split('@')[0] || 'Teacher';
  };

  const menuItems: SidebarMenuItem[] = [
    { title: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, value: "dashboard" },
    { title: "My Learners", icon: <GraduationCap className="h-4 w-4" />, value: "students" },
    { title: "Content", icon: <BookOpen className="h-4 w-4" />, value: "content" },
    { title: "Attendance", icon: <Calendar className="h-4 w-4" />, value: "attendance" },
    { title: "AI Insights", icon: <Brain className="h-4 w-4" />, value: "insights" },
    { title: "Training", icon: <Lightbulb className="h-4 w-4" />, value: "training" },
    { title: "Add Learner Data", icon: <UserPlus className="h-4 w-4" />, value: "add-learner" },
  ];

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

  const headerStats = [
    { title: "Total Students", value: totalStudents, icon: <Users className="h-5 w-5" />, variant: "default" as const },
    { title: "Avg Progress", value: `${avgProgress}%`, icon: <TrendingUp className="h-5 w-5" />, variant: "success" as const },
    { title: "Need Support", value: needSupport, icon: <AlertCircle className="h-5 w-5" />, variant: "warning" as const },
    { title: "On Track", value: onTrack, icon: <CheckCircle2 className="h-5 w-5" />, variant: "success" as const },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <DashboardHeader
              welcomeMessage={`Welcome, ${getDisplayName()}`}
              subtitle="Manage your students and access AI-powered insights"
              stats={headerStats}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <ChartCard title="Recent Recommendations" description="Latest recommendations for your students">
                <div className="space-y-3">
                  {learners.flatMap(l => l.recommendations || []).slice(0, 3).length > 0 ? (
                    learners.flatMap(l => l.recommendations || []).slice(0, 3).map((rec) => (
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
              </ChartCard>

              <ChartCard title="Quick Stats" description="Overview of your class">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Students On Track</span>
                      <span className="font-semibold">{totalStudents > 0 ? Math.round((onTrack / totalStudents) * 100) : 0}%</span>
                    </div>
                    <Progress value={totalStudents > 0 ? (onTrack / totalStudents) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Performance</span>
                      <span className="font-semibold">{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2" />
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        );

      case "students":
        return (
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
                onFeedback={(learner) => {
                  setFeedbackStudent(learner);
                  setFeedbackDialogOpen(true);
                }}
              />
            </CardContent>
          </Card>
        );

      case "insights":
        return (
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
                    <div key={rec.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge 
                          variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                        >
                          {rec.priority}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No AI insights available yet. Click "Analyze" on a student to generate recommendations.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "training":
        return <TrainingRecommendations />;

      case "attendance":
        return (
          <div className="space-y-6">
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
          </div>
        );

      case "content":
        return user?.id ? <TeacherContentManager teacherId={user.id} /> : null;

      case "add-learner":
        return user?.id ? (
          <div className="space-y-6">
            <AddExternalLearnerForm teacherId={user.id} onSuccess={refetch} />
            <LearnerRecommendationPanel teacherId={user.id} />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const sidebar = (
    <DashboardSidebar
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={getDisplayName()}
      userRole="Teacher"
    />
  );

  // Mobile nav items (subset of menu items for bottom nav)
  const mobileNavItems = menuItems.slice(0, 5).map(item => ({
    icon: item.icon,
    label: item.title,
    value: item.value,
  }));

  return (
    <>
      <DashboardLayout
        sidebar={sidebar}
        title="Teacher Dashboard"
        subtitle="Manage your students and insights"
      >
        {renderContent()}
      </DashboardLayout>

      <MobileBottomNav
        items={mobileNavItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <StudentDetailsDialog
        student={selectedStudent}
        open={studentDialogOpen}
        onOpenChange={setStudentDialogOpen}
        onUpdate={refetch}
      />

      {feedbackStudent && user?.id && (
        <TeacherFeedbackDialog
          learnerId={feedbackStudent.id}
          learnerName={feedbackStudent.is_external ? (feedbackStudent.external_name || 'External Learner') : `${feedbackStudent.profiles?.first_name} ${feedbackStudent.profiles?.last_name}`}
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          teacherId={user.id}
        />
      )}
    </>
  );
};

export default TeacherDashboard;
