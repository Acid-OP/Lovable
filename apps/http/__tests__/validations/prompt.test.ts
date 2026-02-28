import { describe, it, expect } from "vitest";
import { promptSchema } from "../../src/validations/prompt.js";

describe("promptSchema", () => {
  it("accepts a valid prompt string", () => {
    const result = promptSchema.safeParse({ prompt: "Build a todo app" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from prompt", () => {
    const result = promptSchema.safeParse({ prompt: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prompt).toBe("hello");
    }
  });

  it("rejects empty prompt", () => {
    const result = promptSchema.safeParse({ prompt: "" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace-only prompt to empty (passes parse, trim happens after min check)", () => {
    const result = promptSchema.safeParse({ prompt: "   " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prompt).toBe("");
    }
  });

  it("rejects prompt over 5000 characters", () => {
    const result = promptSchema.safeParse({ prompt: "x".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("accepts prompt at exactly 5000 characters", () => {
    const result = promptSchema.safeParse({ prompt: "x".repeat(5000) });
    expect(result.success).toBe(true);
  });

  it("accepts valid previousJobId", () => {
    const result = promptSchema.safeParse({
      prompt: "Iterate",
      previousJobId: "job-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty previousJobId", () => {
    const result = promptSchema.safeParse({
      prompt: "Iterate",
      previousJobId: "",
    });
    expect(result.success).toBe(false);
  });

  it("allows missing previousJobId", () => {
    const result = promptSchema.safeParse({ prompt: "Build something" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.previousJobId).toBeUndefined();
    }
  });

  it("rejects missing prompt field entirely", () => {
    const result = promptSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
