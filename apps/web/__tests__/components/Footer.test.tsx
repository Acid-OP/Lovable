import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Footer } from "@/components/home/Footer";

describe("Footer", () => {
  it("renders copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });

  it("renders Built by Gaurav Kapur with GitHub link", () => {
    render(<Footer />);
    const creatorLink = screen.getByRole("link", { name: "Gaurav Kapur" });
    expect(creatorLink).toHaveAttribute("href", "https://github.com/Acid-OP");
    expect(creatorLink).toHaveAttribute("target", "_blank");
  });

  it("renders Editor link pointing to /editor", () => {
    render(<Footer />);
    const editorLink = screen.getByRole("link", { name: "Editor" });
    expect(editorLink).toHaveAttribute("href", "/editor");
  });

  it("renders Privacy and Terms links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
  });

  it("renders social links with correct URLs", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));

    expect(hrefs).toContain("https://github.com/Acid-OP");
    expect(hrefs).toContain("https://x.com/GauravKapurr");
    expect(hrefs).toContain(
      "https://www.linkedin.com/in/gaurav-kapur-a3286b258/",
    );
  });
});
