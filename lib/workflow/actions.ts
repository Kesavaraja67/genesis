// lib/workflow/actions.ts
// Step executor functions for each workflow step type

import nodemailer from "nodemailer";
import type { WorkflowStepConfig } from "../config/types";
import { createCRUDHandler } from "../runtime/apiGenerator";
import { normalizeModel } from "../runtime/schemaBuilder";
import { prisma } from "../db";

interface StepContext {
  input: Record<string, unknown>;
  steps: Record<string, unknown>;
  appId: string;
}

function resolveTemplate(template: string, ctx: StepContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
    const keys = path.trim().split(".");
    let val: unknown = { input: ctx.input, steps: ctx.steps };
    for (const key of keys) {
      if (typeof val === "object" && val !== null && key in (val as Record<string, unknown>)) {
        val = (val as Record<string, unknown>)[key];
      } else {
        val = "";
        break;
      }
    }
    return String(val ?? "");
  });
}

function resolveObject(obj: unknown, ctx: StepContext): unknown {
  if (typeof obj === "string") return resolveTemplate(obj, ctx);
  if (Array.isArray(obj)) return obj.map((v) => resolveObject(v, ctx));
  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = resolveObject(v, ctx);
    }
    return result;
  }
  return obj;
}

export async function executeStep(
  step: WorkflowStepConfig,
  ctx: StepContext
): Promise<unknown> {
  const config = resolveObject(step.config, ctx) as Record<string, unknown>;

  switch (step.type) {
    case "sendEmail": {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        to: String(config.to),
        subject: String(config.subject ?? ""),
        html: String(config.body ?? ""),
      });
      return { sent: true, to: config.to };
    }

    case "createRecord": {
      const modelName = String(config.model);
      const appModel = await prisma.appModel.findFirst({
        where: { appId: ctx.appId, name: modelName },
      });
      if (!appModel) throw new Error(`Model "${modelName}" not found`);
      const normalized = normalizeModel(appModel.schema as unknown as Parameters<typeof normalizeModel>[0]);
      const handler = createCRUDHandler(normalized);
      return await handler.create(ctx.appId, config.data as Record<string, unknown>);
    }

    case "updateRecord": {
      const modelName = String(config.model);
      const recordId = String(config.recordId);
      const appModel = await prisma.appModel.findFirst({
        where: { appId: ctx.appId, name: modelName },
      });
      if (!appModel) throw new Error(`Model "${modelName}" not found`);
      const normalized = normalizeModel(appModel.schema as unknown as Parameters<typeof normalizeModel>[0]);
      const handler = createCRUDHandler(normalized);
      return await handler.update(ctx.appId, recordId, config.data as Record<string, unknown>);
    }

    case "deleteRecord": {
      const modelName = String(config.model);
      const recordId = String(config.recordId);
      const appModel = await prisma.appModel.findFirst({
        where: { appId: ctx.appId, name: modelName },
      });
      if (!appModel) throw new Error(`Model "${modelName}" not found`);
      const normalized = normalizeModel(appModel.schema as unknown as Parameters<typeof normalizeModel>[0]);
      const handler = createCRUDHandler(normalized);
      await handler.delete(ctx.appId, recordId);
      return { deleted: true };
    }

    case "httpRequest": {
      const method = String(config.method ?? "GET").toUpperCase();
      const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
      if (!allowedMethods.includes(method)) throw new Error(`HTTP method "${method}" not allowed`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(String(config.url), {
          method,
          headers: config.headers as HeadersInit,
          body: method !== "GET" ? JSON.stringify(config.body) : undefined,
          signal: controller.signal,
        });
        const response = await res.json().catch(() => res.text());
        return { status: res.status, response };
      } finally {
        clearTimeout(timeout);
      }
    }

    case "condition": {
      const field = String(config.field);
      const operator = String(config.operator);
      const value = config.value;
      const ctxValue = (ctx.input as Record<string, unknown>)[field];
      let result = false;
      switch (operator) {
        case "eq":     result = ctxValue === value; break;
        case "neq":    result = ctxValue !== value; break;
        case "gt":     result = Number(ctxValue) > Number(value); break;
        case "lt":     result = Number(ctxValue) < Number(value); break;
        case "exists": result = ctxValue !== undefined && ctxValue !== null; break;
        case "notExists": result = ctxValue === undefined || ctxValue === null; break;
      }
      return { result, nextStep: result ? config.onTrue : config.onFalse };
    }

    case "delay": {
      const ms = Math.min(Number(config.milliseconds ?? 0), 10_000);
      await new Promise((resolve) => setTimeout(resolve, ms));
      return { delayed: ms };
    }

    case "log": {
      const message = String(config.message ?? "");
      return { logged: message };
    }

    case "transformData": {
      const rules = (config.transform as Array<{ from: string; to: string; operation?: string }>) ?? [];
      const result: Record<string, unknown> = { ...(ctx.input) };
      for (const rule of rules) {
        let val = String(result[rule.from] ?? "");
        switch (rule.operation) {
          case "uppercase":  val = val.toUpperCase(); break;
          case "lowercase":  val = val.toLowerCase(); break;
          case "trim":       val = val.trim(); break;
          case "stringify":  val = JSON.stringify(result[rule.from]); break;
        }
        result[rule.to] = val;
      }
      return result;
    }

    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}
