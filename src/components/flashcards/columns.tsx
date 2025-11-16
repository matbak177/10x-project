"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Database } from "@/db/database.types";
import { EditFlashcardDialog } from "./EditFlashcardDialog";
import * as z from "zod";

export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
const formSchema = z.object({
  front: z.string().min(1, "Pytanie nie może być puste.").max(200, "Pytanie jest za długie."),
  back: z.string().min(1, "Odpowiedź nie może być pusta.").max(500, "Odpowiedź jest za długa."),
});

interface ColumnsProps {
  onUpdate: (id: number, values: z.infer<typeof formSchema>) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

export const columns = ({ onUpdate, onDelete, isUpdating }: ColumnsProps): ColumnDef<Flashcard>[] => [
  {
    accessorKey: "front",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Pytanie
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "back",
    header: "Odpowiedź",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Data dodania
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const flashcard = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Otwórz menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(flashcard.id.toString())}>
              Kopiuj ID fiszki
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <EditFlashcardDialog flashcard={flashcard} onUpdate={onUpdate} isUpdating={isUpdating}>
              <Button variant="ghost" className="w-full justify-start p-2 font-normal">
                Edytuj fiszkę
              </Button>
            </EditFlashcardDialog>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(flashcard.id)}>
              Usuń fiszkę
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
