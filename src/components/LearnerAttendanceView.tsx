import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, XCircle, Clock, FileText, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  notes: string | null;
}

interface LearnerAttendanceViewProps {
  learnerId: string;
}

export const LearnerAttendanceView = ({ learnerId }: LearnerAttendanceViewProps) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [learnerId]);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('learner_id', learnerId)
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
      setRecords(data);
    }
    setLoading(false);
  };

  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const statusIcons = {
    present: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
    absent: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    late: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
    excused: { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  };

  // Prepare chart data (last 14 days)
  const chartData = records
    .slice(0, 14)
    .reverse()
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: record.status === 'present' ? 1 : record.status === 'late' ? 0.5 : 0,
    }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading attendance...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <Progress value={attendanceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" aria-hidden="true" />
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{presentDays - lateDays}</div>
            <p className="text-xs text-muted-foreground">Days on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" aria-hidden="true" />
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lateDays}</div>
            <p className="text-xs text-muted-foreground">Late arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{absentDays}</div>
            <p className="text-xs text-muted-foreground">Days missed</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Your attendance over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} tickFormatter={(value) => value === 1 ? 'Present' : value === 0.5 ? 'Late' : 'Absent'} />
                <Tooltip 
                  formatter={(value: number) => value === 1 ? 'Present' : value === 0.5 ? 'Late' : 'Absent'}
                />
                <Line type="monotone" dataKey="status" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" aria-hidden="true" />
            Recent Attendance
          </CardTitle>
          <CardDescription>Your attendance records from the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-2">
              {records.map((record) => {
                const statusConfig = statusIcons[record.status as keyof typeof statusIcons];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : 'outline'}
                      className="capitalize"
                    >
                      {record.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No attendance records yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Message */}
      {attendanceRate < 75 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <XCircle className="h-5 w-5" aria-hidden="true" />
              Attendance Improvement Needed
            </CardTitle>
            <CardDescription>
              Your attendance rate is below 75%. Regular attendance is important for your learning success.
              If you're facing challenges attending regularly, please speak with your teacher.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};