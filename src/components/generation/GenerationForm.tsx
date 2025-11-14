import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface GenerationFormProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

export const GenerationForm: React.FC<GenerationFormProps> = ({
  sourceText,
  onSourceTextChange,
  onGenerate,
  isGenerating,
}) => {
  const isTextValid = sourceText.length >= MIN_LENGTH && sourceText.length <= MAX_LENGTH;
  const isButtonDisabled = !isTextValid || isGenerating;

  return (
    <div className="space-y-4">
      <Textarea
        value={sourceText}
        onChange={(e) => onSourceTextChange(e.target.value)}
        placeholder="Wklej tekst źródłowy (od 1000 do 10 000 znaków)..."
        maxLength={MAX_LENGTH}
        className="min-h-[200px]"
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Liczba znaków: {sourceText.length} / {MAX_LENGTH}
        </p>
        <Button onClick={onGenerate} disabled={isButtonDisabled}>
          {isGenerating ? "Generowanie..." : "Generuj"}
        </Button>
      </div>
    </div>
  );
};
