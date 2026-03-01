import { describe, it, expect } from "vitest";
import {
  frontendValidator,
  FrontendValidator,
} from "../../src/validation/frontendValidator.js";
import type { Plan, PlanStep } from "../../src/planner/types.js";

function makeFileStep(overrides: Partial<PlanStep> = {}): PlanStep {
  return {
    id: 1,
    type: "file_write",
    description: "Create file",
    path: "/workspace/app/page.tsx",
    content: "",
    ...overrides,
  };
}

function makePlan(steps: PlanStep[]): Plan {
  return {
    summary: "Test plan",
    estimatedTimeSeconds: 120,
    steps,
  };
}

describe("FrontendValidator", () => {
  const validator = new FrontendValidator();

  // --- Responsive design ---
  describe("responsive design checks", () => {
    it("warns when no responsive breakpoints detected", () => {
      const plan = makePlan([
        makeFileStep({ content: '<div className="p-4 text-lg">Hello</div>' }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(
        expect.stringContaining("responsive"),
      );
    });

    it("no warning when responsive breakpoints present", () => {
      const plan = makePlan([
        makeFileStep({
          content: '<div className="p-4 sm:p-8 md:text-lg">Hello</div>',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).not.toContainEqual(
        expect.stringContaining("responsive Tailwind breakpoints"),
      );
    });

    it("suggests responsive widths for fixed pixel widths", () => {
      const plan = makePlan([
        makeFileStep({
          content: '<div className="w-[400px] sm:w-full">Box</div>',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("responsive width"),
      );
    });

    it("suggests responsive padding when only base padding exists", () => {
      const plan = makePlan([
        makeFileStep({ content: '<div className="p-4">Content</div>' }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("responsive padding"),
      );
    });
  });

  // --- Accessibility ---
  describe("accessibility checks", () => {
    it("warns about interactive elements without ARIA", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content: "<button onClick={handleClick}>Click</button>",
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(expect.stringContaining("ARIA"));
    });

    it("no ARIA warning when aria attributes present", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content:
            '<button aria-label="Submit" onClick={handleClick}>Click</button>',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).not.toContainEqual(
        expect.stringContaining("ARIA"),
      );
    });

    it("warns about images without alt text", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content: '<Image src="/photo.jpg" width={100} height={100} />',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(expect.stringContaining("alt"));
    });

    it("suggests labels for inputs", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content: '<input type="text" placeholder="Name" />',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("label"),
      );
    });

    it("suggests semantic HTML when only divs used", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content:
            "export default function Page() { return <div><div>Content</div></div>; }",
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("semantic HTML"),
      );
    });
  });

  // --- Component structure ---
  describe("component structure checks", () => {
    it("warns about missing use client directive", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content:
            'import { useState } from "react";\nexport default function Page() { const [x, setX] = useState(0); return <div>{x}</div>; }',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(
        expect.stringContaining("use client"),
      );
    });

    it("no use client warning when directive present", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content:
            '"use client";\nimport { useState } from "react";\nexport default function Page() { const [x, setX] = useState(0); return <div>{x}</div>; }',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).not.toContainEqual(
        expect.stringContaining("use client"),
      );
    });

    it("warns about lowercase component name", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content:
            "export default function myComponent() { return <div>Hi</div>; }",
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(
        expect.stringContaining("uppercase"),
      );
    });

    it("suggests splitting large components", () => {
      const lines = Array(201).fill("<div>line</div>").join("\n");
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content: lines,
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("Large component"),
      );
    });
  });

  // --- Styling ---
  describe("styling checks", () => {
    it("warns about inline styles", () => {
      const plan = makePlan([
        makeFileStep({
          content: '<div style={{ color: "red", padding: 10 }}>Styled</div>',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(
        expect.stringContaining("Inline styles"),
      );
    });

    it("suggests Tailwind colors instead of hex codes", () => {
      const plan = makePlan([
        makeFileStep({
          content: '<div className="bg-[#FF5733] sm:bg-blue-500">Color</div>',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("hex colors"),
      );
    });

    it("suggests transitions for hover states", () => {
      const plan = makePlan([
        makeFileStep({
          content:
            '<button className="hover:bg-blue-600 bg-blue-500">Click</button>',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("transition"),
      );
    });
  });

  // --- TypeScript ---
  describe("TypeScript checks", () => {
    it("warns about any type usage", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content: "function handle(data: any) { return data.name; }",
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toContainEqual(expect.stringContaining("any"));
    });

    it("suggests typed useState", () => {
      const plan = makePlan([
        makeFileStep({
          path: "/workspace/app/page.tsx",
          content:
            '"use client";\nimport { useState } from "react";\nexport default function Page() { const [items, setItems] = useState([]); return <div />; }',
        }),
      ]);
      const result = validator.validate(plan);
      expect(result.suggestions).toContainEqual(
        expect.stringContaining("useState"),
      );
    });
  });

  // --- Edge cases ---
  describe("edge cases", () => {
    it("handles plan with no file_write steps", () => {
      const plan = makePlan([
        {
          id: 1,
          type: "command",
          description: "Run a command",
          command: "echo hello",
        },
      ]);
      const result = validator.validate(plan);
      expect(result.warnings).toBeDefined();
      expect(result.suggestions).toBeDefined();
    });

    it("handles file step with empty content", () => {
      const plan = makePlan([makeFileStep({ content: "" })]);
      const result = validator.validate(plan);
      // Should not throw
      expect(result).toBeDefined();
    });
  });

  // --- Exported singleton ---
  describe("exported singleton", () => {
    it("frontendValidator is a FrontendValidator instance", () => {
      expect(frontendValidator).toBeInstanceOf(FrontendValidator);
    });
  });
});
