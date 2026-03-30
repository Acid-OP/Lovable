import type { ISandboxProvider } from "./types.js";
import { DockerSandboxProvider } from "./SandboxManager.js";

export type SandboxProviderType = "docker" | "k8s" | "e2b";

/**
 * Creates the appropriate sandbox provider based on the SANDBOX_PROVIDER env var.
 *
 * Currently only "docker" is implemented. Future providers (k8s, e2b) can be
 * added here without changing any consumer code.
 */
export function createSandboxProvider(
  type?: SandboxProviderType,
): ISandboxProvider {
  const providerType =
    type || (process.env.SANDBOX_PROVIDER as SandboxProviderType) || "docker";

  switch (providerType) {
    case "docker":
      return DockerSandboxProvider.getInstance();
    default:
      throw new Error(
        `Unknown sandbox provider: "${providerType}". Available: docker`,
      );
  }
}
