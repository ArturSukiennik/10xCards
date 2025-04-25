import type { Tables } from "./db/database.types";

// ========================
// Enum Types
// ========================

/**
 * Możliwe źródła pochodzenia fiszek
 */
export enum FlashcardSource {
  AI_FULL = "ai-full",
  AI_EDITED = "ai-edited",
  MANUAL = "manual",
}

/**
 * Okresy dla statystyk generowania
 */
export enum GenerationStatsPeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  ALL = "all",
}

// ========================
// Base DTOs
// ========================

/**
 * DTO reprezentujące fiszkę
 */
export interface FlashcardDto {
  id: number;
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: number;
  created_at: string;
  updated_at: string;
}

/**
 * DTO reprezentujące tymczasową fiszkę przed zapisaniem
 */
export interface TemporaryFlashcardDto {
  id: string;
  front: string;
  back: string;
}

/**
 * DTO reprezentujące informacje o paginacji
 */
export interface PaginationResponseDto {
  current_page: number;
  total_pages: number;
  total_items: number;
  limit: number;
}

// ========================
// Command Models
// ========================

/**
 * Command model do ręcznego tworzenia pojedynczej fiszki
 */
export interface CreateFlashcardCommand {
  front: string;
  back: string;
}

/**
 * Command model do aktualizacji fiszki
 */
export interface UpdateFlashcardCommand {
  front: string;
  back: string;
}

/**
 * Command model do tworzenia wielu fiszek jednocześnie
 */
export interface CreateMultipleFlashcardsCommand {
  flashcards: {
    front: string;
    back: string;
    source: FlashcardSource;
  }[];
  generation_id?: number;
}

/**
 * Command model do generowania fiszek przez AI
 */
export interface GenerateFlashcardsCommand {
  source_text: string;
  model: string;
}

/**
 * Command model dla zapisu wygenerowanych fiszek
 */
export interface SaveGeneratedFlashcardsCommand {
  flashcards: {
    id: string;
    front: string;
    back: string;
    source: FlashcardSource;
  }[];
}

// ========================
// AI Service Types
// ========================

/**
 * Interface representing the raw AI response structure
 */
export interface AIFlashcardResponse {
  flashcards: {
    front: string;
    back: string;
  }[];
}

// ========================
// Response DTOs
// ========================

/**
 * DTO odpowiedzi dla listy fiszek
 */
export interface FlashcardListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationResponseDto;
}

/**
 * DTO odpowiedzi dla usunięcia fiszki
 */
export interface DeleteFlashcardResponseDto {
  message: string;
}

/**
 * Response DTO for creating multiple flashcards
 */
export interface CreateMultipleFlashcardsResponseDto {
  created_count: number;
  flashcards: FlashcardDto[];
}

/**
 * DTO odpowiedzi dla generowania fiszek przez AI
 */
export interface GenerateFlashcardsResponseDto {
  generation_id: number;
  generated_flashcards: TemporaryFlashcardDto[];
}

/**
 * DTO odpowiedzi dla zapisania wygenerowanych fiszek
 */
export interface SaveGeneratedFlashcardsResponseDto {
  saved_count: number;
  flashcards: FlashcardDto[];
}

/**
 * DTO odpowiedzi dla statystyk generowania
 */
export interface GenerationStatsResponseDto {
  total_generations: number;
  total_flashcards_generated: number;
  flashcards_accepted: number;
  acceptance_rate: number;
  by_source: {
    ai_full: number;
    ai_edited: number;
    manual: number;
  };
}

// ========================
// Mappers (Database -> DTO)
// ========================

/**
 * Funkcja mapująca encję bazy danych na DTO fiszki
 */
export function mapToFlashcardDto(flashcard: Tables<"flashcards">): FlashcardDto {
  return {
    id: flashcard.id,
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source as FlashcardSource,
    generation_id: flashcard.generation_id,
    created_at: flashcard.created_at,
    updated_at: flashcard.updated_at,
  };
}

/**
 * Funkcja mapująca tablicę encji bazy danych na tablicę DTO fiszek
 */
export function mapToFlashcardDtoArray(flashcards: Tables<"flashcards">[]): FlashcardDto[] {
  return flashcards.map(mapToFlashcardDto);
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  password_confirmation: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
