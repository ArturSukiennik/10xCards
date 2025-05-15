import { z } from "zod";
import { FlashcardSource } from "../../types";

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;
const MAX_BATCH_SIZE = 30;

export const createFlashcardSchema = z.object({
  front: z
    .string({
      required_error: "Front side is required",
      invalid_type_error: "Front side must be a string",
    })
    .min(1, "Front side cannot be empty")
    .max(MAX_FRONT_LENGTH, `Front side must not exceed ${MAX_FRONT_LENGTH} characters`),
  back: z
    .string({
      required_error: "Back side is required",
      invalid_type_error: "Back side must be a string",
    })
    .min(1, "Back side cannot be empty")
    .max(MAX_BACK_LENGTH, `Back side must not exceed ${MAX_BACK_LENGTH} characters`),
});

export const createFlashcardBatchSchema = z
  .object({
    flashcards: z
      .array(
        z.object({
          front: createFlashcardSchema.shape.front,
          back: createFlashcardSchema.shape.back,
          source: z.nativeEnum(FlashcardSource, {
            errorMap: () => ({ message: "Invalid flashcard source" }),
          }),
        })
      )
      .min(1, "Flashcards array cannot be empty")
      .max(MAX_BATCH_SIZE, `Cannot create more than ${MAX_BATCH_SIZE} flashcards at once`),
    generation_id: z.number().optional(),
  })
  .refine(
    (data) => {
      const hasAiFlashcards = data.flashcards.some(
        (f) => f.source === FlashcardSource.AI_FULL || f.source === FlashcardSource.AI_EDITED
      );
      return !hasAiFlashcards || (hasAiFlashcards && data.generation_id !== undefined);
    },
    {
      message: "generation_id is required for AI-generated flashcards",
      path: ["generation_id"],
    }
  );

export type CreateFlashcardSchema = z.infer<typeof createFlashcardSchema>;
export type CreateFlashcardBatchSchema = z.infer<typeof createFlashcardBatchSchema>;
