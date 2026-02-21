import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

interface TeacherFeedbackDialogProps {
  learnerId: string;
  learnerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
}

const FEEDBACK_CATEGORIES = [
  { value: "academic_progress", label: "Academic Progress" },
  { value: "behavior", label: "Behavior & Engagement" },
  { value: "learning_needs", label: "Learning Needs" },
  { value: "accessibility", label: "Accessibility Support" },
  { value: "intervention_effectiveness", label: "Intervention Effectiveness" },
  { value: "general", label: "General Observation" },
];

export function TeacherFeedbackDialog({ learnerId, learnerName, open, onOpenChange, teacherId }: TeacherFeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast({ title: "Error", description: "Please enter feedback text.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('teacher_feedback' as any)
        .insert({
          learner_id: learnerId,
          teacher_id: teacherId,
          feedback_text: feedbackText.trim(),
          category,
        } as any);

      if (error) throw error;

      toast({ title: "Feedback Submitted!", description: "Your feedback has been recorded and will help improve AI recommendations." });
      setFeedbackText("");
      setCategory("general");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({ title: "Error", description: "Failed to submit feedback. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Feedback for {learnerName}
          </DialogTitle>
          <DialogDescription>
            Your feedback helps improve AI-generated recommendations and interventions for this learner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Share your observations about this learner's progress, challenges, or needs..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
