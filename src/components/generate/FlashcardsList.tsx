import type { FlashcardProposalViewModel } from "@/lib/hooks/useFlashcardGeneration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Generated Flashcards</h2>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={onSaveAll}
            disabled={isSaving || flashcards.length === 0}
          >
            Save All
          </Button>
          <Button onClick={onSaveAccepted} disabled={isSaving || acceptedCount === 0}>
            Save Accepted ({acceptedCount})
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <Card key={flashcard.id}>
            <CardHeader>
              <CardTitle>Flashcard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Front</h3>
                <p>{flashcard.front}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Back</h3>
                <p>{flashcard.back}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant={flashcard.status === "rejected" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(flashcard.id, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant={flashcard.status === "accepted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(flashcard.id, "accepted")}
                >
                  Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
