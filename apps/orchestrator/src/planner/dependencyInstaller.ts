import { SandboxManager } from "@repo/sandbox";
import { logger } from "../utils/logger.js";

export interface InstallResult {
  success: boolean;
  installedPackages: string[];
  failedPackages: string[];
  output: string;
}

function normalizePackageName(packageName: string): string {
  let normalized = packageName.replace(/\.(js|ts|jsx|tsx|mjs|cjs)$/, "");

  // Handle relative/absolute paths - these are not npm packages
  if (normalized.startsWith(".") || normalized.startsWith("/")) {
    return "";
  }

  // Extract package name from scoped packages (@org/package/subpath -> @org/package)
  if (normalized.startsWith("@")) {
    const parts = normalized.split("/");
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return ""; // Invalid scoped package
  }

  // Extract base package name (lodash/get -> lodash)
  const parts = normalized.split("/");
  return parts[0] || "";
}

function filterValidPackages(packages: string[]): string[] {
  const valid: string[] = [];

  for (const pkg of packages) {
    const normalized = normalizePackageName(pkg);

    // Skip empty, relative paths, and built-in Node.js modules
    if (!normalized) continue;
    if (
      [
        "fs",
        "path",
        "http",
        "https",
        "crypto",
        "stream",
        "util",
        "os",
        "events",
      ].includes(normalized)
    ) {
      continue;
    }

    valid.push(normalized);
  }

  // Remove duplicates
  return Array.from(new Set(valid));
}

export async function autoInstallPackages(
  containerId: string,
  packageNames: string[],
  jobId: string,
): Promise<InstallResult> {
  const sandbox = SandboxManager.getInstance();
  const result: InstallResult = {
    success: false,
    installedPackages: [],
    failedPackages: [],
    output: "",
  };

  // Filter and normalize package names
  const validPackages = filterValidPackages(packageNames);

  if (validPackages.length === 0) {
    logger.info("dependency.no_valid_packages", {
      jobId,
      providedPackages: packageNames,
    });
    return {
      success: true,
      installedPackages: [],
      failedPackages: [],
      output: "No valid packages to install",
    };
  }

  logger.info("dependency.install_start", {
    jobId,
    containerId,
    packages: validPackages,
    count: validPackages.length,
  });

  try {
    const installCommand = `cd /workspace && pnpm add ${validPackages.join(" ")} 2>&1`;

    logger.info("dependency.running_command", {
      jobId,
      command: installCommand,
    });

    const execResult = await sandbox.exec(containerId, installCommand);
    const installOutput = execResult.output;

    result.output = installOutput;

    // Check if installation was successful
    if (installOutput.includes("ERR!") || installOutput.includes("error")) {
      // Parse which packages failed
      for (const pkg of validPackages) {
        if (installOutput.includes(`${pkg}`)) {
          result.failedPackages.push(pkg);
        } else {
          result.installedPackages.push(pkg);
        }
      }

      logger.warn("dependency.install_partial", {
        jobId,
        installed: result.installedPackages,
        failed: result.failedPackages,
      });

      result.success = result.installedPackages.length > 0;
    } else {
      // All packages installed successfully
      result.installedPackages = validPackages;
      result.success = true;

      logger.info("dependency.install_success", {
        jobId,
        packages: validPackages,
        count: validPackages.length,
      });
    }
  } catch (error) {
    logger.error("dependency.install_error", {
      jobId,
      packages: validPackages,
      error: error instanceof Error ? error.message : String(error),
    });

    result.failedPackages = validPackages;
    result.success = false;
    result.output = error instanceof Error ? error.message : String(error);
  }

  return result;
}

export async function isPackageInstalled(
  containerId: string,
  packageName: string,
): Promise<boolean> {
  const sandbox = SandboxManager.getInstance();

  try {
    const normalized = normalizePackageName(packageName);
    if (!normalized) return false;

    // Check if package exists in node_modules
    const checkCommand = `cd /workspace && test -d node_modules/${normalized} && echo "exists" || echo "missing"`;
    const execResult = await sandbox.exec(containerId, checkCommand);

    return execResult.output.trim() === "exists";
  } catch (error) {
    return false;
  }
}

export async function getInstalledPackages(
  containerId: string,
): Promise<string[]> {
  const sandbox = SandboxManager.getInstance();

  try {
    const command = "cd /workspace && pnpm list --depth=0 --json 2>&1";
    const execResult = await sandbox.exec(containerId, command);

    // Parse pnpm output
    const json = JSON.parse(execResult.output);
    const dependencies = json.dependencies || {};

    return Object.keys(dependencies);
  } catch (error) {
    logger.error("dependency.list_error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
