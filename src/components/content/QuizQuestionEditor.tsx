import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, Plus, GripVertical, Trash2, Check } from 'lucide-react';
import { QuizQuestion } from '@/hooks/useQuizzes';

interface QuizQuestionEditorProps {
  question?: Partial<QuizQuestion>;
  index: number;
  onSave: (question: Partial<QuizQuestion>) => void;
  onDelete: () => void;
  onCancel?: () => void;
}

export const QuizQuestionEditor = ({ question, index, onSave, onDelete, onCancel }: QuizQuestionEditorProps) => {
  const [questionText, setQuestionText] = useState(question?.question_text || '');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'true_false' | 'short_answer'>(
    question?.question_type || 'multiple_choice'
  );
  const [options, setOptions] = useState<string[]>(
    question?.options && Array.isArray(question.options) ? question.options : ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || '');
  const [points, setPoints] = useState(question?.points || 1);

  useEffect(() => {
    if (questionType === 'true_false') {
      setOptions(['True', 'False']);
      if (!['True', 'False'].includes(correctAnswer)) {
        setCorrectAnswer('True');
      }
    } else if (questionType === 'multiple_choice' && options.length < 2) {
      setOptions(['', '', '', '']);
    }
  }, [questionType]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== idx);
      setOptions(newOptions);
      if (correctAnswer === options[idx]) {
        setCorrectAnswer(newOptions[0] || '');
      }
    }
  };

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...options];
    const oldValue = newOptions[idx];
    newOptions[idx] = value;
    setOptions(newOptions);
    if (correctAnswer === oldValue) {
      setCorrectAnswer(value);
    }
  };

  const handleSave = () => {
    if (!questionText.trim()) return;
    if (questionType !== 'short_answer' && !correctAnswer) return;

    onSave({
      ...question,
      question_text: questionText,
      question_type: questionType,
      options: questionType === 'short_answer' ? [] : options.filter(o => o.trim()),
      correct_answer: correctAnswer,
      points,
      order_index: index,
    });
  };

  const isValid = questionText.trim() && 
    (questionType === 'short_answer' ? correctAnswer.trim() : correctAnswer);

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 text-muted-foreground pt-2">
            <GripVertical className="h-5 w-5 cursor-grab" />
            <span className="font-medium">Q{index + 1}</span>
          </div>

          <div className="flex-1 space-y-4">
            {/* Question Text */}
            <div>
              <Label>Question</Label>
              <Textarea
                placeholder="Enter your question..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Question Type */}
              <div>
                <Label>Question Type</Label>
                <Select value={questionType} onValueChange={(v: any) => setQuestionType(v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Points */}
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Answer Options */}
            {questionType === 'multiple_choice' && (
              <div>
                <Label>Answer Options (select correct answer)</Label>
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} className="mt-2 space-y-2">
                  {options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <RadioGroupItem value={option} id={`option-${index}-${idx}`} disabled={!option.trim()} />
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
                {options.length < 6 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
            )}

            {questionType === 'true_false' && (
              <div>
                <Label>Correct Answer</Label>
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} className="mt-2 flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="True" id={`true-${index}`} />
                    <Label htmlFor={`true-${index}`} className="font-normal">True</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="False" id={`false-${index}`} />
                    <Label htmlFor={`false-${index}`} className="font-normal">False</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {questionType === 'short_answer' && (
              <div>
                <Label>Expected Answer</Label>
                <Input
                  placeholder="Enter the correct answer..."
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Learner answers will be compared to this (case-insensitive)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Question
              </Button>
              <div className="flex gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="button" size="sm" onClick={handleSave} disabled={!isValid}>
                  <Check className="h-4 w-4 mr-1" />
                  Save Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
