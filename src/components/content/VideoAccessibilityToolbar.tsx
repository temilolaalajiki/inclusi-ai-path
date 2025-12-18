import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Captions, 
  CaptionsOff, 
  Accessibility,
  ChevronDown,
  ChevronUp,
  Loader2,
  Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Caption {
  text: string;
  start: number;
  end: number;
}

interface VideoAccessibilityToolbarProps {
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  onCaptionChange?: (caption: string) => void;
}

export const VideoAccessibilityToolbar = ({ 
  videoUrl, 
  videoRef,
  onCaptionChange 
}: VideoAccessibilityToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentCaption, setCurrentCaption] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasTranscribed, setHasTranscribed] = useState(false);
  const [captionFontSize, setCaptionFontSize] = useState([100]);
  const { toast } = useToast();

  // Load cached captions from localStorage
  useEffect(() => {
    const cacheKey = `video_captions_${videoUrl}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCaptions(parsed);
        setHasTranscribed(true);
      } catch (e) {
        console.error('Failed to parse cached captions');
      }
    }
  }, [videoUrl]);

  // Update current caption based on video time
  useEffect(() => {
    if (!captionsEnabled || captions.length === 0 || !videoRef.current) return;

    const video = videoRef.current;
    
    const updateCaption = () => {
      const currentTime = video.currentTime;
      
      // Find words that should be displayed at current time
      // Group nearby words into phrases
      const visibleWords = captions.filter(
        caption => currentTime >= caption.start && currentTime <= caption.end + 0.5
      );
      
      // Show last few words for context
      const recentWords = captions.filter(
        caption => currentTime >= caption.start && currentTime <= caption.start + 3
      );
      
      const displayWords = recentWords.length > 0 ? recentWords : visibleWords;
      const captionText = displayWords.map(w => w.text).join(' ').trim();
      
      setCurrentCaption(captionText);
      onCaptionChange?.(captionText);
    };

    video.addEventListener('timeupdate', updateCaption);
    return () => video.removeEventListener('timeupdate', updateCaption);
  }, [captionsEnabled, captions, videoRef, onCaptionChange]);

  const handleTranscribe = async () => {
    if (!videoUrl) {
      toast({
        title: "No video",
        description: "No video URL available for transcription.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    
    try {
      toast({
        title: "Generating captions",
        description: "This may take a moment...",
      });

      const { data, error } = await supabase.functions.invoke('transcribe-video', {
        body: { videoUrl },
      });

      if (error) throw error;

      if (data.captions && data.captions.length > 0) {
        setCaptions(data.captions);
        setHasTranscribed(true);
        setCaptionsEnabled(true);
        
        // Cache captions
        const cacheKey = `video_captions_${videoUrl}`;
        localStorage.setItem(cacheKey, JSON.stringify(data.captions));

        toast({
          title: "Captions ready",
          description: "Video captions have been generated.",
        });
      } else {
        toast({
          title: "No speech detected",
          description: "No speech was found in this video.",
        });
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: error.message || "Failed to generate captions.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleCaptions = () => {
    if (!hasTranscribed && !captionsEnabled) {
      handleTranscribe();
    } else {
      setCaptionsEnabled(!captionsEnabled);
      if (!captionsEnabled === false) {
        setCurrentCaption('');
        onCaptionChange?.('');
      }
    }
  };

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          Video Accessibility
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-2 p-4 space-y-4">
          {/* Captions Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Captions className="h-4 w-4" />
              Captions & Subtitles
            </h4>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-2">
                {captionsEnabled ? (
                  <Captions className="h-3 w-3" />
                ) : (
                  <CaptionsOff className="h-3 w-3" />
                )}
                {hasTranscribed ? 'Show Captions' : 'Generate Captions'}
              </Label>
              
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Switch
                  checked={captionsEnabled}
                  onCheckedChange={toggleCaptions}
                />
              )}
            </div>

            {!hasTranscribed && (
              <p className="text-xs text-muted-foreground">
                Click to auto-generate captions using AI speech recognition.
              </p>
            )}

            {hasTranscribed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="w-full text-xs"
              >
                {isTranscribing ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : null}
                Regenerate Captions
              </Button>
            )}
          </div>

          {/* Caption Display Settings */}
          {hasTranscribed && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Type className="h-4 w-4" />
                Caption Settings
              </h4>

              <div className="space-y-2">
                <Label className="text-xs">Caption Size: {captionFontSize[0]}%</Label>
                <Slider
                  value={captionFontSize}
                  onValueChange={setCaptionFontSize}
                  min={80}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </Card>
      )}

    </div>
  );
};
