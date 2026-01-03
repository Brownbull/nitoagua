// nitoagua Service Worker
// Cache-first strategy for static assets, network-first for API
// Push notifications for background alerts (Story 12-6)

// Version should be updated with each deploy for update detection
// IMPORTANT: Increment version when push handlers change
const SW_VERSION = "2.6.0";
const CACHE_NAME = `nitoagua-v${SW_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = ["/", "/icons/icon-192.png", "/icons/icon-512.png"];

// Install event - pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      // Don't call skipWaiting here - wait for user to trigger update
  );
});

// Message event - handle update requests from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches that don't match current version
              return (
                cacheName.startsWith("nitoagua-") && cacheName !== CACHE_NAME
              );
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - cache-first for static, network-first for API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first for API routes
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets
  event.respondWith(cacheFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Return offline fallback if available
    return caches.match("/");
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return error response
    return new Response("Network error", { status: 503 });
  }
}

// =============================================================================
// PUSH NOTIFICATIONS (Story 12-6)
// =============================================================================

/**
 * Push event handler
 * AC12.6.4: Parse notification payload and display
 *
 * Payload structure:
 * {
 *   title: string,
 *   body: string,
 *   icon?: string,
 *   url?: string,
 *   tag?: string,
 *   data?: object
 * }
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  // Default notification if no payload
  let notification = {
    title: "NitoAgua",
    body: "Tienes una nueva notificación",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: "/",
    tag: "nitoagua-notification",
  };

  // Parse payload if present
  if (event.data) {
    try {
      const payload = event.data.json();
      notification = {
        title: payload.title || notification.title,
        body: payload.body || notification.body,
        icon: payload.icon || notification.icon,
        badge: notification.badge,
        url: payload.url || notification.url,
        tag: payload.tag || notification.tag,
        data: payload.data || {},
      };
    } catch (e) {
      console.error("[SW] Error parsing push payload:", e);
      // Try as text
      notification.body = event.data.text() || notification.body;
    }
  }

  // AC12.6.4: Display notification using self.registration.showNotification()
  const options = {
    body: notification.body,
    icon: notification.icon,
    badge: notification.badge,
    tag: notification.tag,
    data: {
      url: notification.url,
      ...notification.data,
    },
    // Android-specific options
    vibrate: [200, 100, 200],
    requireInteraction: false,
    // Actions for quick response
    actions: [
      {
        action: "view",
        title: "Ver detalles",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(notification.title, options));
});

/**
 * Notification click handler
 * AC12.6.4: Navigate to correct URL on click using clients.openWindow()
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  // AC12.6.4: Close notification after click
  event.notification.close();

  // Get the URL to navigate to (relative path)
  const urlPath = event.notification.data?.url || "/";
  // Build full URL
  const urlToOpen = new URL(urlPath, self.location.origin).href;

  console.log("[SW] Will navigate to:", urlToOpen);

  // Handle action clicks
  if (event.action === "view") {
    // "Ver detalles" action - same as clicking notification
  }

  // AC12.6.4: Navigate to correct URL
  // Strategy: Focus existing window and use postMessage to navigate,
  // or open new window if no existing window found
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windowClients) => {
        console.log("[SW] Found", windowClients.length, "window client(s)");

        // First, try to find an existing window at our origin
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            console.log("[SW] Found existing window:", client.url);

            // Try to focus the window first
            if ("focus" in client) {
              await client.focus();
            }

            // Use postMessage to tell the app to navigate
            // This works even for uncontrolled clients
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: urlPath,
            });

            console.log("[SW] Sent NOTIFICATION_CLICK message to client");
            return;
          }
        }

        // No existing window found, open new one
        console.log("[SW] No existing window found, opening new one");
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Push subscription change handler
 * AC12.6.10: Handle subscription renewal when service worker updates
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed");

  // The old subscription is no longer valid
  // Re-subscribe and notify the server
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        // Note: applicationServerKey would need to be passed from the page
        // This event is rare and usually handled by the browser
      })
      .then((subscription) => {
        console.log("[SW] Re-subscribed to push:", subscription.endpoint);
        // The new subscription should be sent to the server
        // This would typically be handled by the app when it next loads
      })
      .catch((err) => {
        console.error("[SW] Failed to re-subscribe:", err);
      })
  );
});
