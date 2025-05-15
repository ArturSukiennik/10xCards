import { TextInputSection } from "./TextInputSection";
import { FlashcardsList } from "./FlashcardsList";
import { TopBar } from "./TopBar";
import { useFlashcardGeneration } from "@/lib/hooks/useFlashcardGeneration";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import type { AuthUser } from "@/types";

interface GenerateViewProps {
  initialUser?: AuthUser;
}

export function GenerateView({ initialUser }: GenerateViewProps) {
  const {
    state,
    generateFlashcards,
    updateFlashcardStatus,
    saveAllFlashcards,
    saveAcceptedFlashcards,
  } = useFlashcardGeneration();

  const setUser = useAuthStore((state) => state.setUser);

  // Set initial user in auth store
  useEffect(() => {
    if (initialUser) {
      console.log("GenerateView: Setting initial user from props:", initialUser);
      setUser(initialUser);
    } else {
      console.log("GenerateView: No initial user provided via props");
    }

    // Set up event listeners for auth events (backup solution)
    const handleLogin = (event: CustomEvent<{ user: AuthUser }>) => {
      console.log("GenerateView: Received auth:login event", event.detail);
      setUser(event.detail.user);
    };

    const handleLogout = () => {
      console.log("GenerateView: Received auth:logout event");
      setUser(null);
    };

    window.addEventListener("auth:login", handleLogin as EventListener);
    window.addEventListener("auth:logout", handleLogout as EventListener);

    return () => {
      window.removeEventListener("auth:login", handleLogin as EventListener);
      window.removeEventListener("auth:logout", handleLogout as EventListener);
    };
  }, [initialUser, setUser]);

  const handleGenerateWithToast = async (params: { source_text: string; model: string }) => {
    try {
      await generateFlashcards(params);
      toast.success("Flashcards generated successfully!", {
        style: {
          backgroundColor: "#22c55e", // green-500
          color: "white",
          opacity: "1",
        },
      });
    } catch (error) {
      toast.error("Failed to generate flashcards", {
        style: {
          backgroundColor: "#ef4444", // red-500
          color: "white",
          opacity: "1",
        },
      });
      throw error;
    }
  };

  const handleSaveAllWithToast = async () => {
    try {
      await saveAllFlashcards();
      toast.success("All flashcards saved successfully!", {
        style: {
          backgroundColor: "#22c55e",
          color: "white",
          opacity: "1",
        },
      });
    } catch (error) {
      console.error("Failed to save all flashcards:", error);
      toast.error("Failed to save flashcards", {
        style: {
          backgroundColor: "#ef4444",
          color: "white",
          opacity: "1",
        },
      });
    }
  };

  const handleSaveAcceptedWithToast = async () => {
    try {
      await saveAcceptedFlashcards();
      toast.success("Accepted flashcards saved successfully!", {
        style: {
          backgroundColor: "#22c55e",
          color: "white",
          opacity: "1",
        },
      });
    } catch (error) {
      console.error("Failed to save accepted flashcards:", error);
      toast.error("Failed to save accepted flashcards", {
        style: {
          backgroundColor: "#ef4444",
          color: "white",
          opacity: "1",
        },
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <div className="container mx-auto py-8 space-y-8 flex-1">
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
            onSaveAll={handleSaveAllWithToast}
            onSaveAccepted={handleSaveAcceptedWithToast}
            isSaving={state.isSaving}
            onUpdateStatus={updateFlashcardStatus}
          />
        )}
      </div>
    </div>
  );
}
