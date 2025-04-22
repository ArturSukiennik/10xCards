import { useState } from "react";
import { FlashcardSource } from "@/types";
import type {
  GenerateFlashcardsCommand,
  TemporaryFlashcardDto,
  GenerateFlashcardsResponseDto,
} from "@/types";

interface GenerateViewState {
  sourceText: string;
  selectedModel: string;
  isGenerating: boolean;
  isSaving: boolean;
  generationError: string | null;
  flashcards: FlashcardProposalViewModel[];
  generationId: number | null;
  errors: ErrorState | null;
}

export interface FlashcardProposalViewModel extends TemporaryFlashcardDto {
  status: "pending" | "accepted" | "rejected";
  isEditing: boolean;
  originalContent: {
    front: string;
    back: string;
  };
  hasBeenEdited: boolean;
}

interface ErrorState {
  type: "validation" | "api" | "network" | "unknown";
  message: string;
  details?: { field: string; message: string }[];
  isRetryable: boolean;
}

const initialState: GenerateViewState = {
  sourceText: "",
  selectedModel: "gpt-4",
  isGenerating: false,
  isSaving: false,
  generationError: null,
  flashcards: [],
  generationId: null,
  errors: null,
};

export function useFlashcardGeneration() {
  const [state, setState] = useState<GenerateViewState>(initialState);

  const generateFlashcards = async (command: GenerateFlashcardsCommand) => {
    setState((prev) => ({ ...prev, isGenerating: true, errors: null }));

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data: GenerateFlashcardsResponseDto = await response.json();

      const flashcardProposals: FlashcardProposalViewModel[] = data.generated_flashcards.map(
        (card) => ({
          ...card,
          status: "pending",
          isEditing: false,
          originalContent: {
            front: card.front,
            back: card.back,
          },
          hasBeenEdited: false,
        }),
      );

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        flashcards: flashcardProposals,
        generationId: data.generation_id,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        errors: {
          type: "api",
          message: error instanceof Error ? error.message : "An unknown error occurred",
          isRetryable: true,
        },
      }));
    }
  };

  const updateFlashcard = (id: string, updates: Partial<TemporaryFlashcardDto>) => {
    setState((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((card) =>
        card.id === id
          ? {
              ...card,
              ...updates,
              hasBeenEdited: true,
              isEditing: false,
            }
          : card,
      ),
    }));
  };

  const updateFlashcardStatus = (id: string, status: "accepted" | "rejected") => {
    setState((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((card) => (card.id === id ? { ...card, status } : card)),
    }));
  };

  const determineFlashcardSource = (proposal: FlashcardProposalViewModel): FlashcardSource => {
    if (proposal.status !== "accepted") {
      throw new Error("Cannot determine source for non-accepted flashcard");
    }
    return proposal.hasBeenEdited ? FlashcardSource.AI_EDITED : FlashcardSource.AI_FULL;
  };

  const saveAllFlashcards = async () => {
    setState((prev) => ({ ...prev, isSaving: true, errors: null }));

    try {
      const flashcardsToSave = state.flashcards.map((proposal) => ({
        front: proposal.front,
        back: proposal.back,
        source:
          proposal.status === "accepted"
            ? determineFlashcardSource(proposal)
            : FlashcardSource.AI_FULL,
      }));

      const response = await fetch("/api/flashcards/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: flashcardsToSave,
          generation_id: state.generationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      // Reset state after successful save
      setState(initialState);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        errors: {
          type: "api",
          message: error instanceof Error ? error.message : "Failed to save flashcards",
          isRetryable: true,
        },
      }));
    }
  };

  const saveAcceptedFlashcards = async () => {
    setState((prev) => ({ ...prev, isSaving: true, errors: null }));

    try {
      const acceptedFlashcards = state.flashcards
        .filter((proposal) => proposal.status === "accepted")
        .map((proposal) => ({
          front: proposal.front,
          back: proposal.back,
          source: determineFlashcardSource(proposal),
        }));

      if (acceptedFlashcards.length === 0) {
        throw new Error("No accepted flashcards to save");
      }

      const response = await fetch("/api/flashcards/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: acceptedFlashcards,
          generation_id: state.generationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      // Reset state after successful save
      setState(initialState);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        errors: {
          type: "api",
          message: error instanceof Error ? error.message : "Failed to save flashcards",
          isRetryable: true,
        },
      }));
    }
  };

  return {
    state,
    generateFlashcards,
    updateFlashcard,
    updateFlashcardStatus,
    saveAllFlashcards,
    saveAcceptedFlashcards,
  };
}
