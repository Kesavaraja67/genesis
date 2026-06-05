// lib/config/sanitizer.ts
// Injects defaults for all optional fields after successful validation

import type {
  GenesisConfig,
  ThemeConfig,
  ModelConfig,
  FieldConfig,
  PageConfig,
  ComponentConfig,
  WorkflowConfig,
  WorkflowStepConfig,
} from "./types";

const DEFAULT_THEME: Required<ThemeConfig> = {
  primaryColor: "#7c3aed",
  backgroundColor: "#0a0a0f",
  fontFamily: "Space Grotesk",
  darkMode: true,
  borderRadius: "md",
};

export function sanitizeConfig(config: GenesisConfig): GenesisConfig {
  const sanitized: GenesisConfig = JSON.parse(JSON.stringify(config));

  // version
  if (!sanitized.version) sanitized.version = "1.0";

  // theme — merge with defaults, preserving partial overrides
  sanitized.theme = {
    ...DEFAULT_THEME,
    ...(sanitized.theme ?? {}),
  };

  // auth
  if (!sanitized.auth) {
    sanitized.auth = { required: false };
  }
  if (!sanitized.auth.providers) {
    sanitized.auth.providers = ["credentials"];
  }
  if (!sanitized.auth.redirectAfterLogin) {
    sanitized.auth.redirectAfterLogin = "/";
  }
  if (!sanitized.auth.redirectAfterLogout) {
    sanitized.auth.redirectAfterLogout = "/login";
  }

  // models
  sanitized.models = sanitized.models.map((model: ModelConfig) => {
    const sanitizedModel: ModelConfig = {
      ...model,
      label: model.label ?? model.name,
      timestamps: model.timestamps ?? true,
      softDelete: model.softDelete ?? false,
      searchable: model.searchable ?? [],
      sortable: model.sortable ?? ["createdAt"],
      fields: model.fields.map((field: FieldConfig) => ({
        ...field,
        label: field.label ?? field.name,
        required: field.required ?? false,
        unique: field.unique ?? false,
        hidden: field.hidden ?? false,
        default: field.default ?? null,
        validation: field.validation ?? [],
      })),
    };
    return sanitizedModel;
  });

  // pages
  sanitized.pages = sanitized.pages.map((page: PageConfig) => ({
    ...page,
    auth: page.auth ?? false,
    title: page.title ?? page.name,
    components: sanitizeComponents(page.components ?? []),
  }));

  // workflows
  if (sanitized.workflows) {
    sanitized.workflows = sanitized.workflows.map((wf: WorkflowConfig) => ({
      ...wf,
      isActive: wf.isActive ?? false,
      steps: wf.steps.map((step: WorkflowStepConfig) => ({
        ...step,
        onFailure: step.onFailure ?? "__end__",
      })),
    }));
  } else {
    sanitized.workflows = [];
  }

  return sanitized;
}

function sanitizeComponents(components: ComponentConfig[]): ComponentConfig[] {
  return components.map((comp: ComponentConfig) => ({
    ...comp,
    props: comp.props ?? {},
    children: sanitizeComponents(comp.children ?? []),
    actions: comp.actions ?? [],
  }));
}
