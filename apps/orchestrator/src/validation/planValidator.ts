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

const MAX_STEPS = 20;
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
      result.errors.push(`Too many steps: ${plan.steps.length} (max ${MAX_STEPS})`);
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
          `Step ${stepNum}: Invalid "type" (must be ${STEP_TYPES.join(", ")})`
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
    result: ValidationResult
  ): void {
    if (!step.command || typeof step.command !== "string") {
      result.errors.push(`Step ${stepNum}: Missing or invalid "command"`);
      result.valid = false;
      return;
    }

    if (step.command.length > MAX_COMMAND_LENGTH) {
      result.errors.push(
        `Step ${stepNum}: Command too long (${step.command.length} chars, max ${MAX_COMMAND_LENGTH})`
      );
      result.valid = false;
    }

    if (!step.workingDirectory) {
      result.warnings.push(
        `Step ${stepNum}: No workingDirectory, defaulting to /workspace`
      );
      step.workingDirectory = "/workspace";
    }

    if (!step.workingDirectory.startsWith("/workspace")) {
      result.errors.push(
        `Step ${stepNum}: workingDirectory must be inside /workspace`
      );
      result.valid = false;
    }
  }

  private validateFileWriteStep(
    step: PlanStep,
    stepNum: number,
    result: ValidationResult
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
        `Step ${stepNum}: File content too long (${step.content.length} chars, max ${MAX_FILE_CONTENT_LENGTH})`
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
    result: ValidationResult
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
    result: ValidationResult
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
          `Step ${stepNum}: Command uses semicolon chaining, ensure it's safe`
        );
      }

      if (command.includes(">") && !command.includes(">>")) {
        result.warnings.push(
          `Step ${stepNum}: Command uses redirect operator`
        );
      }
    });
  }

  private validateSemantics(plan: Plan, result: ValidationResult): void {
    const steps = plan.steps;

    const firstStep = steps[0];
    if (firstStep && firstStep.type === "command" && firstStep.command) {
      const cmd = firstStep.command.toLowerCase();
      if (
        !cmd.includes("create") &&
        !cmd.includes("init") &&
        !cmd.includes("clone") &&
        !cmd.includes("install")
      ) {
        result.warnings.push(
          "First step should typically initialize the project"
        );
      }
    }

    const initStepIndex = steps.findIndex(
      (step) =>
        step.type === "command" &&
        step.command &&
        (step.command.includes("create-next-app") ||
          step.command.includes("create-react-app") ||
          step.command.includes("npm init") ||
          step.command.includes("pnpm init"))
    );

    if (initStepIndex > 0) {
      const earlyFileOps = steps.slice(0, initStepIndex).some(
        (step) => step.type === "file_write" || step.type === "file_delete"
      );
      if (earlyFileOps) {
        result.warnings.push(
          "File operations found before project initialization"
        );
      }
    }

    const filePaths = steps
      .filter((step) => step.type === "file_write" || step.type === "file_delete")
      .map((step) => step.path);

    const duplicates = filePaths.filter(
      (path, index) => filePaths.indexOf(path) !== index
    );

    if (duplicates.length > 0) {
      result.warnings.push(
        `Duplicate file operations on: ${[...new Set(duplicates)].join(", ")}`
      );
    }

    const installIndex = steps.findIndex(
      (step) =>
        step.type === "command" &&
        step.command &&
        (step.command.includes("npm install") ||
          step.command.includes("pnpm install") ||
          step.command.includes("yarn install"))
    );

    const buildIndex = steps.findIndex(
      (step) =>
        step.type === "command" &&
        step.command &&
        (step.command.includes("npm run build") ||
          step.command.includes("pnpm build") ||
          step.command.includes("yarn build"))
    );

    if (buildIndex !== -1 && installIndex !== -1 && buildIndex < installIndex) {
      result.warnings.push("Build step found before dependency installation");
    }
  }
}

export const planValidator = new PlanValidator();
