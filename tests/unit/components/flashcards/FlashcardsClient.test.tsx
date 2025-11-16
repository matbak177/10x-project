import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import FlashcardsClient from "@/components/flashcards/FlashcardsClient";

vi.mock("@/components/ui/data-table", () => ({
  DataTable: () => <div data-testid="data-table" />,
}));

vi.mock("@/components/flashcards/StudyView", () => ({
  __esModule: true,
  default: () => <div data-testid="study-view" />,
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("FlashcardsClient", () => {
  it("should display loading state", () => {
    vi.spyOn(window, "fetch").mockImplementation(
      () =>
        new Promise(() => {
          // Do not resolve to keep it in loading state
        })
    );

    render(<FlashcardsClient />, { wrapper });

    expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
  });
});
