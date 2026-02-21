import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HeroSection } from "@/components/home/HeroSection";

vi.mock("@lobehub/icons", () => ({
  Claude: { Color: () => <span data-testid="icon-claude" /> },
  OpenAI: () => <span data-testid="icon-openai" />,
  Gemini: { Color: () => <span data-testid="icon-gemini" /> },
  Perplexity: { Color: () => <span data-testid="icon-perplexity" /> },
}));

vi.mock("@/components/home/FallingStars", () => ({
  FallingStars: () => <div data-testid="falling-stars" />,
}));

vi.mock("@/components/home/LogoCarousel", () => ({
  LogoCarousel: () => <div data-testid="logo-carousel" />,
}));

vi.mock("@/components/home/ThreeSteps", () => ({
  ThreeSteps: () => <div data-testid="three-steps" />,
}));

vi.mock("@/components/home/UseCases", () => ({
  UseCases: () => <div data-testid="use-cases" />,
}));

vi.mock("@/components/home/CtaBanner", () => ({
  CtaBanner: () => <div data-testid="cta-banner" />,
}));

describe("HeroSection", () => {
  it("renders FallingStars animation", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("falling-stars")).toBeInTheDocument();
  });

  it("renders HeroContent with heading", () => {
    render(<HeroSection />);
    expect(screen.getByText(/You describe it\./)).toBeInTheDocument();
  });

  it("renders editor preview image with correct alt text", () => {
    render(<HeroSection />);
    const img = screen.getByAltText(
      "Haven editor workspace showing a personal finance dashboard built with AI",
    );
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/editor-preview-v2.png");
  });

  it("renders LogoCarousel section", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("logo-carousel")).toBeInTheDocument();
  });

  it("renders ThreeSteps section", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("three-steps")).toBeInTheDocument();
  });

  it("renders UseCases section", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("use-cases")).toBeInTheDocument();
  });

  it("renders CtaBanner section", () => {
    render(<HeroSection />);
    expect(screen.getByTestId("cta-banner")).toBeInTheDocument();
  });
});
