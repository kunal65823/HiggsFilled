import type { ApiEnvelope } from "./types";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_BASE_URL}. Start the backend and try again.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`The backend returned an invalid response (${response.status}).`);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    typeof payload.success !== "boolean"
  ) {
    throw new Error(`The backend returned an unexpected response (${response.status}).`);
  }

  const result = payload as ApiEnvelope<T>;
  if (!response.ok || !result.success) {
    const details = Array.isArray(result.errors) ? result.errors.join(", ") : "";
    const message = result.message || `Request failed (${response.status})`;
    throw new Error(details ? `${message}: ${details}` : message);
  }

  return result;
}

export function withUserId(path: string, userId?: string) {
  if (!userId) return path;

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}userId=${encodeURIComponent(userId)}`;
}
