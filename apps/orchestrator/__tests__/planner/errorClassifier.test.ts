import { describe, it, expect } from "vitest";
import {
  classifyError,
  classifyBuildErrors,
  groupErrorsByType,
  extractMissingPackages,
  requiresLLMFix,
  ErrorType,
} from "../../src/planner/errorClassifier.js";

describe("classifyError", () => {
  // --- Dependency errors ---
  describe("dependency errors", () => {
    it("classifies Cannot find module", () => {
      const result = classifyError("Cannot find module 'lodash'");
      expect(result.type).toBe(ErrorType.DEPENDENCY);
      expect(result.details.missingPackage).toBe("lodash");
      expect(result.details.severity).toBe("critical");
    });

    it("classifies Module not found: Can't resolve", () => {
      const result = classifyError(
        "Module not found: Can't resolve '@headlessui/react'",
      );
      expect(result.type).toBe(ErrorType.DEPENDENCY);
      expect(result.details.missingPackage).toBe("@headlessui/react");
    });

    it("classifies ERR_MODULE_NOT_FOUND", () => {
      const result = classifyError(
        "ERR_MODULE_NOT_FOUND: Cannot find package 'framer-motion'",
      );
      expect(result.type).toBe(ErrorType.DEPENDENCY);
    });

    it("extracts package name from dependency error", () => {
      const result = classifyError("Could not resolve 'next-themes'");
      expect(result.details.missingPackage).toBe("next-themes");
    });
  });

  // --- Import errors ---
  describe("import errors", () => {
    it("classifies wrong arrow syntax in import", () => {
      const result = classifyError("import React => 'react'");
      expect(result.type).toBe(ErrorType.IMPORT);
      expect(result.details.severity).toBe("critical");
    });

    it("classifies Unexpected token import", () => {
      const result = classifyError("Unexpected token import");
      // Could match syntax or import depending on order — imports checked first
      expect([ErrorType.IMPORT, ErrorType.SYNTAX]).toContain(result.type);
    });
  });

  // --- Syntax errors ---
  describe("syntax errors", () => {
    it("classifies SyntaxError:", () => {
      const result = classifyError(
        "SyntaxError: missing ) after argument list",
      );
      expect(result.type).toBe(ErrorType.SYNTAX);
      expect(result.details.severity).toBe("critical");
    });

    it("classifies Unterminated string", () => {
      const result = classifyError("Unterminated string constant");
      expect(result.type).toBe(ErrorType.SYNTAX);
    });

    it("extracts line and column from error", () => {
      const result = classifyError(
        "SyntaxError: /workspace/app/page.tsx:42:10 Unexpected token",
      );
      expect(result.type).toBe(ErrorType.SYNTAX);
      expect(result.details.line).toBe(42);
      expect(result.details.column).toBe(10);
    });

    it("classifies Unclosed JSX tag", () => {
      const result = classifyError("Unclosed JSX tag at line 15");
      expect(result.type).toBe(ErrorType.SYNTAX);
    });
  });

  // --- Type errors ---
  describe("type errors", () => {
    it("classifies type not assignable", () => {
      const result = classifyError(
        "Type 'string' is not assignable to type 'number'",
      );
      expect(result.type).toBe(ErrorType.TYPE);
      expect(result.details.severity).toBe("high");
    });

    it("classifies property does not exist on type", () => {
      const result = classifyError(
        "Property 'foo' does not exist on type 'Bar'",
      );
      expect(result.type).toBe(ErrorType.TYPE);
    });

    it("classifies TypeScript error codes", () => {
      const result = classifyError("TS2345: Argument of type error");
      expect(result.type).toBe(ErrorType.TYPE);
    });
  });

  // --- Config errors ---
  describe("config errors", () => {
    it("classifies Cannot find tsconfig", () => {
      const result = classifyError("Cannot find tsconfig.json");
      expect(result.type).toBe(ErrorType.CONFIG);
      expect(result.details.severity).toBe("critical");
    });

    it("classifies next.config error", () => {
      const result = classifyError("Error in next.config.js: invalid option");
      expect(result.type).toBe(ErrorType.CONFIG);
    });

    it("classifies tailwind.config error", () => {
      const result = classifyError("Failed to parse tailwind.config.ts");
      expect(result.type).toBe(ErrorType.CONFIG);
    });
  });

  // --- Hydration errors ---
  describe("hydration errors", () => {
    it("classifies Hydration failed", () => {
      const result = classifyError(
        "Hydration failed because the initial UI does not match",
      );
      expect(result.type).toBe(ErrorType.HYDRATION);
      expect(result.details.severity).toBe("high");
    });

    it("classifies Minified React error #418", () => {
      const result = classifyError("Minified React error #418");
      expect(result.type).toBe(ErrorType.HYDRATION);
    });

    it("classifies dangerouslySetInnerHTML mismatch", () => {
      const result = classifyError("dangerouslySetInnerHTML did not match");
      expect(result.type).toBe(ErrorType.HYDRATION);
    });
  });

  // --- Routing errors ---
  describe("routing errors", () => {
    it("classifies NEXT_NOT_FOUND", () => {
      const result = classifyError("NEXT_NOT_FOUND: page not found");
      expect(result.type).toBe(ErrorType.ROUTING);
      expect(result.details.severity).toBe("high");
    });

    it("classifies useRouter is not a function", () => {
      const result = classifyError("useRouter is not a function");
      // Could match routing or runtime — routing patterns checked first
      expect(result.type).toBe(ErrorType.ROUTING);
    });

    it("classifies generateStaticParams error", () => {
      const result = classifyError("generateStaticParams is required");
      expect(result.type).toBe(ErrorType.ROUTING);
    });
  });

  // --- Runtime errors ---
  describe("runtime errors", () => {
    it("classifies Cannot read property of undefined", () => {
      const result = classifyError(
        "Cannot read properties of undefined (reading 'map')",
      );
      expect(result.type).toBe(ErrorType.RUNTIME);
      expect(result.details.severity).toBe("high");
    });

    it("classifies Maximum update depth exceeded", () => {
      const result = classifyError("Maximum update depth exceeded");
      expect(result.type).toBe(ErrorType.RUNTIME);
    });

    it("classifies Too many re-renders", () => {
      const result = classifyError(
        "Too many re-renders. React limits the number of renders",
      );
      expect(result.type).toBe(ErrorType.RUNTIME);
    });
  });

  // --- Unknown fallback ---
  describe("unknown errors", () => {
    it("falls back to UNKNOWN for unrecognized errors", () => {
      const result = classifyError("Something completely unexpected happened");
      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.details.severity).toBe("medium");
      expect(result.details.message).toBe("Unclassified error");
    });
  });

  // --- filePath forwarding ---
  it("preserves filePath in result", () => {
    const result = classifyError(
      "SyntaxError: oops",
      "/workspace/app/page.tsx",
    );
    expect(result.filePath).toBe("/workspace/app/page.tsx");
  });

  it("preserves originalError in result", () => {
    const error = "  Some error with whitespace  ";
    const result = classifyError(error);
    expect(result.originalError).toBe(error);
  });
});

