import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { EnhancedAccessibilityToolbar } from "@/components/EnhancedAccessibilityToolbar";
import { EnhancedLearnerProfile } from "@/components/EnhancedLearnerProfile";
import { CurriculumStandardsView } from "@/components/CurriculumStandardsView";
import { ExplainableAIView } from "@/components/ExplainableAIView";
import { DataTransparencyView } from "@/components/DataTransparencyView";
import { LearnerProfileCompletion } from "@/components/LearnerProfileCompletion";
import { BookOpen, TrendingUp, Lightbulb, ThumbsUp, ThumbsDown, Award, Calendar, Clock, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLearnerData } from "@/hooks/useLearnerData";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LearnerAttendanceView } from "@/components/LearnerAttendanceView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LearnerContentHub } from "@/components/content/LearnerContentHub";

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
  const [activeTab, setActiveTab] = useState("progress");
  const [curriculumAlignments, setCurriculumAlignments] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (learner?.id) {
      fetchCurriculumAlignments();
    }
  }, [learner?.id]);

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
    // Trigger a refresh by updating the key
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {userProfile?.firstName || 'Learner'}!
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
              <div className="text-4xl font-bold text-primary mb-2">{avgProgress}%</div>
              <Progress value={avgProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {avgProgress >= 85 ? 'Excellent work!' : avgProgress >= 70 ? 'Keep up the great work!' : 'You can do it!'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{subjects.length}</div>
              <p className="text-sm text-muted-foreground">Subjects in progress</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary mb-2">{recommendations.length}</div>
              <p className="text-sm text-muted-foreground">Personalized suggestions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-5xl grid-cols-7">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="ai">AI Reasoning</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Subject Progress</CardTitle>
                  <CardDescription>Your performance across all subjects</CardDescription>
                </CardHeader>
...
              </Card>
            </div>

            <ProgressTimeline performance={performance} />
          </TabsContent>

          <TabsContent value="standards" className="space-y-6">
            <CurriculumStandardsView alignments={curriculumAlignments} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <EnhancedLearnerProfile
              learnerId={learner.id}
              nigerianContext={nigerianContext}
              demographics={demographics}
              accessibilityProfile={accessibilityProfile}
            />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <ExplainableAIView learnerId={learner.id} />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            {user && <DataTransparencyView userId={user.id} />}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            {learner && <LearnerAttendanceView learnerId={learner.id} />}
          </TabsContent>

          <TabsContent value="learn" className="space-y-6">
            {learner && <LearnerContentHub learnerId={learner.id} />}
          </TabsContent>
        </Tabs>
      </div>

      <EnhancedAccessibilityToolbar />
    </div>
  );
};

export default LearnerDashboard;
