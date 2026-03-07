import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProjectShowcase } from "@/components/editor/ProjectShowcase";

describe("ProjectShowcase", () => {
  it("renders the first project card by default", () => {
    render(<ProjectShowcase isDark={false} />);
    expect(screen.getByText("DrawDeck")).toBeInTheDocument();
    expect(
      screen.getByText(/Real-time collaborative canvas/),
    ).toBeInTheDocument();
  });

  it("renders a single link card at a time", () => {
    render(<ProjectShowcase isDark={false} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://drawdeck.xyz");
  });

  it("opens link in new tab", () => {
    render(<ProjectShowcase isDark={false} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders 4 carousel indicator buttons", () => {
    render(<ProjectShowcase isDark={false} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("supports dark mode", () => {
    render(<ProjectShowcase isDark={true} />);
    expect(screen.getByText("DrawDeck")).toBeInTheDocument();
  });
});
