import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Video, FileText, Link, BookOpen, Search, Clock, CheckCircle, Play } from 'lucide-react';
import { LearningMaterial } from '@/hooks/useLearningMaterials';
import { MaterialProgress } from '@/hooks/useLearnerContent';

const SUBJECTS = ['All', 'Mathematics', 'English', 'Science', 'Social Studies', 'Civic Education', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Government', 'Literature'];

const contentTypeIcons = {
  video: Video,
  document: FileText,
  article: BookOpen,
  external_link: Link,
};

const contentTypeColors = {
  video: 'bg-red-500/10 text-red-600',
  document: 'bg-blue-500/10 text-blue-600',
  article: 'bg-green-500/10 text-green-600',
  external_link: 'bg-purple-500/10 text-purple-600',
};

interface LearningMaterialsLibraryProps {
  materials: LearningMaterial[];
  progress: MaterialProgress[];
  onSelectMaterial: (material: LearningMaterial) => void;
  isLoading?: boolean;
}

export const LearningMaterialsLibrary = ({ 
  materials, 
  progress, 
  onSelectMaterial,
  isLoading 
}: LearningMaterialsLibraryProps) => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const getProgress = (materialId: string): MaterialProgress | undefined => {
    return progress.find(p => p.material_id === materialId);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(search.toLowerCase()) ||
      material.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || material.subject === subjectFilter;
    const matchesType = typeFilter === 'All' || material.content_type === typeFilter;
    return matchesSearch && matchesSubject && matchesType;
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
            placeholder="Search learning materials..."
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="external_link">Links</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No learning materials available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => {
            const Icon = contentTypeIcons[material.content_type];
            const colorClass = contentTypeColors[material.content_type];
            const materialProgress = getProgress(material.id);
            const isCompleted = materialProgress?.status === 'completed';
            const isInProgress = materialProgress?.status === 'in_progress';

            return (
              <Card 
                key={material.id} 
                className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => onSelectMaterial(material)}
              >
                <CardContent className="p-0">
                  {/* Content Type Header */}
                  <div className={`p-6 ${colorClass} flex items-center justify-center`}>
                    <Icon className="h-12 w-12" />
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Title and Description */}
                    <div>
                      <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {material.title}
                      </h3>
                      {material.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {material.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{material.subject}</Badge>
                      <Badge variant="secondary">{material.grade_level}</Badge>
                    </div>

                    {/* Progress */}
                    {materialProgress && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{materialProgress.progress_percent}%</span>
                        </div>
                        <Progress value={materialProgress.progress_percent} className="h-2" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      {isCompleted ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : isInProgress ? (
                        <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Start Learning
                        </Badge>
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
