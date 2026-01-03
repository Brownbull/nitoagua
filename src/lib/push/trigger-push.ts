"use server";

import { sendPushToUser, type PushPayload } from "./send-push";

/**
 * Push Notification Triggers
 * Story 12-6: Web Push Notifications
 *
 * AC12.6.7: Fire push on same events as in-app notifications
 * AC12.6.8: Coordinate with in-app to prevent duplicate perception
 *
 * This module provides trigger functions that are called alongside
 * in-app notification creation to also send push notifications.
 */

// Common icon path
const DEFAULT_ICON = "/icons/icon-192.png";

/**
 * Send push for offer accepted notification
 * AC12.6.7: Provider receives push when their offer is accepted
 *
 * @param providerId - The provider user ID
 * @param requestId - The request ID
 * @param amount - Water amount in liters
 * @param comuna - Delivery location
 */
export async function triggerOfferAcceptedPush(
  providerId: string,
  requestId: string,
  amount: number,
  comuna: string
): Promise<void> {
  console.log(
    `[TriggerPush] triggerOfferAcceptedPush called - provider: ${providerId}, request: ${requestId}`
  );
  const notification: PushPayload = {
    title: "¡Tu oferta fue aceptada!",
    body: `Solicitud de ${amount.toLocaleString("es-CL")}L en ${comuna || "tu área"}`,
    icon: DEFAULT_ICON,
    url: `/provider/deliveries/${requestId}`,
    tag: `offer-accepted-${requestId}`,
    data: {
      type: "offer_accepted",
      request_id: requestId,
    },
  };

  try {
    const result = await sendPushToUser(providerId, notification);
    console.log(`[TriggerPush] offer_accepted push result:`, JSON.stringify(result));
  } catch (error) {
    console.error("[TriggerPush] Error sending offer_accepted push:", error);
  }
}

/**
 * Send push for new offer notification
 * AC12.6.7: Consumer receives push when a new offer arrives
 *
 * @param consumerId - The consumer user ID
 * @param requestId - The request ID
 * @param amount - Water amount in liters
 * @param offerCount - Number of offers now available
 */
