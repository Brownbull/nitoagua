import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  supplierProfileSchema,
  type SupplierProfile,
} from "@/lib/validations/supplier-profile";

/**
 * GET /api/supplier/profile
 * Returns the current supplier's profile
 *
 * Response: { data: SupplierProfile, error: null }
 * Error: { data: null, error: { message, code } }
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[API/SUPPLIER/PROFILE/GET]", {
        action: "auth",
        error: userError?.message || "No user",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Debes iniciar sesión para ver tu perfil",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("[API/SUPPLIER/PROFILE/GET]", {
        action: "fetch_profile",
        userId: user.id,
        error: profileError?.message || "Not found",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Perfil no encontrado",
            code: "NOT_FOUND",
          },
        },
        { status: 404 }
      );
    }

    // Verify user is a supplier
    if (profile.role !== "supplier") {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Solo los proveedores pueden acceder a este recurso",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      );
    }

    // Transform to SupplierProfile type
    const supplierProfile: SupplierProfile = {
      id: profile.id,
      role: "supplier",
      name: profile.name || "",
      phone: profile.phone || "",
      serviceArea: profile.service_area || "",
      price100l: profile.price_100l || 0,
      price1000l: profile.price_1000l || 0,
      price5000l: profile.price_5000l || 0,
      price10000l: profile.price_10000l || 0,
      isAvailable: profile.is_available ?? true,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
    };

    return NextResponse.json(
      {
        data: supplierProfile,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API/SUPPLIER/PROFILE/GET]", {
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

/**
 * PATCH /api/supplier/profile
 * Updates the current supplier's profile
 *
 * Request: SupplierProfileInput
 * Response: { data: SupplierProfile, error: null }
 * Error: { data: null, error: { message, code } }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[API/SUPPLIER/PROFILE/PATCH]", {
        action: "auth",
        error: userError?.message || "No user",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Debes iniciar sesión para actualizar tu perfil",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    // Verify user is a supplier
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !existingProfile) {
      console.error("[API/SUPPLIER/PROFILE/PATCH]", {
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

    if (existingProfile.role !== "supplier") {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Solo los proveedores pueden actualizar este perfil",
            code: "FORBIDDEN",
          },
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = supplierProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message).join(", ");
      console.error("[API/SUPPLIER/PROFILE/PATCH]", {
        action: "validation",
        errors: validationResult.error.issues,
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: errors,
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        name: data.name,
        phone: data.phone,
        service_area: data.serviceArea,
        price_100l: data.price100l,
        price_1000l: data.price1000l,
        price_5000l: data.price5000l,
        price_10000l: data.price10000l,
        is_available: data.isAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError || !updatedProfile) {
      console.error("[API/SUPPLIER/PROFILE/PATCH]", {
        action: "update",
        userId: user.id,
        error: updateError?.message || "Update failed",
      });
      return NextResponse.json(
        {
          data: null,
          error: {
            message: "Error al actualizar el perfil. Por favor intenta de nuevo.",
            code: "UPDATE_ERROR",
          },
        },
        { status: 500 }
      );
    }

    // Transform to SupplierProfile type
    const supplierProfile: SupplierProfile = {
      id: updatedProfile.id,
      role: "supplier",
      name: updatedProfile.name || "",
      phone: updatedProfile.phone || "",
      serviceArea: updatedProfile.service_area || "",
      price100l: updatedProfile.price_100l || 0,
      price1000l: updatedProfile.price_1000l || 0,
      price5000l: updatedProfile.price_5000l || 0,
      price10000l: updatedProfile.price_10000l || 0,
      isAvailable: updatedProfile.is_available ?? true,
      createdAt: updatedProfile.created_at || new Date().toISOString(),
      updatedAt: updatedProfile.updated_at || new Date().toISOString(),
    };

    console.log("[API/SUPPLIER/PROFILE/PATCH]", {
      action: "success",
      userId: user.id,
    });

    return NextResponse.json(
      {
        data: supplierProfile,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API/SUPPLIER/PROFILE/PATCH]", {
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
