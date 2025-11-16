"use client";

import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FlashcardForm } from "./FlashcardForm";
import type { Flashcard } from "./columns";

interface EditFlashcardDialogProps {
  flashcard: Flashcard;
  children: React.ReactNode;
  onUpdate: (id: number, values: z.infer<ReturnType<typeof formSchema>>) => void;
  isUpdating: boolean;
}

const formSchema = () =>
  z.object({
    front: z.string().min(1, "Pytanie nie może być puste.").max(200, "Pytanie jest za długie."),
    back: z.string().min(1, "Odpowiedź nie może być pusta.").max(500, "Odpowiedź jest za długa."),
  });

export function EditFlashcardDialog({ flashcard, children, onUpdate, isUpdating }: EditFlashcardDialogProps) {
  const handleSubmit = (values: z.infer<ReturnType<typeof formSchema>>) => {
    onUpdate(flashcard.id, values);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>Zmień dane swojej fiszki. Kliknij zapisz, aby zakończyć.</DialogDescription>
        </DialogHeader>
        <FlashcardForm flashcard={flashcard} onSubmit={handleSubmit} isSubmitting={isUpdating} />
      </DialogContent>
    </Dialog>
  );
}
