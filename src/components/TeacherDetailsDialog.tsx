import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Users, BookOpen, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeacherData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  assigned_learners_count?: number;
}

interface AssignedLearner {
  id: string;
  first_name: string;
  last_name: string;
  avgScore: number;
  totalAssessments: number;
  learning_challenges?: string[];
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

interface TeacherDetailsDialogProps {
  teacher: TeacherData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeacherDetailsDialog({ teacher, open, onOpenChange }: TeacherDetailsDialogProps) {
  const [assignedLearners, setAssignedLearners] = useState<AssignedLearner[]>([]);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [reassigning, setReassigning] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && teacher) {
      fetchAssignedLearners();
      fetchAllTeachers();
    }
  }, [open, teacher]);

  const fetchAssignedLearners = async () => {
    if (!teacher) return;

    setLoading(true);
    try {
      const { data: learnersData, error } = await supabase
        .from('learners')
        .select(`
          id,
          user_id,
          learning_challenges,
          performance_records(score)
        `)
        .eq('teacher_id', teacher.id);

      if (error) throw error;

      // Fetch profiles separately
      if (learnersData && learnersData.length > 0) {
        const userIds = learnersData.map(l => l.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const processedLearners = learnersData.map((learner: any) => {
          const profile = profilesData?.find(p => p.id === learner.user_id);
          const scores = learner.performance_records?.map((p: any) => Number(p.score)) || [];
          const avgScore = scores.length > 0 
            ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length 
            : 0;

          return {
            id: learner.id,
            first_name: profile?.first_name || 'N/A',
            last_name: profile?.last_name || 'N/A',
            avgScore: Math.round(avgScore),
            totalAssessments: scores.length,
            learning_challenges: learner.learning_challenges || []
          };
        });

        setAssignedLearners(processedLearners);
      } else {
        setAssignedLearners([]);
      }
    } catch (error: any) {
      console.error('Error fetching assigned learners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assigned learners.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTeachers = async () => {
    try {
      const { data: teachersData, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'teacher');

      if (error) throw error;

      const teacherIds = teachersData?.map(t => t.user_id) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', teacherIds);

      if (profilesError) throw profilesError;

      setAllTeachers(profilesData || []);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleReassignStudent = async (learnerId: string, newTeacherId: string) => {
    if (newTeacherId === teacher?.id) return;

    setReassigning(learnerId);
    try {
      const { error } = await supabase
        .from('learners')
        .update({ teacher_id: newTeacherId })
        .eq('id', learnerId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Student reassigned successfully.',
      });

      await fetchAssignedLearners();
    } catch (error: any) {
      console.error('Error reassigning student:', error);
      toast({
        title: 'Error',
        description: 'Failed to reassign student.',
        variant: 'destructive'
      });
    } finally {
      setReassigning(null);
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Teacher Details</DialogTitle>
          <DialogDescription>
            Complete information about the teacher and their assigned students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {teacher.first_name} {teacher.last_name}
              </CardTitle>
              <CardDescription>Teacher Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{teacher.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Learners</p>
                    <p className="font-medium">{teacher.assigned_learners_count || 0} students</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Learners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Learners</CardTitle>
              <CardDescription>
                Students currently assigned to this teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading learners...</p>
              ) : assignedLearners.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Assessments</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Learning Challenges</TableHead>
                        <TableHead>Reassign To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignedLearners.map((learner) => (
                        <TableRow key={learner.id}>
                          <TableCell className="font-medium">
                            {learner.first_name} {learner.last_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span>{learner.totalAssessments}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <Badge 
                                variant={learner.avgScore >= 70 ? "default" : "destructive"}
                              >
                                {learner.avgScore}%
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {learner.learning_challenges && learner.learning_challenges.length > 0 ? (
                                learner.learning_challenges.map((challenge, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {challenge}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              disabled={reassigning === learner.id}
                              onValueChange={(value) => handleReassignStudent(learner.id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select teacher..." />
                              </SelectTrigger>
                              <SelectContent>
                                {allTeachers
                                  .filter(t => t.id !== teacher.id)
                                  .map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                      {t.first_name} {t.last_name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No learners assigned to this teacher yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
