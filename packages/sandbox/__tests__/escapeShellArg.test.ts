import { describe, it, expect } from "vitest";
import { escapeShellArg } from "../src/SandboxManager.js";

describe("escapeShellArg", () => {
  it("wraps a simple path in single quotes", () => {
    expect(escapeShellArg("/workspace/app")).toBe("'/workspace/app'");
  });

  it("wraps a simple filename", () => {
    expect(escapeShellArg("hello.txt")).toBe("'hello.txt'");
  });

  it("escapes single quotes with quote-backslash-quote pattern", () => {
    expect(escapeShellArg("it's")).toBe("'it'\\''s'");
  });

  it("handles multiple single quotes", () => {
    expect(escapeShellArg("it's a 'test'")).toBe("'it'\\''s a '\\''test'\\'''");
  });

  it("preserves spaces safely inside quotes", () => {
    expect(escapeShellArg("path with spaces")).toBe("'path with spaces'");
  });

  it("neutralizes shell metacharacters ($, backtick, semicolon)", () => {
    const input = "$(rm -rf /)";
    const result = escapeShellArg(input);
    // Single quotes prevent expansion, so the literal chars are preserved
    expect(result).toBe("'$(rm -rf /)'");
  });

  it("neutralizes pipe and ampersand operators", () => {
    expect(escapeShellArg("foo | bar && baz")).toBe("'foo | bar && baz'");
  });

  it("neutralizes redirect operators", () => {
    expect(escapeShellArg("echo > /etc/passwd")).toBe("'echo > /etc/passwd'");
  });

  it("handles empty string", () => {
    expect(escapeShellArg("")).toBe("''");
  });

  it("preserves newlines and tabs safely", () => {
    expect(escapeShellArg("line1\nline2\ttab")).toBe("'line1\nline2\ttab'");
  });

  it("preserves unicode characters", () => {
    expect(escapeShellArg("hello-world")).toBe("'hello-world'");
  });

  it("neutralizes adversarial breakout attempt", () => {
    const input = "'; rm -rf / #";
    const result = escapeShellArg(input);
    // The single quote in the input is escaped, preventing breakout
    // Input: '  ; rm -rf / #
    // After replace: '\''  ; rm -rf / #
    // Wrapped: ''\''; rm -rf / #'
    expect(result).toBe("''\\''; rm -rf / #'");
  });

  it("handles backtick command substitution", () => {
    expect(escapeShellArg("`whoami`")).toBe("'`whoami`'");
  });
});
