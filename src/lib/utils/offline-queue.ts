import type { RequestInput } from "@/lib/validations/request";

const QUEUE_KEY = "nitoagua_request_queue";

/**
 * A request that has been queued for offline submission
 */
export interface QueuedRequest {
  data: RequestInput;
  queuedAt: string;
}

/**
 * Response from the API after submission
 */
export interface SubmissionResponse {
  data: {
    id: string;
    trackingToken: string;
    status: string;
    createdAt: string;
  } | null;
  error: {
    message: string;
    code: string;
  } | null;
}

/**
 * Adds a request to the offline queue in localStorage
 */
export function queueRequest(data: RequestInput): void {
  if (typeof window === "undefined") return;

  const queue = getQueuedRequests();
  queue.push({ data, queuedAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Gets all queued requests from localStorage
 */
export function getQueuedRequests(): QueuedRequest[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Removes a specific request from the queue by index
 */
export function removeFromQueue(index: number): void {
  if (typeof window === "undefined") return;

  const queue = getQueuedRequests();
  if (index >= 0 && index < queue.length) {
    queue.splice(index, 1);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
}

/**
 * Clears the entire queue
 */
export function clearQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

/**
 * Submits a single request to the API
 */
async function submitRequest(
  data: RequestInput
): Promise<SubmissionResponse> {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

/**
 * Processes all queued requests when online
 * Returns an array of results for each processed request
 */
export async function processQueue(): Promise<
  Array<{ success: boolean; response?: SubmissionResponse; error?: Error }>
> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return [];
  }

  const queue = getQueuedRequests();
  if (queue.length === 0) return [];

  const results: Array<{
    success: boolean;
    response?: SubmissionResponse;
    error?: Error;
  }> = [];

  // Process queue in order, removing successful ones
  for (let i = 0; i < queue.length; i++) {
    try {
      const response = await submitRequest(queue[i].data);

      if (response.data && !response.error) {
        // Success - remove from queue
        removeFromQueue(0); // Always remove from index 0 since we're processing in order
        results.push({ success: true, response });
      } else {
        // API returned an error - keep in queue for retry
        results.push({ success: false, response });
      }
    } catch (error) {
      // Network error - keep in queue
      results.push({
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }

  return results;
}

/**
 * Checks if the browser is currently online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

/**
 * Registers an event listener to process the queue when coming back online
 * Should be called once at app initialization
 */
export function registerOnlineListener(
  onProcessed?: (results: Awaited<ReturnType<typeof processQueue>>) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = async () => {
    const results = await processQueue();
    if (results.length > 0 && onProcessed) {
      onProcessed(results);
    }
  };

  window.addEventListener("online", handleOnline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
