import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trophy, Target, Clock, ArrowLeft, RotateCcw } from 'lucide-react';
import { Quiz, QuizQuestion } from '@/hooks/useQuizzes';
import { QuizAttempt, useLearnerContent } from '@/hooks/useLearnerContent';
import { format } from 'date-fns';

interface QuizResultCardProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onBack: () => void;
  onRetry?: () => void;
}

export const QuizResultCard = ({ quiz, attempt, onBack, onRetry }: QuizResultCardProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const { getQuizQuestions } = useLearnerContent();

  useEffect(() => {
    const loadQuestions = async () => {
      const loadedQuestions = await getQuizQuestions(quiz.id);
      setQuestions(loadedQuestions as QuizQuestion[]);
    };
    loadQuestions();
  }, [quiz.id]);

  const score = attempt.score || 0;
  const maxScore = attempt.max_score || 1;
  const percentage = Math.round((score / maxScore) * 100);
  const passed = percentage >= quiz.pass_score;

  const getAnswerStatus = (question: QuizQuestion): 'correct' | 'incorrect' | 'unanswered' => {
    const userAnswer = attempt.answers[question.id]?.toLowerCase().trim();
    if (!userAnswer) return 'unanswered';
    return userAnswer === question.correct_answer.toLowerCase().trim() ? 'correct' : 'incorrect';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>
      </div>

      {/* Score Card */}
      <Card className={passed ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            {passed ? (
              <Trophy className="h-16 w-16 text-green-500 mb-4" />
            ) : (
              <Target className="h-16 w-16 text-red-500 mb-4" />
            )}
            
            <h2 className="text-4xl font-bold mb-2">
              {percentage}%
            </h2>
            
            <p className="text-lg text-muted-foreground mb-4">
              {score} out of {maxScore} points
            </p>
            
            <Badge 
              className={passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
              variant="default"
            >
              {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
            </Badge>

            <p className="text-sm text-muted-foreground mt-4">
              Pass score: {quiz.pass_score}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">
              {questions.filter(q => getAnswerStatus(q) === 'correct').length}
            </p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">
              {questions.filter(q => getAnswerStatus(q) === 'incorrect').length}
            </p>
            <p className="text-sm text-muted-foreground">Incorrect</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">
              {attempt.completed_at && attempt.started_at ? (
                Math.round((new Date(attempt.completed_at).getTime() - new Date(attempt.started_at).getTime()) / 60000)
              ) : '-'}
            </p>
            <p className="text-sm text-muted-foreground">Minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Answers Toggle */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => setShowAnswers(!showAnswers)}
      >
        {showAnswers ? 'Hide Answers' : 'Review Answers'}
      </Button>

      {/* Answer Review */}
      {showAnswers && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Answer Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, idx) => {
              const status = getAnswerStatus(question);
              const userAnswer = attempt.answers[question.id] || 'Not answered';

              return (
                <div key={question.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded-full ${
                      status === 'correct' ? 'bg-green-500/20' :
                      status === 'incorrect' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {status === 'correct' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : status === 'incorrect' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {idx + 1}. {question.question_text}
                      </p>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={status === 'correct' ? 'text-green-600 font-medium' : 'text-red-600'}>
                            {userAnswer}
                          </span>
                        </p>
                        {status !== 'correct' && (
                          <p>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-600 font-medium">{question.correct_answer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{question.points} pt{question.points !== 1 ? 's' : ''}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back to Quizzes
        </Button>
        {onRetry && !passed && (
          <Button onClick={onRetry} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>

      {/* Timestamp */}
      <p className="text-center text-sm text-muted-foreground">
        Completed on {attempt.completed_at && format(new Date(attempt.completed_at), 'MMMM d, yyyy at h:mm a')}
      </p>
    </div>
  );
};
