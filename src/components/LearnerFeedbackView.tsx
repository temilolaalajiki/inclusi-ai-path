import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackEntry {
  id: string;
  learner_id: string;
  teacher_id: string;
  feedback_text: string;
  category: string;
  created_at: string;
  teacher_name?: string;
  learner_name?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  academic_progress: "Academic Progress",
  behavior: "Behavior & Engagement",
  learning_needs: "Learning Needs",
  accessibility: "Accessibility Support",
  intervention_effectiveness: "Intervention Effectiveness",
  general: "General Observation",
};

export function LearnerFeedbackView() {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_feedback' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const entries = (data || []) as any[];
      if (entries.length === 0) {
        setFeedbacks([]);
        setLoading(false);
        return;
      }

      // Get unique teacher and learner IDs
      const teacherIds = [...new Set(entries.map(e => e.teacher_id))];
      const learnerIds = [...new Set(entries.map(e => e.learner_id))];

      // Fetch profiles for teachers
      const { data: teacherProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', teacherIds);

      // Fetch learner user_ids then profiles
      const { data: learnersData } = await supabase
        .from('learners')
        .select('id, user_id')
        .in('id', learnerIds);

      const learnerUserIds = (learnersData || []).map(l => l.user_id);
      const { data: learnerProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', learnerUserIds);

      const teacherMap = new Map((teacherProfiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));
      const learnerUserMap = new Map((learnersData || []).map(l => [l.id, l.user_id]));
      const profileMap = new Map((learnerProfiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));

      const enriched: FeedbackEntry[] = entries.map(e => ({
        ...e,
        teacher_name: teacherMap.get(e.teacher_id) || 'Unknown Teacher',
        learner_name: profileMap.get(learnerUserMap.get(e.learner_id) || '') || 'Unknown Learner',
      }));

      setFeedbacks(enriched);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Teacher Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Teacher Feedback
        </CardTitle>
        <CardDescription>All feedback submitted by teachers for their learners</CardDescription>
      </CardHeader>
      <CardContent>
        {feedbacks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{fb.learner_name}</p>
                    <p className="text-xs text-muted-foreground">by {fb.teacher_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[fb.category] || fb.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm">{fb.feedback_text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
