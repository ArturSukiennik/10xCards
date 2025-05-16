import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { FlashcardItem } from "@/components/generate/FlashcardItem";
import type { FlashcardProposalViewModel } from "@/lib/hooks/useFlashcardGeneration";

describe("FlashcardItem", () => {
  const mockFlashcard: FlashcardProposalViewModel = {
    id: "test-id",
    front: "Test front",
    back: "Test back",
    status: "pending",
    hasBeenEdited: false,
    isEditing: false,
    originalContent: {
      front: "Test front",
      back: "Test back",
    },
  };

  const mockOnUpdate = vi.fn();
  const mockOnStatusChange = vi.fn();

  const renderComponent = (flashcard = mockFlashcard) => {
    return render(
      <FlashcardItem
        flashcard={flashcard}
        onUpdate={mockOnUpdate}
        onStatusChange={mockOnStatusChange}
      />,
    );
  };

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnStatusChange.mockClear();
  });

  describe("Initial Render", () => {
    it("should display flashcard content correctly", () => {
      renderComponent();
      expect(screen.getByText("Test front")).toBeInTheDocument();
      expect(screen.getByText("Test back")).toBeInTheDocument();
    });

    it("should show edit, accept and reject buttons", () => {
      renderComponent();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Accept")).toBeInTheDocument();
      expect(screen.getByText("Reject")).toBeInTheDocument();
    });

    it("should not show reset button for unedited flashcard", () => {
      renderComponent();
      expect(screen.queryByText("Reset")).not.toBeInTheDocument();
    });

    it("should show reset button for edited flashcard", () => {
      renderComponent({
        ...mockFlashcard,
        hasBeenEdited: true,
      });
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    it("should enter edit mode when edit button is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Edit"));

      const frontTextarea = screen.getByLabelText("Front:");
      const backTextarea = screen.getByLabelText("Back:");

      expect(frontTextarea).toBeInTheDocument();
      expect(backTextarea).toBeInTheDocument();
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should update content when saving edits", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Edit"));

      const frontTextarea = screen.getByLabelText("Front:");
      const backTextarea = screen.getByLabelText("Back:");

      fireEvent.change(frontTextarea, { target: { value: "Updated front" } });
      fireEvent.change(backTextarea, { target: { value: "Updated back" } });

      fireEvent.click(screen.getByText("Save"));

      expect(mockOnUpdate).toHaveBeenCalledWith("test-id", {
        front: "Updated front",
        back: "Updated back",
      });
    });

    it("should revert changes when canceling edit", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Edit"));

      const frontTextarea = screen.getByLabelText("Front:");
      const backTextarea = screen.getByLabelText("Back:");

      fireEvent.change(frontTextarea, { target: { value: "Updated front" } });
      fireEvent.change(backTextarea, { target: { value: "Updated back" } });

      fireEvent.click(screen.getByText("Cancel"));

      expect(screen.getByText("Test front")).toBeInTheDocument();
      expect(screen.getByText("Test back")).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Status Changes", () => {
    it("should call onStatusChange with 'accepted' when accepting flashcard", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Accept"));
      expect(mockOnStatusChange).toHaveBeenCalledWith("test-id", "accepted");
    });

    it("should call onStatusChange with 'rejected' when rejecting flashcard", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Reject"));
      expect(mockOnStatusChange).toHaveBeenCalledWith("test-id", "rejected");
    });

    it("should apply opacity style to rejected flashcards", () => {
      renderComponent({
        ...mockFlashcard,
        status: "rejected",
      });
      const card = screen.getByText("Test front").closest(".opacity-60");
      expect(card).toBeInTheDocument();
    });
  });

  describe("Reset Functionality", () => {
    it("should reset to original content when reset button is clicked", () => {
      const editedFlashcard = {
        ...mockFlashcard,
        front: "Edited front",
        back: "Edited back",
        hasBeenEdited: true,
        originalContent: {
          front: "Original front",
          back: "Original back",
        },
      };

      renderComponent(editedFlashcard);
      fireEvent.click(screen.getByText("Reset"));

      expect(mockOnUpdate).toHaveBeenCalledWith("test-id", {
        front: "Original front",
        back: "Original back",
      });
    });
  });

  describe("Validation", () => {
    it("should enforce maxLength on front textarea", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Edit"));

      const frontTextarea = screen.getByLabelText("Front:");
      expect(frontTextarea).toHaveAttribute("maxLength", "200");
    });

    it("should enforce maxLength on back textarea", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Edit"));

      const backTextarea = screen.getByLabelText("Back:");
      expect(backTextarea).toHaveAttribute("maxLength", "600");
    });
  });
});
