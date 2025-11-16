"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { Database } from "@/db/database.types";
import type { Flashcard } from "./columns";
import StudyView from "./StudyView";

type FlashcardDto = Pick<Flashcard, "front" | "back">;

async function getFlashcards(): Promise<{ data: Flashcard[]; count: number }> {
  const response = await fetch("/api/flashcards");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

async function updateFlashcard({ id, ...data }: { id: number } & FlashcardDto) {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update flashcard");
  }
}

async function deleteFlashcard(id: number) {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete flashcard");
  }
}

const FlashcardsClient = () => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["flashcards"],
    queryFn: getFlashcards,
  });

  const updateMutation = useMutation({
    mutationFn: updateFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>Wystąpił błąd: {error.message}</div>;
  }

  const flashcards = data?.data ?? [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {isStudyMode && flashcards.length > 0 ? (
        <StudyView flashcards={flashcards} onExit={() => setIsStudyMode(false)} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Twoje fiszki</h1>
            <div>
              <Button onClick={() => setIsStudyMode(true)} disabled={flashcards.length === 0}>
                Widok nauki
              </Button>
              <Button asChild className="ml-2">
                <a href="/generate">Wygeneruj fiszki AI</a>
              </Button>
            </div>
          </div>
          <DataTable
            columns={columns({
              onUpdate: (id, data) => updateMutation.mutate({ id, ...data }),
              onDelete: (id) => deleteMutation.mutate(id),
              isUpdating: updateMutation.isPending,
            })}
            data={flashcards}
          />
        </>
      )}
    </div>
  );
};

export default FlashcardsClient;