describe("classifyBuildErrors", () => {
  it("classifies multiple errors from a map", () => {
    const errorMap = new Map([
      ["/workspace/app/page.tsx", "Cannot find module 'lodash'"],
      ["/workspace/app/layout.tsx", "SyntaxError: Unexpected token"],
    ]);
    const results = classifyBuildErrors(errorMap);
    expect(results).toHaveLength(2);
    expect(results[0]!.type).toBe(ErrorType.DEPENDENCY);
    expect(results[1]!.type).toBe(ErrorType.SYNTAX);
  });

  it("returns empty array for empty map", () => {
    const results = classifyBuildErrors(new Map());
    expect(results).toHaveLength(0);
  });

  it("skips entries with falsy values", () => {
    const errorMap = new Map([
      ["/workspace/app/page.tsx", ""],
      ["", "Some error"],
    ]);
    const results = classifyBuildErrors(errorMap);
    expect(results).toHaveLength(0);
  });
});

describe("groupErrorsByType", () => {
  it("groups errors correctly", () => {
    const errors = [
      classifyError("Cannot find module 'a'"),
      classifyError("Cannot find module 'b'"),
      classifyError("SyntaxError: bad"),
    ];
    const grouped = groupErrorsByType(errors);
    expect(grouped.get(ErrorType.DEPENDENCY)).toHaveLength(2);
    expect(grouped.get(ErrorType.SYNTAX)).toHaveLength(1);
  });

  it("handles empty input", () => {
    const grouped = groupErrorsByType([]);
    expect(grouped.size).toBe(0);
  });
});

describe("extractMissingPackages", () => {
  it("extracts unique package names", () => {
    const errors = [
      classifyError("Cannot find module 'lodash'"),
      classifyError("Cannot find module 'react-query'"),
      classifyError("Cannot find module 'lodash'"), // duplicate
      classifyError("SyntaxError: oops"), // not a dependency error
    ];
    const packages = extractMissingPackages(errors);
    expect(packages).toHaveLength(2);
    expect(packages).toContain("lodash");
    expect(packages).toContain("react-query");
  });

  it("returns empty for no dependency errors", () => {
    const errors = [classifyError("SyntaxError: bad")];
    expect(extractMissingPackages(errors)).toHaveLength(0);
  });
});

describe("requiresLLMFix", () => {
  it("returns false for DEPENDENCY", () => {
    expect(requiresLLMFix(ErrorType.DEPENDENCY)).toBe(false);
  });

  it("returns false for CONFIG", () => {
    expect(requiresLLMFix(ErrorType.CONFIG)).toBe(false);
  });

  it("returns true for SYNTAX", () => {
    expect(requiresLLMFix(ErrorType.SYNTAX)).toBe(true);
  });

  it("returns true for TYPE", () => {
    expect(requiresLLMFix(ErrorType.TYPE)).toBe(true);
  });

  it("returns true for HYDRATION", () => {
    expect(requiresLLMFix(ErrorType.HYDRATION)).toBe(true);
  });

  it("returns true for RUNTIME", () => {
    expect(requiresLLMFix(ErrorType.RUNTIME)).toBe(true);
  });

  it("returns true for UNKNOWN", () => {
    expect(requiresLLMFix(ErrorType.UNKNOWN)).toBe(true);
  });
});
