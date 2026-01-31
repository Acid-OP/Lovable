import { Plan, PlanStep } from "../planner/types.js";

export interface UIValidationResult {
  warnings: string[];
  suggestions: string[];
}

export class FrontendValidator {
  validate(plan: Plan): UIValidationResult {
    const result: UIValidationResult = {
      warnings: [],
      suggestions: [],
    };

    const fileSteps = plan.steps.filter((step) => step.type === "file_write");

    this.checkResponsiveDesign(fileSteps, result);
    this.checkAccessibility(fileSteps, result);
    this.checkComponentStructure(fileSteps, result);
    this.checkStyling(fileSteps, result);
    this.checkTypeScript(fileSteps, result);

    return result;
  }

  private checkResponsiveDesign(
    steps: PlanStep[],
    result: UIValidationResult,
  ): void {
    const allContent = steps.map((s) => s.content || "").join("\n");

    // Check for responsive breakpoints
    const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:|2xl:)\w+/.test(allContent);
    if (!hasResponsiveClasses) {
      result.warnings.push(
        "No responsive Tailwind breakpoints detected - consider adding mobile-first responsive design (sm:, md:, lg:)",
      );
    }

    // Check for fixed widths instead of responsive containers
    if (/w-\[\d+px\]/.test(allContent) || /width:\s*\d+px/.test(allContent)) {
      result.suggestions.push(
        "Consider using responsive width classes (max-w-xl, max-w-4xl) instead of fixed pixel widths",
      );
    }

