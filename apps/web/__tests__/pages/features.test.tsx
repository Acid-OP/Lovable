import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeaturesPage from "@/app/features/page";

describe("Features Page", () => {
  it("renders hero heading", () => {
    render(<FeaturesPage />);
    expect(
      screen.getByText("Everything you need to build, iterate, and ship"),
    ).toBeInTheDocument();
  });

  it("renders Features label in hero and navbar", () => {
    render(<FeaturesPage />);
    const featureElements = screen.getAllByText("Features");
    expect(featureElements.length).toBeGreaterThanOrEqual(2);
  });

  it("renders all 6 feature cards", () => {
    render(<FeaturesPage />);
    const featureTitles = [
      "AI-Powered Code Generation",
      "Live Preview",
      "Multi-File Editor",
      "Conversational Iteration",
      "Multiple AI Models",
      "One-Click Deploy",
    ];
    featureTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders stats section with correct values", () => {
    render(<FeaturesPage />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("<60s")).toBeInTheDocument();
    expect(screen.getByText("∞")).toBeInTheDocument();
  });

  it("renders stat descriptions", () => {
    render(<FeaturesPage />);
    expect(
      screen.getByText("AI models powering every prompt"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("To generate a full-stack app"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Follow-up iterations, no limits"),
    ).toBeInTheDocument();
  });

  it("renders How it works section with 3 steps", () => {
    render(<FeaturesPage />);
    expect(screen.getByText("Describe")).toBeInTheDocument();
    expect(screen.getByText("Generate")).toBeInTheDocument();
    expect(screen.getByText("Ship")).toBeInTheDocument();
  });

  it("renders CTA with Start Building link to /editor", () => {
    render(<FeaturesPage />);
    const ctaLink = screen.getByRole("link", { name: /start building/i });
    expect(ctaLink).toHaveAttribute("href", "/editor");
  });

  it("renders Try the Editor button linking to /editor", () => {
    render(<FeaturesPage />);
    const editorLink = screen.getByRole("link", { name: /try the editor/i });
    expect(editorLink).toHaveAttribute("href", "/editor");
  });

  it("renders See All Features anchor link", () => {
    render(<FeaturesPage />);
    const seeAllLink = screen.getByRole("link", {
      name: /see all features/i,
    });
    expect(seeAllLink).toHaveAttribute("href", "#all-features");
  });
});
