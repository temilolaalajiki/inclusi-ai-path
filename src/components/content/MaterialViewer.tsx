import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, FileText, Link, BookOpen, ExternalLink, CheckCircle, Download } from 'lucide-react';
import { LearningMaterial } from '@/hooks/useLearningMaterials';
import { MaterialProgress, useLearnerContent } from '@/hooks/useLearnerContent';
import { DocumentAccessibilityToolbar } from './DocumentAccessibilityToolbar';
import { VideoAccessibilityToolbar } from './VideoAccessibilityToolbar';

const contentTypeIcons = {
  video: Video,
  document: FileText,
  article: BookOpen,
  external_link: Link,
};

interface MaterialViewerProps {
  material: LearningMaterial;
  progress?: MaterialProgress;
  learnerId: string;
  onBack: () => void;
}

export const MaterialViewer = ({ material, progress, learnerId, onBack }: MaterialViewerProps) => {
  const { updateProgress } = useLearnerContent(learnerId);
  const Icon = contentTypeIcons[material.content_type];
  const documentContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentCaption, setCurrentCaption] = useState('');
  const showAccessibilityOptions = material.content_type === 'document' || material.content_type === 'article';


  // Mark as in progress when viewing
  useEffect(() => {
    if (!progress || progress.status === 'not_started') {
      updateProgress.mutate({
        materialId: material.id,
        status: 'in_progress',
        progressPercent: 10,
      });
    }
  }, [material.id]);

  const handleMarkComplete = () => {
    updateProgress.mutate({
      materialId: material.id,
      status: 'completed',
      progressPercent: 100,
    });
  };

  const isCompleted = progress?.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{material.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{material.subject}</Badge>
                <Badge variant="secondary">{material.grade_level}</Badge>
                <Badge variant="outline" className="capitalize">
                  {material.content_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          {material.description && (
            <p className="text-muted-foreground">{material.description}</p>
          )}
        </div>
        {!isCompleted && (
          <Button onClick={handleMarkComplete}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
        )}
        {isCompleted && (
          <Badge className="bg-green-500/10 text-green-600 px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </Badge>
        )}
      </div>

      {/* Accessibility Options for Document/Article */}
      {showAccessibilityOptions && (
        <DocumentAccessibilityToolbar 
          contentRef={documentContentRef}
          contentText={material.content_text || undefined}
        />
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {/* Video Content */}
          {material.content_type === 'video' && material.file_url && (
            <div className="space-y-4">
              <VideoAccessibilityToolbar 
                videoUrl={material.file_url}
                videoRef={videoRef}
                onCaptionChange={setCurrentCaption}
              />
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={material.file_url}
                  controls
                  className="w-full h-full"
                  onEnded={handleMarkComplete}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Caption Overlay */}
                {currentCaption && (
                  <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-10">
                    <div className="bg-black/80 text-white px-4 py-2 rounded-lg max-w-[80%] text-center">
                      {currentCaption}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Document Content */}
          {material.content_type === 'document' && material.file_url && (
            <div ref={documentContentRef} className="space-y-4">
              {material.file_url.endsWith('.pdf') ? (
                <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={`${material.file_url}#toolbar=1`}
                    className="w-full h-full"
                    title={material.title}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    This document cannot be previewed in the browser.
                  </p>
                  <Button asChild>
                    <a href={material.file_url} download target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download Document
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Article Content */}
          {material.content_type === 'article' && material.content_text && (
            <div ref={documentContentRef} className="prose prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{material.content_text}</div>
            </div>
          )}

          {/* External Link Content */}
          {material.content_type === 'external_link' && material.external_url && (
            <div className="text-center py-12">
              <Link className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                This material is hosted on an external website.
              </p>
              <Button asChild>
                <a href={material.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open External Resource
                </a>
              </Button>
            </div>
          )}

          {/* No Content Available */}
          {!material.file_url && !material.content_text && !material.external_url && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No content available for this material.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
