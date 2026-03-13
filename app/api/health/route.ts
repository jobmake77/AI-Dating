import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Health Check API Endpoint
 *
 * Returns the health status of the application and its dependencies.
 * Used by monitoring systems and deployment pipelines.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("users")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    const dbStatus = dbError ? "unhealthy" : "healthy";
    const responseTime = Date.now() - startTime;

    // Overall health status
    const isHealthy = dbStatus === "healthy";

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: dbStatus,
            responseTime: `${responseTime}ms`,
          },
          api: {
            status: "healthy",
          },
        },
        version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "dev",
        environment: process.env.VERCEL_ENV || "development",
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "unhealthy",
            responseTime: `${responseTime}ms`,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          api: {
            status: "healthy",
          },
        },
        version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "dev",
        environment: process.env.VERCEL_ENV || "development",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
