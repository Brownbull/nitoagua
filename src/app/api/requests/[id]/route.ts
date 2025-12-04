import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AcceptRequestBody {
  action: "accept";
  deliveryWindow?: string;
}

interface DeliverRequestBody {
  action: "deliver";
}

type RequestBody = AcceptRequestBody | DeliverRequestBody;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/**
 * Handle the "deliver" action - mark an accepted request as delivered
 */
async function handleDeliverAction(
  supabase: SupabaseClient,
  requestId: string,
  existingRequest: { id: string; status: string; supplier_id: string | null },
  userId: string
) {
  // Validate status is 'accepted'
  if (existingRequest.status !== "accepted") {
    console.error("[API/REQUESTS/PATCH]", {
      action: "deliver_status_check",
      requestId,
      currentStatus: existingRequest.status,
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            existingRequest.status === "pending"
              ? "Esta solicitud aún no ha sido aceptada"
              : existingRequest.status === "delivered"
              ? "Esta solicitud ya fue marcada como entregada"
              : "Esta solicitud no puede ser marcada como entregada",
          code: "INVALID_STATUS",
        },
      },
      { status: 409 }
    );
  }

  // Validate the current user is the supplier who accepted this request
  if (existingRequest.supplier_id !== userId) {
    console.error("[API/REQUESTS/PATCH]", {
      action: "deliver_supplier_check",
      requestId,
      expectedSupplier: existingRequest.supplier_id,
      actualUser: userId,
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Solo el proveedor que aceptó esta solicitud puede marcarla como entregada",
          code: "FORBIDDEN",
        },
      },
      { status: 403 }
    );
  }

  // Update request: mark as delivered
  const now = new Date().toISOString();
  const { data: updatedRequest, error: updateError } = await supabase
    .from("water_requests")
    .update({
      status: "delivered",
      delivered_at: now,
    })
    .eq("id", requestId)
    .eq("status", "accepted") // Extra safety: only update if still accepted
    .eq("supplier_id", userId) // Extra safety: only the accepting supplier
    .select("id, status, delivered_at")
    .single();

  if (updateError || !updatedRequest) {
    console.error("[API/REQUESTS/PATCH]", {
      action: "deliver_update",
      requestId,
      error: updateError?.message || "Update failed",
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Error al marcar la solicitud como entregada. Por favor intenta de nuevo.",
          code: "UPDATE_ERROR",
        },
      },
      { status: 500 }
    );
  }

  // TODO: Epic 5 - Send email notification to customer
  console.log(
    "[NOTIFY] Request delivered - customer notification would send here",
    {
      requestId,
      supplierId: userId,
    }
  );

  // Return success response
  return NextResponse.json(
    {
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        deliveredAt: updatedRequest.delivered_at,
      },
      error: null,
    },
    { status: 200 }
  );
}

/**
 * PATCH /api/requests/[id]
 * Updates a water request - supports "accept" and "deliver" actions
 *
 * Accept: { action: "accept", deliveryWindow?: string }
 * Response: { data: { id, status, acceptedAt, deliveryWindow, supplierId }, error: null }
 *
 * Deliver: { action: "deliver" }
 * Response: { data: { id, status, deliveredAt }, error: null }
 *
 * Error: { data: null, error: { message, code } }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "ID de solicitud requerido",
            code: "MISSING_ID",
          },
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: RequestBody = await request.json();

    if (body.action !== "accept" && body.action !== "deliver") {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Acción no soportada",
            code: "UNSUPPORTED_ACTION",
          },
        },
        { status: 400 }
      );
    }

    // Get current user (supplier)
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[API/REQUESTS/PATCH]", {
        action: "auth",
        error: userError?.message || "No user",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Debes iniciar sesión para realizar esta acción",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    // Verify user is a supplier
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("[API/REQUESTS/PATCH]", {
        action: "profile_check",
        userId: user.id,
        error: profileError?.message || "No profile",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Perfil de proveedor no encontrado",
            code: "PROFILE_NOT_FOUND",
          },
        },
        { status: 403 }
      );
    }

    if (profile.role !== "supplier") {
      console.error("[API/REQUESTS/PATCH]", {
        action: "role_check",
        userId: user.id,
        role: profile.role,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Solo los proveedores pueden realizar esta acción",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      );
    }

    // Verify request exists
    const { data: existingRequest, error: fetchError } = await supabase
      .from("water_requests")
      .select("id, status, supplier_id")
      .eq("id", requestId)
      .single();

    if (fetchError || !existingRequest) {
      console.error("[API/REQUESTS/PATCH]", {
        action: "fetch_request",
        requestId,
        error: fetchError?.message || "Not found",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Solicitud no encontrada",
            code: "NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    // Route to appropriate action handler
    if (body.action === "deliver") {
      return handleDeliverAction(supabase, requestId, existingRequest, user.id);
    }

    // Accept action: verify request is pending
    if (existingRequest.status !== "pending") {
      console.error("[API/REQUESTS/PATCH]", {
        action: "status_check",
        requestId,
        currentStatus: existingRequest.status,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message:
              existingRequest.status === "accepted"
                ? "Esta solicitud ya fue aceptada por otro proveedor"
                : "Esta solicitud no puede ser aceptada",
            code: "INVALID_STATUS",
          },
        },
        { status: 409 }
      );
    }

    // Update request: accept it
    const now = new Date().toISOString();
    const { data: updatedRequest, error: updateError } = await supabase
      .from("water_requests")
      .update({
        status: "accepted",
        supplier_id: user.id,
        accepted_at: now,
        delivery_window: body.deliveryWindow || null,
      })
      .eq("id", requestId)
      .eq("status", "pending") // Extra safety: only update if still pending
      .select("id, status, accepted_at, delivery_window, supplier_id")
      .single();

    if (updateError || !updatedRequest) {
      // Check if it was a race condition (another supplier accepted first)
      const { data: recheckRequest } = await supabase
        .from("water_requests")
        .select("status")
        .eq("id", requestId)
        .single();

      if (recheckRequest?.status === "accepted") {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: "Esta solicitud ya fue aceptada por otro proveedor",
              code: "ALREADY_ACCEPTED",
            },
          },
          { status: 409 }
        );
      }

      console.error("[API/REQUESTS/PATCH]", {
        action: "update",
        requestId,
        error: updateError?.message || "Update failed",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Error al aceptar la solicitud. Por favor intenta de nuevo.",
            code: "UPDATE_ERROR",
          },
        },
        { status: 500 }
      );
    }

    // TODO: Epic 5 - Send email notification to customer
    console.log(
      "[NOTIFY] Request accepted - customer notification would send here",
      {
        requestId,
        supplierId: user.id,
        deliveryWindow: body.deliveryWindow || "none specified",
      }
    );

    // Return success response
    return NextResponse.json(
      {
        data: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          acceptedAt: updatedRequest.accepted_at,
          deliveryWindow: updatedRequest.delivery_window,
          supplierId: updatedRequest.supplier_id,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API/REQUESTS/PATCH]", {
      action: "unexpected_error",
      error,
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Error interno del servidor. Por favor intenta de nuevo.",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/requests/[id]
 * Gets a single water request by ID
 * Used by request details page
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;

    if (!requestId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "ID de solicitud requerido",
            code: "MISSING_ID",
          },
        },
        { status: 400 }
      );
    }

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Debes iniciar sesión",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    // Fetch request
    const { data: waterRequest, error: fetchError } = await supabase
      .from("water_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !waterRequest) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Solicitud no encontrada",
            code: "NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: waterRequest,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API/REQUESTS/GET]", {
      action: "unexpected_error",
      error,
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Error interno del servidor",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
