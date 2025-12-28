/**
 * VAPID Configuration for Web Push Notifications
 *
 * VAPID (Voluntary Application Server Identification) keys are used to
 * authenticate the application server with push services.
 *
 * Key Generation:
 * ```bash
 * node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('Public:', keys.publicKey); console.log('Private:', keys.privateKey);"
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Push_API
 */

// Public VAPID key - safe to expose to client
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Validate VAPID key is configured
export function isVapidConfigured(): boolean {
  return VAPID_PUBLIC_KEY.length > 0;
}

/**
 * Convert VAPID public key to ArrayBuffer for PushManager.subscribe()
 *
 * The applicationServerKey must be a BufferSource (ArrayBuffer or ArrayBufferView),
 * but VAPID keys are stored as base64url strings. This function converts between formats.
 */
export function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  // Return the underlying ArrayBuffer for type compatibility
  return outputArray.buffer as ArrayBuffer;
}
