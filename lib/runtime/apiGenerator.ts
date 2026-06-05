// lib/runtime/apiGenerator.ts
// Dynamic CRUD handler factory — all operations scoped to appId + modelName in RuntimeRecord

import { prisma } from "../db";
import { createId } from "@paralleldrive/cuid2";
import type { NormalizedModel } from "./schemaBuilder";
import { validatePayload } from "./dataValidator";
import type { ListQuery, PaginatedResponse } from "../../types";

export interface ModelCRUDHandler {
  list: (appId: string, query: ListQuery) => Promise<PaginatedResponse<Record<string, unknown>>>;
  create: (appId: string, data: unknown) => Promise<Record<string, unknown>>;
  getById: (appId: string, recordId: string) => Promise<Record<string, unknown> | null>;
  update: (appId: string, recordId: string, data: unknown) => Promise<Record<string, unknown>>;
  delete: (appId: string, recordId: string) => Promise<void>;
}

export class ValidationError extends Error {
  constructor(public errors: { field: string; messages: string[] }[]) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Record not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export function createCRUDHandler(model: NormalizedModel): ModelCRUDHandler {
  return {
    async list(appId, query) {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 20));
      const skip = (page - 1) * limit;

      // Fetch all matching records for this app/model
      const allRecords = await prisma.runtimeRecord.findMany({
        where: { appId, modelName: model.name },
        orderBy: { createdAt: "desc" },
      });

      // Filter soft-deleted records
      let records = allRecords.map(r => r.data as Record<string, unknown>);
      if (model.softDelete) {
        records = records.filter(r => !r.deletedAt);
      }

      // Search
      if (query.search && model.searchable.length > 0) {
        const term = query.search.toLowerCase();
        records = records.filter(r =>
          model.searchable.some(field =>
            String(r[field] ?? "").toLowerCase().includes(term)
          )
        );
      }

      // Filter
      if (query.filters) {
        for (const [field, value] of Object.entries(query.filters)) {
          records = records.filter(r => r[field] === value);
        }
      }

      // Sort
      if (query.sortBy) {
        const sortField = query.sortBy;
        const sortOrder = query.sortOrder === "asc" ? 1 : -1;
        records.sort((a, b) => {
          const av = a[sortField] ?? "";
          const bv = b[sortField] ?? "";
          return av < bv ? -sortOrder : av > bv ? sortOrder : 0;
        });
      }

      const total = records.length;
      const totalPages = Math.ceil(total / limit);
      const paginated = records.slice(skip, skip + limit);

      return { data: paginated, total, page, limit, totalPages };
    },

    async create(appId, data) {
      const validation = validatePayload(model.fields, data);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const now = new Date().toISOString();
      const id = createId();
      const record: Record<string, unknown> = {
        id,
        ...(validation.data),
        createdAt: now,
        updatedAt: now,
      };

      await prisma.runtimeRecord.create({
        data: {
          id,
          appId,
          modelName: model.name,
          data: record as never,
        },
      });

      return record;
    },

    async getById(appId, recordId) {
      const row = await prisma.runtimeRecord.findFirst({
        where: { id: recordId, appId, modelName: model.name },
      });
      if (!row) return null;
      const record = row.data as Record<string, unknown>;
      if (model.softDelete && record.deletedAt) return null;
      return record;
    },

    async update(appId, recordId, data) {
      const row = await prisma.runtimeRecord.findFirst({
        where: { id: recordId, appId, modelName: model.name },
      });
      if (!row) throw new NotFoundError();

      const existing = row.data as Record<string, unknown>;
      if (model.softDelete && existing.deletedAt) throw new NotFoundError();

      const validation = validatePayload(model.fields, data, true);
      if (!validation.success) {
        throw new ValidationError(validation.errors);
      }

      const updated: Record<string, unknown> = {
        ...existing,
        ...(validation.data),
        updatedAt: new Date().toISOString(),
      };

      await prisma.runtimeRecord.update({
        where: { id: recordId },
        data: { data: updated as never },
      });

      return updated;
    },

    async delete(appId, recordId) {
      const row = await prisma.runtimeRecord.findFirst({
        where: { id: recordId, appId, modelName: model.name },
      });
      if (!row) throw new NotFoundError();

      if (model.softDelete) {
        const existing = row.data as Record<string, unknown>;
        await prisma.runtimeRecord.update({
          where: { id: recordId },
          data: { data: { ...existing, deletedAt: new Date().toISOString() } as never },
        });
      } else {
        await prisma.runtimeRecord.delete({ where: { id: recordId } });
      }
    },
  };
}
