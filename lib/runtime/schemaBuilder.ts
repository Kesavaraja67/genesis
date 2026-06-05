// lib/runtime/schemaBuilder.ts
// Converts ModelConfig[] → NormalizedField[] for Prisma + frontend rendering

import type { ModelConfig, FieldConfig, FieldType, NormalizedField } from "../config/types";

const FIELD_TYPE_TO_PRISMA: Record<FieldType, string> = {
  text: "String",
  textarea: "String",
  number: "Float",
  boolean: "Boolean",
  date: "DateTime",
  datetime: "DateTime",
  email: "String",
  url: "String",
  select: "String",
  multiselect: "Json",
  file: "String",
  image: "String",
  relation: "String",
  json: "Json",
  richtext: "String",
};

const FIELD_TYPE_TO_ZOD: Record<FieldType, string> = {
  text: "z.string()",
  textarea: "z.string()",
  number: "z.number()",
  boolean: "z.boolean()",
  date: "z.string().datetime()",
  datetime: "z.string().datetime()",
  email: "z.string().email()",
  url: "z.string().url()",
  select: "z.string()",
  multiselect: "z.array(z.string())",
  file: "z.string()",
  image: "z.string()",
  relation: "z.string()",
  json: "z.record(z.unknown())",
  richtext: "z.string()",
};

const FIELD_TYPE_TO_HTML_INPUT: Record<FieldType, string> = {
  text: "text",
  textarea: "textarea",
  number: "number",
  boolean: "checkbox",
  date: "date",
  datetime: "datetime-local",
  email: "email",
  url: "url",
  select: "select",
  multiselect: "select",
  file: "url",
  image: "url",
  relation: "select",
  json: "textarea",
  richtext: "textarea",
};

export function normalizeField(field: FieldConfig): NormalizedField {
  const type = field.type as FieldType;
  return {
    name: field.name,
    label: field.label ?? field.name,
    type,
    required: field.required ?? false,
    unique: field.unique ?? false,
    default: field.default ?? null,
    hidden: field.hidden ?? false,
    prismaType: FIELD_TYPE_TO_PRISMA[type] ?? "String",
    zodType: FIELD_TYPE_TO_ZOD[type] ?? "z.string()",
    htmlInputType: FIELD_TYPE_TO_HTML_INPUT[type] ?? "text",
    options: field.options,
    relation: field.relation,
    validation: field.validation ?? [],
  };
}

export interface NormalizedModel {
  name: string;
  label: string;
  slug: string;
  fields: NormalizedField[];
  timestamps: boolean;
  softDelete: boolean;
  searchable: string[];
  sortable: string[];
}

export function normalizeModel(model: ModelConfig): NormalizedModel {
  const slug = model.name.charAt(0).toLowerCase() + model.name.slice(1);
  return {
    name: model.name,
    label: model.label ?? model.name,
    slug,
    fields: model.fields.map(normalizeField),
    timestamps: model.timestamps ?? true,
    softDelete: model.softDelete ?? false,
    searchable: model.searchable ?? [],
    sortable: model.sortable ?? ["createdAt"],
  };
}

export function buildSchema(models: ModelConfig[]): NormalizedModel[] {
  return models.map(normalizeModel);
}
