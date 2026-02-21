import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "@/app/login/page";

vi.mock("@/components/MountainWithStars", () => ({
  __esModule: true,
  default: () => <div data-testid="mountain-with-stars" />,
}));

vi.mock("@/lib/providers/ThemeProvider", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

describe("Login Page", () => {
  it("renders Welcome back heading", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<LoginPage />);
    expect(screen.getByText("Log in to continue building")).toBeInTheDocument();
  });

  it("renders Bolt logo linking to homepage", () => {
    render(<LoginPage />);
    const boltLink = screen.getByRole("link", { name: /bolt/i });
    expect(boltLink).toHaveAttribute("href", "/");
  });

  it("renders Continue with Google button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders Log in submit button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("renders Forgot password link", () => {
    render(<LoginPage />);
    const forgotLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  it("renders Sign up link pointing to /signup", () => {
    render(<LoginPage />);
    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("renders Terms and Privacy Policy links", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: "Terms" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(<LoginPage />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders MountainWithStars component", () => {
    render(<LoginPage />);
    expect(screen.getByTestId("mountain-with-stars")).toBeInTheDocument();
  });
});
