import { SanitizationResult, RiskLevel } from "../types.js";

const SANITIZATION_CONFIG = {
  minLength: 5,
  maxLength: 5000,
  strictMode: true,
  enableLogging: true,
};

export async function sanitizePrompt(prompt: string): Promise<SanitizationResult> {
  const warnings: string[] = [];
  let riskLevel: RiskLevel = "low";

  if (!prompt || typeof prompt !== "string") {
    return {
      isValid: false,
      sanitizedPrompt: "",
      originalPrompt: prompt,
      warnings: ["Invalid input type"],
      rejectionReason: "Prompt is empty or not a string",
      riskLevel: "low",
    };
  }

  // Normalize whitespace
  let sanitized = prompt.trim().replace(/\s+/g, " ");
  const originalPrompt = sanitized;

  // Length validation
  if (sanitized.length < SANITIZATION_CONFIG.minLength) {
    return {
      isValid: false,
      sanitizedPrompt: "",
      originalPrompt,
      warnings: [`Too short: ${sanitized.length} chars`],
      rejectionReason: `Prompt must be at least ${SANITIZATION_CONFIG.minLength} characters`,
      riskLevel: "low",
    };
  }

  if (sanitized.length > SANITIZATION_CONFIG.maxLength) {
    warnings.push(
      `Truncated from ${sanitized.length} to ${SANITIZATION_CONFIG.maxLength} chars`
    );
    sanitized = sanitized.substring(0, SANITIZATION_CONFIG.maxLength);
  }

  const dangerousCommands = [
    /\b(rm|delete|sudo|chmod|chown|kill|shutdown|reboot|format)\b/gi,
    /\b(unlink|rmdir|fdisk|mkfs|dd)\b/gi,
  ];

  dangerousCommands.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      warnings.push("Dangerous system command detected");
      sanitized = sanitized.replace(pattern, "[FILTERED]");
      riskLevel = "high";
    }
  });

  const injectionPatterns = [
    /(;|\||&&|`|\$\(|\$\{)/g, // Shell injection
    /(\bDROP\b|\bDELETE\b|\bTRUNCATE\b).*\b(TABLE|DATABASE)\b/gi, // SQL
    /<script[^>]*>.*?<\/script>/gis, // XSS
    /javascript:/gi,
    /on(load|error|click|mouse\w+)\s*=/gi,
  ];

  injectionPatterns.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      warnings.push("Code injection pattern detected");
      sanitized = sanitized.replace(pattern, "");
      riskLevel = riskLevel === "low" ? "medium" : "high";
    }
  });

  const promptInjection = [
    /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|commands?)/gi,
    /disregard\s+(previous|all|above)\s+(instructions?|prompts?)/gi,
    /you\s+are\s+now/gi,
    /new\s+(instructions?|rules?|prompts?)/gi,
    /forget\s+(everything|all|previous)/gi,
    /system\s*:\s*/gi,
    /\[INST\]/gi, 
    /\<\|im_start\|\>/gi, 
  ];

  promptInjection.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      warnings.push("Prompt injection attempt detected");
      sanitized = sanitized.replace(pattern, "[FILTERED]");
      riskLevel = "high";
    }
  });

  const specialCharCount = (sanitized.match(/[^a-zA-Z0-9\s.,!?-]/g) || []).length;
  const specialCharRatio = specialCharCount / sanitized.length;

  if (specialCharRatio > 0.3) {
    warnings.push("Excessive special characters detected");
    riskLevel = riskLevel === "low" ? "medium" : riskLevel;
  }

  const repeatedPattern = /(.)\1{20,}/g;
  if (repeatedPattern.test(sanitized)) {
    warnings.push("Excessive character repetition detected");
    sanitized = sanitized.replace(repeatedPattern, (match: string) =>
      match.charAt(0).repeat(5)
    );
  }

  // URL validation and sanitization
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const urls = sanitized.match(urlPattern);

  if (urls && urls.length > 0) {
    const suspiciousTLDs = [".zip", ".exe", ".scr", ".bat", ".cmd"];

    urls.forEach((url) => {
      try {
        const parsedUrl = new URL(url);

        if (suspiciousTLDs.some((tld) => parsedUrl.hostname.endsWith(tld))) {
          warnings.push(`Suspicious URL detected: ${url}`);
          sanitized = sanitized.replace(url, "[URL_REMOVED]");
          riskLevel = "high";
        }

        // Check for localhost/internal IPs
        if (
          parsedUrl.hostname === "localhost" ||
          /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(parsedUrl.hostname)
        ) {
          warnings.push("Internal/localhost URL detected");
          sanitized = sanitized.replace(url, "[INTERNAL_URL_REMOVED]");
          riskLevel = "medium";
        }
      } catch (e) {
        warnings.push(`Invalid URL format: ${url}`);
      }
    });
  }

  // HTML encoding
  sanitized = sanitized
    .replace(/&(?!amp;|lt;|gt;|quot;|#x27;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const isHighRisk = (riskLevel as string) === "high";
  const meetsMinLength = sanitized.length >= SANITIZATION_CONFIG.minLength;
  const isValid = !isHighRisk && meetsMinLength;

  if (!isValid && isHighRisk) {
    return {
      isValid: false,
      sanitizedPrompt: "",
      originalPrompt,
      warnings,
      rejectionReason: "Prompt contains high-risk patterns and was rejected",
      riskLevel,
    };
  }

  return {
    isValid,
    sanitizedPrompt: sanitized,
    originalPrompt,
    warnings,
    riskLevel,
  };
}

