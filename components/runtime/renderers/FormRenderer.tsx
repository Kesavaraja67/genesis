"use client";
// components/runtime/renderers/FormRenderer.tsx

import { useReducer, useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import type { ComponentRenderProps } from "../FallbackComponent";

interface FieldMeta {
  name: string;
  label: string;
  type: string;
  required: boolean;
  hidden: boolean;
  options?: string[];
  placeholder?: string;
  default?: unknown;
}

type FormState = Record<string, unknown>;
type FormAction = { field: string; value: unknown };

function formReducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.field]: action.value };
}

export function FormRenderer({ config, appId, onAction }: ComponentRenderProps) {
  const modelName = config.model ?? "";
  const props = config.props as Record<string, unknown> ?? {};
  const defaultValues = (props.defaultValues as Record<string, unknown>) ?? {};
  const recordId = props.recordId as string | undefined;
  const isEdit = !!recordId;

  const [fields, setFields] = useState<FieldMeta[]>([]);
  const [state, dispatch] = useReducer(formReducer, defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/apps/${appId}`)
      .then(r => r.json())
      .then(d => {
        const model = d.app?.models?.find((m: { name: string; schema: { fields: FieldMeta[] } }) => m.name === modelName);
        if (model?.schema?.fields) {
          const visibleFields = model.schema.fields.filter(
            (f: FieldMeta) =>
              !f.hidden &&
              f.name !== "id" &&
              f.name !== "createdAt" &&
              f.name !== "updatedAt" &&
              (!config.fields || config.fields.includes(f.name))
          );
          setFields(visibleFields);
          // Pre-fill defaults
          visibleFields.forEach((f: FieldMeta) => {
            if (defaultValues[f.name] === undefined && f.default != null) {
              dispatch({ field: f.name, value: f.default });
            }
          });
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, modelName]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    fields.forEach(f => {
      const val = state[f.name];
      if (f.required && (val === undefined || val === null || val === "")) {
        errs[f.name] = `${f.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/runtime/${appId}/${modelName}/${recordId}`
        : `/api/runtime/${appId}/${modelName}`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const serverErrors: Record<string, string> = {};
          data.errors.forEach((e: { field: string; messages: string[] }) => {
            serverErrors[e.field] = e.messages[0];
          });
          setErrors(serverErrors);
          toast.error("Please fix the errors below");
        } else {
          toast.error(data.error ?? "Submission failed");
        }
        return;
      }
      toast.success(isEdit ? "Record updated!" : "Record created!");
      if (props.resetOnSubmit) fields.forEach(f => dispatch({ field: f.name, value: "" }));
      onAction?.({ id: "submit", label: "Submit", type: "submit" }, data.data);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FieldMeta) => {
    const value = state[field.name] ?? "";
    const error = errors[field.name];
    const commonProps = {
      label: field.label,
      error,
      required: field.required,
      placeholder: field.placeholder ?? `Enter ${field.label}`,
      id: `form-${config.id}-${field.name}`,
    };

    switch (field.type) {
      case "textarea":
      case "richtext":
      case "json":
        return (
          <Textarea
            key={field.name}
            {...commonProps}
            value={String(value)}
            onChange={e => dispatch({ field: field.name, value: e.target.value })}
          />
        );

      case "boolean":
        return (
          <div key={field.name} className="flex items-center gap-3">
            <input
              type="checkbox"
              id={commonProps.id}
              checked={Boolean(value)}
              onChange={e => dispatch({ field: field.name, value: e.target.checked })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <label htmlFor={commonProps.id} className="text-sm font-medium text-white cursor-pointer">
              {field.label}
              {field.required && <span className="text-error ml-1">*</span>}
            </label>
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label htmlFor={commonProps.id} className="text-sm font-medium text-white">
              {field.label}{field.required && <span className="text-error ml-1">*</span>}
            </label>
            <select
              id={commonProps.id}
              value={String(value)}
              onChange={e => dispatch({ field: field.name, value: e.target.value })}
              className="bg-bg-elevated border border-border rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="">Select {field.label}…</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {error && <p className="text-xs text-error">{error}</p>}
          </div>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">
              {field.label}{field.required && <span className="text-error ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {field.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(opt)}
                    onChange={e => {
                      const newVals = e.target.checked
                        ? [...selectedValues, opt]
                        : selectedValues.filter(v => v !== opt);
                      dispatch({ field: field.name, value: newVals });
                    }}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-error">{error}</p>}
          </div>
        );

      case "date":
      case "datetime":
        return (
          <Input
            key={field.name}
            {...commonProps}
            type={field.type === "datetime" ? "datetime-local" : "date"}
            value={String(value)}
            onChange={e => dispatch({ field: field.name, value: e.target.value })}
          />
        );

      case "number":
        return (
          <Input
            key={field.name}
            {...commonProps}
            type="number"
            value={String(value)}
            onChange={e => dispatch({ field: field.name, value: e.target.valueAsNumber })}
          />
        );

      default:
        return (
          <Input
            key={field.name}
            {...commonProps}
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            value={String(value)}
            onChange={e => dispatch({ field: field.name, value: e.target.value })}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {config.title && (
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
      )}
      {fields.map(renderField)}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={submitting}
          className="w-full"
          id={`form-${config.id}-submit`}
        >
          {String(props.submitLabel ?? (isEdit ? "Update" : "Submit"))}
        </Button>
      </div>
    </form>
  );
}
