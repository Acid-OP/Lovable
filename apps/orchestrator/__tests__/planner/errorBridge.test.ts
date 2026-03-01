import { describe, it, expect } from "vitest";
import { getErrorBridgeScript } from "../../src/planner/errorBridge.js";

describe("getErrorBridgeScript", () => {
  it("returns a non-empty string", () => {
    const script = getErrorBridgeScript();
    expect(script.length).toBeGreaterThan(0);
  });

  it("contains the report type marker", () => {
    const script = getErrorBridgeScript();
    expect(script).toContain("__ERROR_BRIDGE_REPORT__");
  });

  it("contains window.onerror handler", () => {
    const script = getErrorBridgeScript();
    expect(script).toContain("window.onerror");
  });

  it("contains unhandledrejection handler", () => {
    const script = getErrorBridgeScript();
    expect(script).toContain("unhandledrejection");
  });

  it("contains configurable constants", () => {
    const script = getErrorBridgeScript();
    expect(script).toContain("MAX_ERRORS = 20");
    expect(script).toContain("REPORT_DELAY = 3000");
    expect(script).toContain("FALLBACK_TIMEOUT = 15000");
  });
});
