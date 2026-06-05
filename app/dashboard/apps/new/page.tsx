"use client";
// app/(dashboard)/apps/new/page.tsx — Template Gallery + JSON Editor

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ValidationPanel } from "@/components/editor/ValidationPanel";
import toast from "react-hot-toast";
import type { ValidationResult } from "@/lib/config/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// ─── Templates ────────────────────────────────────────────────────────────────

interface Template {
  id: string;
  icon: string;
  name: string;
  description: string;
  tags: string[];
  config: unknown;
}

const TEMPLATES: Template[] = [
  {
    id: "crm",
    icon: "👥",
    name: "CRM",
    description: "Contacts, deals and pipeline tracking for sales teams.",
    tags: ["Sales", "Popular"],
    config: {
      version: "1.0",
      name: "CRM",
      description: "Customer relationship management built with Genesis",
      models: [
        {
          name: "Contact",
          fields: [
            { name: "name", type: "text", required: true, label: "Full Name" },
            { name: "email", type: "email", required: true, unique: true },
            { name: "phone", type: "text", label: "Phone" },
            { name: "company", type: "text" },
            { name: "status", type: "select", options: ["lead", "prospect", "customer", "churned"], default: "lead" },
            { name: "notes", type: "textarea" },
          ],
          searchable: ["name", "email", "company"],
          sortable: ["name", "createdAt"],
        },
        {
          name: "Deal",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "value", type: "number", label: "Deal Value ($)" },
            { name: "stage", type: "select", options: ["prospecting", "qualification", "proposal", "closed-won", "closed-lost"], default: "prospecting" },
            { name: "contactName", type: "text", label: "Contact" },
            { name: "closeDate", type: "date", label: "Close Date" },
            { name: "notes", type: "textarea" },
          ],
          searchable: ["title", "contactName"],
          sortable: ["value", "closeDate", "createdAt"],
        },
      ],
      pages: [
        {
          id: "contacts",
          name: "Contacts",
          path: "/contacts",
          layout: "single-column",
          components: [
            { id: "contacts-table", type: "table", model: "Contact", title: "All Contacts" },
          ],
        },
        {
          id: "deals",
          name: "Deals",
          path: "/deals",
          layout: "single-column",
          components: [
            { id: "deals-table", type: "table", model: "Deal", title: "Pipeline" },
          ],
        },
      ],
    },
  },
  {
    id: "task-manager",
    icon: "✅",
    name: "Task Manager",
    description: "Kanban-style task tracking with priorities and assignees.",
    tags: ["Productivity", "Popular"],
    config: {
      version: "1.0",
      name: "Task Manager",
      description: "Project and task management built with Genesis",
      models: [
        {
          name: "Task",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "description", type: "textarea" },
            { name: "status", type: "select", options: ["To Do", "In Progress", "Review", "Done"], default: "To Do" },
            { name: "priority", type: "select", options: ["low", "medium", "high", "urgent"], default: "medium" },
            { name: "assignee", type: "text" },
            { name: "dueDate", type: "date", label: "Due Date" },
          ],
          searchable: ["title", "assignee"],
          sortable: ["priority", "dueDate", "createdAt"],
        },
        {
          name: "Project",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "description", type: "textarea" },
            { name: "status", type: "select", options: ["planning", "active", "completed", "paused"], default: "planning" },
            { name: "startDate", type: "date" },
            { name: "endDate", type: "date" },
          ],
          searchable: ["name"],
        },
      ],
      pages: [
        {
          id: "tasks",
          name: "Tasks",
          path: "/tasks",
          layout: "single-column",
          components: [
            {
              id: "tasks-kanban",
              type: "kanban",
              model: "Task",
              title: "Task Board",
              props: {
                statusField: "status",
                titleField: "title",
                descriptionField: "description",
                statuses: ["To Do", "In Progress", "Review", "Done"],
              },
            },
          ],
        },
        {
          id: "projects",
          name: "Projects",
          path: "/projects",
          layout: "single-column",
          components: [
            { id: "projects-table", type: "table", model: "Project", title: "Projects" },
          ],
        },
      ],
    },
  },
  {
    id: "inventory",
    icon: "📦",
    name: "Inventory",
    description: "Product catalog and stock level management.",
    tags: ["Commerce"],
    config: {
      version: "1.0",
      name: "Inventory Manager",
      description: "Product inventory system built with Genesis",
      models: [
        {
          name: "Product",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "sku", type: "text", required: true, unique: true, label: "SKU" },
            { name: "description", type: "textarea" },
            { name: "price", type: "number", label: "Price ($)" },
            { name: "stock", type: "number", label: "Stock Qty", default: 0 },
            { name: "category", type: "select", options: ["Electronics", "Clothing", "Food", "Books", "Other"], default: "Other" },
            { name: "status", type: "select", options: ["active", "discontinued", "draft"], default: "active" },
          ],
          searchable: ["name", "sku", "category"],
          sortable: ["name", "price", "stock", "createdAt"],
        },
        {
          name: "Supplier",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "email", type: "email" },
            { name: "phone", type: "text" },
            { name: "country", type: "text" },
            { name: "notes", type: "textarea" },
          ],
          searchable: ["name", "email"],
        },
      ],
      pages: [
        {
          id: "products",
          name: "Products",
          path: "/products",
          layout: "single-column",
          components: [
            { id: "products-table", type: "table", model: "Product", title: "Product Catalog" },
          ],
        },
        {
          id: "suppliers",
          name: "Suppliers",
          path: "/suppliers",
          layout: "single-column",
          components: [
            { id: "suppliers-table", type: "table", model: "Supplier", title: "Suppliers" },
          ],
        },
      ],
    },
  },
  {
    id: "blog",
    icon: "📝",
    name: "Blog / CMS",
    description: "Content management system for articles and authors.",
    tags: ["Content"],
    config: {
      version: "1.0",
      name: "Blog CMS",
      description: "Content management system built with Genesis",
      models: [
        {
          name: "Post",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "slug", type: "text", required: true, unique: true },
            { name: "content", type: "richtext", label: "Content" },
            { name: "excerpt", type: "textarea" },
            { name: "author", type: "text", required: true },
            { name: "status", type: "select", options: ["draft", "published", "archived"], default: "draft" },
            { name: "publishedAt", type: "datetime", label: "Published At" },
            { name: "tags", type: "multiselect", options: ["Tech", "Design", "Business", "Product", "Culture"] },
          ],
          searchable: ["title", "author", "slug"],
          sortable: ["publishedAt", "createdAt"],
        },
        {
          name: "Category",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "slug", type: "text", required: true, unique: true },
            { name: "description", type: "textarea" },
          ],
          searchable: ["name"],
        },
      ],
      pages: [
        {
          id: "posts",
          name: "Posts",
          path: "/posts",
          layout: "single-column",
          components: [
            { id: "posts-table", type: "table", model: "Post", title: "All Posts" },
          ],
        },
        {
          id: "categories",
          name: "Categories",
          path: "/categories",
          layout: "single-column",
          components: [
            { id: "categories-table", type: "table", model: "Category", title: "Categories" },
          ],
        },
      ],
    },
  },
  {
    id: "hr",
    icon: "🏢",
    name: "HR Dashboard",
    description: "Employee directory, leave requests, and org management.",
    tags: ["HR", "Enterprise"],
    config: {
      version: "1.0",
      name: "HR Dashboard",
      description: "Human resources management built with Genesis",
      models: [
        {
          name: "Employee",
          fields: [
            { name: "firstName", type: "text", required: true, label: "First Name" },
            { name: "lastName", type: "text", required: true, label: "Last Name" },
            { name: "email", type: "email", required: true, unique: true },
            { name: "department", type: "select", options: ["Engineering", "Design", "Sales", "Marketing", "HR", "Finance", "Operations"], default: "Engineering" },
            { name: "role", type: "text", label: "Job Title" },
            { name: "startDate", type: "date", label: "Start Date" },
            { name: "status", type: "select", options: ["active", "on-leave", "terminated"], default: "active" },
            { name: "salary", type: "number" },
          ],
          searchable: ["firstName", "lastName", "email", "department"],
          sortable: ["lastName", "department", "startDate"],
        },
        {
          name: "LeaveRequest",
          label: "Leave Request",
          fields: [
            { name: "employeeName", type: "text", required: true, label: "Employee" },
            { name: "type", type: "select", options: ["annual", "sick", "personal", "maternity", "paternity"], required: true },
            { name: "startDate", type: "date", required: true, label: "From" },
            { name: "endDate", type: "date", required: true, label: "To" },
            { name: "reason", type: "textarea" },
            { name: "status", type: "select", options: ["pending", "approved", "rejected"], default: "pending" },
          ],
          searchable: ["employeeName"],
          sortable: ["startDate", "status"],
        },
      ],
      pages: [
        {
          id: "employees",
          name: "Employees",
          path: "/employees",
          layout: "single-column",
          components: [
            { id: "employees-table", type: "table", model: "Employee", title: "Employee Directory" },
          ],
        },
        {
          id: "leave",
          name: "Leave Requests",
          path: "/leave",
          layout: "single-column",
          components: [
            { id: "leave-table", type: "table", model: "LeaveRequest", title: "Leave Requests" },
          ],
        },
      ],
    },
  },
  {
    id: "custom",
    icon: "⚡",
    name: "Start from Scratch",
    description: "Begin with a blank config and build exactly what you need.",
    tags: ["Custom"],
    config: {
      version: "1.0",
      name: "My App",
      description: "A Genesis application",
      models: [
        {
          name: "Item",
          fields: [
            { name: "name", type: "text", required: true },
            { name: "description", type: "textarea" },
            { name: "status", type: "select", options: ["active", "inactive"], default: "active" },
          ],
          searchable: ["name"],
        },
      ],
      pages: [
        {
          id: "items",
          name: "Items",
          path: "/items",
          layout: "single-column",
          components: [
            { id: "items-table", type: "table", model: "Item", title: "Items" },
          ],
        },
      ],
    },
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

type Step = "templates" | "configure";

export default function NewAppPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [configStr, setConfigStr] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    const cfg = { ...(template.config as Record<string, unknown>) };
    if (!name) setName(template.name === "Start from Scratch" ? "" : template.name);
    if (!description) setDescription(typeof cfg.description === "string" ? cfg.description : "");
    setConfigStr(JSON.stringify(cfg, null, 2));
    setStep("configure");
  };

  const validateConfig = async (value: string) => {
    setValidating(true);
    try {
      const res = await fetch("/api/validate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: JSON.parse(value) }),
      });
      const data = await res.json();
      setValidation(data.validation);
    } catch {
      setValidation(null);
    } finally {
      setValidating(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const v = value ?? "";
    setConfigStr(v);
    try {
      JSON.parse(v);
      setTimeout(() => validateConfig(v), 500);
    } catch { /* not valid JSON yet */ }
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("App name is required"); return; }
    setCreating(true);
    try {
      let config: unknown;
      try { config = JSON.parse(configStr); }
      catch { toast.error("Config is not valid JSON"); return; }

      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description, config }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error((data as { error?: string }).error ?? "Failed to create app"); return; }
      toast.success("App created!");
      router.push(`/dashboard/apps/${(data as { app: { id: string } }).app.id}/editor`);
    } finally {
      setCreating(false);
    }
  };

  const hasErrors = validation && !validation.valid;

  // ── Template Gallery ────────────────────────────────────────────────────────
  if (step === "templates") {
    return (
      <div style={{ padding: "40px 48px", maxWidth: "960px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-disabled)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
              margin: "0 0 6px",
            }}
          >
            New App
          </p>
          <h1
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 8px",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Start with a template
          </h1>
          <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", margin: 0 }}>
            Pick a starter configuration or build from scratch. Everything is editable.
          </p>
        </div>

        {/* Template Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
            gap: "16px",
          }}
        >
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              id={`template-${template.id}`}
              onClick={() => selectTemplate(template)}
              style={{
                textAlign: "left",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "24px",
                cursor: "pointer",
                transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                }}
              >
                {template.icon}
              </div>

              {/* Name */}
              <p
                style={{
                  fontSize: "var(--text-md)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "0 0 6px",
                }}
              >
                {template.name}
              </p>

              {/* Description */}
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  margin: "0 0 16px",
                  lineHeight: "1.5",
                }}
              >
                {template.description}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: tag === "Popular" ? "var(--pine-muted)" : "var(--bg-elevated)",
                      color: tag === "Popular" ? "var(--pine)" : "var(--text-secondary)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Configure Step ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col" style={{ height: "100vh" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "56px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setStep("templates")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              padding: "6px 8px",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Templates
          </button>
          {selectedTemplate && (
            <>
              <span style={{ color: "var(--border-default)" }}>/</span>
              <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                {selectedTemplate.icon} {selectedTemplate.name}
              </span>
            </>
          )}
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          loading={creating}
          disabled={!!hasErrors}
          id="create-app-submit"
        >
          Create App
        </Button>
      </div>

      {/* Content: meta + editor | validation */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRight: "1px solid var(--border-subtle)",
          }}
        >
          {/* App meta */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
              display: "flex",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                label="App Name"
                id="new-app-name"
                placeholder="My Awesome App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 2 }}>
              <Textarea
                label="Description"
                id="new-app-description"
                placeholder="What does this app do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ minHeight: "38px" } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Monaco editor */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <MonacoEditor
              height="100%"
              language="json"
              theme="vs-dark"
              value={configStr}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                lineNumbers: "on",
                wordWrap: "on",
                formatOnPaste: true,
                formatOnType: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Right: Validation panel */}
        <div
          style={{
            width: "320px",
            flexShrink: 0,
            overflowY: "auto",
            background: "var(--bg-elevated)",
            padding: "20px",
          }}
        >
          <ValidationPanel validation={validation} loading={validating} />
        </div>
      </div>
    </div>
  );
}
