import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage from "@/app/about/page";

describe("About Page", () => {
  it("renders hero heading", () => {
    render(<AboutPage />);
    expect(
      screen.getByText("Built by one person, for everyone"),
    ).toBeInTheDocument();
  });

  it("renders About label in hero section", () => {
    render(<AboutPage />);
    const aboutElements = screen.getAllByText("About");
    expect(aboutElements.length).toBeGreaterThanOrEqual(2);
  });

  it("renders creator name in the creator card", () => {
    render(<AboutPage />);
    const names = screen.getAllByText("Gaurav Kapur");
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it("renders creator title", () => {
    render(<AboutPage />);
    expect(screen.getByText("Creator & Solo Developer")).toBeInTheDocument();
  });

  it("renders creator social links", () => {
    render(<AboutPage />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("https://github.com/Acid-OP");
    expect(hrefs).toContain("https://x.com/GauravKapurr");
    expect(hrefs).toContain(
      "https://www.linkedin.com/in/gaurav-kapur-a3286b258/",
    );
  });

  it("renders all 3 timeline items", () => {
    render(<AboutPage />);
    expect(screen.getByText("The Problem")).toBeInTheDocument();
    expect(screen.getByText("The Idea")).toBeInTheDocument();
    expect(screen.getByText("Bolt Was Born")).toBeInTheDocument();
  });

  it("renders all 4 values", () => {
    render(<AboutPage />);
    expect(screen.getByText("Speed over ceremony")).toBeInTheDocument();
    expect(screen.getByText("Transparency")).toBeInTheDocument();
    expect(screen.getByText("Accessible to everyone")).toBeInTheDocument();
    expect(screen.getByText("Always improving")).toBeInTheDocument();
  });

  it("renders the quote", () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/Work until the people who doubted you/),
    ).toBeInTheDocument();
  });

  it("renders CTA with link to /editor", () => {
    render(<AboutPage />);
    const ctaLink = screen.getByRole("link", { name: /open the editor/i });
    expect(ctaLink).toHaveAttribute("href", "/editor");
  });
});
