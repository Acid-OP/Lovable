import { SandboxManager } from "@repo/sandbox";
import { logger } from "../utils/logger.js";
import {
  ClassifiedError,
  ErrorType,
  groupErrorsByType,
  extractMissingPackages,
  requiresLLMFix,
} from "./errorClassifier.js";
import { autoInstallPackages, InstallResult } from "./dependencyInstaller.js";
import { FileError } from "./buildErrorParser.js";
import { generateFixes, FileFix } from "./fixGenerator.js";

export interface ErrorHandlingResult {
  success: boolean;
  handledErrors: ClassifiedError[];
  llmFixedErrors: ClassifiedError[];
  autoFixedErrors: ClassifiedError[];
  failedErrors: ClassifiedError[];
  installResult?: InstallResult;
  fixes?: FileFix[];
  shouldRetryBuild: boolean;
  message: string;
}

export async function routeAndHandleErrors(
  containerId: string,
  classifiedErrors: ClassifiedError[],
  jobId: string,
): Promise<ErrorHandlingResult> {
  const result: ErrorHandlingResult = {
    success: false,
    handledErrors: [],
    llmFixedErrors: [],
    autoFixedErrors: [],
    failedErrors: [],
    shouldRetryBuild: false,
    message: "",
  };

  if (classifiedErrors.length === 0) {
    return {
      ...result,
      success: true,
      message: "No errors to handle",
    };
  }

  // Group errors by type
  const errorGroups = groupErrorsByType(classifiedErrors);

  logger.info("error_router.classification_summary", {
    jobId,
    total: classifiedErrors.length,
    byType: {
      dependency: errorGroups.get(ErrorType.DEPENDENCY)?.length || 0,
      import: errorGroups.get(ErrorType.IMPORT)?.length || 0,
      syntax: errorGroups.get(ErrorType.SYNTAX)?.length || 0,
      type: errorGroups.get(ErrorType.TYPE)?.length || 0,
      config: errorGroups.get(ErrorType.CONFIG)?.length || 0,
      unknown: errorGroups.get(ErrorType.UNKNOWN)?.length || 0,
    },
  });

  // PHASE 1: Handle dependency errors (auto-install)
  const dependencyErrors = errorGroups.get(ErrorType.DEPENDENCY) || [];
  if (dependencyErrors.length > 0) {
    const packages = extractMissingPackages(dependencyErrors);

    logger.info("error_router.handling_dependencies", {
      jobId,
      packages,
      count: packages.length,
    });

    const installResult = await autoInstallPackages(
      containerId,
      packages,
      jobId,
    );
    result.installResult = installResult;

    if (installResult.success) {
      result.autoFixedErrors.push(...dependencyErrors);
      result.handledErrors.push(...dependencyErrors);
      result.shouldRetryBuild = true;

      logger.info("error_router.dependencies_installed", {
        jobId,
        installed: installResult.installedPackages,
        failed: installResult.failedPackages,
      });
    } else {
      result.failedErrors.push(...dependencyErrors);

      logger.error("error_router.dependency_install_failed", {
        jobId,
        failed: installResult.failedPackages,
      });
    }
  }

  // PHASE 2: Handle config errors (abort)
  const configErrors = errorGroups.get(ErrorType.CONFIG) || [];
  if (configErrors.length > 0) {
    logger.error("error_router.config_errors_detected", {
      jobId,
      count: configErrors.length,
      errors: configErrors.map((e) => e.details.message),
    });

    result.failedErrors.push(...configErrors);
    result.message = `Configuration errors detected. Cannot proceed. Please check your setup.`;
    return result;
  }

  // PHASE 3: Collect errors that need LLM fixing
  const errorsNeedingLLM: ClassifiedError[] = [];

  for (const [errorType, errors] of errorGroups) {
    if (requiresLLMFix(errorType)) {
      errorsNeedingLLM.push(...errors);
    }
  }

  if (errorsNeedingLLM.length > 0) {
    logger.info("error_router.preparing_llm_fixes", {
      jobId,
      count: errorsNeedingLLM.length,
      types: Array.from(new Set(errorsNeedingLLM.map((e) => e.type))),
    });

    // Convert ClassifiedError to FileError format for LLM
    const fileErrors = await convertToFileErrors(containerId, errorsNeedingLLM);

    try {
      // Generate fixes using Gemini
      const fixes = await generateFixes(fileErrors);

      result.fixes = fixes;
      result.llmFixedErrors.push(...errorsNeedingLLM);
      result.handledErrors.push(...errorsNeedingLLM);
      result.shouldRetryBuild = true;

      logger.info("error_router.llm_fixes_generated", {
        jobId,
        fixCount: fixes.length,
        files: fixes.map((f) => f.path),
      });
    } catch (error) {
      logger.error("error_router.llm_fix_failed", {
        jobId,
        error: error instanceof Error ? error.message : String(error),
      });

      result.failedErrors.push(...errorsNeedingLLM);
    }
  }

  // Calculate overall success
  result.success = result.failedErrors.length === 0;

  if (result.success) {
    result.message = `Successfully handled ${result.handledErrors.length} errors (${result.autoFixedErrors.length} auto-fixed, ${result.llmFixedErrors.length} LLM-fixed)`;
  } else {
    result.message = `Handled ${result.handledErrors.length}/${classifiedErrors.length} errors. ${result.failedErrors.length} errors could not be fixed.`;
  }

  return result;
}

async function convertToFileErrors(
  containerId: string,
  classifiedErrors: ClassifiedError[],
): Promise<FileError[]> {
  const sandbox = SandboxManager.getInstance();
  const fileErrors: FileError[] = [];

  for (const error of classifiedErrors) {
    if (!error.filePath) {
      // Skip errors without file paths
      continue;
    }

    try {
      const content = await sandbox.readFile(containerId, error.filePath);

      fileErrors.push({
        path: error.filePath,
        error: error.originalError,
        content,
      });
    } catch (readError) {
      logger.error("error_router.file_read_failed", {
        path: error.filePath,
        error:
          readError instanceof Error ? readError.message : String(readError),
      });
    }
  }

  return fileErrors;
}

export async function applyFixes(
  containerId: string,
  fixes: FileFix[],
  jobId: string,
): Promise<void> {
  const sandbox = SandboxManager.getInstance();

  for (const fix of fixes) {
    try {
      await sandbox.writeFile(containerId, fix.path, fix.content);

      logger.info("error_router.fix_applied", {
        jobId,
        path: fix.path,
      });
    } catch (error) {
      logger.error("error_router.fix_apply_failed", {
        jobId,
        path: fix.path,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}

export function prioritizeErrors(errors: ClassifiedError[]): ClassifiedError[] {
  const priority: Record<ErrorType, number> = {
    [ErrorType.DEPENDENCY]: 1, // Fix first (fastest)
    [ErrorType.CONFIG]: 2, // Check early (may need to abort)
    [ErrorType.SYNTAX]: 3, // Fix before type errors
    [ErrorType.IMPORT]: 4, // Fix before type errors
    [ErrorType.TYPE]: 5, // Fix after syntax/imports
    [ErrorType.HYDRATION]: 6, // React hydration errors
    [ErrorType.ROUTING]: 7, // Next.js routing errors
    [ErrorType.RUNTIME]: 8, // Runtime errors
    [ErrorType.UNKNOWN]: 9, // Fix last
  };

  return [...errors].sort((a, b) => {
    const priorityA = priority[a.type] || 999;
    const priorityB = priority[b.type] || 999;
    return priorityA - priorityB;
  });
}
