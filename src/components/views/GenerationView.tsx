import React from "react";
import { useGenerationAndReview } from "@/components/hooks/useGenerationAndReview";
import { GenerationForm } from "@/components/generation/GenerationForm";
import ReviewSection from "@/components/generation/ReviewSection";
import EditFlashcardDialog from "@/components/generation/EditFlashcardDialog";
import { Toaster } from "@/components/ui/sonner";

const GenerationView = () => {
  const {
    sourceText,
    proposals,
    status,
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
  } = useGenerationAndReview();

  const isGenerating = status === "generating";
  const isReviewing = status === "reviewing" || status === "saving" || status === "error";
  const isSaving = status === "saving";

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster richColors />
      <GenerationForm
        sourceText={sourceText}
        onSourceTextChange={handleSourceTextChange}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {isReviewing && (
        <ReviewSection
          proposals={proposals}
          acceptedCount={acceptedCount}
          isSaving={isSaving}
          onAccept={handleAccept}
          onReject={handleReject}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          onEdit={handleStartEdit}
          onSave={handleSave}
        />
      )}

      <EditFlashcardDialog proposal={editingProposal} onSave={handleSaveEdit} onCancel={handleCancelEdit} />

      {status === "success" && (
        <div className="text-center p-8">
          <p className="text-green-500 font-semibold">Fiszki zapisane pomyślnie!</p>
        </div>
      )}
    </div>
  );
};

export default GenerationView;
