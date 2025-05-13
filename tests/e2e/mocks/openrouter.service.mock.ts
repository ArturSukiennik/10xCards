import type { Flashcard } from "@/lib/services/openrouter.interfaces";

export class MockOpenRouterService {
  async generateFlashcards(): Promise<Flashcard[]> {
    // Zwracamy przykładowe fiszki dla testów
    return [
      {
        front: "Kiedy powstało państwo polskie?",
        back: "Państwo polskie powstało ponad tysiąc lat temu, za czasów Mieszka I z dynastii Piastów.",
      },
      {
        front: "Co wydarzyło się w 966 roku?",
        back: "W 966 roku Mieszko I przyjął chrzest, wprowadzając Polskę do kręgu kultury chrześcijańskiej i europejskiej.",
      },
      {
        front: "Kto był pierwszym królem Polski?",
        back: "Bolesław Chrobry został pierwszym królem Polski w 1025 roku.",
      },
    ];
  }
}
