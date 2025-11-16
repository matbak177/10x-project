import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FlashcardsClient from "@/components/flashcards/FlashcardsClient";

const queryClient = new QueryClient();

const FlashcardsView = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FlashcardsClient />
    </QueryClientProvider>
  );
};

export default FlashcardsView;
