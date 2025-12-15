import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getDashboardMetrics, type Period } from "@/lib/queries/admin-metrics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Require admin access
    await requireAdmin();

    // Get period from query params
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") as Period | null;

    // Validate period
    if (!period || !["today", "week", "month"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Must be 'today', 'week', or 'month'" },
        { status: 400 }
      );
    }

    // Fetch metrics
    const metrics = await getDashboardMetrics(period);

    return NextResponse.json(metrics, {
      headers: {
        // Cache for 5 minutes on CDN/browser
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    // Check if it's a Next.js redirect (from requireAdmin)
    // Next.js redirect throws with NEXT_REDIRECT or has digest property
    if (
      error instanceof Error &&
      (error.message.includes("NEXT_REDIRECT") ||
        (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[API] Error fetching admin metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
