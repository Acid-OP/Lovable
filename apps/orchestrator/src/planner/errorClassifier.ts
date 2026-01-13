export enum ErrorType {
  DEPENDENCY = 'dependency',    
  IMPORT = 'import',             
  SYNTAX = 'syntax',    
  TYPE = 'type',           
  RUNTIME = 'runtime',           
  CONFIG = 'config',             
  UNKNOWN = 'unknown',          
}

export interface ClassifiedError {
  type: ErrorType;
  originalError: string;
  filePath?: string;
  details: ErrorDetails;
}

export interface ErrorDetails {
  // For DEPENDENCY errors
  missingPackage?: string;

  // For IMPORT errors
  importPath?: string;
  importedItems?: string[];

  // For SYNTAX errors
  syntaxIssue?: string;
  line?: number;
  column?: number;

  // For TYPE errors
  typeError?: string;
  expectedType?: string;
  actualType?: string;

  // General
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const ERROR_PATTERNS = {
  dependency: [
    /Cannot find module ['"]([^'"]+)['"]/i,
    /Module not found: Can't resolve ['"]([^'"]+)['"]/i,
    /Cannot resolve module ['"]([^'"]+)['"]/i,
    /Error: Cannot find package ['"]([^'"]+)['"]/i,
    /ERR_MODULE_NOT_FOUND.*['"]([^'"]+)['"]/i,
    /Could not resolve ['"]([^'"]+)['"]/i,
  ],

  import: [
    /import.*=>/,  // Wrong arrow syntax in import
    /import.*from\s*$/i,  // Missing import path
    /export.*=>/,  // Wrong arrow syntax in export
    /Unexpected token.*import/i,
    /Invalid or unexpected token.*import/i,
    /SyntaxError.*import/i,
  ],

  syntax: [
    /SyntaxError:/i,
    /Unexpected token/i,
    /Invalid or unexpected token/i,
    /Unterminated string/i,
    /Unterminated template/i,
    /Missing semicolon/i,
    /Unexpected end of input/i,
    /Unexpected identifier/i,
    /Unclosed JSX tag/i,
  ],

  type: [
    /Type ['"].*['"] is not assignable to type/i,
    /Property ['"].*['"] does not exist on type/i,
    /Cannot find name ['"].*['"]/i,
    /Type ['"].*['"] has no properties in common/i,
    /Argument of type ['"].*['"] is not assignable/i,
    /Object is possibly ['"].*['"]/i,
    /TS\d{4}:/,  // TypeScript error codes
  ],

  config: [
    /Cannot find tsconfig/i,
    /Invalid configuration/i,
    /Failed to load config/i,
    /next\.config/i,
    /tailwind\.config/i,
  ],
};

export function classifyError(errorMessage: string, filePath?: string): ClassifiedError {
  const trimmedError = errorMessage.trim();

  // Check for dependency errors
  for (const pattern of ERROR_PATTERNS.dependency) {
    const match = trimmedError.match(pattern);
    if (match) {
      const packageName = match[1];
      return {
        type: ErrorType.DEPENDENCY,
        originalError: errorMessage,
        filePath,
        details: {
          missingPackage: packageName,
          message: `Missing package: ${packageName}`,
          severity: 'critical',
        },
      };
    }
  }

  // Check for import errors
  for (const pattern of ERROR_PATTERNS.import) {
    if (pattern.test(trimmedError)) {
      return {
        type: ErrorType.IMPORT,
        originalError: errorMessage,
        filePath,
        details: {
          message: 'Import/export syntax error',
          severity: 'critical',
        },
      };
    }
  }

  // Check for syntax errors
  for (const pattern of ERROR_PATTERNS.syntax) {
    if (pattern.test(trimmedError)) {
      const lineMatch = trimmedError.match(/:(\d+):(\d+)/);
      return {
        type: ErrorType.SYNTAX,
        originalError: errorMessage,
        filePath,
        details: {
          syntaxIssue: trimmedError.split('\n')[0],
          line: lineMatch && lineMatch[1] ? parseInt(lineMatch[1]) : undefined,
          column: lineMatch && lineMatch[2] ? parseInt(lineMatch[2]) : undefined,
          message: 'Syntax error',
          severity: 'critical',
        },
      };
    }
  }

  // Check for type errors
  for (const pattern of ERROR_PATTERNS.type) {
    if (pattern.test(trimmedError)) {
      return {
        type: ErrorType.TYPE,
        originalError: errorMessage,
        filePath,
        details: {
          typeError: trimmedError,
          message: 'Type error',
          severity: 'high',
        },
      };
    }
  }

  // Check for config errors
  for (const pattern of ERROR_PATTERNS.config) {
    if (pattern.test(trimmedError)) {
      return {
        type: ErrorType.CONFIG,
        originalError: errorMessage,
        filePath,
        details: {
          message: 'Configuration error',
          severity: 'critical',
        },
      };
    }
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    originalError: errorMessage,
    filePath,
    details: {
      message: 'Unclassified error',
      severity: 'medium',
    },
  };
}

export function classifyBuildErrors(
  errorMap: Map<string, string>
): ClassifiedError[] {
  const classified: ClassifiedError[] = [];

  for (const [filePath, errorMessage] of errorMap.entries()) {
    if (filePath && errorMessage) {
      const classifiedError = classifyError(errorMessage, filePath);
      classified.push(classifiedError);
    }
  }

  return classified;
}

export function groupErrorsByType(
  errors: ClassifiedError[]
): Map<ErrorType, ClassifiedError[]> {
  const grouped = new Map<ErrorType, ClassifiedError[]>();

  for (const error of errors) {
    const existing = grouped.get(error.type) || [];
    existing.push(error);
    grouped.set(error.type, existing);
  }

  return grouped;
}

export function extractMissingPackages(errors: ClassifiedError[]): string[] {
  const packages = new Set<string>();

  for (const error of errors) {
    if (error.type === ErrorType.DEPENDENCY && error.details.missingPackage) {
      packages.add(error.details.missingPackage);
    }
  }

  return Array.from(packages);
}

export function requiresLLMFix(errorType: ErrorType): boolean {
  switch (errorType) {
    case ErrorType.DEPENDENCY:
      return false;  // Auto-install
    case ErrorType.CONFIG:
      return false;  // Should abort instead
    case ErrorType.IMPORT:
    case ErrorType.SYNTAX:
    case ErrorType.TYPE:
    case ErrorType.UNKNOWN:
      return true;  // Send to Gemini
    default:
      return true;
  }
}
