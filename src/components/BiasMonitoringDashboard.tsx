import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Scale, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EquityMetric {
  demographic_category: string;
  demographic_value: string;
  total_learners: number;
  recommendations_count: number;
  avg_recommendation_priority: number;
  interventions_implemented: number;
  success_rate: number;
  resource_allocation_score: number;
}

interface ComplianceCheck {
  id: string;
  check_date: string;
  check_type: string;
  status: string;
  findings: any;
}

export const BiasMonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<EquityMetric[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquityData();
  }, []);

  const fetchEquityData = async () => {
    try {
      const [metricsRes, checksRes] = await Promise.all([
        supabase.from('equity_metrics').select('*').order('metric_date', { ascending: false }).limit(50),
        supabase.from('ethical_compliance_checks').select('*').order('check_date', { ascending: false }).limit(10)
      ]);

      setMetrics(metricsRes.data || []);
      setComplianceChecks(checksRes.data || []);
    } catch (error) {
      console.error('Error fetching equity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (category: string) => {
    return metrics
      .filter(m => m.demographic_category === category)
      .reduce((acc, metric) => {
        const existing = acc.find(item => item.demographic_value === metric.demographic_value);
        if (existing) {
          existing.total_learners += metric.total_learners;
          existing.recommendations_count += metric.recommendations_count;
          existing.interventions_implemented += metric.interventions_implemented;
        } else {
          acc.push({ ...metric });
        }
        return acc;
      }, [] as EquityMetric[]);
  };

  const calculateEquityScore = () => {
    if (metrics.length === 0) return 0;
    const avgScore = metrics.reduce((sum, m) => sum + m.resource_allocation_score, 0) / metrics.length;
    return Math.round(avgScore * 100);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading equity metrics...</div>;
  }

  const locationData = groupByCategory('location');
  const languageData = groupByCategory('language');
  const equityScore = calculateEquityScore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Equity & Bias Monitoring</CardTitle>
          </div>
          <CardDescription>
            Ensuring fair and equitable support distribution across all learners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{equityScore}%</div>
                  <p className="text-sm text-muted-foreground">Overall Equity Score</p>
                  <Progress value={equityScore} className="mt-3 h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    {complianceChecks.filter(c => c.status === 'passed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Passed Compliance Checks</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground">Last 30 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">
                    {complianceChecks.filter(c => c.status === 'flagged').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Flagged Issues</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-xs text-muted-foreground">Requires review</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="location" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="location">By Location</TabsTrigger>
              <TabsTrigger value="language">By Language</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resource Distribution by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  {locationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="demographic_value" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="recommendations_count" fill="hsl(var(--primary))" name="Recommendations" />
                        <Bar dataKey="interventions_implemented" fill="hsl(var(--success))" name="Interventions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No location data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Support by Primary Language</CardTitle>
                </CardHeader>
                <CardContent>
                  {languageData.length > 0 ? (
                    <div className="space-y-3">
                      {languageData.map((data, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">{data.demographic_value}</div>
                            <Badge>{data.total_learners} learners</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Recommendations</p>
                              <p className="font-semibold">{data.recommendations_count}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interventions</p>
                              <p className="font-semibold">{data.interventions_implemented}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Success Rate</p>
                              <p className="font-semibold">{Math.round(data.success_rate * 100)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No language data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4 mt-4">
              <div className="space-y-3">
                {complianceChecks.length > 0 ? (
                  complianceChecks.map((check) => (
                    <Card key={check.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{check.check_type.replace(/_/g, ' ')}</Badge>
                              <Badge variant={
                                check.status === 'passed' ? 'default' :
                                check.status === 'flagged' ? 'outline' : 'destructive'
                              }>
                                {check.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(check.check_date).toLocaleDateString()}
                            </p>
                          </div>
                          {check.status === 'passed' ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        {check.findings && Object.keys(check.findings).length > 0 && (
                          <div className="text-sm">
                            <p className="font-semibold mb-1">Findings:</p>
                            <div className="space-y-1 text-muted-foreground">
                              {Object.entries(check.findings).map(([key, value]) => (
                                <p key={key}>• {key}: {String(value)}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground py-8">
                        <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No compliance checks performed yet</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
