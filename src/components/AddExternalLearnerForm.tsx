import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddExternalLearnerFormProps {
  teacherId: string;
  onSuccess: () => void;
}

const accessibilityChallenges = [
  "visual", "hearing", "cognitive", "mobility", "none", "other"
];

const gradeOptions = [
  "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3",
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"
];

export function AddExternalLearnerForm({ teacherId, onSuccess }: AddExternalLearnerFormProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    learnerName: "",
    grade: "",
    subject: "",
    assessmentScore: "",
    attendancePercent: "",
    accessibilityChallenge: "",
    observations: "",
  });

  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  const toggleChallenge = (challenge: string) => {
    if (challenge === "none") {
      setSelectedChallenges(["none"]);
      return;
    }
    setSelectedChallenges(prev => {
      const filtered = prev.filter(c => c !== "none");
      return filtered.includes(challenge)
        ? filtered.filter(c => c !== challenge)
        : [...filtered, challenge];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.learnerName || !formData.grade || !formData.subject || !formData.assessmentScore) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const score = parseFloat(formData.assessmentScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast({ title: "Validation Error", description: "Assessment score must be between 0 and 100.", variant: "destructive" });
      return;
    }

    const attendance = formData.attendancePercent ? parseFloat(formData.attendancePercent) : null;
    if (attendance !== null && (isNaN(attendance) || attendance < 0 || attendance > 100)) {
      toast({ title: "Validation Error", description: "Attendance percentage must be between 0 and 100.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // 1. Create external learner record
      const challenges = selectedChallenges.filter(c => c !== "none");
      const { data: learnerData, error: learnerError } = await supabase
        .from("learners")
        .insert({
          teacher_id: teacherId,
          is_external: true,
          external_name: formData.learnerName.trim(),
          user_id: null as any,
          learning_challenges: challenges.length > 0 ? challenges : [],
          accessibility_needs: challenges.filter(c => c !== "other"),
          demographics: {
            grade: formData.grade,
            attendance_percent: attendance,
          },
        })
        .select("id")
        .single();

      if (learnerError) throw learnerError;

      const learnerId = learnerData.id;

      // 2. Insert performance record
      const { error: perfError } = await supabase
        .from("performance_records")
        .insert({
          learner_id: learnerId,
          subject: formData.subject.trim(),
          score: score,
          assessment_date: new Date().toISOString().split("T")[0],
          grade_level: formData.grade,
        });

      if (perfError) throw perfError;

      // 3. Insert teacher observation as feedback
      if (formData.observations.trim()) {
        const { error: feedbackError } = await supabase
          .from("teacher_feedback")
          .insert({
            learner_id: learnerId,
            teacher_id: teacherId,
            feedback_text: formData.observations.trim(),
            category: "observation",
          });

        if (feedbackError) throw feedbackError;
      }

      toast({ title: "Learner Added", description: "External learner data saved. Running AI analysis..." });

      // 4. Auto-trigger AI analysis
      setAnalyzing(true);
      try {
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-learner", {
          body: { learnerId },
        });

        if (analysisError) throw analysisError;

        toast({
          title: "Analysis Complete!",
          description: `Generated ${analysisData.recommendations?.length || 0} recommendations using ${analysisData.source === "ai" ? "AI" : "rule-based analysis"}.`,
        });
      } catch (analysisErr) {
        console.error("AI analysis error:", analysisErr);
        toast({
          title: "Analysis Pending",
          description: "Learner added but AI analysis could not complete. You can trigger it manually.",
          variant: "default",
        });
      } finally {
        setAnalyzing(false);
      }

      // Reset form
      setFormData({
        learnerName: "",
        grade: "",
        subject: "",
        assessmentScore: "",
        attendancePercent: "",
        accessibilityChallenge: "",
        observations: "",
      });
      setSelectedChallenges([]);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding external learner:", error);
      toast({ title: "Error", description: error.message || "Failed to add learner data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Add External Learner Data
        </CardTitle>
        <CardDescription>
          Input data for learners who will not directly use the system. The AI will automatically analyze and generate recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="learnerName">Learner Name *</Label>
              <Input
                id="learnerName"
                placeholder="Full name of the learner"
                value={formData.learnerName}
                onChange={(e) => setFormData(prev => ({ ...prev, learnerName: e.target.value }))}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Class / Grade *</Label>
              <Select value={formData.grade} onValueChange={(v) => setFormData(prev => ({ ...prev, grade: v }))}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="e.g. Mathematics, English"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                maxLength={50}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentScore">Assessment Score (0-100) *</Label>
              <Input
                id="assessmentScore"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 65"
                value={formData.assessmentScore}
                onChange={(e) => setFormData(prev => ({ ...prev, assessmentScore: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendancePercent">Attendance Record (%)</Label>
              <Input
                id="attendancePercent"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 85"
                value={formData.attendancePercent}
                onChange={(e) => setFormData(prev => ({ ...prev, attendancePercent: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accessibility Challenges</Label>
            <div className="flex flex-wrap gap-2">
              {accessibilityChallenges.map(challenge => (
                <Badge
                  key={challenge}
                  variant={selectedChallenges.includes(challenge) ? "default" : "outline"}
                  className="cursor-pointer capitalize transition-colors"
                  onClick={() => toggleChallenge(challenge)}
                >
                  {challenge}
                  {selectedChallenges.includes(challenge) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Teacher Observations / Notes</Label>
            <Textarea
              id="observations"
              placeholder="Any observations about the learner's behavior, learning patterns, or challenges..."
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading || analyzing} className="min-w-[180px]">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {analyzing ? "Analyzing..." : "Saving..."}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add & Analyze Learner
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              The AI will automatically analyze the data and generate recommendations after submission.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
