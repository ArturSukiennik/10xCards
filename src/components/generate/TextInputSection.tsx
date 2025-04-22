import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ValidationError } from "@/components/ui/validation-error";
import type { GenerateFlashcardsCommand } from "@/types";

interface TextInputSectionProps {
  onGenerate: (command: GenerateFlashcardsCommand) => Promise<void>;
  isGenerating: boolean;
}

const MIN_TEXT_LENGTH = 1000;
const MAX_TEXT_LENGTH = 10000;

const AI_MODELS = [
  { id: "gpt-4", label: "GPT-4 (Best Quality)" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Faster)" },
] as const;

export function TextInputSection({ onGenerate, isGenerating }: TextInputSectionProps) {
  const [sourceText, setSourceText] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const textLength = sourceText.length;
  const isTextValid = textLength >= MIN_TEXT_LENGTH && textLength <= MAX_TEXT_LENGTH;

  const validateText = () => {
    const errors: string[] = [];

    if (textLength < MIN_TEXT_LENGTH) {
      errors.push(`Text must be at least ${MIN_TEXT_LENGTH} characters long`);
    }
    if (textLength > MAX_TEXT_LENGTH) {
      errors.push(`Text must not exceed ${MAX_TEXT_LENGTH} characters`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGenerate = async () => {
    if (!validateText()) return;

    const command: GenerateFlashcardsCommand = {
      source_text: sourceText,
      model: selectedModel,
    };

    try {
      await onGenerate(command);
      // Clear validation errors on successful generation
      setValidationErrors([]);
    } catch {
      // Error handling is done by the parent component
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Enter Your Text</h2>
        <span className={`text-sm ${isTextValid ? "text-green-600" : "text-red-600"}`}>
          {textLength}/{MAX_TEXT_LENGTH} characters
        </span>
      </div>

      <Textarea
        value={sourceText}
        onChange={(e) => setSourceText(e.target.value)}
        placeholder="Paste your text here (minimum 1000 characters)"
        className="min-h-[200px]"
      />

      {validationErrors.length > 0 && <ValidationError errors={validationErrors} />}

      <div className="flex gap-4 items-center">
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleGenerate}
          disabled={!isTextValid || isGenerating}
          className="ml-auto"
        >
          {isGenerating ? "Generating..." : "Generate Flashcards"}
        </Button>
      </div>
    </div>
  );
}
