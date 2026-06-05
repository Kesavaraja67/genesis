// lib/errors.ts
// Implementation of the API Error Response Standard (Section 13)

export type StandardErrorCode = 
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INVALID_CONFIG"
  | "SCHEMA_BUILD_ERROR"
  | "GENERATION_ERROR"
  | "WORKFLOW_ERROR";

export interface ApiErrorResponse {
  error: string;
  code: StandardErrorCode;
  field?: string;
  details?: unknown;
}

export class GenesisApiError extends Error {
  public code: StandardErrorCode;
  public status: number;
  public field?: string;
  public details?: unknown;

  constructor({
    message,
    code,
    status = 400,
    field,
    details
  }: {
    message: string;
    code: StandardErrorCode;
    status?: number;
    field?: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "GenesisApiError";
    this.code = code;
    this.status = status;
    this.field = field;
    this.details = details;
  }

  public toResponse(): Response {
    const body: ApiErrorResponse = {
      error: this.message,
      code: this.code,
    };
    if (this.field) body.field = this.field;
    if (this.details) body.details = this.details;
    
    return new Response(JSON.stringify(body), {
      status: this.status,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof GenesisApiError) {
    return error.toResponse();
  }
  
  console.error("Unhandled API Error:", error);
  
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : "Internal Server Error",
      code: "INTERNAL_ERROR"
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}
