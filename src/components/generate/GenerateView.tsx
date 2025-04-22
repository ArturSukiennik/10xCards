import { TextInputSection } from "./TextInputSection";
import { FlashcardsList } from "./FlashcardsList";
import { useFlashcardGeneration } from "@/lib/hooks/useFlashcardGeneration";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "sonner";

export function GenerateView() {
  const {
    state,
    generateFlashcards,
    updateFlashcardStatus,
    saveAllFlashcards,
    saveAcceptedFlashcards,
  } = useFlashcardGeneration();

  const handleGenerateWithToast = async (params: { source_text: string; model: string }) => {
    try {
      await generateFlashcards(params);
      toast.success("Flashcards generated successfully!");
    } catch (error) {
      toast.error("Failed to generate flashcards");
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Generate Flashcards</h1>

      {state.errors && (
        <ErrorAlert
          error={state.errors}
          onRetry={
            state.errors.isRetryable
              ? () =>
                  handleGenerateWithToast({
                    source_text: state.sourceText,
                    model: state.selectedModel,
                  })
              : undefined
          }
        />
      )}

      <TextInputSection onGenerate={handleGenerateWithToast} isGenerating={state.isGenerating} />

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
