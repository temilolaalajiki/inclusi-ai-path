import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, CheckCircle, TrendingDown, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExternalLearner {
  id: string;
  external_name: string;
  demographics: any;
  learning_challenges: string[];
  accessibility_needs: string[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  recommendation_type: string;
}

interface LearnerWithRecommendations extends ExternalLearner {
  recommendations: Recommendation[];
  avgScore: number;
  riskLevel: "low" | "medium" | "high";
}

interface LearnerRecommendationPanelProps {
  teacherId: string;
}

export function LearnerRecommendationPanel({ teacherId }: LearnerRecommendationPanelProps) {
  const [learners, setLearners] = useState<LearnerWithRecommendations[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchExternalLearners = async () => {
    setLoading(true);
    try {
      const { data: learnersData, error } = await supabase
        .from("learners")
        .select("id, external_name, demographics, learning_challenges, accessibility_needs")
        .eq("teacher_id", teacherId)
        .eq("is_external", true);

      if (error) throw error;
      if (!learnersData || learnersData.length === 0) {
        setLearners([]);
        return;
      }

      const learnerIds = learnersData.map(l => l.id);

      const [recsRes, perfRes] = await Promise.all([
        supabase
          .from("recommendations")
          .select("id, learner_id, title, description, priority, status, recommendation_type")
          .in("learner_id", learnerIds),
        supabase
          .from("performance_records")
          .select("learner_id, score")
          .in("learner_id", learnerIds),
      ]);

      const recsByLearner = new Map<string, Recommendation[]>();
      (recsRes.data || []).forEach((r: any) => {
        const arr = recsByLearner.get(r.learner_id) || [];
        arr.push(r);
        recsByLearner.set(r.learner_id, arr);
      });

      const scoresByLearner = new Map<string, number[]>();
      (perfRes.data || []).forEach((p: any) => {
        const arr = scoresByLearner.get(p.learner_id) || [];
        arr.push(Number(p.score));
        scoresByLearner.set(p.learner_id, arr);
      });

      const combined: LearnerWithRecommendations[] = learnersData.map((l: any) => {
        const scores = scoresByLearner.get(l.id) || [];
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const riskLevel: "low" | "medium" | "high" = avgScore >= 70 ? "low" : avgScore >= 50 ? "medium" : "high";

        return {
          ...l,
          recommendations: recsByLearner.get(l.id) || [],
          avgScore,
          riskLevel,
        };
      });

      setLearners(combined);
    } catch (err: any) {
      console.error("Error fetching external learners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExternalLearners();
  }, [teacherId]);

  const reAnalyze = async (learnerId: string) => {
    setAnalyzingId(learnerId);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-learner", {
        body: { learnerId },
      });
      if (error) throw error;
      toast({
        title: "Re-analysis Complete",
        description: `Generated ${data.recommendations?.length || 0} updated recommendations.`,
      });
      fetchExternalLearners();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to re-analyze learner.", variant: "destructive" });
    } finally {
      setAnalyzingId(null);
    }
  };

  const riskConfig = {
    low: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", icon: CheckCircle, label: "Low Risk" },
    medium: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", icon: AlertTriangle, label: "Medium Risk" },
    high: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: TrendingDown, label: "High Risk" },
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (learners.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          <Brain className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No external learner data yet. Use the form above to add learner data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        Learner Recommendation Panel
      </h3>

      {learners.map((learner) => {
        const risk = riskConfig[learner.riskLevel];
        const RiskIcon = risk.icon;
        const challenges = learner.learning_challenges || [];

        return (
          <Card key={learner.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {learner.external_name}
                    <Badge variant="outline" className="text-xs font-normal">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      External
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {(learner.demographics as any)?.grade || "No grade"} • Avg Score: {learner.avgScore}%
                    {(learner.demographics as any)?.attendance_percent != null && (
                      <> • Attendance: {(learner.demographics as any).attendance_percent}%</>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                    <RiskIcon className="h-3 w-3" />
                    {risk.label}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => reAnalyze(learner.id)}
                    disabled={analyzingId === learner.id}
                  >
                    {analyzingId === learner.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {challenges.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Identified Challenges</p>
                  <div className="flex flex-wrap gap-1">
                    {challenges.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs capitalize">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {learner.recommendations.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Recommendations & Interventions</p>
                  {learner.recommendations.map((rec) => (
                    <div key={rec.id} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-start gap-2">
                        <Badge
                          variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {rec.priority}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{rec.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No recommendations generated yet. Click the refresh button to trigger analysis.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
