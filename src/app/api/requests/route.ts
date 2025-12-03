import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestSchema } from "@/lib/validations/request";

/**
 * POST /api/requests
 * Creates a new water request for guest consumers
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

    // Generate tracking token for guest requests
    const trackingToken = crypto.randomUUID();

    // Create Supabase admin client (bypasses RLS for server-side operations)
    const supabase = createAdminClient();

    // Insert water request into database
    const { data: insertedRequest, error: dbError } = await supabase
      .from("water_requests")
      .insert({
        guest_name: data.name,
        guest_phone: data.phone,
        guest_email: data.email,
        address: data.address,
        special_instructions: data.specialInstructions,
        amount: parseInt(data.amount, 10),
        is_urgent: data.isUrgent,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        tracking_token: trackingToken,
        status: "pending",
      })
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
