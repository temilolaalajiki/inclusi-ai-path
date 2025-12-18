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
    materialProgress,
    quizAttempts,
    stats,
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


  const headerStats = [
    { title: "Overall Progress", value: `${stats.overallProgress}%`, icon: <TrendingUp className="h-5 w-5" />, variant: "success" as const },
    { title: "Active Courses", value: stats.activeCourses, icon: <BookOpen className="h-5 w-5" />, variant: "default" as const },
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
              thirdLine={teacherName ? `Assigned Teacher: ${teacherName}` : undefined}
              stats={headerStats}
            />

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Materials Completed</p>
                      <p className="text-2xl font-bold">{stats.completedMaterials}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10">
                      <Award className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quizzes Passed</p>
                      <p className="text-2xl font-bold">{stats.completedQuizzes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
                      <p className="text-2xl font-bold">{stats.averageQuizScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-500/10">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">{stats.materialsInProgress.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ChartCard title="Materials Progress" description="Your learning materials journey">
                <div className="space-y-4">
                  {materialProgress.length > 0 ? (
                    materialProgress.slice(0, 5).map((progress) => (
                      <div key={progress.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {progress.material?.title || 'Learning Material'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{progress.progress_percent}%</span>
                            <Badge 
                              variant={progress.status === 'completed' ? 'default' : progress.status === 'in_progress' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {progress.status === 'completed' ? 'Completed' : progress.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={progress.progress_percent} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No materials started yet. Check the Learn tab to get started!
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
                      Start learning to get personalized recommendations!
                    </p>
                  )}
                </div>
              </ChartCard>
            </div>

            {/* Recent Quiz Attempts */}
            {quizAttempts.length > 0 && (
              <ChartCard title="Recent Quiz Attempts" description="Your latest quiz performance">
                <div className="space-y-3">
                  {quizAttempts.slice(0, 5).map((attempt) => {
                    const scorePercent = attempt.score && attempt.max_score 
                      ? Math.round((attempt.score / attempt.max_score) * 100) 
                      : null;
                    const passed = scorePercent !== null && attempt.quiz?.pass_score 
                      ? scorePercent >= attempt.quiz.pass_score 
                      : false;
                    
                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${passed ? 'bg-green-500/10' : attempt.completed_at ? 'bg-red-500/10' : 'bg-orange-500/10'}`}>
                            {passed ? (
                              <Award className="h-4 w-4 text-green-500" />
                            ) : attempt.completed_at ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{attempt.quiz?.title || 'Quiz'}</p>
                            <p className="text-xs text-muted-foreground">{attempt.quiz?.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {scorePercent !== null ? (
                            <>
                              <p className={`font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                                {scorePercent}%
                              </p>
                              <Badge variant={passed ? 'default' : 'destructive'} className="text-xs">
                                {passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">In Progress</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            )}
          </div>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{stats.overallProgress}%</p>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">{stats.completedMaterials}</p>
                    <p className="text-sm text-muted-foreground">Completed Materials</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-500">{stats.completedQuizzes}</p>
                    <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-500">{stats.averageQuizScore}%</p>
                    <p className="text-sm text-muted-foreground">Average Quiz Score</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <ChartCard title="All Learning Materials" description="Track your progress across all materials">
              <div className="space-y-4">
                {materialProgress.length > 0 ? (
                  materialProgress.map((progress) => (
                    <div key={progress.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">{progress.material?.title || 'Learning Material'}</span>
                          <p className="text-xs text-muted-foreground">{progress.material?.subject} • {progress.material?.grade_level}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{progress.progress_percent}%</span>
                          <Badge 
                            variant={progress.status === 'completed' ? 'default' : progress.status === 'in_progress' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {progress.status === 'completed' ? 'Completed' : progress.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={progress.progress_percent} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No materials started yet. Check the Learn tab to get started!
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
