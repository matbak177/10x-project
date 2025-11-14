// Lokalizacja: src/types/view-models.ts

import type { FlashcardProposalDto } from "../types";

// Status propozycji fiszki w interfejsie użytkownika
export type ProposalStatus = "pending" | "accepted" | "rejected";

// ViewModel dla pojedynczej propozycji fiszki
export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  // Unikalny identyfikator po stronie klienta (np. z crypto.randomUUID())
  id: string;

  // Status propozycji (oczekująca, zaakceptowana, odrzucona)
  status: ProposalStatus;

  // Przechowuje oryginalne źródło na wypadek edycji
  // `source` z FlashcardProposalDto jest zawsze 'ai-full'
  // Ten typ pomoże nam określić, czy wysłać 'ai-full' czy 'ai-edited'
  edited: boolean;
}
