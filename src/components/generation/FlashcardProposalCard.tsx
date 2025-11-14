import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardProposalViewModel } from "@/types/view-models";
import { cn } from "@/lib/utils";

interface FlashcardProposalCardProps {
  proposal: FlashcardProposalViewModel;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
}

const FlashcardProposalCard: React.FC<FlashcardProposalCardProps> = ({ proposal, onAccept, onReject, onEdit }) => {
  const cardClasses = cn({
    "border-green-500": proposal.status === "accepted",
    "border-red-500": proposal.status === "rejected",
    "opacity-60": proposal.status === "rejected",
  });

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle>Propozycja fiszki</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Przód</p>
          <p>{proposal.front}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Tył</p>
          <p>{proposal.back}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {proposal.status !== "rejected" && (
          <Button variant="outline" onClick={() => onReject(proposal.id)}>
            Odrzuć
          </Button>
        )}
        {proposal.status !== "accepted" && (
          <>
            <Button variant="outline" onClick={() => onEdit(proposal.id)}>
              Edytuj
            </Button>
            <Button onClick={() => onAccept(proposal.id)}>Akceptuj</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default FlashcardProposalCard;
