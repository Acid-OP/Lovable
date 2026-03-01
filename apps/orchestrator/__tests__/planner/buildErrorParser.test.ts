import { describe, it, expect } from "vitest";
import { parseErrorFiles } from "../../src/planner/buildErrorParser.js";

describe("parseErrorFiles", () => {
  it("parses standard format: ./file.tsx:line:col Error", () => {
    const input = `./app/page.tsx:42:10
Error: something went wrong here`;
    const result = parseErrorFiles(input);
    expect(result.size).toBe(1);
    expect(result.has("/workspace/app/page.tsx")).toBe(true);
    expect(result.get("/workspace/app/page.tsx")).toContain("42:10");
  });

  it("parses SWC format: ./file.tsx on its own line", () => {
    const input = `./app/page.tsx
  x Expected ';', got 'x'`;
    const result = parseErrorFiles(input);
    expect(result.size).toBe(1);
    expect(result.has("/workspace/app/page.tsx")).toBe(true);
  });

  it("parses multiple files", () => {
    const input = `./app/page.tsx:10:5
Error: first error
./app/layout.tsx:20:3
Error: second error`;
    const result = parseErrorFiles(input);
    expect(result.size).toBe(2);
    expect(result.has("/workspace/app/page.tsx")).toBe(true);
    expect(result.has("/workspace/app/layout.tsx")).toBe(true);
  });

  it("concatenates multiple errors for the same file", () => {
    const input = `./app/page.tsx:10:5
Error: first error
./app/page.tsx:20:3
Error: second error`;
    const result = parseErrorFiles(input);
    expect(result.size).toBe(1);
    const error = result.get("/workspace/app/page.tsx")!;
    expect(error).toContain("first error");
    expect(error).toContain("second error");
  });

  it("strips workspace/ prefix from paths", () => {
    const input = `workspace/app/page.tsx:5:1
Some error message`;
    const result = parseErrorFiles(input);
    expect(result.has("/workspace/app/page.tsx")).toBe(true);
  });

  it("handles .ts extension", () => {
    const input = `./lib/utils.ts:15:3
Type error: something wrong`;
    const result = parseErrorFiles(input);
    expect(result.has("/workspace/lib/utils.ts")).toBe(true);
  });

  it("handles .css extension", () => {
    const input = `./app/globals.css:5:1
Unknown property: foo`;
    const result = parseErrorFiles(input);
    expect(result.has("/workspace/app/globals.css")).toBe(true);
  });

  it("handles .json extension", () => {
    const input = `./tsconfig.json:10:3
Expected comma`;
    const result = parseErrorFiles(input);
    expect(result.has("/workspace/tsconfig.json")).toBe(true);
  });

  it("returns empty map for empty input", () => {
    const result = parseErrorFiles("");
    expect(result.size).toBe(0);
  });

  it("returns empty map when no patterns match", () => {
    const result = parseErrorFiles(
      "General build failure: something went wrong\nNo specific file mentioned",
    );
    expect(result.size).toBe(0);
  });

  it("includes multi-line error content", () => {
    const input = `./app/page.tsx:10:5
Error: Cannot find module
  at resolver (/path/to/resolver.js)
  at compile (/path/to/compile.js)`;
    const result = parseErrorFiles(input);
    const error = result.get("/workspace/app/page.tsx")!;
    expect(error).toContain("Cannot find module");
    expect(error).toContain("at resolver");
  });
});
