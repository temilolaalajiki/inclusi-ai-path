import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Teacher {
  id: string;
  name: string;
  learnerCount: number;
}

interface AssignTeacherDialogProps {
  learner: {
    id: string;
    user_id: string;
    profiles: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AssignTeacherDialog = ({ learner, open, onOpenChange, onSuccess }: AssignTeacherDialogProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open]);

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

        const { data: learnersCount } = await supabase
          .from('learners')
          .select('teacher_id');

        const teachersWithDetails = profilesData?.map(profile => {
          const count = learnersCount?.filter(l => l.teacher_id === profile.id).length || 0;
          return {
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`.trim() || 'Unknown Teacher',
            learnerCount: count
          };
        }) || [];

        setTeachers(teachersWithDetails);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleAssign = async () => {
    if (!learner || !selectedTeacherId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('learners')
        .update({ teacher_id: selectedTeacherId })
        .eq('id', learner.id);

      if (error) throw error;

      toast({
        title: "Teacher Assigned!",
        description: `${learner.profiles?.first_name || 'Learner'} has been assigned to their teacher.`,
      });

      setSelectedTeacherId("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const learnerName = learner?.profiles 
    ? `${learner.profiles.first_name} ${learner.profiles.last_name}` 
    : 'Unknown Learner';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Assign Teacher
          </DialogTitle>
          <DialogDescription>
            Select a teacher to assign to <strong>{learnerName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Teacher</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.learnerCount} learners)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedTeacherId || isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
