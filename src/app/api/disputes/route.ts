import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Dispute types - must match database CHECK constraint
type DisputeType =
  | "not_delivered"
  | "wrong_quantity"
  | "late_delivery"
  | "quality_issue"
  | "other";

/**
 * Safe admin client creator that returns null if env vars are missing
 */
function createAdminClientSafe() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("[Disputes API] Admin client not available - missing env vars");
    return null;
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET /api/disputes?requestId=xxx
 * Check if user can file a dispute and get existing dispute if any
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "requestId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get the request details
    const { data: waterRequest, error: requestError } = await supabase
      .from("water_requests")
      .select("id, status, delivered_at, consumer_id, supplier_id")
      .eq("id", requestId)
      .single();

    if (requestError || !waterRequest) {
      return NextResponse.json(
        { success: false, error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (waterRequest.consumer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para ver esta solicitud" },
        { status: 403 }
      );
    }

    // Check for existing dispute - use maybeSingle() to avoid 406 error when no results
    const { data: existingDisputeArray } = await supabase
      .from("disputes")
      .select("*")
      .eq("request_id", requestId)
      .limit(1);

    const existingDispute = existingDisputeArray?.[0] || null;

    if (existingDispute) {
      return NextResponse.json({
        success: true,
        data: {
          canFile: false,
          reason: "Ya existe una disputa para esta solicitud",
          existingDispute,
        },
      });
    }

    // Check if already delivered
    if (waterRequest.status !== "delivered") {
      return NextResponse.json({
        success: true,
        data: {
          canFile: false,
          reason: "Solo puedes disputar solicitudes entregadas",
          existingDispute: null,
        },
      });
    }

    // Get dispute window setting - use default if not accessible
    let disputeWindowHours = 48;
    const adminClient = createAdminClientSafe();
    if (adminClient) {
      try {
        const { data: setting } = await adminClient
          .from("admin_settings")
          .select("value")
          .eq("key", "dispute_window_hours")
          .single();
        if (setting?.value) {
          disputeWindowHours = Number(setting.value);
        }
      } catch {
        // Use default
      }
    }

    // Check if within dispute window
    if (waterRequest.delivered_at) {
      const deliveredAt = new Date(waterRequest.delivered_at);
      const windowEnd = new Date(
        deliveredAt.getTime() + disputeWindowHours * 60 * 60 * 1000
      );
      const now = new Date();

      if (now > windowEnd) {
        return NextResponse.json({
          success: true,
          data: {
            canFile: false,
            reason: `El plazo para disputar ha expirado (${disputeWindowHours} horas después de la entrega)`,
            existingDispute: null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        canFile: true,
        existingDispute: null,
      },
    });
  } catch (err) {
    console.error("[Disputes API] GET error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/disputes
 * Create a new dispute
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request_id, dispute_type, description } = body;

    if (!request_id || !dispute_type) {
      return NextResponse.json(
        { success: false, error: "request_id y dispute_type son requeridos" },
        { status: 400 }
      );
    }

    // Validate dispute type
    const validTypes: DisputeType[] = [
      "not_delivered",
      "wrong_quantity",
      "late_delivery",
      "quality_issue",
      "other",
    ];
    if (!validTypes.includes(dispute_type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de disputa inválido" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get request to verify ownership and get provider_id
    const { data: waterRequest, error: requestError } = await supabase
      .from("water_requests")
      .select("supplier_id, consumer_id, status")
      .eq("id", request_id)
      .single();

    if (requestError || !waterRequest) {
      return NextResponse.json(
        { success: false, error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    if (waterRequest.consumer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "No tienes permiso para disputar esta solicitud" },
        { status: 403 }
      );
    }

    if (waterRequest.status !== "delivered") {
      return NextResponse.json(
        { success: false, error: "Solo puedes disputar solicitudes entregadas" },
        { status: 400 }
      );
    }

    if (!waterRequest.supplier_id) {
      return NextResponse.json(
        { success: false, error: "La solicitud no tiene un proveedor asignado" },
        { status: 400 }
      );
    }

    // Check for existing dispute - use limit(1) to avoid 406 error when no results
    const { data: existingDisputeArray } = await supabase
      .from("disputes")
      .select("id")
      .eq("request_id", request_id)
      .limit(1);

    if (existingDisputeArray && existingDisputeArray.length > 0) {
      return NextResponse.json(
        { success: false, error: "Ya existe una disputa para esta solicitud" },
        { status: 409 }
      );
    }

    // Create the dispute using regular client - RLS policy allows consumers to insert
    // disputes for their own delivered requests (see migration file)
    const { data: dispute, error: insertError } = await supabase
      .from("disputes")
      .insert({
        request_id,
        consumer_id: user.id,
        provider_id: waterRequest.supplier_id,
        dispute_type,
        description: description?.trim() || null,
        status: "open",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Disputes API] Insert error:", insertError);

      if (insertError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "Ya existe una disputa para esta solicitud" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Error al crear la disputa" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { disputeId: dispute.id },
    });
  } catch (err) {
    console.error("[Disputes API] POST error:", err);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
