import React from "react";
import FlashcardProposalCard from "./FlashcardProposalCard";
import ReviewActions from "./ReviewActions";
import type { FlashcardProposalViewModel } from "@/types/view-models";

interface ReviewSectionProps {
  proposals: FlashcardProposalViewModel[];
  acceptedCount: number;
  isSaving: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onEdit: (id: string) => void;
  onSave: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  proposals,
  acceptedCount,
  isSaving,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
  onEdit,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Przeglądaj propozycje</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proposals.map((proposal) => (
          <FlashcardProposalCard
            key={proposal.id}
            proposal={proposal}
            onAccept={onAccept}
            onReject={onReject}
            onEdit={onEdit}
          />
        ))}
      </div>
      <ReviewActions
        acceptedCount={acceptedCount}
        onAcceptAll={onAcceptAll}
        onRejectAll={onRejectAll}
        isSaving={isSaving}
        onSave={onSave}
      />
    </div>
  );
};

export default ReviewSection;
