// lib/config/types.ts
// Canonical TypeScript types for the Genesis config system

export interface GenesisConfig {
  version: string;
  name: string;
  description?: string;
  theme?: ThemeConfig;
  models: ModelConfig[];
  pages: PageConfig[];
  workflows?: WorkflowConfig[];
  auth?: AuthConfig;
  navigation?: NavigationConfig;
}

export interface ThemeConfig {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  darkMode?: boolean;
  borderRadius?: "none" | "sm" | "md" | "lg";
}

export interface ModelConfig {
  name: string;
  label?: string;
  fields: FieldConfig[];
  timestamps?: boolean;
  softDelete?: boolean;
  searchable?: string[];
  sortable?: string[];
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  relation?: RelationConfig;
  validation?: ValidationRule[];
  hidden?: boolean;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "select"
  | "multiselect"
  | "file"
  | "image"
  | "relation"
  | "json"
  | "richtext";

export interface RelationConfig {
  model: string;
  type: "hasOne" | "hasMany" | "belongsTo";
  foreignKey?: string;
}

export interface ValidationRule {
  type: "min" | "max" | "regex" | "custom";
  value: unknown;
  message: string;
}

export interface PageConfig {
  id: string;
  name: string;
  path: string;
  layout: LayoutType;
  components: ComponentConfig[];
  auth?: boolean;
  title?: string;
}

export type LayoutType =
  | "single-column"
  | "two-column"
  | "sidebar-main"
  | "grid"
  | "full-width";

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  model?: string;
  fields?: string[];
  title?: string;
  props?: Record<string, unknown>;
  style?: StyleOverride;
  children?: ComponentConfig[];
  condition?: ConditionConfig;
  actions?: ActionConfig[];
}

export type ComponentType =
  | "form"
  | "table"
  | "card"
  | "dashboard"
  | "chart"
  | "kanban"
  | "modal"
  | "nav"
  | "sidebar"
  | "header"
  | "stats"
  | "list"
  | "detail"
  | "empty"
  | "custom";

export interface StyleOverride {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  background?: string;
  color?: string;
}

export interface ConditionConfig {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "exists" | "notExists";
  value?: unknown;
}

export interface ActionConfig {
  id: string;
  label: string;
  type: "submit" | "navigate" | "delete" | "custom" | "workflow";
  target?: string;
  confirm?: string;
  style?: "primary" | "secondary" | "danger" | "ghost";
}

export interface NavigationConfig {
  type: "topbar" | "sidebar";
  brand?: string;
  logo?: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  auth?: boolean;
}

export interface AuthConfig {
  required: boolean;
  providers?: ("credentials" | "google" | "github")[];
  redirectAfterLogin?: string;
  redirectAfterLogout?: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  trigger: WorkflowTriggerConfig;
  steps: WorkflowStepConfig[];
  isActive?: boolean;
}

export interface WorkflowTriggerConfig {
  type:
    | "manual"
    | "onRecordCreate"
    | "onRecordUpdate"
    | "onRecordDelete"
    | "scheduled"
    | "onFormSubmit";
  model?: string;
  schedule?: string;
  formId?: string;
}

export interface WorkflowStepConfig {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: Record<string, unknown>;
  onSuccess?: string;
  onFailure?: string;
}

export type WorkflowStepType =
  | "sendEmail"
  | "createRecord"
  | "updateRecord"
  | "deleteRecord"
  | "httpRequest"
  | "condition"
  | "delay"
  | "log"
  | "transformData";

// Normalized internal types (post-processing)
export interface NormalizedField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  default: unknown;
  hidden: boolean;
  prismaType: string;
  zodType: string;
  htmlInputType: string;
  options?: string[];
  relation?: RelationConfig;
  validation?: ValidationRule[];
}

// Validation system types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  infos: ValidationIssue[];
  sanitizedConfig: GenesisConfig | null;
}

export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
}

// Convenience aliases — UIComponent is the canonical name used in runtime renderers
export type UIComponent = ComponentConfig;
export type UILayout = PageConfig;
