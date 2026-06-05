"use client";
// components/runtime/renderers/TableRenderer.tsx — Full-featured data table

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

import { ConfirmModal } from "@/components/ui/Modal";
import { Modal } from "@/components/ui/Modal";
import { FormRenderer } from "./FormRenderer";
import toast from "react-hot-toast";
import type { ComponentRenderProps } from "../FallbackComponent";
import type { NormalizedModel } from "@/lib/runtime/schemaBuilder";

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export function TableRenderer({ config, appId }: ComponentRenderProps) {
  const modelName = config.model ?? "";
  const [schema, setSchema] = useState<NormalizedModel | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const readonly = config.props?.readonly === true;

  const fetchSchema = useCallback(async () => {
    const res = await fetch(`/api/apps/${appId}`);
    const data = await res.json();
    const model = data.app?.models?.find((m: NormalizedModel) => m.name === modelName);
    if (model) setSchema(model.schema);
  }, [appId, modelName]);

  const fetchData = useCallback(async () => {
    if (!modelName) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/runtime/${appId}/${modelName}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecords(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [appId, modelName, page, search]);

  useEffect(() => { void fetchSchema(); }, [fetchSchema]);
  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/runtime/${appId}/${modelName}/${deleteId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Delete failed"); return; }
      toast.success("Record deleted");
      fetchData();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns = config.fields
    ? (schema as unknown as { fields: { name: string; label: string }[] })?.fields?.filter((f: { name: string }) => config.fields!.includes(f.name)) ?? []
    : (schema as unknown as { fields: { name: string; label: string; hidden?: boolean }[] })?.fields?.filter((f: { hidden?: boolean; name: string }) => !f.hidden && f.name !== "id") ?? [];

  const displayValue = (val: unknown): string => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "boolean") return val ? "✓" : "✗";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {config.title && <h3 className="font-semibold text-white">{config.title}</h3>}
          <span className="text-xs text-muted bg-bg-overlay px-2 py-0.5 rounded-full">{total} records</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-bg-overlay border border-border rounded-md px-3 py-1.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary w-48 transition-colors"
          />
          {!readonly && (
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLoading(true);
                    try {
                      const text = await file.text();
                      const lines = text.split('\n').filter(line => line.trim().length > 0);
                      if (lines.length < 2) throw new Error("CSV must have a header and at least one row");
                      const headers = lines[0].split(',').map(h => h.trim());
                      const parsedData = [];
                      for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim());
                        const obj: Record<string, unknown> = {};
                        headers.forEach((h, idx) => {
                          let val: unknown = values[idx];
                          // Coerce "true"/"false" and numbers
                          if (val === "true") val = true;
                          else if (val === "false") val = false;
                          else if (val !== "" && !isNaN(Number(val))) val = Number(val);
                          else if (val === "") val = null;
                          obj[h] = val;
                        });
                        parsedData.push(obj);
                      }
                      
                      const res = await fetch(`/api/runtime/${appId}/${modelName}/bulk`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(parsedData)
                      });
                      
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.error || "Import failed");
                      
                      toast.success(`Imported ${result.successCount} records!`);
                      if (result.errorCount > 0) {
                        toast.error(`Failed to import ${result.errorCount} records. Check console.`);
                        console.error("Import errors:", result.errors);
                      }
                      fetchData();
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : "Failed to parse CSV");
                    } finally {
                      setLoading(false);
                      e.target.value = ''; // Reset input
                    }
                  }} 
                />
                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 border border-border bg-transparent hover:bg-bg-overlay h-8 px-3 text-white">
                  Import CSV
                </span>
              </label>
              <Button size="sm" variant="primary" onClick={() => setShowCreate(true)} id={`table-${modelName}-create`}>
                + Add Record
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              {(columns as { name: string; label: string }[]).map((col: { name: string; label: string }) => (
                <th key={col.name} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                  {col.label ?? col.name}
                </th>
              ))}
              {!readonly && <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={(columns as unknown[]).length + (readonly ? 0 : 1)} />
              ))
            ) : error ? (
              <tr>
                <td colSpan={(columns as unknown[]).length + 1} className="text-center py-8 text-error text-sm">
                  {error}
                  <button onClick={fetchData} className="ml-2 text-primary hover:underline">Retry</button>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={(columns as unknown[]).length + 1} className="text-center py-12">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-muted text-sm">No records yet</p>
                </td>
              </tr>
            ) : (
              records.map(record => (
                <tr key={String(record.id)} className="hover:bg-bg-overlay transition-colors group">
                  {(columns as { name: string }[]).map((col: { name: string }) => (
                    <td key={col.name} className="px-4 py-3 text-white font-mono text-xs max-w-[200px] truncate">
                      {displayValue(record[col.name])}
                    </td>
                  ))}
                  {!readonly && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditRecord(record)}
                          className="text-xs text-muted hover:text-primary transition-colors px-2 py-1 rounded hover:bg-primary/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(String(record.id))}
                          className="text-xs text-muted hover:text-error transition-colors px-2 py-1 rounded hover:bg-error/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-xs text-muted">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message={`Delete record ${deleteId}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={`New ${modelName}`} size="lg">
        <FormRenderer
          config={{ ...config, id: `${config.id}-create-form`, type: "form", props: { submitLabel: "Create", resetOnSubmit: true } }}
          appId={appId}
          onAction={() => { setShowCreate(false); fetchData(); }}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title={`Edit ${modelName}`} size="lg">
        {editRecord && (
          <FormRenderer
            config={{
              ...config,
              id: `${config.id}-edit-form`,
              type: "form",
              props: { submitLabel: "Update", defaultValues: editRecord, recordId: String(editRecord.id) },
            }}
            appId={appId}
            onAction={() => { setEditRecord(null); fetchData(); }}
          />
        )}
      </Modal>
    </div>
  );
}
