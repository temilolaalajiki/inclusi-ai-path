import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LearnerWithProgress } from "@/hooks/useTeacherData";

interface AttendanceTrackerProps {
  learners: LearnerWithProgress[];
  onAttendanceRecorded: () => void;
}

export const AttendanceTracker = ({ learners, onAttendanceRecorded }: AttendanceTrackerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; notes: string }>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (learnerId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [learnerId]: { ...prev[learnerId], status }
    }));
  };

  const handleNotesChange = (learnerId: string, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [learnerId]: { ...prev[learnerId], notes }
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendanceData)
        .filter(([_, data]) => data.status)
        .map(([learnerId, data]) => ({
          learner_id: learnerId,
          date: selectedDate.toISOString().split('T')[0],
          status: data.status,
          notes: data.notes || null,
        }));

      if (records.length === 0) {
        toast({
          title: "No records to save",
          description: "Please mark attendance for at least one learner.",
          variant: "destructive",
        });
        return;
      }

      // Use upsert to handle updates
      const { error } = await supabase
        .from('attendance_records')
        .upsert(records, { 
          onConflict: 'learner_id,date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Attendance saved",
        description: `Successfully recorded attendance for ${records.length} learner(s).`,
      });

      setAttendanceData({});
      onAttendanceRecorded();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance records.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-success' },
    { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-destructive' },
    { value: 'late', label: 'Late', icon: Clock, color: 'text-warning' },
    { value: 'excused', label: 'Excused', icon: FileText, color: 'text-muted-foreground' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Attendance</CardTitle>
        <CardDescription>
          Mark attendance for your learners on the selected date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => date > new Date()}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Attendance for {selectedDate.toLocaleDateString()}
            </h3>
            <Badge variant="outline">
              {learners.length} Learner{learners.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="space-y-3">
            {learners.map((learner) => {
              const currentStatus = attendanceData[learner.id]?.status;
              const StatusIcon = statusOptions.find(opt => opt.value === currentStatus)?.icon;

              return (
                <Card key={learner.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {StatusIcon && (
                          <StatusIcon 
                            className={`h-5 w-5 ${statusOptions.find(opt => opt.value === currentStatus)?.color}`}
                            aria-hidden="true"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {learner.profiles?.first_name} {learner.profiles?.last_name}
                          </p>
                          {currentStatus && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {currentStatus}
                            </p>
                          )}
                        </div>
                      </div>
                      <Select
                        value={currentStatus || ''}
                        onValueChange={(value) => handleStatusChange(learner.id, value)}
                      >
                        <SelectTrigger className="w-[140px]" aria-label={`Attendance status for ${learner.profiles?.first_name} ${learner.profiles?.last_name}`}>
                          <SelectValue placeholder="Mark status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className={`h-4 w-4 ${option.color}`} aria-hidden="true" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentStatus && (
                      <div className="space-y-2">
                        <Label htmlFor={`notes-${learner.id}`}>Notes (optional)</Label>
                        <Textarea
                          id={`notes-${learner.id}`}
                          placeholder="Add any relevant notes..."
                          value={attendanceData[learner.id]?.notes || ''}
                          onChange={(e) => handleNotesChange(learner.id, e.target.value)}
                          className="h-20"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Button 
            onClick={handleSaveAttendance} 
            disabled={saving || Object.keys(attendanceData).length === 0}
            className="w-full"
            aria-label="Save attendance records"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};