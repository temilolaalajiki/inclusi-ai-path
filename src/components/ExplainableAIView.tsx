import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, Database, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReasoningStep {
  step: number;
  description: string;
  data_point?: string;
  conclusion?: string;
}

interface AIReasoning {
  id: string;
  recommendation_id: string;
  ai_model: string;
  reasoning_chain: ReasoningStep[];
  data_sources_used: string[];
  confidence_score: number;
  rule_based_fallback: boolean;
  created_at: string;
  recommendations?: {
    title: string;
    description: string;
    priority: string;
  };
}

interface ExplainableAIViewProps {
  learnerId: string;
}

export const ExplainableAIView = ({ learnerId }: ExplainableAIViewProps) => {
  const [reasoningLogs, setReasoningLogs] = useState<AIReasoning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReasoningLogs();
  }, [learnerId]);

  const fetchReasoningLogs = async () => {
    try {
      const { data } = await supabase
        .from('ai_reasoning_logs')
        .select(`
          *,
          recommendations(title, description, priority)
        `)
        .eq('learner_id', learnerId)
        .order('created_at', { ascending: false })
        .limit(10);

      const transformedData = (data || []).map(log => ({
        ...log,
        reasoning_chain: (log.reasoning_chain as any) || [],
        data_sources_used: (log.data_sources_used as any) || []
      }));
      
      setReasoningLogs(transformedData as AIReasoning[]);
    } catch (error) {
      console.error('Error fetching reasoning logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading AI reasoning...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Explainable AI Recommendations</CardTitle>
          </div>
          <CardDescription>
            Understand how AI arrives at learning recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reasoningLogs.length > 0 ? (
            <div className="space-y-6">
              {reasoningLogs.map((log) => (
                <Card key={log.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={log.rule_based_fallback ? "outline" : "default"}>
                            {log.rule_based_fallback ? "Rule-Based" : "AI-Generated"}
                          </Badge>
                          <Badge variant="secondary">
                            Confidence: {Math.round(log.confidence_score * 100)}%
                          </Badge>
                        </div>
                        <CardTitle className="text-base">
                          {log.recommendations?.title || 'Recommendation'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Model: {log.ai_model}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Reasoning Chain
                      </h4>
                      <div className="space-y-2">
                        {log.reasoning_chain.map((step: ReasoningStep, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{step.description}</p>
                              {step.data_point && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Data: {step.data_point}
                                </p>
                              )}
                              {step.conclusion && (
                                <p className="text-xs text-primary mt-1 font-medium">
                                  → {step.conclusion}
                                </p>
                              )}
                            </div>
                            {idx < log.reasoning_chain.length - 1 && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Data Sources Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {log.data_sources_used.map((source: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t text-xs text-muted-foreground">
                      Generated: {new Date(log.created_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No AI reasoning logs available yet</p>
              <p className="text-sm">Reasoning will be logged when AI generates recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
