import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataUsageLog {
  id: string;
  data_type: string;
  purpose: string;
  data_fields: string[];
  processing_context?: string;
  consent_required: boolean;
  consent_given: boolean;
  created_at: string;
}

interface UserConsent {
  analytics_consent: boolean;
  ai_processing_consent: boolean;
  demographic_sharing_consent: boolean;
  research_participation_consent: boolean;
  consent_date?: string;
}

interface DataTransparencyViewProps {
  userId: string;
}

export const DataTransparencyView = ({ userId }: DataTransparencyViewProps) => {
  const [usageLogs, setUsageLogs] = useState<DataUsageLog[]>([]);
  const [consent, setConsent] = useState<UserConsent>({
    analytics_consent: false,
    ai_processing_consent: false,
    demographic_sharing_consent: false,
    research_participation_consent: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDataUsage();
    fetchConsent();
  }, [userId]);

  const fetchDataUsage = async () => {
    const { data } = await supabase
      .from('data_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    setUsageLogs(data || []);
  };

  const fetchConsent = async () => {
    const { data } = await supabase
      .from('user_data_consent')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setConsent({
        analytics_consent: data.analytics_consent || false,
        ai_processing_consent: data.ai_processing_consent || false,
        demographic_sharing_consent: data.demographic_sharing_consent || false,
        research_participation_consent: data.research_participation_consent || false,
        consent_date: data.consent_date
      });
    }
  };

  const updateConsent = async (key: keyof UserConsent, value: boolean) => {
    try {
      const updates = { 
        [key]: value,
        consent_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_data_consent')
        .upsert({
          user_id: userId,
          ...consent,
          ...updates
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setConsent({ ...consent, ...updates });
      toast({
        title: 'Consent Updated',
        description: 'Your data processing preferences have been saved.'
      });
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: 'Error',
        description: 'Failed to update consent preferences.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Data Privacy & Transparency</CardTitle>
          </div>
          <CardDescription>
            Control how your data is used and see transparency logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Your Data Consent</h3>
            
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics & Performance Tracking</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow system to track performance data for improvement
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={consent.analytics_consent}
                  onCheckedChange={(checked) => updateConsent('analytics_consent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai">AI-Powered Recommendations</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable AI analysis of your data for personalized recommendations
                  </p>
                </div>
                <Switch
                  id="ai"
                  checked={consent.ai_processing_consent}
                  onCheckedChange={(checked) => updateConsent('ai_processing_consent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="demographic">Demographic Data Sharing</Label>
                  <p className="text-xs text-muted-foreground">
                    Share anonymized demographic data for equity analysis
                  </p>
                </div>
                <Switch
                  id="demographic"
                  checked={consent.demographic_sharing_consent}
                  onCheckedChange={(checked) => updateConsent('demographic_sharing_consent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="research">Research Participation</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow your data to be used in educational research
                  </p>
                </div>
                <Switch
                  id="research"
                  checked={consent.research_participation_consent}
                  onCheckedChange={(checked) => updateConsent('research_participation_consent', checked)}
                />
              </div>
            </div>

            {consent.consent_date && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(consent.consent_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Data Usage History</CardTitle>
          </div>
          <CardDescription>Recent data processing activities</CardDescription>
        </CardHeader>
        <CardContent>
          {usageLogs.length > 0 ? (
            <div className="space-y-3">
              {usageLogs.map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{log.data_type}</Badge>
                        <Badge variant="secondary">{log.purpose}</Badge>
                      </div>
                      <p className="text-sm font-medium capitalize">
                        {log.data_type.replace(/_/g, ' ')} data accessed
                      </p>
                    </div>
                    {log.consent_required && (
                      <Badge variant={log.consent_given ? "default" : "destructive"}>
                        {log.consent_given ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        {log.consent_given ? "Consented" : "No Consent"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Fields accessed: {log.data_fields.join(', ')}</p>
                    {log.processing_context && <p>Context: {log.processing_context}</p>}
                    <p>Time: {new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No data usage logs yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
