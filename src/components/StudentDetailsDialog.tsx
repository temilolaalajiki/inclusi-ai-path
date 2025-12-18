import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LearnerWithProgress } from "@/hooks/useTeacherData";
import { User, BarChart3, BookOpen, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedLearnerProfile } from "@/components/EnhancedLearnerProfile";

interface StudentDetailsDialogProps {
  student: LearnerWithProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function StudentDetailsDialog({ student, open, onOpenChange, onUpdate }: StudentDetailsDialogProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [nigerianContext, setNigerianContext] = useState<any>(null);
  const [demographics, setDemographics] = useState<any>(null);
  const [accessibilityProfile, setAccessibilityProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    teacherId: "",
    learningChallenges: [] as string[],
    accessibilityNeeds: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    if (student && open) {
      setFormData({
        firstName: student.profiles?.first_name || "",
        lastName: student.profiles?.last_name || "",
        teacherId: student.teacher_id || "",
        learningChallenges: student.learning_challenges || [],
        accessibilityNeeds: student.accessibility_needs || []
      });
      fetchTeachers();
      fetchEnhancedData();
    }
  }, [student, open]);

  const fetchEnhancedData = async () => {
    if (!student) return;

    try {
      const [contextRes, demoRes, accessRes] = await Promise.all([
        supabase.from('nigerian_learning_contexts').select('*').eq('learner_id', student.id).maybeSingle(),
        supabase.from('learner_demographics').select('*').eq('learner_id', student.id).maybeSingle(),
        supabase.from('accessibility_profiles').select('*').eq('learner_id', student.id).maybeSingle()
      ]);

      setNigerianContext(contextRes.data);
      setDemographics(demoRes.data);
      setAccessibilityProfile(accessRes.data);
    } catch (error) {
      console.error('Error fetching enhanced data:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (rolesData && rolesData.length > 0) {
        const teacherIds = rolesData.map(r => r.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', teacherIds);

        if (profilesData) {
          setTeachers(profilesData.map(p => ({
            id: p.id,
            name: `${p.first_name} ${p.last_name}`
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSave = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName
        })
        .eq('id', student.user_id);

      if (profileError) throw profileError;

      // Update learner
      const { data: updatedLearner, error: learnerError } = await supabase
        .from('learners')
        .update({
          teacher_id: formData.teacherId || null,
          learning_challenges: formData.learningChallenges,
          accessibility_needs: formData.accessibilityNeeds
        })
        .eq('id', student.id)
        .select();

      if (learnerError) throw learnerError;
      
      // Check if update actually happened (RLS might block without error)
      if (!updatedLearner || updatedLearner.length === 0) {
        throw new Error('Update was blocked. You may not have permission to modify this learner.');
      }

      toast({
        title: 'Success!',
        description: 'Student profile updated successfully.'
      });
      
      setEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student profile.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  const avgScore = student.performance_records.length > 0
    ? Math.round(
        student.performance_records.reduce((sum, p) => sum + Number(p.score), 0) /
        student.performance_records.length
      )
    : 0;

  const status = avgScore >= 85 ? 'Excellent' : avgScore >= 70 ? 'On Track' : 'Needs Support';
  const assignedTeacher = teachers.find(t => t.id === formData.teacherId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Profile
          </DialogTitle>
          <DialogDescription>
            View and manage student details, progress, and assignments
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced Profile</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                  {!editing ? (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={loading}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    {editing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{student.profiles?.first_name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    {editing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{student.profiles?.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Assigned Teacher</Label>
                  {editing ? (
                    <Select value={formData.teacherId} onValueChange={(value) => setFormData({ ...formData, teacherId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium mt-1">
                      {assignedTeacher?.name || 'Not assigned'}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={
                      status === "Excellent" ? "default" : 
                      status === "On Track" ? "secondary" : "outline"
                    }>
                      {status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Learning Challenges</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(editing ? formData.learningChallenges : student.learning_challenges || []).map((challenge, idx) => (
                      <Badge key={idx} variant="outline">
                        {challenge}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Accessibility Needs</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(editing ? formData.accessibilityNeeds : student.accessibility_needs || []).map((need, idx) => (
                      <Badge key={idx} variant="outline">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-4">
            <EnhancedLearnerProfile
              learnerId={student.id}
              nigerianContext={nigerianContext}
              demographics={demographics}
              accessibilityProfile={accessibilityProfile}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-bold">{avgScore}%</span>
                  </div>
                  <Progress value={avgScore} className="h-3" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Recent Performance</h4>
                  {student.performance_records.length > 0 ? (
                    student.performance_records.map((record, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{record.subject}</p>
                            <p className="text-xs text-muted-foreground">{new Date(record.assessment_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge variant={Number(record.score) >= 85 ? "default" : Number(record.score) >= 70 ? "secondary" : "destructive"}>
                          {record.score}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No performance records yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Active Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.recommendations.length > 0 ? (
                    student.recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">{rec.status}</Badge>
                        </div>
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recommendations yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
