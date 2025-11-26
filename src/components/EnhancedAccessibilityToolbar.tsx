import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Type, Contrast, Ear, Accessibility } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAccessibilityLogger } from "@/hooks/useAccessibilityLogger";

const VOICES = [
  { id: 'Aria', name: 'Aria (Female)' },
  { id: 'Roger', name: 'Roger (Male)' },
  { id: 'Sarah', name: 'Sarah (Female)' },
  { id: 'Laura', name: 'Laura (Female)' },
  { id: 'Charlie', name: 'Charlie (Male)' },
  { id: 'George', name: 'George (Male)' },
  { id: 'Liam', name: 'Liam (Male)' },
];

export const EnhancedAccessibilityToolbar = () => {
  const [fontSize, setFontSize] = useState([100]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Aria');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const { logAccessibilityFeature } = useAccessibilityLogger();

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_font_size');
    const savedVoice = localStorage.getItem('accessibility_voice');
    const savedContrast = localStorage.getItem('accessibility_high_contrast');

    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize([size]);
      document.documentElement.style.fontSize = `${size}%`;
    }
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
    if (savedContrast === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value[0]}%`;
    localStorage.setItem('accessibility_font_size', value[0].toString());
    logAccessibilityFeature('font_size', value[0].toString());
  };

  const handleTextToSpeech = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
      const textToRead = mainContent.slice(0, 1000); // Limit to 1000 chars for performance

      toast({
        title: "Generating speech...",
        description: "Please wait while we process your request.",
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: textToRead, voice: selectedVoice }
      });

      if (error) throw error;

      // Play the audio
      const audioBlob = await fetch(`data:audio/mp3;base64,${data.audioContent}`).then(r => r.blob());
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: "Playback error",
          description: "Failed to play the audio.",
          variant: "destructive",
        });
      };

      await audio.play();
      logAccessibilityFeature('tts', selectedVoice);

      toast({
        title: "Reading page",
        description: "Click the button again to stop.",
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReadSelection = async () => {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      toast({
        title: "No text selected",
        description: "Please select some text to read.",
      });
      return;
    }

    try {
      setIsSpeaking(true);
      toast({
        title: "Generating speech...",
        description: "Please wait while we process your selection.",
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: selection, voice: selectedVoice }
      });

      if (error) throw error;

      const audioBlob = await fetch(`data:audio/mp3;base64,${data.audioContent}`).then(r => r.blob());
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      logAccessibilityFeature('read_selection', selectedVoice);
    } catch (error) {
      console.error('Read selection error:', error);
      setIsSpeaking(false);
      toast({
        title: "Error",
        description: "Failed to read selection.",
        variant: "destructive",
      });
    }
  };

  const toggleHighContrast = () => {
    const isEnabled = document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('accessibility_high_contrast', isEnabled.toString());
    logAccessibilityFeature('high_contrast', isEnabled.toString());
    toast({
      title: isEnabled ? "High contrast enabled" : "High contrast disabled",
    });
  };

  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        onFocus={() => logAccessibilityFeature('keyboard_nav', 'skip_link')}
      >
        Skip to main content
      </a>

      <div className="fixed bottom-4 right-4 z-50">
        {isOpen && (
          <Card className="mb-2 p-4 w-72 shadow-xl">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4" aria-hidden="true" />
                  <Label htmlFor="font-size-slider" className="text-sm font-medium">
                    Font Size
                  </Label>
                </div>
                <Slider
                  id="font-size-slider"
                  value={fontSize}
                  onValueChange={handleFontSizeChange}
                  min={80}
                  max={150}
                  step={10}
                  className="w-full"
                  aria-label="Adjust font size"
                />
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  {fontSize}%
                </span>
              </div>

              <div>
                <Label htmlFor="voice-select" className="text-sm font-medium mb-2 block">
                  Voice Selection
                </Label>
                <Select 
                  value={selectedVoice} 
                  onValueChange={(value) => {
                    setSelectedVoice(value);
                    localStorage.setItem('accessibility_voice', value);
                  }}
                >
                  <SelectTrigger id="voice-select" aria-label="Select voice for text-to-speech">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleTextToSpeech}
                disabled={isSpeaking}
                aria-label={isSpeaking ? "Stop reading page" : "Read page aloud"}
              >
                <Volume2 className="h-4 w-4 mr-2" aria-hidden="true" />
                {isSpeaking ? 'Stop Reading' : 'Read Page Aloud'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleReadSelection}
                aria-label="Read selected text aloud"
              >
                <Ear className="h-4 w-4 mr-2" aria-hidden="true" />
                Read Selection
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={toggleHighContrast}
                aria-label="Toggle high contrast mode"
              >
                <Contrast className="h-4 w-4 mr-2" aria-hidden="true" />
                High Contrast
              </Button>
            </div>
          </Card>
        )}
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full shadow-xl"
          aria-label={isOpen ? "Close accessibility toolbar" : "Open accessibility toolbar"}
          aria-expanded={isOpen}
        >
          <Accessibility className="h-5 w-5 mr-2" aria-hidden="true" />
          Accessibility
        </Button>
      </div>
    </>
  );
};