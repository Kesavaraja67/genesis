// lib/runtime/dataValidator.ts
// Generates Zod schemas from NormalizedField[] and validates payloads

import { z, ZodTypeAny } from "zod";
import type { NormalizedField } from "../config/types";

function buildZodField(field: NormalizedField): ZodTypeAny {
  let schema: ZodTypeAny;

  switch (field.type) {
    case "number":
      schema = z.coerce.number();
      if (field.validation) {
        for (const rule of field.validation) {
          if (rule.type === "min") schema = (schema as z.ZodNumber).min(Number(rule.value), rule.message);
          if (rule.type === "max") schema = (schema as z.ZodNumber).max(Number(rule.value), rule.message);
        }
      }
      break;

    case "boolean":
      schema = z.boolean();
      break;

    case "email":
      schema = z.string().email("Invalid email address");
      break;

    case "url":
    case "file":
    case "image":
      schema = z.string().min(1, "URL is required");
      break;

    case "date":
    case "datetime":
      schema = z.string().min(1, "Date is required");
      break;

    case "select":
      if (field.options && field.options.length > 0) {
        schema = z.enum(field.options as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;

    case "multiselect":
      schema = z.array(z.string());
      break;

    case "json":
      schema = z.record(z.string(), z.unknown()).or(z.array(z.unknown()));
      break;

    default:
      schema = z.string();
      if (field.validation) {
        for (const rule of field.validation) {
          if (rule.type === "regex") {
            schema = (schema as z.ZodString).regex(new RegExp(String(rule.value)), rule.message);
          }
        }
      }
  }

  // Apply maxLength for string fields
  if (field.type === "text" || field.type === "textarea" || field.type === "richtext") {
    const maxLength = field.validation?.find(r => r.type === "max");
    if (maxLength) {
      schema = (schema as z.ZodString).max(Number(maxLength.value), maxLength.message);
    }
  }

  // Make optional if not required
  if (!field.required) {
    schema = schema.nullable().optional();
  }

  return schema;
}

export function buildValidationSchema(fields: NormalizedField[]): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.name === "id" || field.name === "createdAt" || field.name === "updatedAt") continue;
    shape[field.name] = buildZodField(field);
  }
  return z.object(shape);
}

export interface ValidationError {
  field: string;
  messages: string[];
}

export function validatePayload(
  fields: NormalizedField[],
  data: unknown,
  partial = false
): { success: true; data: Record<string, unknown> } | { success: false; errors: ValidationError[] } {
  const schema = buildValidationSchema(fields);
  const finalSchema = partial ? schema.partial() : schema;

  const result = finalSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as Record<string, unknown> };
  }

  const errors: ValidationError[] = [];
  for (const [field, issues] of Object.entries(result.error.flatten().fieldErrors)) {
    errors.push({ field, messages: issues ?? [] });
  }

  return { success: false, errors };
}
