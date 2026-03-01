import { describe, it, expect } from "vitest";
import { extractRoutesFromPlan } from "../../src/planner/routeExtractor.js";

describe("extractRoutesFromPlan", () => {
  // --- App Router ---
  describe("App Router", () => {
    it("extracts root page", () => {
      const routes = extractRoutesFromPlan(["app/page.tsx"]);
      expect(routes).toContain("/");
    });

    it("extracts nested route", () => {
      const routes = extractRoutesFromPlan(["app/about/page.tsx"]);
      expect(routes).toContain("/about");
    });

    it("extracts deeply nested route", () => {
      const routes = extractRoutesFromPlan(["app/blog/posts/page.tsx"]);
      expect(routes).toContain("/blog/posts");
    });

    it("replaces dynamic route params with 1", () => {
      const routes = extractRoutesFromPlan(["app/blog/[slug]/page.tsx"]);
      expect(routes).toContain("/blog/1");
    });

    it("handles multiple dynamic segments", () => {
      const routes = extractRoutesFromPlan(["app/[category]/[id]/page.tsx"]);
      expect(routes).toContain("/1/1");
    });
  });

  // --- /workspace prefix ---
  describe("workspace prefix handling", () => {
    it("strips /workspace/ prefix from paths", () => {
      const routes = extractRoutesFromPlan(["/workspace/app/page.tsx"]);
      expect(routes).toContain("/");
    });

    it("strips /workspace/ prefix from nested paths", () => {
      const routes = extractRoutesFromPlan([
        "/workspace/app/dashboard/page.tsx",
      ]);
      expect(routes).toContain("/dashboard");
    });
  });

  // --- Pages Router ---
  describe("Pages Router", () => {
    it("extracts index as root", () => {
      const routes = extractRoutesFromPlan(["pages/index.tsx"]);
      expect(routes).toContain("/");
    });

    it("extracts pages route", () => {
      const routes = extractRoutesFromPlan(["pages/about.tsx"]);
      expect(routes).toContain("/about");
    });

    it("excludes _app.tsx", () => {
      const routes = extractRoutesFromPlan([
        "pages/_app.tsx",
        "pages/index.tsx",
      ]);
      expect(routes).not.toContain("/_app");
    });

    it("excludes _document.tsx", () => {
      const routes = extractRoutesFromPlan([
        "pages/_document.tsx",
        "pages/index.tsx",
      ]);
      expect(routes).not.toContain("/_document");
    });
  });

  // --- Default behavior ---
  describe("defaults", () => {
    it("returns ['/'] for empty input", () => {
      const routes = extractRoutesFromPlan([]);
      expect(routes).toEqual(["/"]);
    });

    it("returns ['/'] when no page files found", () => {
      const routes = extractRoutesFromPlan([
        "app/layout.tsx",
        "app/components/Button.tsx",
      ]);
      expect(routes).toEqual(["/"]);
    });
  });

  // --- Multiple routes ---
  it("extracts multiple routes", () => {
    const routes = extractRoutesFromPlan([
      "app/page.tsx",
      "app/about/page.tsx",
      "app/blog/[slug]/page.tsx",
    ]);
    expect(routes).toContain("/");
    expect(routes).toContain("/about");
    expect(routes).toContain("/blog/1");
    expect(routes).toHaveLength(3);
  });
});
