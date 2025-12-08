import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGuestRequest, sendGuestNotification } from "@/lib/email";

interface AcceptRequestBody {
  action: "accept";
  deliveryWindow?: string;
}

interface DeliverRequestBody {
  action: "deliver";
}

interface CancelRequestBody {
  action: "cancel";
  trackingToken?: string; // For guest cancellation
}

type RequestBody = AcceptRequestBody | DeliverRequestBody | CancelRequestBody;

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

  // Send email notification to guest consumers (non-blocking)
  // Fetch full request with guest info for notification
  const { data: fullRequest } = await supabase
    .from("water_requests")
    .select("guest_email, guest_name, consumer_id, tracking_token, amount, address")
    .eq("id", requestId)
    .single();

  if (fullRequest && isGuestRequest(fullRequest) && fullRequest.guest_email && fullRequest.guest_name) {
    // Fetch supplier name for the email
    const { data: supplierProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    // Fire and forget - don't await, don't block response
    sendGuestNotification({
      type: "delivered",
      guestEmail: fullRequest.guest_email,
      guestName: fullRequest.guest_name,
      requestId: requestId,
      trackingToken: fullRequest.tracking_token || "",
      amount: fullRequest.amount,
      address: fullRequest.address,
      supplierName: supplierProfile?.name || "Su aguatero",
      deliveredAt: updatedRequest.delivered_at,
    });
  }

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
 * Handle the "cancel" action - cancel a pending request (consumer or guest)
 */
async function handleCancelAction(
  supabase: SupabaseClient,
  requestId: string,
  existingRequest: {
    id: string;
    status: string;
    consumer_id: string | null;
    tracking_token: string | null;
  },
  userId: string | null,
  trackingToken?: string
) {
  // Validate status is 'pending'
  if (existingRequest.status !== "pending") {
    console.error("[API/REQUESTS/PATCH]", {
      action: "cancel_status_check",
      requestId,
      currentStatus: existingRequest.status,
    });

    const errorMessage =
      existingRequest.status === "accepted"
        ? "Esta solicitud ya fue aceptada y no puede ser cancelada"
        : existingRequest.status === "delivered"
        ? "Esta solicitud ya fue entregada y no puede ser cancelada"
        : existingRequest.status === "cancelled"
        ? "Esta solicitud ya fue cancelada"
        : "Esta solicitud no puede ser cancelada";

    return NextResponse.json(
      {
        data: null,
        error: {
          message: errorMessage,
          code: "INVALID_STATUS",
        },
      },
      { status: 409 }
    );
  }

  // Validate ownership - either authenticated consumer or guest with token
  const isAuthenticatedOwner =
    userId && existingRequest.consumer_id && existingRequest.consumer_id === userId;
  const isGuestOwner =
    trackingToken &&
    existingRequest.tracking_token &&
    existingRequest.tracking_token === trackingToken;

  if (!isAuthenticatedOwner && !isGuestOwner) {
    console.error("[API/REQUESTS/PATCH]", {
      action: "cancel_ownership_check",
      requestId,
      expectedConsumerId: existingRequest.consumer_id,
      actualUserId: userId,
      hasTrackingToken: !!trackingToken,
      requestHasTrackingToken: !!existingRequest.tracking_token,
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "No tienes permiso para cancelar esta solicitud",
          code: "FORBIDDEN",
        },
      },
      { status: 403 }
    );
  }

  // Use admin client for guest cancellation (to bypass RLS)
  // For authenticated users, the regular client with RLS is sufficient
  const updateClient = isGuestOwner ? createAdminClient() : supabase;

  // Update request: mark as cancelled
  const now = new Date().toISOString();
  const { data: updatedRequest, error: updateError } = await updateClient
    .from("water_requests")
    .update({
      status: "cancelled",
      cancelled_at: now,
    })
    .eq("id", requestId)
    .eq("status", "pending") // Extra safety: only update if still pending
    .select("id, status, cancelled_at")
    .single();

  if (updateError || !updatedRequest) {
    // Check if it was a race condition (status changed)
    const { data: recheckRequest } = await updateClient
      .from("water_requests")
      .select("status")
      .eq("id", requestId)
      .single();

    if (recheckRequest?.status === "accepted") {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Esta solicitud ya fue aceptada y no puede ser cancelada",
            code: "ALREADY_ACCEPTED",
          },
        },
        { status: 409 }
      );
    }

    console.error("[API/REQUESTS/PATCH]", {
      action: "cancel_update",
      requestId,
      error: updateError?.message || "Update failed",
    });
    return NextResponse.json(
      {
        data: null,
        error: {
          message: "Error al cancelar la solicitud. Por favor intenta de nuevo.",
          code: "UPDATE_ERROR",
        },
      },
      { status: 500 }
    );
  }

  // TODO: Epic 5 - Send notification about cancellation
  console.log("[NOTIFY] Request cancelled - notification would send here", {
    requestId,
    cancelledBy: userId || "guest",
  });

  // Return success response
  return NextResponse.json(
    {
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        cancelledAt: updatedRequest.cancelled_at,
      },
      error: null,
    },
    { status: 200 }
  );
}

/**
 * PATCH /api/requests/[id]
 * Updates a water request - supports "accept", "deliver", and "cancel" actions
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

    if (body.action !== "accept" && body.action !== "deliver" && body.action !== "cancel") {
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

    // Get supabase client and current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Cancel action has different auth requirements (consumer/guest vs supplier)
    if (body.action === "cancel") {
      // Fetch request with consumer_id and tracking_token for ownership check
      const { data: existingRequest, error: fetchError } = await supabase
        .from("water_requests")
        .select("id, status, consumer_id, tracking_token")
        .eq("id", requestId)
        .single();

      if (fetchError || !existingRequest) {
        console.error("[API/REQUESTS/PATCH]", {
          action: "fetch_request_for_cancel",
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

      return handleCancelAction(
        supabase,
        requestId,
        existingRequest,
        user?.id || null,
        body.trackingToken
      );
    }

    // Accept and deliver actions require authenticated supplier
    if (!user) {
      console.error("[API/REQUESTS/PATCH]", {
        action: "auth",
        error: "No user",
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

    // Verify request exists (for accept/deliver actions)
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

    // Send email notification to guest consumers (non-blocking)
    // Fetch full request with guest info for notification
    const { data: fullRequest } = await supabase
      .from("water_requests")
      .select("guest_email, guest_name, consumer_id, tracking_token, amount, address")
      .eq("id", requestId)
      .single();

    if (fullRequest && isGuestRequest(fullRequest) && fullRequest.guest_email && fullRequest.guest_name) {
      // Fetch supplier name for the email
      const { data: supplierProfile } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", user.id)
        .single();

      // Fire and forget - don't await, don't block response
      sendGuestNotification({
        type: "accepted",
        guestEmail: fullRequest.guest_email,
        guestName: fullRequest.guest_name,
        requestId: requestId,
        trackingToken: fullRequest.tracking_token || "",
        amount: fullRequest.amount,
        address: fullRequest.address,
        supplierName: supplierProfile?.name || "Su aguatero",
        deliveryWindow: body.deliveryWindow,
      });
    }

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
