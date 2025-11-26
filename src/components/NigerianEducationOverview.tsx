import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, MapPin, Target, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const NigerianEducationOverview = () => {
  const [standards, setStandards] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [frameworks, setFrameworks] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [standardsRes, policiesRes, frameworksRes] = await Promise.all([
      supabase.from('curriculum_standards').select('*').limit(10),
      supabase.from('state_education_policies').select('*').limit(10),
      supabase.from('assessment_frameworks').select('*')
    ]);

    setStandards(standardsRes.data || []);
    setPolicies(policiesRes.data || []);
    setFrameworks(frameworksRes.data || []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Nigerian Education System Overview
        </CardTitle>
        <CardDescription>
          WAEC/NECO standards, state policies, and assessment frameworks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="standards">
              <BookOpen className="h-4 w-4 mr-2" />
              Standards
            </TabsTrigger>
            <TabsTrigger value="policies">
              <MapPin className="h-4 w-4 mr-2" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="frameworks">
              <Target className="h-4 w-4 mr-2" />
              Frameworks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standards" className="space-y-4 mt-4">
            {standards.length > 0 ? (
              <div className="space-y-3">
                {standards.map((standard) => (
                  <Card key={standard.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default">{standard.examination_body}</Badge>
                            <Badge variant="outline">{standard.grade_level}</Badge>
                          </div>
                          <CardTitle className="text-base">{standard.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {standard.subject} • Code: {standard.code}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Competency Areas</p>
                          <div className="flex flex-wrap gap-1">
                            {standard.competency_areas?.map((area: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{area}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No curriculum standards available</p>
                <p className="text-sm">Click "Seed WAEC/NECO Standards" to add default standards</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="policies" className="space-y-4 mt-4">
            {policies.length > 0 ? (
              <div className="space-y-3">
                {policies.map((policy) => (
                  <Card key={policy.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{policy.state}</Badge>
                        <Badge variant="outline">{policy.policy_type}</Badge>
                      </div>
                      <CardTitle className="text-base">{policy.policy_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{policy.description}</p>
                      {policy.implementation_guidelines && (
                        <div className="p-3 bg-muted/50 rounded text-sm">
                          <p className="font-semibold mb-1">Implementation Guidelines:</p>
                          <p>{policy.implementation_guidelines}</p>
                        </div>
                      )}
                      {policy.effective_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Effective from: {new Date(policy.effective_date).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No state policies available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4 mt-4">
            {frameworks.length > 0 ? (
              <div className="space-y-3">
                {frameworks.map((framework) => (
                  <Card key={framework.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{framework.examination_body || 'INTERNAL'}</Badge>
                        <Badge variant="outline">{framework.framework_type}</Badge>
                      </div>
                      <CardTitle className="text-base">{framework.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Pass Mark</p>
                          <p className="text-lg font-bold">{framework.pass_mark}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Excellence Mark</p>
                          <p className="text-lg font-bold">{framework.excellence_mark}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Grade Levels</p>
                          <div className="flex flex-wrap gap-1">
                            {framework.grade_levels?.map((level: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{level}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Subjects</p>
                          <div className="flex flex-wrap gap-1">
                            {framework.subjects?.slice(0, 5).map((subject: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{subject}</Badge>
                            ))}
                            {framework.subjects?.length > 5 && (
                              <Badge variant="outline" className="text-xs">+{framework.subjects.length - 5} more</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No assessment frameworks available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
