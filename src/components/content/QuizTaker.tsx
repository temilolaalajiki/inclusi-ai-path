import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, ArrowRight, Clock, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Quiz, QuizQuestion } from '@/hooks/useQuizzes';
import { QuizAttempt, useLearnerContent } from '@/hooks/useLearnerContent';

interface QuizTakerProps {
  quiz: Quiz;
  learnerId: string;
  onComplete: (attempt: QuizAttempt) => void;
  onBack: () => void;
}

export const QuizTaker = ({ quiz, learnerId, onComplete, onBack }: QuizTakerProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { getQuizQuestions, startQuizAttempt, submitQuizAttempt } = useLearnerContent(learnerId);

  // Load questions and start attempt
  useEffect(() => {
    const initQuiz = async () => {
      try {
        const [loadedQuestions, newAttempt] = await Promise.all([
          getQuizQuestions(quiz.id),
          startQuizAttempt.mutateAsync(quiz.id),
        ]);
        setQuestions(loadedQuestions as QuizQuestion[]);
        setAttempt(newAttempt);
        if (quiz.time_limit_minutes) {
          setTimeRemaining(quiz.time_limit_minutes * 60);
        }
      } catch (error) {
        console.error('Error initializing quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initQuiz();
  }, [quiz.id]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = (): { score: number; maxScore: number } => {
    let score = 0;
    let maxScore = 0;

    questions.forEach((q) => {
      maxScore += q.points;
      const userAnswer = answers[q.id]?.toLowerCase().trim();
      const correctAnswer = q.correct_answer.toLowerCase().trim();
      if (userAnswer === correctAnswer) {
        score += q.points;
      }
    });

    return { score, maxScore };
  };

  const handleSubmit = async () => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { score, maxScore } = calculateScore();
      const completedAttempt = await submitQuizAttempt.mutateAsync({
        attemptId: attempt.id,
        answers,
        score,
        maxScore,
      });
      onComplete(completedAttempt);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-muted-foreground">This quiz has no questions.</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>•</span>
              <span>{answeredCount} answered</span>
            </div>
          </div>
        </div>
        {timeRemaining !== null && (
          <Badge variant={timeRemaining < 60 ? 'destructive' : 'outline'} className="text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {formatTime(timeRemaining)}
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {currentQuestion.question_type.replace('_', ' ')} • {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
            </Badge>
          </div>
          <CardTitle className="text-lg mt-4">{currentQuestion.question_text}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Multiple Choice */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              {(currentQuestion.options as string[]).map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* True/False */}
          {currentQuestion.question_type === 'true_false' && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="True" id="true" />
                <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="False" id="false" />
                <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}

          {/* Short Answer */}
          {currentQuestion.question_type === 'short_answer' && (
            <Input
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                idx === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : answers[questions[idx].id]
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={() => setShowConfirmSubmit(true)}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex((prev) => prev + 1)}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Confirm Submit Dialog */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="text-yellow-600 block mt-2">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount !== 1 ? 's' : ''}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
