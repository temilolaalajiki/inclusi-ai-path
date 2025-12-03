import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileQuestion } from 'lucide-react';
import { LearningMaterialsLibrary } from './LearningMaterialsLibrary';
import { MaterialViewer } from './MaterialViewer';
import { QuizzesLibrary } from './QuizzesLibrary';
import { QuizTaker } from './QuizTaker';
import { QuizResultCard } from './QuizResultCard';
import { useLearnerContent, QuizAttempt } from '@/hooks/useLearnerContent';
import { LearningMaterial } from '@/hooks/useLearningMaterials';
import { Quiz } from '@/hooks/useQuizzes';

type MaterialView = 'library' | 'viewer';
type QuizView = 'library' | 'taking' | 'result';

interface LearnerContentHubProps {
  learnerId: string;
}

export const LearnerContentHub = ({ learnerId }: LearnerContentHubProps) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [materialView, setMaterialView] = useState<MaterialView>('library');
  const [quizView, setQuizView] = useState<QuizView>('library');
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);

  const { materials, quizzes, progress, attempts, isLoading } = useLearnerContent(learnerId);

  // Material handlers
  const handleSelectMaterial = (material: LearningMaterial) => {
    setSelectedMaterial(material);
    setMaterialView('viewer');
  };

  const handleBackToLibrary = () => {
    setMaterialView('library');
    setSelectedMaterial(null);
  };

  // Quiz handlers
  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizView('taking');
  };

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setCurrentAttempt(attempt);
    setQuizView('result');
  };

  const handleViewResult = (quiz: Quiz, attempt: QuizAttempt) => {
    setSelectedQuiz(quiz);
    setCurrentAttempt(attempt);
    setQuizView('result');
  };

  const handleBackToQuizzes = () => {
    setQuizView('library');
    setSelectedQuiz(null);
    setCurrentAttempt(null);
  };

  const handleRetryQuiz = () => {
    setQuizView('taking');
    setCurrentAttempt(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Learning Hub</h2>
        <p className="text-muted-foreground">Access learning materials and take quizzes to test your knowledge</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-6">
          {materialView === 'library' && (
            <LearningMaterialsLibrary
              materials={materials as LearningMaterial[]}
              progress={progress}
              onSelectMaterial={handleSelectMaterial}
              isLoading={isLoading}
            />
          )}
          {materialView === 'viewer' && selectedMaterial && (
            <MaterialViewer
              material={selectedMaterial}
              progress={progress.find(p => p.material_id === selectedMaterial.id)}
              learnerId={learnerId}
              onBack={handleBackToLibrary}
            />
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          {quizView === 'library' && (
            <QuizzesLibrary
              quizzes={quizzes as Quiz[]}
              attempts={attempts}
              onSelectQuiz={handleSelectQuiz}
              onViewResult={handleViewResult}
              isLoading={isLoading}
            />
          )}
          {quizView === 'taking' && selectedQuiz && (
            <QuizTaker
              quiz={selectedQuiz}
              learnerId={learnerId}
              onComplete={handleQuizComplete}
              onBack={handleBackToQuizzes}
            />
          )}
          {quizView === 'result' && selectedQuiz && currentAttempt && (
            <QuizResultCard
              quiz={selectedQuiz}
              attempt={currentAttempt}
              onBack={handleBackToQuizzes}
              onRetry={handleRetryQuiz}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