export async function triggerNewOfferPush(
  consumerId: string,
  requestId: string,
  amount: number,
  offerCount: number
): Promise<void> {
  console.log(
    `[TriggerPush] triggerNewOfferPush called - consumer: ${consumerId}, request: ${requestId}, offerCount: ${offerCount}`
  );
  const notification: PushPayload = {
    title: "Nueva oferta recibida",
    body: `Un proveedor ha enviado una oferta para tu solicitud de ${amount.toLocaleString("es-CL")}L`,
    icon: DEFAULT_ICON,
    url: `/request/${requestId}/offers`,
    tag: `new-offer-${requestId}`,
    data: {
      type: "new_offer",
      request_id: requestId,
      offer_count: offerCount,
    },
  };

  try {
    await sendPushToUser(consumerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending new_offer push:", error);
  }
}

/**
 * Send push for delivery completed notification
 * AC12.6.7: Consumer receives push when delivery is completed
 *
 * @param consumerId - The consumer user ID
 * @param requestId - The request ID
 * @param amount - Water amount in liters
 */
export async function triggerDeliveryCompletedPush(
  consumerId: string,
  requestId: string,
  amount: number
): Promise<void> {
  console.log(
    `[TriggerPush] triggerDeliveryCompletedPush called - consumer: ${consumerId}, request: ${requestId}`
  );
  const notification: PushPayload = {
    title: "¡Entrega completada!",
    body: `Tu pedido de ${amount.toLocaleString("es-CL")} litros ha sido entregado`,
    icon: DEFAULT_ICON,
    url: `/request/${requestId}`,
    tag: `delivery-completed-${requestId}`,
    data: {
      type: "delivery_completed",
      request_id: requestId,
    },
  };

  try {
    await sendPushToUser(consumerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending delivery_completed push:", error);
  }
}

/**
 * Send push for request timeout notification
 * AC12.6.7: Consumer receives push when request times out
 *
 * @param consumerId - The consumer user ID
 * @param requestId - The request ID
 */
export async function triggerRequestTimeoutPush(
  consumerId: string,
  requestId: string
): Promise<void> {
  console.log(
    `[TriggerPush] triggerRequestTimeoutPush called - consumer: ${consumerId}, request: ${requestId}`
  );
  const notification: PushPayload = {
    title: "Solicitud sin ofertas",
    body: "No recibimos ofertas para tu solicitud. Puedes crear una nueva cuando lo necesites.",
    icon: DEFAULT_ICON,
    url: `/request/${requestId}`,
    tag: `request-timeout-${requestId}`,
    data: {
      type: "request_timeout",
      request_id: requestId,
    },
  };

  try {
    await sendPushToUser(consumerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending request_timeout push:", error);
  }
}

/**
 * Send push for provider verification approved
 * AC12.6.7: Provider receives push when their account is approved
 *
 * @param providerId - The provider user ID
 */
export async function triggerVerificationApprovedPush(
  providerId: string
): Promise<void> {
  console.log(
    `[TriggerPush] triggerVerificationApprovedPush called - provider: ${providerId}`
  );
  const notification: PushPayload = {
    title: "¡Cuenta verificada!",
    body: "Tu cuenta ha sido aprobada. Ya puedes empezar a recibir solicitudes.",
    icon: DEFAULT_ICON,
    url: `/provider/requests`,
    tag: `verification-approved`,
    data: {
      type: "verification_approved",
    },
  };

  try {
    await sendPushToUser(providerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending verification_approved push:", error);
  }
}

/**
 * Send push for provider in-transit notification
 * AC12.6.7: Consumer receives push when provider is on the way
 *
 * @param consumerId - The consumer user ID
 * @param requestId - The request ID
 * @param providerName - Name of the provider
 */
export async function triggerInTransitPush(
  consumerId: string,
  requestId: string,
  providerName: string
): Promise<void> {
  console.log(
    `[TriggerPush] triggerInTransitPush called - consumer: ${consumerId}, request: ${requestId}`
  );
  const notification: PushPayload = {
    title: "¡Proveedor en camino!",
    body: `${providerName} está en camino con tu pedido`,
    icon: DEFAULT_ICON,
    url: `/request/${requestId}`,
    tag: `in-transit-${requestId}`,
    data: {
      type: "in_transit",
      request_id: requestId,
    },
  };

  try {
    await sendPushToUser(consumerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending in_transit push:", error);
  }
}

/**
 * Send push for request filled (other provider selected)
 * AC12.6.7: Provider receives push when their offer was not selected
 *
 * @param providerId - The provider user ID
 * @param requestId - The request ID
 */
export async function triggerRequestFilledPush(
  providerId: string,
  requestId: string
): Promise<void> {
  console.log(
    `[TriggerPush] triggerRequestFilledPush called - provider: ${providerId}, request: ${requestId}`
  );
  const notification: PushPayload = {
    title: "Solicitud asignada",
    body: "La solicitud ya fue asignada a otro repartidor",
    icon: DEFAULT_ICON,
    url: `/provider/offers`,
    tag: `request-filled-${requestId}`,
    data: {
      type: "offer_request_filled",
      request_id: requestId,
    },
  };

  try {
    await sendPushToUser(providerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending request_filled push:", error);
  }
}

/**
 * Send push for request cancelled by consumer
 * AC12.6.7: Provider receives push when consumer cancels request
 *
 * @param providerId - The provider user ID
 * @param requestId - The request ID
 */
export async function triggerRequestCancelledPush(
  providerId: string,
  requestId: string
): Promise<void> {
  console.log(
    `[TriggerPush] triggerRequestCancelledPush called - provider: ${providerId}, request: ${requestId}`
  );
  const notification: PushPayload = {
    title: "Solicitud cancelada",
    body: "El cliente ha cancelado la solicitud",
    icon: DEFAULT_ICON,
    url: `/provider/offers`,
    tag: `request-cancelled-${requestId}`,
    data: {
      type: "request_cancelled",
      request_id: requestId,
    },
  };

  try {
    await sendPushToUser(providerId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending request_cancelled push:", error);
  }
}

/**
 * Send push for dispute resolved notification
 * Both consumer and provider receive push when admin resolves a dispute
 *
 * @param userId - The user ID (consumer or provider)
 * @param requestId - The request ID
 * @param message - The resolution message
 * @param isProvider - Whether this is for a provider (affects URL)
 */
export async function triggerDisputeResolvedPush(
  userId: string,
  requestId: string,
  message: string,
  isProvider: boolean
): Promise<void> {
  console.log(
    `[TriggerPush] triggerDisputeResolvedPush called - user: ${userId}, request: ${requestId}, isProvider: ${isProvider}`
  );

  // Route to appropriate view based on user type
  const url = isProvider ? `/provider/offers` : `/request/${requestId}`;

  const notification: PushPayload = {
    title: "Disputa Resuelta",
    body: message,
    icon: DEFAULT_ICON,
    url,
    tag: `dispute-resolved-${requestId}`,
    data: {
      type: "dispute_resolved",
      request_id: requestId,
    },
  };

  try {
    await sendPushToUser(userId, notification);
  } catch (error) {
    console.error("[TriggerPush] Error sending dispute_resolved push:", error);
  }
}
