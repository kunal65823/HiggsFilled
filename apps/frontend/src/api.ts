import type { ApiEnvelope } from "./types";

const API_BASE_URL = `http://${window.location.hostname}:3000/api/v1`;

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    const details = payload.errors?.join(", ");
    throw new Error(details ? `${payload.message}: ${details}` : payload.message);
  }

  return payload;
}

export function withUserId(path: string, userId?: string) {
  if (!userId) return path;

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}userId=${encodeURIComponent(userId)}`;
}
