import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LearnerWithProgress } from "@/hooks/useTeacherData";
import { Eye, Search } from "lucide-react";

interface StudentListTableProps {
  learners: LearnerWithProgress[];
  onViewStudent: (student: LearnerWithProgress) => void;
  onAnalyze: (learnerId: string) => void;
  onSuggestInterventions: (learnerId: string) => void;
}

export function StudentListTable({ learners, onViewStudent, onAnalyze, onSuggestInterventions }: StudentListTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLearners = useMemo(() => {
    if (!searchQuery) return learners;
    
    const query = searchQuery.toLowerCase();
    return learners.filter(learner => {
      const fullName = `${learner.profiles?.first_name} ${learner.profiles?.last_name}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [learners, searchQuery]);

  const calculateStatus = (avgScore: number) => {
    if (avgScore >= 85) return { label: 'Excellent', variant: 'default' as const };
    if (avgScore >= 70) return { label: 'On Track', variant: 'secondary' as const };
    return { label: 'Needs Support', variant: 'outline' as const };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredLearners.length} of {learners.length} students
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Teacher</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Learning Needs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLearners.length > 0 ? (
              filteredLearners.map((learner) => {
                const avgScore = learner.performance_records.length > 0
                  ? Math.round(
                      learner.performance_records.reduce((sum, p) => sum + Number(p.score), 0) /
                      learner.performance_records.length
                    )
                  : 0;
                const status = calculateStatus(avgScore);
                const allNeeds = [...(learner.learning_challenges || []), ...(learner.accessibility_needs || [])];

                return (
                  <TableRow key={learner.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {learner.profiles?.first_name} {learner.profiles?.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {learner.teacher_id ? 'Assigned' : 'Not assigned'}
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={avgScore} className="h-2" />
                          <span className="text-xs font-medium">{avgScore}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {allNeeds.slice(0, 2).map((need, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {need}
                          </Badge>
                        ))}
                        {allNeeds.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{allNeeds.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewStudent(learner)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAnalyze(learner.id)}
                        >
                          Analyze
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onSuggestInterventions(learner.id)}
                        >
                          Interventions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No students found matching your search' : 'No students assigned yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
