import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

/**
 * Centralized error handler for route handlers. Keeps every route's
 * catch block identical: unknown internals never leak to the client,
 * but validation/domain errors return actionable, structured messages.
 */
export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return fail(422, "VALIDATION_ERROR", "The request failed validation.", error.flatten());
  }
  if (error instanceof ApiError) {
    return fail(error.status, error.code, error.message, error.details);
  }
  console.error("[api] unhandled error:", error);
  return fail(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
}
