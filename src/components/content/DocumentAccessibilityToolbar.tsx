import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Volume2, 
  VolumeX, 
  Type, 
  Contrast, 
  ALargeSmall,
  SeparatorHorizontal,
  Accessibility,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAccessibilityLogger } from '@/hooks/useAccessibilityLogger';

interface DocumentAccessibilityToolbarProps {
  contentRef: React.RefObject<HTMLDivElement>;
  contentText?: string;
}

const getAvailableVoices = () => {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return [];
  return voices.filter(v => v.lang.startsWith('en')).slice(0, 7);
};

export const DocumentAccessibilityToolbar = ({ contentRef, contentText }: DocumentAccessibilityToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState([100]);
  const [lineSpacing, setLineSpacing] = useState([1.5]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [speechRate, setSpeechRate] = useState([1]);
  const { toast } = useToast();
  const { logAccessibilityFeature } = useAccessibilityLogger();

  // Load voices
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
    const savedFontSize = localStorage.getItem('doc_accessibility_font_size');
    const savedLineSpacing = localStorage.getItem('doc_accessibility_line_spacing');
    const savedHighContrast = localStorage.getItem('doc_accessibility_high_contrast');
    const savedDyslexiaFont = localStorage.getItem('doc_accessibility_dyslexia_font');
    const savedSpeechRate = localStorage.getItem('doc_accessibility_speech_rate');

    if (savedFontSize) setFontSize([parseInt(savedFontSize)]);
    if (savedLineSpacing) setLineSpacing([parseFloat(savedLineSpacing)]);
    if (savedHighContrast === 'true') setHighContrast(true);
    if (savedDyslexiaFont === 'true') setDyslexiaFont(true);
    if (savedSpeechRate) setSpeechRate([parseFloat(savedSpeechRate)]);
  }, []);

  // Apply styles to content
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${fontSize[0]}%`;
      contentRef.current.style.lineHeight = `${lineSpacing[0]}`;
      
      if (highContrast) {
        contentRef.current.classList.add('high-contrast-doc');
      } else {
        contentRef.current.classList.remove('high-contrast-doc');
      }

      if (dyslexiaFont) {
        contentRef.current.style.fontFamily = 'OpenDyslexic, Comic Sans MS, Arial, sans-serif';
        contentRef.current.style.letterSpacing = '0.05em';
        contentRef.current.style.wordSpacing = '0.1em';
      } else {
        contentRef.current.style.fontFamily = '';
        contentRef.current.style.letterSpacing = '';
        contentRef.current.style.wordSpacing = '';
      }
    }
  }, [fontSize, lineSpacing, highContrast, dyslexiaFont, contentRef]);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    localStorage.setItem('doc_accessibility_font_size', value[0].toString());
    logAccessibilityFeature('doc_font_size', value[0].toString());
  };

  const handleLineSpacingChange = (value: number[]) => {
    setLineSpacing(value);
    localStorage.setItem('doc_accessibility_line_spacing', value[0].toString());
    logAccessibilityFeature('doc_line_spacing', value[0].toString());
  };

  const handleHighContrastToggle = (enabled: boolean) => {
    setHighContrast(enabled);
    localStorage.setItem('doc_accessibility_high_contrast', enabled.toString());
    logAccessibilityFeature('doc_high_contrast', enabled.toString());
  };

  const handleDyslexiaFontToggle = (enabled: boolean) => {
    setDyslexiaFont(enabled);
    localStorage.setItem('doc_accessibility_dyslexia_font', enabled.toString());
    logAccessibilityFeature('doc_dyslexia_font', enabled.toString());
  };

  const handleSpeechRateChange = (value: number[]) => {
    setSpeechRate(value);
    localStorage.setItem('doc_accessibility_speech_rate', value[0].toString());
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
    
    utterance.rate = speechRate[0];
    utterance.pitch = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      if (event.error === 'canceled' || event.error === 'interrupted') return;
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

    // Try to get text from content or use provided contentText
    let textToRead = contentText || '';
    
    if (!textToRead && contentRef.current) {
      textToRead = contentRef.current.innerText || '';
    }

    if (!textToRead) {
      toast({
        title: "No text available",
        description: "There is no text content to read.",
      });
      return;
    }

    // Limit to avoid very long reads
    textToRead = textToRead.slice(0, 5000);

    toast({
      title: "Reading document",
      description: "Click the button again to stop.",
    });

    speakText(textToRead);
    logAccessibilityFeature('doc_tts', 'started');
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
    logAccessibilityFeature('doc_read_selection', 'native_speech');
  };

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
        aria-expanded={isOpen}
        aria-label="Toggle accessibility options"
      >
        <span className="flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          Accessibility Options
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <Card className="mt-2 p-4 space-y-4">
          {/* Text-to-Speech Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Text-to-Speech
            </h4>
            
            <div className="flex gap-2">
              <Button
                variant={isSpeaking ? "destructive" : "secondary"}
                size="sm"
                onClick={handleTextToSpeech}
                className="flex-1"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Read Document
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReadSelection}
                className="flex-1"
              >
                Read Selection
              </Button>
            </div>

            {availableVoices.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Voice</Label>
                <Select 
                  value={selectedVoiceIndex.toString()} 
                  onValueChange={(value) => setSelectedVoiceIndex(parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs">Speech Speed: {speechRate[0]}x</Label>
              <Slider
                value={speechRate}
                onValueChange={handleSpeechRateChange}
                min={0.5}
                max={2}
                step={0.25}
                className="w-full"
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text Display
            </h4>

            {/* Font Size */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <ALargeSmall className="h-3 w-3" />
                Font Size: {fontSize[0]}%
              </Label>
              <Slider
                value={fontSize}
                onValueChange={handleFontSizeChange}
                min={80}
                max={200}
                step={10}
                className="w-full"
              />
            </div>

            {/* Line Spacing */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <SeparatorHorizontal className="h-3 w-3" />
                Line Spacing: {lineSpacing[0]}
              </Label>
              <Slider
                value={lineSpacing}
                onValueChange={handleLineSpacingChange}
                min={1}
                max={3}
                step={0.25}
                className="w-full"
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              Visual Aids
            </h4>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">High Contrast Mode</Label>
              <Switch
                checked={highContrast}
                onCheckedChange={handleHighContrastToggle}
              />
            </div>

            {/* Dyslexia-friendly Font */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Dyslexia-Friendly Font</Label>
              <Switch
                checked={dyslexiaFont}
                onCheckedChange={handleDyslexiaFontToggle}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