    // Check for responsive padding/margin
    const hasMobilePadding = /\bp-\d+\b/.test(allContent);
    const hasResponsivePadding = /\b(sm:p-|md:p-|lg:p-)\d+/.test(allContent);
    if (hasMobilePadding && !hasResponsivePadding) {
      result.suggestions.push(
        "Consider adding responsive padding/margin for better mobile experience (p-4 sm:p-8)",
      );
    }
  }

  private checkAccessibility(
    steps: PlanStep[],
    result: UIValidationResult,
  ): void {
    const componentFiles = steps.filter(
      (s) => s.path?.endsWith(".tsx") && s.content,
    );

    for (const file of componentFiles) {
      const content = file.content || "";
      const fileName = file.path?.split("/").pop() || "";

      // Check for aria attributes
      const hasInteractiveElements = /<button|<input|<a\s|<select/.test(
        content,
      );
      const hasAriaAttributes = /aria-\w+/.test(content);

      if (hasInteractiveElements && !hasAriaAttributes) {
        result.warnings.push(
          `${fileName}: Interactive elements found without ARIA attributes - add aria-label for better accessibility`,
        );
      }

      // Check for images without alt text
      const hasImages = /<img|<Image/.test(content);
      const hasAltAttributes = /alt=/.test(content);

      if (hasImages && !hasAltAttributes) {
        result.warnings.push(
          `${fileName}: Images found without alt attributes - add descriptive alt text`,
        );
      }

      // Check for form inputs without labels
      if (/<input/.test(content)) {
        const hasLabels = /<label/.test(content) || /aria-label/.test(content);
        if (!hasLabels) {
          result.suggestions.push(
            `${fileName}: Form inputs should have associated labels or aria-label attributes`,
          );
        }
      }

      // Check for semantic HTML
      const hasSemanticTags =
        /<(header|nav|main|section|article|footer|aside)/.test(content);
      const hasOnlyDivs = /<div/.test(content) && !hasSemanticTags;

      if (hasOnlyDivs && content.includes("return")) {
        result.suggestions.push(
          `${fileName}: Consider using semantic HTML tags (header, nav, main, section) instead of only divs`,
        );
      }
    }
  }

  private checkComponentStructure(
    steps: PlanStep[],
    result: UIValidationResult,
  ): void {
    const componentFiles = steps.filter(
      (s) => s.path?.endsWith(".tsx") && s.content,
    );

    for (const file of componentFiles) {
      const content = file.content || "";
      const fileName = file.path?.split("/").pop() || "";

      // Check for inline event handlers with complex logic
      if (/onClick=\{.*=>.{50,}\}/.test(content)) {
        result.suggestions.push(
          `${fileName}: Consider extracting complex inline event handlers into separate functions`,
        );
      }

      // Check for missing 'use client' directive
      const hasClientFeatures =
        /useState|useEffect|useRouter|onClick|onChange/.test(content);
      const hasUseClient = /['"]use client['"]/.test(content);

      if (hasClientFeatures && !hasUseClient) {
        result.warnings.push(
          `${fileName}: Component uses client-side features but missing 'use client' directive`,
        );
      }

      // Check for proper component naming
      const exportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
      if (exportMatch?.[1]) {
        const componentName = exportMatch[1];
        const firstChar = componentName[0];
        if (firstChar && firstChar === firstChar.toLowerCase()) {
          result.warnings.push(
            `${fileName}: Component name "${componentName}" should start with uppercase letter`,
          );
        }
      }

      // Check for large components (potential refactoring needed)
      const lines = content.split("\n").length;
      if (lines > 200) {
        result.suggestions.push(
          `${fileName}: Large component (${lines} lines) - consider breaking into smaller, reusable components`,
        );
      }
    }
  }

  private checkStyling(steps: PlanStep[], result: UIValidationResult): void {
    const allContent = steps.map((s) => s.content || "").join("\n");

    // Check for inline styles
    if (/style=\{\{/.test(allContent)) {
      result.warnings.push(
        "Inline styles detected - prefer Tailwind utility classes for consistency",
      );
    }

    // Check for magic numbers in styles
    if (/style.*:\s*\d+px/.test(allContent)) {
      result.suggestions.push(
        "Hard-coded pixel values found - use Tailwind spacing scale (p-4, gap-6) for consistency",
      );
    }

    // Check for consistent spacing
    const hasInconsistentSpacing = /\b(p-\d+|m-\d+|gap-\d+)/.test(allContent);
    if (hasInconsistentSpacing) {
      const spacingValues = allContent.match(/\b(p|m|gap)-(\d+)/g) || [];
      const uniqueValues = new Set(spacingValues.map((v) => v.split("-")[1]));
      if (uniqueValues.size > 6) {
        result.suggestions.push(
          "Consider using a consistent spacing scale - too many different spacing values detected",
        );
      }
    }

    // Check for color usage
    const hasCustomColors = /#[0-9A-Fa-f]{6}/.test(allContent);
    if (hasCustomColors) {
      result.suggestions.push(
        "Custom hex colors detected - consider using Tailwind color palette for consistency (bg-gray-100, text-blue-600)",
      );
    }

    // Check for transitions
    const hasInteractive = /hover:/.test(allContent);
    const hasTransitions = /transition/.test(allContent);
    if (hasInteractive && !hasTransitions) {
      result.suggestions.push(
        "Interactive elements with hover states detected - add transitions for smooth UX (transition-colors, transition-all)",
      );
    }
  }

  private checkTypeScript(steps: PlanStep[], result: UIValidationResult): void {
    const tsxFiles = steps.filter((s) => s.path?.endsWith(".tsx") && s.content);

    for (const file of tsxFiles) {
      const content = file.content || "";
      const fileName = file.path?.split("/").pop() || "";

      // Check for proper TypeScript types
      const hasFunctionParams = /function\s+\w+\([^)]+\)/.test(content);
      const hasTypedParams =
        /:\s*(string|number|boolean|React\.ReactNode|\w+\[\])/.test(content);

      if (hasFunctionParams && !hasTypedParams) {
        result.warnings.push(
          `${fileName}: Function parameters without type annotations - add TypeScript types for better type safety`,
        );
      }

      // Check for 'any' type usage
      if (/:\s*any\b/.test(content)) {
        result.warnings.push(
          `${fileName}: 'any' type detected - consider using specific types for better type safety`,
        );
      }

      // Check for proper props interface
      const hasProps = /\{\s*\w+[\s,]/.test(content) && /\(\{/.test(content);
      const hasPropsInterface =
        /interface\s+\w+Props/.test(content) || /type\s+\w+Props/.test(content);

      if (hasProps && !hasPropsInterface) {
        result.suggestions.push(
          `${fileName}: Component accepts props - define a Props interface or type for better documentation`,
        );
      }

      // Check for useState without type parameter
      if (/useState\(/.test(content)) {
        const hasTypedState = /useState<\w+>/.test(content);
        if (!hasTypedState) {
          result.suggestions.push(
            `${fileName}: useState hooks without type parameters - add types for better type safety (useState<string>)`,
          );
        }
      }
    }
  }
}

export const frontendValidator = new FrontendValidator();
