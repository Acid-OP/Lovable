import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Navbar } from "@/components/home/Navbar";

describe("Navbar", () => {
  it("renders the Bolt logo text", () => {
    render(<Navbar />);
    expect(screen.getByText("Bolt")).toBeInTheDocument();
  });

  it("renders all navigation links with correct hrefs", () => {
    render(<Navbar />);
    const featuresLink = screen.getByRole("link", { name: "Features" });
    const aboutLink = screen.getByRole("link", { name: "About" });
    const editorLink = screen.getByRole("link", { name: "Editor" });

    expect(featuresLink).toHaveAttribute("href", "/features");
    expect(aboutLink).toHaveAttribute("href", "/about");
    expect(editorLink).toHaveAttribute("href", "/editor");
  });

  it("renders Get Started button linking to /signup", () => {
    render(<Navbar />);
    const getStartedLinks = screen.getAllByRole("link", {
      name: /get started/i,
    });
    expect(getStartedLinks.length).toBeGreaterThan(0);
    expect(getStartedLinks[0]).toHaveAttribute("href", "/signup");
  });

  it("renders mobile menu button", () => {
    render(<Navbar />);
    const buttons = screen.getAllByRole("button");
    const menuButton = buttons.find((btn) =>
      btn.className.includes("md:hidden"),
    );
    expect(menuButton).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", () => {
    render(<Navbar />);
    const buttons = screen.getAllByRole("button");
    const menuButton = buttons.find((btn) =>
      btn.className.includes("md:hidden"),
    )!;

    const initialLinks = screen.getAllByRole("link", { name: "Features" });
    expect(initialLinks).toHaveLength(1);

    fireEvent.click(menuButton);

    const mobileLinks = screen.getAllByRole("link", { name: "Features" });
    expect(mobileLinks.length).toBeGreaterThanOrEqual(2);
  });
});
