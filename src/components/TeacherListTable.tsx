import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, BookOpen } from "lucide-react";
import { TeacherDetailsDialog } from "./TeacherDetailsDialog";

interface TeacherData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  assigned_learners_count?: number;
}

interface TeacherListTableProps {
  teachers: TeacherData[];
}

export function TeacherListTable({ teachers }: TeacherListTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;
    
    const query = searchQuery.toLowerCase();
    return teachers.filter(teacher => {
      const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [teachers, searchQuery]);

  const handleTeacherClick = (teacher: TeacherData) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Learners</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <TableRow 
                    key={teacher.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleTeacherClick(teacher)}
                  >
                    <TableCell className="font-medium">
                      {teacher.first_name} {teacher.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacher.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {teacher.assigned_learners_count || 0} students
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No teachers found matching your search' : 'No teachers in the system yet'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TeacherDetailsDialog 
        teacher={selectedTeacher}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
