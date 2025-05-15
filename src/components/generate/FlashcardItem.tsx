import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2, RotateCcw } from "lucide-react";
import type { FlashcardProposalViewModel } from "@/lib/hooks/useFlashcardGeneration";

interface FlashcardItemProps {
  flashcard: FlashcardProposalViewModel;
  onUpdate: (id: string, updates: { front: string; back: string }) => void;
  onStatusChange: (id: string, status: "accepted" | "rejected") => void;
}

export function FlashcardItem({ flashcard, onUpdate, onStatusChange }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const frontId = `front-${flashcard.id}`;
  const backId = `back-${flashcard.id}`;

  const handleSave = () => {
    onUpdate(flashcard.id, { front, back });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFront(flashcard.front);
    setBack(flashcard.back);
    setIsEditing(false);
  };

  const handleAccept = () => {
    onStatusChange(flashcard.id, "accepted");
  };

  const handleReject = () => {
    onStatusChange(flashcard.id, "rejected");
  };

  const handleReset = () => {
    setFront(flashcard.originalContent.front);
    setBack(flashcard.originalContent.back);
    onUpdate(flashcard.id, {
      front: flashcard.originalContent.front,
      back: flashcard.originalContent.back,
    });
  };

  return (
    <Card className={flashcard.status === "rejected" ? "opacity-60" : undefined}>
      <CardContent className="pt-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor={frontId} className="text-sm font-medium">
                Front:
              </label>
              <Textarea
                id={frontId}
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="mt-1"
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor={backId} className="text-sm font-medium">
                Back:
              </label>
              <Textarea
                id={backId}
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="mt-1"
                maxLength={600}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Front:</div>
              <div className="mt-1">{flashcard.front}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Back:</div>
              <div className="mt-1">{flashcard.back}</div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm" variant="primary">
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="secondary">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleAccept}
                size="sm"
                variant={flashcard.status === "accepted" ? "primary" : "secondary"}
                className="w-24"
                data-test-id={`flashcard-${flashcard.id}-accept`}
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </Button>
              <Button
                onClick={handleReject}
                size="sm"
                variant={flashcard.status === "rejected" ? "primary" : "secondary"}
                className="w-24"
                data-test-id={`flashcard-${flashcard.id}-reject`}
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)} size="sm" variant="text" className="w-24">
                <Edit2 className="mr-1 h-4 w-4" />
                Edit
              </Button>
              {flashcard.hasBeenEdited && (
                <Button onClick={handleReset} size="sm" variant="text" className="w-24">
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
