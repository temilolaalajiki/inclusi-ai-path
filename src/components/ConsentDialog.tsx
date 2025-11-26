import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConsentDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConsentDialog = ({ userId, open, onOpenChange }: ConsentDialogProps) => {
  const [consents, setConsents] = useState({
    analytics_consent: false,
    ai_processing_consent: false,
    demographic_sharing_consent: false,
    research_participation_consent: false
  });
  const { toast } = useToast();

  const handleSaveConsent = async () => {
    try {
      const { error } = await supabase
        .from('user_data_consent')
        .upsert({
          user_id: userId,
          ...consents,
          consent_date: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Preferences Saved',
        description: 'Your data privacy preferences have been recorded.'
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving consent:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Data Privacy & Consent
          </DialogTitle>
          <DialogDescription>
            We value your privacy. Please review and set your data processing preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="analytics"
              checked={consents.analytics_consent}
              onCheckedChange={(checked) => 
                setConsents({ ...consents, analytics_consent: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="analytics" className="font-medium cursor-pointer">
                Analytics & Performance Tracking
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Allow us to track your performance data to help improve your learning experience 
                and provide personalized insights.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="ai"
              checked={consents.ai_processing_consent}
              onCheckedChange={(checked) => 
                setConsents({ ...consents, ai_processing_consent: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="ai" className="font-medium cursor-pointer">
                AI-Powered Recommendations
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enable AI analysis of your learning data to receive personalized recommendations 
                and interventions tailored to your needs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="demographic"
              checked={consents.demographic_sharing_consent}
              onCheckedChange={(checked) => 
                setConsents({ ...consents, demographic_sharing_consent: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="demographic" className="font-medium cursor-pointer">
                Demographic Data for Equity Analysis
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Share anonymized demographic information to help ensure equitable distribution 
                of resources and support across all learners.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="research"
              checked={consents.research_participation_consent}
              onCheckedChange={(checked) => 
                setConsents({ ...consents, research_participation_consent: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="research" className="font-medium cursor-pointer">
                Educational Research Participation
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Allow your anonymized data to be used in educational research to improve 
                inclusive learning systems nationwide.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              You can change these preferences at any time in your Privacy settings. 
              Your data is always encrypted and stored securely. We never sell your data to third parties.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip for Now
          </Button>
          <Button onClick={handleSaveConsent}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
