// lib/config/parser.ts
// Orchestrates parse → validate → sanitize pipeline

import { validateConfig } from "./validator";
import { sanitizeConfig } from "./sanitizer";
import type { ValidationResult } from "./types";

export function parseConfig(input: unknown): ValidationResult {
  let parsed: unknown = input;

  // If input is a string, try to parse as JSON
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return {
        valid: false,
        errors: [{ path: "root", message: "Input is not valid JSON", code: "INVALID_JSON" }],
        warnings: [],
        infos: [],
        sanitizedConfig: null,
      };
    }
  }

  // Validate
  const result = validateConfig(parsed);

  // Sanitize only if valid
  if (result.valid && result.sanitizedConfig) {
    result.sanitizedConfig = sanitizeConfig(result.sanitizedConfig);
  }

  return result;
}
