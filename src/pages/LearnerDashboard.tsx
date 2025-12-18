import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EnhancedLearnerProfile } from "@/components/EnhancedLearnerProfile";
import { CurriculumStandardsView } from "@/components/CurriculumStandardsView";
import { ExplainableAIView } from "@/components/ExplainableAIView";
import { DataTransparencyView } from "@/components/DataTransparencyView";
import { LearnerProfileCompletion } from "@/components/LearnerProfileCompletion";
import { BookOpen, TrendingUp, Award, Clock, GraduationCap, LayoutDashboard, Brain, Shield, Calendar, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLearnerData } from "@/hooks/useLearnerData";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LearnerAttendanceView } from "@/components/LearnerAttendanceView";
import { LearnerContentHub } from "@/components/content/LearnerContentHub";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardSidebar, SidebarMenuItem } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Navbar } from "@/components/Navbar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";

const LearnerDashboard = () => {
  const { user, userProfile } = useAuth();
  const {
    learner, 
    performance, 
    recommendations, 
    nigerianContext, 
    demographics, 
    accessibilityProfile, 
    loading, 
    submitFeedback 
  } = useLearnerData(user?.id);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [curriculumAlignments, setCurriculumAlignments] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);

  const menuItems: SidebarMenuItem[] = [
    { title: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, value: "dashboard" },
    { title: "My Progress", icon: <TrendingUp className="h-4 w-4" />, value: "progress" },
    { title: "Learn", icon: <GraduationCap className="h-4 w-4" />, value: "learn" },
    { title: "Standards", icon: <BookOpen className="h-4 w-4" />, value: "standards" },
    { title: "Profile", icon: <User className="h-4 w-4" />, value: "profile" },
    { title: "AI Reasoning", icon: <Brain className="h-4 w-4" />, value: "ai" },
    { title: "Privacy", icon: <Shield className="h-4 w-4" />, value: "privacy" },
    { title: "Attendance", icon: <Calendar className="h-4 w-4" />, value: "attendance" },
  ];

  useEffect(() => {
    if (learner?.id) {
      fetchCurriculumAlignments();
    }
    if (learner?.teacher_id) {
      fetchTeacherName();
    }
  }, [learner?.id, learner?.teacher_id]);

  const fetchTeacherName = async () => {
    if (!learner?.teacher_id) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', learner.teacher_id)
      .single();
    
    if (data) {
      setTeacherName(`${data.first_name} ${data.last_name}`);
      setTeacherEmail(data.email);
    }
  };

  const fetchCurriculumAlignments = async () => {
    if (!learner) return;
    
    const { data } = await supabase
      .from('learner_curriculum_alignment')
      .select(`
        *,
        curriculum_standards(*)
      `)
      .eq('learner_id', learner.id);
    
    setCurriculumAlignments(data || []);
  };

  const handleProfileComplete = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Show profile completion form if no learner record exists
  if (!learner && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <LearnerProfileCompletion userId={user.id} onComplete={handleProfileComplete} />
        </div>
        <EnhancedAccessibilityToolbar />
      </div>
    );
  }

  // Show pending teacher assignment message if learner exists but no teacher assigned
  if (learner && !learner.teacher_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Pending Teacher Assignment</CardTitle>
              <CardDescription className="text-base">
                Your profile has been submitted successfully! An administrator will assign you to a teacher soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Please check back later. You'll have full access to your dashboard once a teacher has been assigned.
              </p>
            </CardContent>
          </Card>
        </div>
        <EnhancedAccessibilityToolbar />
      </div>
    );
  }

  if (!learner) {
    return <LoadingScreen />;
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

  const headerStats = [
    { title: "Overall Progress", value: `${avgProgress}%`, icon: <TrendingUp className="h-5 w-5" />, variant: "success" as const },
    { title: "Active Courses", value: subjects.length, icon: <BookOpen className="h-5 w-5" />, variant: "default" as const },
    { title: "Recommendations", value: recommendations.length, icon: <Brain className="h-5 w-5" />, variant: "default" as const },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <DashboardHeader
              welcomeMessage={`Welcome back, ${userProfile?.firstName || 'Learner'}!`}
              subtitle="Your personalized learning journey continues"
              stats={headerStats}
            />

            {teacherName && (
              <div className="flex justify-end items-center gap-3">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Teacher: {teacherName}
                </Badge>
                {teacherEmail && (
                  <a href={`mailto:${teacherEmail}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {teacherEmail}
                  </a>
                )}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <ChartCard title="Subject Progress" description="Your performance across all subjects">
                <div className="space-y-4">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <div key={subject.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{subject.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                            <Badge 
                              variant={subject.status === 'Excellent' ? 'default' : subject.status === 'On Track' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {subject.status}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No performance data yet
                    </p>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="Recent Recommendations" description="Personalized learning suggestions">
                <div className="space-y-3">
                  {recommendations.slice(0, 3).length > 0 ? (
                    recommendations.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <Badge 
                            variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                          >
                            {rec.priority}
                          </Badge>
                          <div>
                            <h4 className="font-semibold text-sm">{rec.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recommendations yet
                    </p>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <ChartCard title="Subject Progress" description="Your performance across all subjects">
              <div className="space-y-4">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <div key={subject.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                          <Badge 
                            variant={subject.status === 'Excellent' ? 'default' : subject.status === 'On Track' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {subject.status}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No performance data yet
                  </p>
                )}
              </div>
            </ChartCard>

            <ProgressTimeline performance={performance} />
          </div>
        );

      case "learn":
        return <LearnerContentHub learnerId={learner.id} />;

      case "standards":
        return <CurriculumStandardsView alignments={curriculumAlignments} />;

      case "profile":
        return (
          <EnhancedLearnerProfile
            learnerId={learner.id}
            nigerianContext={nigerianContext}
            demographics={demographics}
            accessibilityProfile={accessibilityProfile}
          />
        );

      case "ai":
        return <ExplainableAIView learnerId={learner.id} />;

      case "privacy":
        return user ? <DataTransparencyView userId={user.id} /> : null;

      case "attendance":
        return <LearnerAttendanceView learnerId={learner.id} />;

      default:
        return null;
    }
  };

  const sidebar = (
    <DashboardSidebar
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={userProfile?.firstName || 'Learner'}
      userRole="Learner"
    />
  );

  return (
    <DashboardLayout
      sidebar={sidebar}
      title="Learner Dashboard"
      subtitle="Your personalized learning journey"
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default LearnerDashboard;
