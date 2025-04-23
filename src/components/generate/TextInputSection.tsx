import { useState } from "react";
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

const AI_MODELS = [{ id: "openai/gpt-4-turbo", label: "GPT-4 Turbo" }] as const;

export function TextInputSection({ onGenerate, isGenerating }: TextInputSectionProps) {
  const [sourceText, setSourceText] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const textLength = sourceText.trim().length;
  const isTextValid = textLength >= MIN_TEXT_LENGTH && textLength <= MAX_TEXT_LENGTH;

  const validateText = () => {
    const errors: string[] = [];
    const trimmedLength = sourceText.trim().length;

    if (trimmedLength < MIN_TEXT_LENGTH) {
      errors.push(
        `Text must be at least ${MIN_TEXT_LENGTH} characters long (current: ${trimmedLength})`,
      );
    }
    if (trimmedLength > MAX_TEXT_LENGTH) {
      errors.push(`Text must not exceed ${MAX_TEXT_LENGTH} characters (current: ${trimmedLength})`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGenerate = async () => {
    if (!validateText()) return;

    const command: GenerateFlashcardsCommand = {
      source_text: sourceText.trim(),
      model: selectedModel,
    };

    try {
      await onGenerate(command);
      setValidationErrors([]);
    } catch {
      // Error handling is done by the parent component
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Generate Flashcards</h1>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold">Enter Your Text</h2>
          <span className={`text-sm ${isTextValid ? "text-green-600" : "text-red-600"}`}>
            {textLength}/{MAX_TEXT_LENGTH} characters
          </span>
        </div>

        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Paste your text here (minimum 100 characters)"
          className="min-h-[300px] w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />

        {validationErrors.length > 0 && <ValidationError errors={validationErrors} />}

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full sm:w-[250px]">
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
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
      </div>
    </div>
  );
}
