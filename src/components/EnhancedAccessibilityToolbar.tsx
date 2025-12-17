import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Type, Contrast, Ear, Accessibility, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccessibilityLogger } from "@/hooks/useAccessibilityLogger";

// Use browser's native speech synthesis voices
const getAvailableVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return [];
  
  // Filter to get good quality voices, preferring English
  return voices.filter(v => v.lang.startsWith('en')).slice(0, 7);
};

export const EnhancedAccessibilityToolbar = () => {
  const [fontSize, setFontSize] = useState([100]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const { logAccessibilityFeature } = useAccessibilityLogger();

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      const voices = getAvailableVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_font_size');
    const savedVoiceIndex = localStorage.getItem('accessibility_voice_index');
    const savedContrast = localStorage.getItem('accessibility_high_contrast');

    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize([size]);
      document.documentElement.style.fontSize = `${size}%`;
    }
    if (savedVoiceIndex) {
      setSelectedVoiceIndex(parseInt(savedVoiceIndex));
    }
    if (savedContrast === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
    
    const savedDarkMode = localStorage.getItem('accessibility_dark_mode');
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value[0]}%`;
    localStorage.setItem('accessibility_font_size', value[0].toString());
    logAccessibilityFeature('font_size', value[0].toString());
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    
    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      // Don't show error for cancellation (user clicked stop)
      if (event.error === 'canceled' || event.error === 'interrupted') {
        return;
      }
      toast({
        title: "Error",
        description: "Failed to read the text.",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
    const textToRead = mainContent.slice(0, 3000); // Limit chars

    toast({
      title: "Reading page",
      description: "Click the button again to stop.",
    });

    speakText(textToRead);
    logAccessibilityFeature('tts', 'native_speech');
  };

  const handleReadSelection = () => {
    const selection = window.getSelection()?.toString();
    if (!selection) {
      toast({
        title: "No text selected",
        description: "Please select some text to read.",
      });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    speakText(selection);
    logAccessibilityFeature('read_selection', 'native_speech');
  };

  const toggleHighContrast = () => {
    const isEnabled = document.documentElement.classList.toggle('high-contrast');
    localStorage.setItem('accessibility_high_contrast', isEnabled.toString());
    logAccessibilityFeature('high_contrast', isEnabled.toString());
    toast({
      title: isEnabled ? "High contrast enabled" : "High contrast disabled",
    });
  };

  const toggleDarkMode = () => {
    const isEnabled = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isEnabled);
    localStorage.setItem('accessibility_dark_mode', isEnabled.toString());
    logAccessibilityFeature('dark_mode', isEnabled.toString());
    toast({
      title: isEnabled ? "Dark mode enabled" : "Dark mode disabled",
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

              {availableVoices.length > 0 && (
                <div>
                  <Label htmlFor="voice-select" className="text-sm font-medium mb-2 block">
                    Voice Selection
                  </Label>
                  <Select 
                    value={selectedVoiceIndex.toString()} 
                    onValueChange={(value) => {
                      const index = parseInt(value);
                      setSelectedVoiceIndex(index);
                      localStorage.setItem('accessibility_voice_index', value);
                    }}
                  >
                    <SelectTrigger id="voice-select" aria-label="Select voice for text-to-speech" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {availableVoices.map((voice, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button
                variant={isSpeaking ? "destructive" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={handleTextToSpeech}
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

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 mr-2" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
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