import React from "react";
import { Button } from "@/components/ui/button";

interface ReviewActionsProps {
  acceptedCount: number;
  isSaving: boolean;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

const ReviewActions: React.FC<ReviewActionsProps> = ({ acceptedCount, isSaving, onSave, onAcceptAll, onRejectAll }) => {
  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
      <div className="container mx-auto flex justify-between items-center">
        <p className="font-medium">
          Zaakceptowano: <span className="text-primary">{acceptedCount}</span> fiszek
        </p>
        <div className="space-x-2">
          <Button variant="outline" onClick={onRejectAll}>
            Odrzuć wszystkie
          </Button>
          <Button variant="outline" onClick={onAcceptAll}>
            Akceptuj wszystkie
          </Button>
          <Button onClick={onSave} disabled={acceptedCount === 0 || isSaving}>
            {isSaving ? "Zapisywanie..." : `Zapisz ${acceptedCount} fiszek`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewActions;
