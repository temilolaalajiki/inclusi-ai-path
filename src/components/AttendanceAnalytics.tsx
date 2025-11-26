import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingDown, Calendar, Users } from "lucide-react";
import { LearnerWithProgress } from "@/hooks/useTeacherData";

interface AttendanceData {
  learner_id: string;
  date: string;
  status: string;
}

interface AttendanceAnalyticsProps {
  learners: LearnerWithProgress[];
  attendanceRecords: AttendanceData[];
}

export const AttendanceAnalytics = ({ learners, attendanceRecords }: AttendanceAnalyticsProps) => {
  // Calculate attendance rates per learner
  const attendanceRates = learners.map(learner => {
    const learnerRecords = attendanceRecords.filter(r => r.learner_id === learner.id);
    const totalDays = learnerRecords.length;
    const presentDays = learnerRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const rate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;
    
    return {
      name: `${learner.profiles?.first_name} ${learner.profiles?.last_name}`,
      rate: Math.round(rate),
      presentDays,
      absentDays: learnerRecords.filter(r => r.status === 'absent').length,
      lateDays: learnerRecords.filter(r => r.status === 'late').length,
      totalDays,
    };
  });

  // Identify low attendance learners (below 75%)
  const lowAttendanceLearners = attendanceRates.filter(l => l.rate < 75);

  // Calculate overall class attendance by day
  const attendanceByDay = attendanceRecords.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = { date, present: 0, absent: 0, late: 0, excused: 0 };
    }
    acc[date][record.status as 'present' | 'absent' | 'late' | 'excused']++;
    return acc;
  }, {} as Record<string, { date: string; present: number; absent: number; late: number; excused: number }>);

  const dailyData = Object.values(attendanceByDay)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days

  // Status distribution
  const statusDistribution = attendanceRecords.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Present', value: statusDistribution['present'] || 0, color: 'hsl(var(--success))' },
    { name: 'Absent', value: statusDistribution['absent'] || 0, color: 'hsl(var(--destructive))' },
    { name: 'Late', value: statusDistribution['late'] || 0, color: 'hsl(var(--warning))' },
    { name: 'Excused', value: statusDistribution['excused'] || 0, color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  const overallRate = attendanceRecords.length > 0
    ? Math.round((((statusDistribution['present'] || 0) + (statusDistribution['late'] || 0)) / attendanceRecords.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              Overall Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallRate}%</div>
            <Progress value={overallRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Days Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyData.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
              Low Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowAttendanceLearners.length}</div>
            <p className="text-xs text-muted-foreground">Below 75%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Total Absences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusDistribution['absent'] || 0}</div>
            <p className="text-xs text-muted-foreground">Unexcused</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Alert */}
      {lowAttendanceLearners.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              Low Attendance Alert
            </CardTitle>
            <CardDescription>
              {lowAttendanceLearners.length} learner(s) with attendance below 75% require intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowAttendanceLearners.map((learner) => (
                <div key={learner.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{learner.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {learner.absentDays} absent, {learner.lateDays} late out of {learner.totalDays} days
                    </p>
                  </div>
                  <Badge variant="destructive">{learner.rate}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Trend</CardTitle>
            <CardDescription>Last 30 days of attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="hsl(var(--success))" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="hsl(var(--destructive))" name="Absent" />
                <Line type="monotone" dataKey="late" stroke="hsl(var(--warning))" name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Overall breakdown of attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Individual Attendance Rates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Individual Attendance Rates</CardTitle>
            <CardDescription>Attendance percentage by learner</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rate" fill="hsl(var(--primary))" name="Attendance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};