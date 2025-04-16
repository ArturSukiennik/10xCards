import { z } from 'zod';

/**
 * Schema for validating flashcard generation request
 */
export const generateFlashcardsSchema = z.object({
  source_text: z
    .string({
      required_error: 'Source text is required',
      invalid_type_error: 'Source text must be a string',
    })
    .min(1000, 'Source text must be at least 1000 characters long')
    .max(10000, 'Source text must not exceed 10000 characters'),
  
  model: z
    .string({
      required_error: 'Model is required',
      invalid_type_error: 'Model must be a string',
    })
    // Add supported models - can be expanded later
    .refine(
      (model) => ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'].includes(model),
      'Invalid model specified. Supported models are: gpt-4, gpt-4-turbo, gpt-3.5-turbo'
    ),
});

/**
 * Type inference for the schema
 */
export type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>; 