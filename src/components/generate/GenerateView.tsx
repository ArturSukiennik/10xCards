import { TextInputSection } from "./TextInputSection";
import { FlashcardsList } from "src/components/generate/FlashcardsList";
import { useFlashcardGeneration } from "@/lib/hooks/useFlashcardGeneration";
import { ErrorAlert } from "@/components/ui/error-alert";

export function GenerateView() {
  const {
    state,
    generateFlashcards,
    updateFlashcardStatus,
    saveAllFlashcards,
    saveAcceptedFlashcards,
  } = useFlashcardGeneration();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Generate Flashcards</h1>

      {state.errors && (
        <ErrorAlert
          error={state.errors}
          onRetry={
            state.errors.isRetryable
              ? () =>
                  generateFlashcards({ source_text: state.sourceText, model: state.selectedModel })
              : undefined
          }
        />
      )}

      <TextInputSection onGenerate={generateFlashcards} isGenerating={state.isGenerating} />

      {state.flashcards.length > 0 && (
        <FlashcardsList
          flashcards={state.flashcards}
          onSaveAll={saveAllFlashcards}
          onSaveAccepted={saveAcceptedFlashcards}
          isSaving={state.isSaving}
          onUpdateStatus={updateFlashcardStatus}
        />
      )}
    </div>
  );
}
