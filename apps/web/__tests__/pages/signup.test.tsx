import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SignupPage from "@/app/signup/page";

vi.mock("@/components/MountainWithStars", () => ({
  __esModule: true,
  default: () => <div data-testid="mountain-with-stars" />,
}));

vi.mock("@/lib/providers/ThemeProvider", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

describe("Signup Page", () => {
  it("renders Create your account heading", () => {
    render(<SignupPage />);
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<SignupPage />);
    expect(screen.getByText("Get started with Bolt")).toBeInTheDocument();
  });

  it("renders Bolt logo linking to homepage", () => {
    render(<SignupPage />);
    const boltLink = screen.getByRole("link", { name: /bolt/i });
    expect(boltLink).toHaveAttribute("href", "/");
  });

  it("renders Continue with Google button", () => {
    render(<SignupPage />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("renders only email input (no name or password)", () => {
    render(<SignupPage />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Full name")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).not.toBeInTheDocument();
  });

  it("renders Continue submit button", () => {
    render(<SignupPage />);
    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).toBeInTheDocument();
  });

  it("renders Log in link pointing to /login", () => {
    render(<SignupPage />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders Terms and Privacy Policy links", () => {
    render(<SignupPage />);
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(<SignupPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders MountainWithStars component", () => {
    render(<SignupPage />);
    expect(screen.getByTestId("mountain-with-stars")).toBeInTheDocument();
  });
});
