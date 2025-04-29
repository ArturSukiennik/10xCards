import type { FlashcardProposalViewModel } from "@/lib/hooks/useFlashcardGeneration";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface FlashcardsListProps {
  flashcards: FlashcardProposalViewModel[];
  onSaveAll: () => Promise<void>;
  onSaveAccepted: () => Promise<void>;
  isSaving: boolean;
  onUpdateStatus: (id: string, status: "accepted" | "rejected") => void;
}

export function FlashcardsList({
  flashcards,
  onSaveAll,
  onSaveAccepted,
  isSaving,
  onUpdateStatus,
}: FlashcardsListProps) {
  const acceptedCount = flashcards.filter((f) => f.status === "accepted").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 data-test-id="flashcards-list-title" className="text-2xl font-semibold">
            Generated Flashcards
          </h2>
          <span data-test-id="flashcards-count" className="text-sm text-gray-500">
            ({flashcards.length} cards)
          </span>
        </div>
        <div className="flex gap-4">
          <Button
            data-test-id="save-all-button"
            variant="secondary"
            onClick={onSaveAll}
            disabled={isSaving || flashcards.length === 0}
            className="min-w-[100px]"
          >
            Save All
          </Button>
          <Button
            data-test-id="save-accepted-button"
            onClick={onSaveAccepted}
            disabled={isSaving || acceptedCount === 0}
            className="min-w-[140px] bg-green-600 hover:bg-green-700"
          >
            Save Accepted ({acceptedCount})
          </Button>
        </div>
      </div>

      <div
        data-test-id="flashcards-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {flashcards.map((flashcard) => (
          <div
            key={flashcard.id}
            data-test-id={`flashcard-item-${flashcard.id}`}
            className={`relative rounded-lg shadow-md hover:shadow-lg transition-shadow p-6
              ${flashcard.status === "accepted" ? "bg-green-50" : "bg-white"}
              ${flashcard.status === "rejected" ? "bg-white opacity-60" : ""}`}
          >
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                data-test-id={`reject-button-${flashcard.id}`}
                variant="secondary"
                size="sm"
                onClick={() => onUpdateStatus(flashcard.id, "rejected")}
                className="min-w-[32px] h-8 bg-red-500 hover:bg-red-600 p-0"
              >
                <X className="h-4 w-4 text-black" />
              </Button>
              <Button
                data-test-id={`accept-button-${flashcard.id}`}
                variant="secondary"
                size="sm"
                onClick={() => onUpdateStatus(flashcard.id, "accepted")}
                className="min-w-[32px] h-8 bg-green-500 hover:bg-green-600 p-0"
              >
                <Check className="h-4 w-4 text-black" />
              </Button>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Front</h3>
                <p className="text-gray-900 min-h-[60px]">{flashcard.front}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Back</h3>
                <p className="text-gray-900 min-h-[60px]">{flashcard.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
