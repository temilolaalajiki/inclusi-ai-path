import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Volume2, Type, Contrast, Languages } from "lucide-react";

export const AccessibilityToolbar = () => {
  const [fontSize, setFontSize] = useState([100]);
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="mb-2 p-4 w-64 shadow-xl">
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
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{fontSize}%</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleTextToSpeech}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Read Aloud
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={toggleHighContrast}
            >
              <Contrast className="h-4 w-4 mr-2" />
              High Contrast
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Languages className="h-4 w-4 mr-2" />
              Language
            </Button>
          </div>
        </Card>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="rounded-full shadow-xl"
      >
        Accessibility
      </Button>
    </div>
  );
};
