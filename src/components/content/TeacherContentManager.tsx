import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileQuestion } from 'lucide-react';
import { LearningMaterialForm } from './LearningMaterialForm';
import { LearningMaterialsList } from './LearningMaterialsList';
import { QuizBuilder } from './QuizBuilder';
import { QuizzesList } from './QuizzesList';
import { LearningMaterial } from '@/hooks/useLearningMaterials';
import { Quiz } from '@/hooks/useQuizzes';

type ViewMode = 'list' | 'create' | 'edit';

interface TeacherContentManagerProps {
  teacherId: string;
}

export const TeacherContentManager = ({ teacherId }: TeacherContentManagerProps) => {
  const [activeTab, setActiveTab] = useState('materials');
  const [materialView, setMaterialView] = useState<ViewMode>('list');
  const [quizView, setQuizView] = useState<ViewMode>('list');
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | undefined>();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>();

  const handleEditMaterial = (material: LearningMaterial) => {
    setEditingMaterial(material);
    setMaterialView('edit');
  };

  const handleCreateMaterial = () => {
    setEditingMaterial(undefined);
    setMaterialView('create');
  };

  const handleMaterialSuccess = () => {
    setMaterialView('list');
    setEditingMaterial(undefined);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizView('edit');
  };

  const handleCreateQuiz = () => {
    setEditingQuiz(undefined);
    setQuizView('create');
  };

  const handleQuizSuccess = () => {
    setQuizView('list');
    setEditingQuiz(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Management</h2>
        <p className="text-muted-foreground">Create and manage learning materials and quizzes for your students</p>
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
          {materialView === 'list' && (
            <LearningMaterialsList
              teacherId={teacherId}
              onEdit={handleEditMaterial}
              onCreate={handleCreateMaterial}
            />
          )}
          {(materialView === 'create' || materialView === 'edit') && (
            <LearningMaterialForm
              teacherId={teacherId}
              material={editingMaterial}
              onSuccess={handleMaterialSuccess}
              onCancel={() => setMaterialView('list')}
            />
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          {quizView === 'list' && (
            <QuizzesList
              teacherId={teacherId}
              onEdit={handleEditQuiz}
              onCreate={handleCreateQuiz}
            />
          )}
          {(quizView === 'create' || quizView === 'edit') && (
            <QuizBuilder
              teacherId={teacherId}
              quiz={editingQuiz}
              onSuccess={handleQuizSuccess}
              onCancel={() => setQuizView('list')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
