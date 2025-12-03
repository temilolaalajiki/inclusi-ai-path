import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AssignTeacherDialog } from "./AssignTeacherDialog";

interface PendingLearner {
  id: string;
  user_id: string;
  demographics: { age?: string; grade?: string } | null;
  learning_challenges: string[] | null;
  accessibility_needs: string[] | null;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

interface PendingLearnersTableProps {
  onAssignmentComplete: () => void;
}

export const PendingLearnersTable = ({ onAssignmentComplete }: PendingLearnersTableProps) => {
  const [pendingLearners, setPendingLearners] = useState<PendingLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLearner, setSelectedLearner] = useState<PendingLearner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPendingLearners = async () => {
    setLoading(true);
    try {
      const { data: learnersData, error } = await supabase
        .from('learners')
        .select('*')
        .is('teacher_id', null);

      if (error) throw error;

      if (learnersData && learnersData.length > 0) {
        const userIds = learnersData.map(l => l.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        const enrichedLearners = learnersData.map(learner => ({
          ...learner,
          profiles: profilesData?.find(p => p.id === learner.user_id) || null
        }));

        setPendingLearners(enrichedLearners as PendingLearner[]);
      } else {
        setPendingLearners([]);
      }
    } catch (error) {
      console.error('Error fetching pending learners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLearners();
  }, []);

  const handleAssignClick = (learner: PendingLearner) => {
    setSelectedLearner(learner);
    setDialogOpen(true);
  };

  const handleAssignmentSuccess = () => {
    fetchPendingLearners();
    onAssignmentComplete();
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading pending learners...</p>;
  }

  if (pendingLearners.length === 0) {
    return (
      <div className="text-center py-8">
        <UserCheck className="h-12 w-12 mx-auto text-success mb-4" />
        <p className="text-muted-foreground">All learners have been assigned to teachers.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Needs</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingLearners.map((learner) => {
            const demographics = learner.demographics as { age?: string; grade?: string } | null;
            return (
              <TableRow key={learner.id}>
                <TableCell className="font-medium">
                  {learner.profiles 
                    ? `${learner.profiles.first_name} ${learner.profiles.last_name}` 
                    : 'Unknown'}
                </TableCell>
                <TableCell>{demographics?.grade || 'N/A'}</TableCell>
                <TableCell>{demographics?.age || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {learner.accessibility_needs?.slice(0, 2).map((need, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {need}
                      </Badge>
                    ))}
                    {(learner.accessibility_needs?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{(learner.accessibility_needs?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(learner.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => handleAssignClick(learner)}>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Assign Teacher
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AssignTeacherDialog
        learner={selectedLearner}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleAssignmentSuccess}
      />
    </>
  );
};
