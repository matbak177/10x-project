import { useMemo, useState } from "react";
import type { FlashcardProposalViewModel } from "@/types/view-models";
import type {
  FlashcardCreateDto,
  FlashcardsCreateCommand,
  GenerateFlashcardsCommand,
  GenerationCreateResponseDto,
} from "@/types";
import { toast } from "sonner";

export type GenerationStatus = "idle" | "generating" | "reviewing" | "saving" | "success" | "error";

export const useGenerationAndReview = () => {
  const [sourceText, setSourceText] = useState("");
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [editingProposal, setEditingProposal] = useState<FlashcardProposalViewModel | null>(null);

  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
  };

  const handleGenerate = async () => {
    setStatus("generating");
    setError(null);

    try {
      const command: GenerateFlashcardsCommand = { source_text: sourceText };
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        if (response.status === 400) {
          toast.error("Nieprawidłowe dane wejściowe.");
        } else if (response.status === 502) {
          toast.error("Błąd zewnętrznego serwisu AI. Spróbuj ponownie później.");
        } else {
          toast.error("Wystąpił błąd serwera.");
        }
        throw new Error("Błąd podczas generowania fiszek.");
      }

      const data: GenerationCreateResponseDto = await response.json();

      const newProposals: FlashcardProposalViewModel[] = data.flashcard_proposals.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
        status: "pending",
        edited: false,
      }));

      setProposals(newProposals);
      setGenerationId(data.generation_id);
      setStatus("reviewing");
      toast.success(`Wygenerowano ${data.generated_count} propozycji fiszek!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
      if (!errorMessage.startsWith("Błąd")) {
        toast.error("Błąd połączenia sieciowego.");
      }
      setError(errorMessage);
      setStatus("error");
    }
  };

  const handleAccept = (id: string) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: "accepted" } : p)));
  };

  const handleReject = (id: string) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
  };

  const handleAcceptAll = () => {
    setProposals((prev) => prev.map((p) => ({ ...p, status: "accepted" })));
  };

  const handleRejectAll = () => {
    setProposals((prev) => prev.map((p) => ({ ...p, status: "rejected" })));
  };

  const handleStartEdit = (id: string) => {
    const proposalToEdit = proposals.find((p) => p.id === id);
    if (proposalToEdit) {
      setEditingProposal(proposalToEdit);
    }
  };

  const handleCancelEdit = () => {
    setEditingProposal(null);
  };

  const handleSaveEdit = (id: string, updates: { front: string; back: string }) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, status: "accepted", edited: true } : p)));
    setEditingProposal(null);
  };

  const handleSave = async () => {
    setStatus("saving");
    setError(null);

    const acceptedFlashcards: FlashcardCreateDto[] = proposals
      .filter((p) => p.status === "accepted")
      .map(({ front, back, edited }) => ({
        front,
        back,
        source: edited ? "ai-edited" : "ai-full",
        generation_id: generationId,
      }));

    const command: FlashcardsCreateCommand = {
      flashcards: acceptedFlashcards,
    };

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        toast.error("Wystąpił błąd podczas zapisywania fiszek.");
        throw new Error("Błąd zapisu.");
      }

      setStatus("success");
      toast.success("Fiszki zostały pomyślnie zapisane!", {
        description: "Za chwilę zostaniesz przekierowany do listy swoich fiszek.",
      });

      setTimeout(() => {
        window.location.assign("/flashcards");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd.";
      toast.error("Błąd połączenia sieciowego.");
      setError(errorMessage);
      setStatus("reviewing"); // Wracamy do stanu przeglądu
    }
  };

  const acceptedCount = useMemo(() => {
    return proposals.filter((p) => p.status === "accepted").length;
  }, [proposals]);

  return {
    sourceText,
    proposals,
    generationId,
    status,
    error,
    acceptedCount,
    editingProposal,
    handleSourceTextChange,
    handleGenerate,
    handleAccept,
    handleReject,
    handleAcceptAll,
    handleRejectAll,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleSave,
  };
};
