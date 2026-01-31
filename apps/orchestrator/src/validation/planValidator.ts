import { Plan, PlanStep, STEP_TYPES } from "../planner/types.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  plan?: Plan;
}

const DANGEROUS_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /rm\s+-rf\s+\/(?!\w)/, reason: "Deleting root filesystem" },
  { pattern: /rm\s+-rf\s+~/, reason: "Deleting home directory" },
  { pattern: /sudo\s/, reason: "Sudo commands not allowed" },
  { pattern: /su\s+-?\s*\w*/, reason: "User switching not allowed" },
  { pattern: /chmod\s+777/, reason: "Insecure permissions" },
  { pattern: /curl.*\|\s*(ba)?sh/, reason: "Piping curl to shell" },
  { pattern: /wget.*\|\s*(ba)?sh/, reason: "Piping wget to shell" },
  { pattern: />\s*\/etc\//, reason: "Writing to /etc" },
  { pattern: />\s*\/var\//, reason: "Writing to /var" },
  { pattern: />\s*\/usr\//, reason: "Writing to /usr" },
  { pattern: />\s*\/root\//, reason: "Writing to /root" },
  { pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;/, reason: "Fork bomb" },
  { pattern: /mkfs/, reason: "Filesystem formatting" },
  { pattern: /dd\s+if=/, reason: "Direct disk access" },
  { pattern: /shutdown/, reason: "System shutdown" },
  { pattern: /reboot/, reason: "System reboot" },
];

const MAX_STEPS = 25;
const MAX_COMMAND_LENGTH = 500;
const MAX_FILE_CONTENT_LENGTH = 50000;

export class PlanValidator {
  validate(plan: Plan): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    this.validateStructure(plan, result);
    if (!result.valid) return result;

    this.validateSteps(plan.steps, result);
    if (!result.valid) return result;

    this.validateCommandSafety(plan.steps, result);
    if (!result.valid) return result;

    this.validateSemantics(plan, result);

    result.plan = plan;
    return result;
  }

  private validateStructure(plan: Plan, result: ValidationResult): void {
    if (!plan.summary || typeof plan.summary !== "string") {
      result.errors.push('Missing or invalid "summary" field');
      result.valid = false;
    }

    if (!plan.steps || !Array.isArray(plan.steps)) {
      result.errors.push('Missing or invalid "steps" array');
      result.valid = false;
      return;
    }

    if (plan.steps.length === 0) {
      result.errors.push("Steps array is empty");
      result.valid = false;
    }

    if (plan.steps.length > MAX_STEPS) {
      result.errors.push(
        `Too many steps: ${plan.steps.length} (max ${MAX_STEPS})`,
      );
      result.valid = false;
    }

    if (
      plan.estimatedTimeSeconds === undefined ||
      typeof plan.estimatedTimeSeconds !== "number"
    ) {
      result.warnings.push('Missing "estimatedTimeSeconds", defaulting to 120');
      plan.estimatedTimeSeconds = 120;
    }
  }

  private validateSteps(steps: PlanStep[], result: ValidationResult): void {
    const seenIds = new Set<number>();

    steps.forEach((step, index) => {
      const stepNum = index + 1;

      if (step.id === undefined || typeof step.id !== "number") {
        result.errors.push(`Step ${stepNum}: Missing or invalid "id"`);
        result.valid = false;
      } else if (seenIds.has(step.id)) {
        result.errors.push(`Step ${stepNum}: Duplicate id ${step.id}`);
        result.valid = false;
      } else {
        seenIds.add(step.id);
      }

      if (!step.type || !STEP_TYPES.includes(step.type)) {
        result.errors.push(
          `Step ${stepNum}: Invalid "type" (must be ${STEP_TYPES.join(", ")})`,
        );
        result.valid = false;
      }

      if (!step.description || typeof step.description !== "string") {
        result.errors.push(`Step ${stepNum}: Missing "description"`);
        result.valid = false;
      }

      if (step.type === "command") {
        this.validateCommandStep(step, stepNum, result);
      } else if (step.type === "file_write") {
        this.validateFileWriteStep(step, stepNum, result);
      } else if (step.type === "file_delete") {
        this.validateFileDeleteStep(step, stepNum, result);
      }
    });
  }

  private validateCommandStep(
    step: PlanStep,
    stepNum: number,
    result: ValidationResult,
  ): void {
    if (!step.command || typeof step.command !== "string") {
      result.errors.push(`Step ${stepNum}: Missing or invalid "command"`);
      result.valid = false;
      return;
    }

    if (step.command.length > MAX_COMMAND_LENGTH) {
      result.errors.push(
        `Step ${stepNum}: Command too long (${step.command.length} chars, max ${MAX_COMMAND_LENGTH})`,
      );
      result.valid = false;
    }

    if (!step.workingDirectory) {
      result.warnings.push(
        `Step ${stepNum}: No workingDirectory, defaulting to /workspace`,
      );
      step.workingDirectory = "/workspace";
    }

    if (!step.workingDirectory.startsWith("/workspace")) {
      result.errors.push(
        `Step ${stepNum}: workingDirectory must be inside /workspace`,
      );
      result.valid = false;
    }
  }

  private validateFileWriteStep(
    step: PlanStep,
    stepNum: number,
    result: ValidationResult,
  ): void {
    if (!step.path || typeof step.path !== "string") {
      result.errors.push(`Step ${stepNum}: Missing "path"`);
      result.valid = false;
    }

    if (step.content === undefined) {
      result.errors.push(`Step ${stepNum}: Missing "content"`);
      result.valid = false;
    }

    if (step.content && step.content.length > MAX_FILE_CONTENT_LENGTH) {
      result.errors.push(
        `Step ${stepNum}: File content too long (${step.content.length} chars, max ${MAX_FILE_CONTENT_LENGTH})`,
      );
      result.valid = false;
    }

    if (step.path && !step.path.startsWith("/workspace")) {
      result.errors.push(`Step ${stepNum}: path must be inside /workspace`);
      result.valid = false;
    }
  }

  private validateFileDeleteStep(
    step: PlanStep,
    stepNum: number,
    result: ValidationResult,
  ): void {
    if (!step.path || typeof step.path !== "string") {
      result.errors.push(`Step ${stepNum}: Missing "path"`);
      result.valid = false;
    }

    if (step.path && !step.path.startsWith("/workspace")) {
      result.errors.push(`Step ${stepNum}: path must be inside /workspace`);
      result.valid = false;
    }

    if (step.path === "/workspace" || step.path === "/workspace/") {
      result.errors.push(`Step ${stepNum}: Cannot delete root workspace`);
      result.valid = false;
    }
  }

  private validateCommandSafety(
    steps: PlanStep[],
    result: ValidationResult,
  ): void {
    steps.forEach((step, index) => {
      if (step.type !== "command" || !step.command) return;

      const stepNum = index + 1;
      const command = step.command;

      for (const { pattern, reason } of DANGEROUS_PATTERNS) {
        if (pattern.test(command)) {
          result.errors.push(`Step ${stepNum}: Dangerous command - ${reason}`);
          result.valid = false;
        }
      }

      if (command.includes(";")) {
        result.warnings.push(
          `Step ${stepNum}: Command uses semicolon chaining, ensure it's safe`,
        );
      }

      if (command.includes(">") && !command.includes(">>")) {
        result.warnings.push(`Step ${stepNum}: Command uses redirect operator`);
      }
    });
  }

  private validateSemantics(plan: Plan, result: ValidationResult): void {
    const steps = plan.steps;

    // Check for unnecessary package manager commands (packages are pre-installed)
    steps.forEach((step, index) => {
      if (step.type === "command" && step.command) {
        const cmd = step.command.toLowerCase();

        // Warn about package installation commands (not needed with pre-built image)
        if (
          cmd.includes("npm install") ||
          cmd.includes("pnpm install") ||
          cmd.includes("yarn install") ||
          cmd.includes("yarn add") ||
          cmd.includes("npm i ") ||
          cmd.includes("pnpm add")
        ) {
          result.warnings.push(
            `Step ${index + 1}: Package install command detected - packages are pre-installed in sandbox`,
          );
        }

        // Warn about CLI scaffolding tools (should use file_write instead)
        if (
          cmd.includes("create-next-app") ||
          cmd.includes("create-react-app") ||
          cmd.includes("npx create-")
        ) {
          result.warnings.push(
            `Step ${index + 1}: CLI scaffolding detected - use file_write steps instead for faster execution`,
          );
        }
      }
    });

    // Check for duplicate file paths
    const filePaths = steps
      .filter(
        (step) => step.type === "file_write" || step.type === "file_delete",
      )
      .map((step) => step.path);

    const duplicates = filePaths.filter(
      (path, index) => filePaths.indexOf(path) !== index,
    );

    if (duplicates.length > 0) {
      result.warnings.push(
        `Duplicate file operations on: ${[...new Set(duplicates)].join(", ")}`,
      );
    }

    // Check that essential Next.js files are being created
    const hasLayoutFile = filePaths.some((p) => p?.includes("layout.tsx"));
    const hasPageFile = filePaths.some((p) => p?.includes("page.tsx"));

    if (!hasLayoutFile) {
      result.warnings.push(
        "No layout.tsx file in plan - Next.js App Router requires app/layout.tsx",
      );
    }
    if (!hasPageFile) {
      result.warnings.push(
        "No page.tsx file in plan - Next.js requires at least one page",
      );
    }

    // Validate Next.js routing conventions
    this.validateRoutingConventions(steps, result);
  }

  private validateRoutingConventions(
    steps: PlanStep[],
    result: ValidationResult,
  ): void {
    const appFiles = steps
      .filter(
        (step) => step.type === "file_write" && step.path?.includes("/app/"),
      )
      .map((step) => ({ path: step.path || "", stepId: step.id }));

    appFiles.forEach(({ path, stepId }) => {
      // Check for incorrect route file naming (e.g., home.tsx instead of page.tsx)
      if (
        path.match(
          /\/(home|about|contact|dashboard|profile|settings|blog|products|services)\.tsx$/i,
        )
      ) {
        result.errors.push(
          `Step ${stepId}: Invalid route file "${path}" - Next.js routes must use page.tsx inside a directory (e.g., /app/about/page.tsx instead of /app/about.tsx)`,
        );
        result.valid = false;
      }

      // Check for wrong file extensions in app directory
      if (path.match(/\/app\/.*\.(js|jsx)$/)) {
        result.warnings.push(
          `Step ${stepId}: File "${path}" uses .js/.jsx extension - prefer .ts/.tsx for TypeScript`,
        );
      }

      // Validate dynamic route syntax
      const dynamicRouteMatch = path.match(/\/\[([^\]]+)\]/);
      if (dynamicRouteMatch && dynamicRouteMatch[1]) {
        const paramName = dynamicRouteMatch[1];
        if (paramName && (paramName.includes(" ") || paramName.includes("-"))) {
          result.errors.push(
            `Step ${stepId}: Invalid dynamic route parameter "[${paramName}]" in "${path}" - use camelCase without spaces/hyphens (e.g., [userId] not [user-id])`,
          );
          result.valid = false;
        }
      }

      // Validate route groups
      const routeGroupMatch = path.match(/\/\(([^)]+)\)/);
      const groupName = routeGroupMatch?.[1];
      if (groupName && (groupName.includes(" ") || groupName.match(/[A-Z]/))) {
        result.warnings.push(
          `Step ${stepId}: Route group "(${groupName})" in "${path}" should use lowercase-kebab-case`,
        );
      }

      // Check for proper page/layout file structure
      if (
        path.includes("/app/") &&
        !path.match(
          /\/(page|layout|loading|error|not-found|template|default|route)\.tsx$/,
        )
      ) {
        const fileName = path.split("/").pop() || "";
        // Allow files starting with underscore or in components/api/lib directories
        if (
          !fileName.startsWith("_") &&
          !path.includes("/components/") &&
          !path.includes("/api/") &&
          !path.includes("/lib/")
        ) {
          result.warnings.push(
            `Step ${stepId}: File "${fileName}" in app directory is not a special Next.js file - consider moving to /app/components or /lib`,
          );
        }
      }
    });

    // Check for conflicting routes
    const routes = appFiles
      .filter(({ path }) => path.endsWith("/page.tsx"))
      .map(
        ({ path }) =>
          path.replace("/workspace/app", "").replace("/page.tsx", "") || "/",
      );

    const routeConflicts = this.findRouteConflicts(routes);
    routeConflicts.forEach((conflict) => {
      result.warnings.push(`Potential route conflict: ${conflict}`);
    });
  }

  private findRouteConflicts(routes: string[]): string[] {
    const conflicts: string[] = [];
    const normalizedRoutes = routes.map((r) => ({
      original: r,
      normalized: r
        .replace(/\/\[([^\]]+)\]/g, "/:param")
        .replace(/\/\([^)]+\)/g, ""),
    }));

    for (let i = 0; i < normalizedRoutes.length; i++) {
      const routeI = normalizedRoutes[i];
      if (!routeI) continue;

      for (let j = i + 1; j < normalizedRoutes.length; j++) {
        const routeJ = normalizedRoutes[j];
        if (routeJ && routeI.normalized === routeJ.normalized) {
          conflicts.push(`${routeI.original} vs ${routeJ.original}`);
        }
      }
    }

    return conflicts;
  }
}

export const planValidator = new PlanValidator();
