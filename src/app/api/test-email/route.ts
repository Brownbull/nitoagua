/**
 * Test Email API Endpoint
 *
 * FOR DEVELOPMENT/TESTING ONLY - Remove or protect in production
 *
 * Usage:
 * POST /api/test-email
 * Body: { "to": "your-email@example.com", "template": "confirmed" | "accepted" | "delivered" }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  sendRequestConfirmedEmail,
  sendRequestAcceptedEmail,
  sendRequestDeliveredEmail,
} from "@/lib/email";

// Only allow in development mode
const isDevelopment = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  // Block in production
  if (!isDevelopment) {
    return NextResponse.json(
      { error: { message: "Test endpoint disabled in production" } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { to, template = "confirmed" } = body as {
      to?: string;
      template?: "confirmed" | "accepted" | "delivered";
    };

    if (!to) {
      return NextResponse.json(
        { error: { message: "Email address (to) is required" } },
        { status: 400 }
      );
    }

    // Sample data for testing
    const testData = {
      customerName: "Usuario de Prueba",
      requestId: `REQ-TEST-${Date.now()}`,
      trackingUrl: `http://localhost:3005/track/test-${Date.now()}`,
      amount: 20,
      address: "Av. Libertador Bernardo O'Higgins 1234, Santiago Centro",
      supplierName: "Agua Pura Test SpA",
      estimatedDelivery: "Hoy, 14:00 - 16:00",
      deliveredAt: new Date().toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      feedbackUrl: `http://localhost:3005/feedback/test-${Date.now()}`,
    };

    let result;

    switch (template) {
      case "confirmed":
        result = await sendRequestConfirmedEmail({
          to,
          customerName: testData.customerName,
          requestId: testData.requestId,
          trackingUrl: testData.trackingUrl,
          amount: testData.amount,
          address: testData.address,
        });
        break;

      case "accepted":
        result = await sendRequestAcceptedEmail({
          to,
          customerName: testData.customerName,
          requestId: testData.requestId,
          trackingUrl: testData.trackingUrl,
          amount: testData.amount,
          address: testData.address,
          supplierName: testData.supplierName,
          estimatedDelivery: testData.estimatedDelivery,
        });
        break;

      case "delivered":
        result = await sendRequestDeliveredEmail({
          to,
          customerName: testData.customerName,
          requestId: testData.requestId,
          amount: testData.amount,
          address: testData.address,
          supplierName: testData.supplierName,
          deliveredAt: testData.deliveredAt,
          feedbackUrl: testData.feedbackUrl,
        });
        break;

      default:
        return NextResponse.json(
          {
            error: {
              message:
                "Invalid template. Use: confirmed, accepted, or delivered",
            },
          },
          { status: 400 }
        );
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        message: `Test email (${template}) sent successfully`,
        emailId: result.data?.id,
        sentTo: to,
        template,
      },
    });
  } catch (error) {
    console.error("[Test Email] Error:", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show usage instructions
export async function GET() {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: { message: "Test endpoint disabled in production" } },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Test Email Endpoint",
    usage: {
      method: "POST",
      body: {
        to: "your-email@example.com (required)",
        template: "confirmed | accepted | delivered (default: confirmed)",
      },
      example: {
        curl: 'curl -X POST http://localhost:3005/api/test-email -H "Content-Type: application/json" -d \'{"to":"test@example.com","template":"confirmed"}\'',
      },
    },
    note: "Make sure RESEND_API_KEY is set in your .env.local file",
  });
}
