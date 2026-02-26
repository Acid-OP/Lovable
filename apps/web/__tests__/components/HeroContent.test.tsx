import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroContent } from "@/components/home/HeroContent";

vi.mock("@lobehub/icons", () => ({
  Claude: { Color: () => <span data-testid="icon-claude" /> },
  OpenAI: () => <span data-testid="icon-openai" />,
  Gemini: { Color: () => <span data-testid="icon-gemini" /> },
  Perplexity: { Color: () => <span data-testid="icon-perplexity" /> },
}));

describe("HeroContent", () => {
  it("renders the top pill badge", () => {
    render(<HeroContent />);
    expect(
      screen.getByText("build apps 10x faster with AI"),
    ).toBeInTheDocument();
  });

  it("renders the animated pulse dot", () => {
    render(<HeroContent />);
    const pill = screen.getByText("build apps 10x faster with AI");
    const dot = pill.querySelector(".animate-pulse");
    expect(dot).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<HeroContent />);
    expect(screen.getByText(/You describe it\./)).toBeInTheDocument();
    expect(screen.getByText(/AI builds it\./)).toBeInTheDocument();
  });

  it("renders all four AI model badges", () => {
    render(<HeroContent />);
    expect(screen.getByTestId("icon-openai")).toBeInTheDocument();
    expect(screen.getByTestId("icon-claude")).toBeInTheDocument();
    expect(screen.getByTestId("icon-perplexity")).toBeInTheDocument();
    expect(screen.getByTestId("icon-gemini")).toBeInTheDocument();
  });

  it("renders model names for Claude and Perplexity", () => {
    render(<HeroContent />);
    expect(screen.getByText("Claude")).toBeInTheDocument();
    expect(screen.getByText("Perplexity")).toBeInTheDocument();
  });

  it("renders model context line", () => {
    render(<HeroContent />);
    expect(screen.getByText("Understand how")).toBeInTheDocument();
    expect(screen.getByText("build your vision")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<HeroContent />);
    expect(
      screen.getByText(
        "Real code, real design, real apps shipped from a single prompt",
      ),
    ).toBeInTheDocument();
  });

  it("renders Get Started button", () => {
    render(<HeroContent />);
    const button = screen.getByRole("button", { name: /get started/i });
    expect(button).toBeInTheDocument();
  });

  it("renders View Demo button", () => {
    render(<HeroContent />);
    expect(
      screen.getByRole("button", { name: "View Demo" }),
    ).toBeInTheDocument();
  });
});
