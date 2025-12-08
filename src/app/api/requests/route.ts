import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requestSchema } from "@/lib/validations/request";
import { isGuestRequest, sendGuestNotification } from "@/lib/email";

/**
 * POST /api/requests
 * Creates a new water request for both guest and registered consumers
 *
 * Request Body: RequestInput from validation schema
 * Response: { data: { id, trackingToken, status, createdAt }, error: null } on success
 *           { data: null, error: { message, code } } on failure
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      // Zod v4 uses .issues instead of .errors
      const firstIssue = validationResult.error.issues[0];
      return NextResponse.json(
        {
          data: null,
          error: {
            message: firstIssue?.message || "Datos inválidos",
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if user is authenticated
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    // Generate tracking token for guest requests (still useful for sharing)
    const trackingToken = crypto.randomUUID();

    // Create Supabase admin client (bypasses RLS for server-side operations)
    const supabase = createAdminClient();

    // Build insert data - set consumer_id if logged in, otherwise use guest fields
    const baseInsertData = {
      address: data.address,
      special_instructions: data.specialInstructions,
      amount: parseInt(data.amount, 10),
      is_urgent: data.isUrgent,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      tracking_token: trackingToken,
      status: "pending" as const,
      guest_name: data.name,
      guest_phone: data.phone,
      guest_email: data.email,
    };

    // Add consumer_id if logged in
    const insertData = user
      ? { ...baseInsertData, consumer_id: user.id }
      : baseInsertData;

    // Insert water request into database
    const { data: insertedRequest, error: dbError } = await supabase
      .from("water_requests")
      .insert(insertData)
      .select("id, tracking_token, status, created_at")
      .single();

    if (dbError) {
      console.error("[API/REQUESTS]", { action: "insert", error: dbError });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Error al crear la solicitud. Por favor intenta de nuevo.",
            code: "DATABASE_ERROR",
          },
        },
        { status: 500 }
      );
    }

    // Send confirmation email for guest requests (non-blocking)
    const requestForCheck = {
      guest_email: insertData.guest_email ?? null,
      consumer_id: user?.id ?? null,
    };

    if (isGuestRequest(requestForCheck) && insertData.guest_email && insertData.guest_name) {
      // Fetch supplier info for email (MVP: single supplier)
      const { data: supplier } = await supabase
        .from("profiles")
        .select("phone")
        .eq("role", "supplier")
        .limit(1)
        .single();

      // Fire and forget - don't await, don't block response
      sendGuestNotification({
        type: "confirmed",
        guestEmail: insertData.guest_email,
        guestName: insertData.guest_name,
        requestId: insertedRequest.id,
        trackingToken: insertedRequest.tracking_token || "",
        amount: insertData.amount,
        address: insertData.address,
        supplierPhone: supplier?.phone,
      });
    }

    // Return success response
    return NextResponse.json(
      {
        data: {
          id: insertedRequest.id,
          trackingToken: insertedRequest.tracking_token,
          status: insertedRequest.status,
          createdAt: insertedRequest.created_at,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API/REQUESTS]", { action: "unexpected_error", error });
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
