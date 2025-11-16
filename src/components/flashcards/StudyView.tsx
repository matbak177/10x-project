"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "./columns";
import { Card, CardContent } from "@/components/ui/card";

interface StudyViewProps {
  flashcards: Flashcard[];
  onExit: () => void;
}

const StudyView = ({ flashcards, onExit }: StudyViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentFlashcard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onExit();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      onClick={onExit}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="button"
        tabIndex={0}
      >
        <Card
          className="w-[350px] h-[200px] cursor-pointer flex items-center justify-center text-center p-6"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent>
            <p className="text-xl">{isFlipped ? currentFlashcard.back : currentFlashcard.front}</p>
          </CardContent>
        </Card>
        <div className="flex justify-center mt-4">
          <Button onClick={handlePrevious} className="mr-2">
            Poprzednia
          </Button>
          <Button onClick={handleNext}>Następna</Button>
        </div>
      </div>
    </div>
  );
};

export default StudyView;
