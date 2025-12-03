import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileQuestion, Search, Clock, Target, CheckCircle, Play } from 'lucide-react';
import { Quiz } from '@/hooks/useQuizzes';
import { QuizAttempt } from '@/hooks/useLearnerContent';
import { format } from 'date-fns';

const SUBJECTS = ['All', 'Mathematics', 'English', 'Science', 'Social Studies', 'Civic Education', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'];

interface QuizzesLibraryProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onSelectQuiz: (quiz: Quiz) => void;
  onViewResult: (quiz: Quiz, attempt: QuizAttempt) => void;
  isLoading?: boolean;
}

export const QuizzesLibrary = ({ 
  quizzes, 
  attempts, 
  onSelectQuiz,
  onViewResult,
  isLoading 
}: QuizzesLibraryProps) => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const getLatestAttempt = (quizId: string): QuizAttempt | undefined => {
    return attempts
      .filter(a => a.quiz_id === quizId && a.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || quiz.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded-lg mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.map((subject) => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No quizzes available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => {
            const latestAttempt = getLatestAttempt(quiz.id);
            const hasAttempted = !!latestAttempt;
            const score = latestAttempt ? Math.round((latestAttempt.score! / latestAttempt.max_score!) * 100) : 0;
            const passed = hasAttempted && score >= quiz.pass_score;

            return (
              <Card 
                key={quiz.id} 
                className="group hover:shadow-lg transition-all overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-6 bg-primary/10 flex items-center justify-center">
                    <FileQuestion className="h-12 w-12 text-primary" />
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Title and Description */}
                    <div>
                      <h3 className="font-semibold line-clamp-1">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {quiz.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{quiz.subject}</Badge>
                      <Badge variant="secondary">{quiz.grade_level}</Badge>
                    </div>

                    {/* Quiz Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {quiz.time_limit_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quiz.time_limit_minutes} min
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Pass: {quiz.pass_score}%
                      </div>
                    </div>

                    {/* Attempt Status */}
                    {hasAttempted && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <span className="text-sm text-muted-foreground">Last score:</span>
                        <Badge variant={passed ? 'default' : 'secondary'} className={passed ? 'bg-green-500' : ''}>
                          {score}%
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {hasAttempted ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => onViewResult(quiz, latestAttempt)}
                          >
                            View Results
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => onSelectQuiz(quiz)}
                          >
                            Retry
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => onSelectQuiz(quiz)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Quiz
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
