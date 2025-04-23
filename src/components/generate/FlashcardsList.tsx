import type { FlashcardProposalViewModel } from "@/lib/hooks/useFlashcardGeneration";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Source Text</h2>
          <span className="text-sm text-gray-500">({flashcards.length} flashcards)</span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={onSaveAll}
            disabled={isSaving || flashcards.length === 0}
            className="min-w-[100px]"
          >
            Save All
          </Button>
          <Button
            onClick={onSaveAccepted}
            disabled={isSaving || acceptedCount === 0}
            className="min-w-[140px]"
          >
            Save Accepted ({acceptedCount})
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {flashcards.map((flashcard) => (
          <div
            key={flashcard.id}
            className={`bg-white rounded-lg shadow p-6 ${
              flashcard.status === "rejected" ? "opacity-60" : ""
            }`}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Mock Question {flashcard.id}
                </h3>
                <p className="text-gray-900">{flashcard.front}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Mock Answer</h3>
                <p className="text-gray-900">{flashcard.back}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant={flashcard.status === "rejected" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onUpdateStatus(flashcard.id, "rejected")}
                  className="min-w-[80px]"
                >
                  Reject
                </Button>
                <Button
                  variant={flashcard.status === "accepted" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => onUpdateStatus(flashcard.id, "accepted")}
                  className="min-w-[80px]"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
