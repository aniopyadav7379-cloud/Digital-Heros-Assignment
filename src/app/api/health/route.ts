import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] database check failed:", error);
    return fail(503, "SERVICE_UNAVAILABLE", "Database is not reachable.");
  }
}
