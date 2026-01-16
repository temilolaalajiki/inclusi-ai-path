import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Volume2, Type, Contrast, Languages, Accessibility } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const AccessibilityToolbar = () => {
  const [fontSize, setFontSize] = useState([100]);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value[0]}%`;
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      const text = document.body.innerText;
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 200));
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleHighContrast = () => {
    document.documentElement.classList.toggle('high-contrast');
  };

  return (
    <div className={`fixed z-50 ${isMobile ? 'bottom-20 right-3' : 'bottom-4 right-4'} safe-area-bottom`}>
      {isOpen && (
        <Card className={`mb-2 p-4 shadow-xl ${isMobile ? 'w-[calc(100vw-1.5rem)] max-w-xs' : 'w-64'}`}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-4 w-4" />
                <span className="text-sm font-medium">Font Size</span>
              </div>
              <Slider
                value={fontSize}
                onValueChange={handleFontSizeChange}
                min={80}
                max={150}
                step={10}
                className="w-full touch-target"
              />
              <span className="text-xs text-muted-foreground">{fontSize}%</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-11 touch-manipulation"
              onClick={handleTextToSpeech}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Read Aloud
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-11 touch-manipulation"
              onClick={toggleHighContrast}
            >
              <Contrast className="h-4 w-4 mr-2" />
              High Contrast
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start h-11 touch-manipulation"
            >
              <Languages className="h-4 w-4 mr-2" />
              Language
            </Button>
          </div>
        </Card>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size={isMobile ? "icon" : "lg"}
        className={`rounded-full shadow-xl touch-manipulation ${isMobile ? 'h-12 w-12' : ''}`}
        aria-label="Accessibility options"
      >
        {isMobile ? (
          <Accessibility className="h-5 w-5" />
        ) : (
          "Accessibility"
        )}
      </Button>
    </div>
  );
};
