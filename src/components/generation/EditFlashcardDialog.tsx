import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardProposalViewModel } from "@/types/view-models";

interface EditFlashcardDialogProps {
  proposal: FlashcardProposalViewModel | null;
  onSave: (id: string, updates: { front: string; back: string }) => void;
  onCancel: () => void;
}

const EditFlashcardDialog: React.FC<EditFlashcardDialogProps> = ({ proposal, onSave, onCancel }) => {
  const [front, setFront] = React.useState(proposal?.front || "");
  const [back, setBack] = React.useState(proposal?.back || "");

  React.useEffect(() => {
    if (proposal) {
      setFront(proposal.front);
      setBack(proposal.back);
    }
  }, [proposal]);

  if (!proposal) return null;

  const handleSave = () => {
    onSave(proposal.id, { front, back });
  };

  const isFrontValid = front.length > 0 && front.length <= 200;
  const isBackValid = back.length > 0 && back.length <= 500;
  const isSaveDisabled = !isFrontValid || !isBackValid;

  return (
    <Dialog open={!!proposal} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="front">Przód ({front.length} / 200)</label>
            <Input id="front" value={front} onChange={(e) => setFront(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <label htmlFor="back">Tył ({back.length} / 500)</label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              maxLength={500}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Anuluj
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isSaveDisabled}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardDialog;
