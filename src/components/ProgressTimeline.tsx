import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface PerformanceRecord {
  id: string;
  subject: string;
  score: number;
  assessment_date: string;
  notes?: string;
}

interface ProgressTimelineProps {
  performance: PerformanceRecord[];
}

export function ProgressTimeline({ performance }: ProgressTimelineProps) {
  // Group performance by subject and sort by date
  const performanceBySubject = performance.reduce((acc, record) => {
    if (!acc[record.subject]) {
      acc[record.subject] = [];
    }
    acc[record.subject].push(record);
    return acc;
  }, {} as Record<string, PerformanceRecord[]>);

  // Calculate trends for each subject
  const subjectTrends = Object.entries(performanceBySubject).map(([subject, records]) => {
    const sorted = records.sort((a, b) => 
      new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()
    );
    
    if (sorted.length < 2) {
      return { subject, trend: 'stable', improvement: 0, records: sorted };
    }

    const firstScore = Number(sorted[0].score);
    const lastScore = Number(sorted[sorted.length - 1].score);
    const improvement = lastScore - firstScore;
    
    let trend: 'improving' | 'declining' | 'stable';
    if (improvement > 5) trend = 'improving';
    else if (improvement < -5) trend = 'declining';
    else trend = 'stable';

    return { subject, trend, improvement, records: sorted };
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Progress Timeline
        </CardTitle>
        <CardDescription>Track your performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        {subjectTrends.length > 0 ? (
          <div className="space-y-6">
            {subjectTrends.map(({ subject, trend, improvement, records }) => (
              <div key={subject} className="border-l-4 border-primary/20 pl-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{subject}</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend)}
                    <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                      {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {records.map((record, index) => {
                    const isLatest = index === records.length - 1;
                    const scoreColor = Number(record.score) >= 85 
                      ? 'text-green-600' 
                      : Number(record.score) >= 70 
                      ? 'text-yellow-600' 
                      : 'text-red-600';

                    return (
                      <div 
                        key={record.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isLatest ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(record.assessment_date)}
                            </span>
                            {isLatest && (
                              <Badge variant="outline" className="text-xs">Latest</Badge>
                            )}
                          </div>
                          {record.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                          )}
                        </div>
                        <div className={`text-2xl font-bold ${scoreColor}`}>
                          {record.score}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {records.length >= 2 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="font-medium">Progress Summary: </span>
                      <span className="text-muted-foreground">
                        From {records[0].score}% to {records[records.length - 1].score}% 
                        ({formatDate(records[0].assessment_date)} - {formatDate(records[records.length - 1].assessment_date)})
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No performance data available yet. Complete assessments to see your progress timeline.
          </p>
        )}
      </CardContent>
    </Card>
  );
}