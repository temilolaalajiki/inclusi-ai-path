import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookCheck, Target, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CurriculumStandard {
  id: string;
  name: string;
  code: string;
  examination_body: string;
  subject: string;
  grade_level: string;
  learning_objectives: string[];
  competency_areas: string[];
  assessment_criteria: Record<string, number>;
}

interface LearnerAlignment {
  id: string;
  alignment_status: string;
  competency_progress: Record<string, number>;
  last_assessment_date?: string;
  curriculum_standards?: CurriculumStandard;
}

interface CurriculumStandardsViewProps {
  alignments: LearnerAlignment[];
}

export const CurriculumStandardsView = ({ alignments }: CurriculumStandardsViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'default';
      case 'on_track': return 'secondary';
      case 'needs_support': return 'outline';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ahead': return 'Ahead';
      case 'on_track': return 'On Track';
      case 'needs_support': return 'Needs Support';
      case 'critical': return 'Critical';
      default: return status;
    }
  };

  const calculateOverallProgress = (competencies: Record<string, number>) => {
    const values = Object.values(competencies);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle>Nigerian Education Standards Alignment</CardTitle>
          </div>
          <CardDescription>
            Performance aligned with WAEC/NECO curriculum standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alignments.length > 0 ? (
            <div className="space-y-6">
              {alignments.map((alignment) => {
                const standard = alignment.curriculum_standards;
                if (!standard) return null;

                const overallProgress = calculateOverallProgress(alignment.competency_progress || {});

                return (
                  <Card key={alignment.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{standard.examination_body}</Badge>
                            <Badge>{standard.grade_level}</Badge>
                            <Badge variant={getStatusColor(alignment.alignment_status)}>
                              {getStatusLabel(alignment.alignment_status)}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{standard.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Code: {standard.code} • Subject: {standard.subject}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
                          <p className="text-xs text-muted-foreground">Overall Progress</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="competencies" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="competencies">Competencies</TabsTrigger>
                          <TabsTrigger value="objectives">Objectives</TabsTrigger>
                          <TabsTrigger value="assessment">Assessment</TabsTrigger>
                        </TabsList>

                        <TabsContent value="competencies" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            {standard.competency_areas.map((area, idx) => {
                              const progress = alignment.competency_progress?.[area] || 0;
                              return (
                                <div key={idx}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">{area}</span>
                                    <span className="text-sm text-muted-foreground">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>

                        <TabsContent value="objectives" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            {standard.learning_objectives.map((objective, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-sm">{objective}</p>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="assessment" className="space-y-4 mt-4">
                          <div className="space-y-3">
                            {Object.entries(standard.assessment_criteria).map(([component, weight]) => (
                              <div key={component} className="flex justify-between items-center p-3 border rounded-lg">
                                <div className="flex items-center gap-2">
                                  <BookCheck className="h-4 w-4 text-primary" />
                                  <span className="font-medium capitalize">{component.replace(/_/g, ' ')}</span>
                                </div>
                                <Badge variant="outline">{weight}%</Badge>
                              </div>
                            ))}
                          </div>
                          {alignment.last_assessment_date && (
                            <div className="pt-3 border-t">
                              <p className="text-sm text-muted-foreground">
                                Last assessed: {new Date(alignment.last_assessment_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No curriculum standards linked yet</p>
              <p className="text-sm">Contact your teacher to link your performance to national standards</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
