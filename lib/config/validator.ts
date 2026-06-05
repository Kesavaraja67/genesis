// lib/config/validator.ts
// Three-pass config validator returning ValidationResult

import type {
  GenesisConfig,
  ModelConfig,
  FieldConfig,
  FieldType,
  ComponentType,
  LayoutType,
  ValidationResult,
  ValidationIssue,
  WorkflowStepConfig,
} from "./types";

const VALID_FIELD_TYPES: FieldType[] = [
  "text", "textarea", "number", "boolean", "date", "datetime",
  "email", "url", "select", "multiselect", "file", "image",
  "relation", "json", "richtext",
];

const VALID_COMPONENT_TYPES: ComponentType[] = [
  "form", "table", "card", "dashboard", "chart", "kanban",
  "modal", "nav", "sidebar", "header", "stats", "list",
  "detail", "empty", "custom",
];

const VALID_LAYOUT_TYPES: LayoutType[] = [
  "single-column", "two-column", "sidebar-main", "grid", "full-width",
];

const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

export function validateConfig(rawConfig: unknown): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const infos: ValidationIssue[] = [];

  // Deep clone to avoid mutating input
  let config: GenesisConfig;
  try {
    config = JSON.parse(JSON.stringify(rawConfig)) as GenesisConfig;
  } catch {
    return {
      valid: false,
      errors: [{ path: "root", message: "Config is not valid JSON", code: "INVALID_JSON" }],
      warnings: [],
      infos: [],
      sanitizedConfig: null,
    };
  }

  // ─── PASS 1: Structural Validation ────────────────────────────────────────

  // name
  if (!config.name || typeof config.name !== "string" || config.name.trim() === "") {
    errors.push({ path: "name", message: "App name is required", code: "MISSING_NAME" });
  }

  // models
  if (!Array.isArray(config.models) || config.models.length === 0) {
    errors.push({ path: "models", message: "At least one model is required", code: "MISSING_MODELS" });
  } else {
    config.models.forEach((model: ModelConfig, mi: number) => {
      const mPath = `models[${mi}]`;

      if (!model.name || typeof model.name !== "string") {
        errors.push({ path: `${mPath}.name`, message: "Model name is required", code: "MISSING_MODEL_NAME" });
      } else if (!PASCAL_CASE_REGEX.test(model.name)) {
        errors.push({ path: `${mPath}.name`, message: `Model name "${model.name}" must be PascalCase`, code: "INVALID_MODEL_NAME" });
      }

      if (!Array.isArray(model.fields) || model.fields.length === 0) {
        errors.push({ path: `${mPath}.fields`, message: `Model "${model.name}" must have at least one field`, code: "MISSING_FIELDS" });
      } else {
        model.fields.forEach((field: FieldConfig, fi: number) => {
          const fPath = `${mPath}.fields[${fi}]`;
          if (!field.name || typeof field.name !== "string") {
            errors.push({ path: `${fPath}.name`, message: "Field name is required", code: "MISSING_FIELD_NAME" });
          }
          if (!field.type) {
            errors.push({ path: `${fPath}.type`, message: `Field "${field.name}" missing type`, code: "MISSING_FIELD_TYPE" });
          } else if (!VALID_FIELD_TYPES.includes(field.type)) {
            warnings.push({ path: `${fPath}.type`, message: `Unknown field type "${field.type}" — will be coerced to "text"`, code: "UNKNOWN_FIELD_TYPE" });
          }
          // Relation fields must reference an existing model
          if (field.type === "relation" && field.relation) {
            const targetModel = config.models?.find((m: ModelConfig) => m.name === field.relation!.model);
            if (!targetModel) {
              errors.push({ path: `${fPath}.relation.model`, message: `Relation target "${field.relation.model}" not found in models`, code: "INVALID_RELATION_TARGET" });
            }
          }
        });
      }
    });
  }

  // pages
  if (!Array.isArray(config.pages) || config.pages.length === 0) {
    errors.push({ path: "pages", message: "At least one page is required", code: "MISSING_PAGES" });
  } else {
    config.pages.forEach((page, pi) => {
      const pPath = `pages[${pi}]`;
      if (!page.layout || !VALID_LAYOUT_TYPES.includes(page.layout)) {
        errors.push({ path: `${pPath}.layout`, message: `Invalid layout "${page.layout}"`, code: "INVALID_LAYOUT" });
      }
      if (Array.isArray(page.components)) {
        page.components.forEach((comp, ci) => {
          const cPath = `${pPath}.components[${ci}]`;
          if (!comp.type) {
            errors.push({ path: `${cPath}.type`, message: "Component type is required", code: "MISSING_COMPONENT_TYPE" });
          } else if (!VALID_COMPONENT_TYPES.includes(comp.type)) {
            warnings.push({ path: `${cPath}.type`, message: `Unknown component type "${comp.type}" — will render as custom`, code: "UNKNOWN_COMPONENT_TYPE" });
          }
        });
      }
    });
  }

  // workflows: validate step onSuccess / onFailure references
  if (Array.isArray(config.workflows)) {
    config.workflows.forEach((wf, wi) => {
      const wPath = `workflows[${wi}]`;
      if (Array.isArray(wf.steps)) {
        const stepIds = new Set(wf.steps.map((s: WorkflowStepConfig) => s.id));
        wf.steps.forEach((step: WorkflowStepConfig, si: number) => {
          const sPath = `${wPath}.steps[${si}]`;
          if (step.onSuccess && step.onSuccess !== "__end__" && !stepIds.has(step.onSuccess)) {
            errors.push({ path: `${sPath}.onSuccess`, message: `Step onSuccess "${step.onSuccess}" not found`, code: "INVALID_STEP_REFERENCE" });
          }
          if (step.onFailure && step.onFailure !== "__end__" && !stepIds.has(step.onFailure)) {
            errors.push({ path: `${sPath}.onFailure`, message: `Step onFailure "${step.onFailure}" not found`, code: "INVALID_STEP_REFERENCE" });
          }
        });
        if (wf.steps.length > 20) {
          errors.push({ path: `${wPath}.steps`, message: "Workflow cannot exceed 20 steps", code: "TOO_MANY_STEPS" });
        }
      }
    });
  }

  // ─── PASS 2: Cross-Reference Validation ────────────────────────────────────
  const modelNames = new Set((config.models ?? []).map((m: ModelConfig) => m.name));
  const pagePaths = new Set((config.pages ?? []).map((p) => p.path));

  if (Array.isArray(config.pages)) {
    config.pages.forEach((page, pi) => {
      if (Array.isArray(page.components)) {
        page.components.forEach((comp, ci) => {
          const cPath = `pages[${pi}].components[${ci}]`;
          if (comp.model && !modelNames.has(comp.model)) {
            errors.push({ path: `${cPath}.model`, message: `Component references unknown model "${comp.model}"`, code: "INVALID_MODEL_REFERENCE" });
          }
          if (comp.model && comp.fields) {
            const model = config.models?.find((m: ModelConfig) => m.name === comp.model);
            if (model) {
              const fieldNames = new Set(model.fields.map((f: FieldConfig) => f.name));
              comp.fields.forEach((f: string) => {
                if (!fieldNames.has(f)) {
                  warnings.push({ path: `${cPath}.fields`, message: `Field "${f}" not found on model "${comp.model}"`, code: "UNKNOWN_FIELD_REFERENCE" });
                }
              });
            }
          }
        });
      }
    });
  }

  if (Array.isArray(config.workflows)) {
    config.workflows.forEach((wf, wi) => {
      if (wf.trigger?.model && !modelNames.has(wf.trigger.model)) {
        warnings.push({ path: `workflows[${wi}].trigger.model`, message: `Trigger references unknown model "${wf.trigger.model}"`, code: "INVALID_TRIGGER_MODEL" });
      }
    });
  }

  if (config.navigation?.items) {
    config.navigation.items.forEach((item, ii) => {
      if (!pagePaths.has(item.path)) {
        warnings.push({ path: `navigation.items[${ii}].path`, message: `Nav item path "${item.path}" has no matching page`, code: "UNMATCHED_NAV_PATH" });
      }
    });
  }

  // ─── PASS 3: Type Coercion and Warning Generation ──────────────────────────
  if (!config.version) {
    config.version = "1.0";
    warnings.push({ path: "version", message: "version missing — defaulted to \"1.0\"", code: "MISSING_VERSION" });
  }

  if (!config.theme) {
    infos.push({ path: "theme", message: "theme missing — defaults applied", code: "DEFAULT_THEME" });
  }

  if (!config.auth) {
    infos.push({ path: "auth", message: "auth missing — defaulting to { required: false }", code: "DEFAULT_AUTH" });
  }

  if (Array.isArray(config.models)) {
    config.models.forEach((model: ModelConfig, mi: number) => {
      if (model.timestamps === undefined) {
        infos.push({ path: `models[${mi}].timestamps`, message: `Model "${model.name}" timestamps defaulted to true`, code: "DEFAULT_TIMESTAMPS" });
      }
      model.fields?.forEach((field: FieldConfig, fi: number) => {
        if (!VALID_FIELD_TYPES.includes(field.type)) {
          config.models[mi].fields[fi].type = "text";
        }
        if (field.required && field.default === undefined && !field.placeholder) {
          warnings.push({ path: `models[${mi}].fields[${fi}]`, message: `Required field "${field.name}" has no default or placeholder`, code: "REQUIRED_NO_DEFAULT" });
        }
      });
    });
  }

  if (Array.isArray(config.pages)) {
    config.pages.forEach((page, pi) => {
      if (Array.isArray(page.components)) {
        page.components.forEach((comp, ci) => {
          if (!VALID_COMPONENT_TYPES.includes(comp.type)) {
            config.pages[pi].components[ci].type = "custom";
          }
        });
      }
    });
  }

  const isValid = errors.length === 0;

  return {
    valid: isValid,
    errors,
    warnings,
    infos,
    sanitizedConfig: isValid ? config : null,
  };
}
