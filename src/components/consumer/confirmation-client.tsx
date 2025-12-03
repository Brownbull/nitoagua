"use client";

import { useEffect, useRef } from "react";
import { RequestConfirmation } from "./request-confirmation";

interface StoredRequestResponse {
  id: string;
  trackingToken: string;
  status: "pending";
  createdAt: string;
}

interface ConfirmationClientProps {
  requestId: string;
  supplierPhone: string | null;
}

/**
 * Read and parse stored request data from sessionStorage
 * Returns the stored data or a fallback based on requestId
 */
function getStoredRequestData(requestId: string): StoredRequestResponse {
  if (typeof window === "undefined") {
    return {
      id: requestId,
      trackingToken: requestId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  const storedData = sessionStorage.getItem("nitoagua_last_request");

  if (storedData) {
    try {
      return JSON.parse(storedData) as StoredRequestResponse;
    } catch {
      // Invalid JSON, use fallback
    }
  }

  // Fallback for direct URL access
  return {
    id: requestId,
    trackingToken: requestId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

/**
 * ConfirmationClient Component
 *
 * Client component that:
 * 1. Reads request data from sessionStorage (stored by request form on submission)
 * 2. Falls back to URL param if sessionStorage is empty (direct URL access)
 * 3. Clears sessionStorage after first render
 * 4. Renders the RequestConfirmation component with appropriate data
 */
export function ConfirmationClient({
  requestId,
  supplierPhone,
}: ConfirmationClientProps) {
  // Read data synchronously on first render - sessionStorage is synchronous
  const requestData = getStoredRequestData(requestId);

  // Track if cleanup has been done
  const cleanupDone = useRef(false);

  // Clean up sessionStorage after component mounts (side effect only)
  useEffect(() => {
    if (!cleanupDone.current) {
      sessionStorage.removeItem("nitoagua_last_request");
      cleanupDone.current = true;
    }
  }, []);

  return (
    <RequestConfirmation
      requestId={requestData.id}
      trackingToken={requestData.trackingToken}
      supplierPhone={supplierPhone}
      isGuest={true} // For MVP, all requests are guest requests
    />
  );
}
