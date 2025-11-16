import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GenerationForm } from "@/components/generation/GenerationForm";

describe("GenerationForm", () => {
  it("should disable button when text is too short", () => {
    render(
      <GenerationForm
        sourceText="short text"
        onSourceTextChange={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />
    );
    expect(screen.getByRole("button", { name: /Generuj/i })).toBeDisabled();
  });

  it("should enable button when text is long enough", () => {
    const longText = "a".repeat(1000);
    render(
      <GenerationForm sourceText={longText} onSourceTextChange={() => {}} onGenerate={() => {}} isGenerating={false} />
    );
    expect(screen.getByRole("button", { name: /Generuj/i })).toBeEnabled();
  });

  it("should call onGenerate when button is clicked", () => {
    const onGenerate = vi.fn();
    const longText = "a".repeat(1000);
    render(
      <GenerationForm
        sourceText={longText}
        onSourceTextChange={() => {}}
        onGenerate={onGenerate}
        isGenerating={false}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Generuj/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('should show "Generowanie..." and be disabled when generating', () => {
    const longText = "a".repeat(1000);
    render(
      <GenerationForm sourceText={longText} onSourceTextChange={() => {}} onGenerate={() => {}} isGenerating={true} />
    );
    const button = screen.getByRole("button", { name: /Generowanie.../i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
