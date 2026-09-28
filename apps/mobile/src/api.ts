import type { CreateSignalInput, PulseCell, SignalRecord } from "@aurora/domain";

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const API_URL = (configuredApiUrl || (__DEV__ ? "http://10.0.2.2:8787" : "https://aurora-app-api.neuronax-sas.workers.dev")).replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(`aurora_api_${response.status}`);
  return response.json() as Promise<T>;
}

export function fetchPulse(latitude: number, longitude: number, signal?: AbortSignal): Promise<{
  readonly cells: readonly PulseCell[];
  readonly recentSignals: readonly SignalRecord[];
}> {
  const radius = 0.12;
  const params = new URLSearchParams({
    west: String(longitude - radius),
    south: String(latitude - radius),
    east: String(longitude + radius),
    north: String(latitude + radius),
    // Published Signals remain available by default; the web surface offers
    // optional recency filters without changing the shared API contract.
    sinceHours: "0",
    kind: "all",
  });
  return request(`/v1/pulse?${params}`, signal ? { signal } : undefined);
}

export function submitSignal(input: CreateSignalInput): Promise<{ readonly id: string; readonly status: "published" | "pending" }> {
  return request("/v1/signals", { method: "POST", body: JSON.stringify(input) });
}

export interface LocalMediaAsset {
  readonly uri: string;
  readonly name: string;
  readonly mimeType: string;
}

export async function uploadSignalMedia(asset: LocalMediaAsset): Promise<{ readonly mediaKey: string }> {
  const form = new FormData();
  form.append("file", { uri: asset.uri, name: asset.name, type: asset.mimeType } as unknown as Blob);
  const response = await fetch(`${API_URL}/v1/media`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: form,
  });
  if (!response.ok) throw new Error(`aurora_media_${response.status}`);
  return response.json() as Promise<{ readonly mediaKey: string }>;
}

export interface WalkShareCredentials {
  readonly viewToken: string;
  readonly editToken: string;
  readonly viewerUrl: string;
  readonly expiresAt: number;
}

export function createWalkShare(durationMinutes: number, label: string): Promise<WalkShareCredentials> {
  return request("/v1/walk-shares", { method: "POST", body: JSON.stringify({ durationMinutes, label }) });
}

export function updateWalkShare(
  credentials: WalkShareCredentials,
  location: { readonly latitude: number; readonly longitude: number; readonly accuracyMeters: number | null },
  status: "active" | "arrived" | "ended" = "active",
): Promise<{ readonly ok: true }> {
  return request(`/v1/walk-shares/${encodeURIComponent(credentials.viewToken)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${credentials.editToken}` },
    body: JSON.stringify({ ...location, status }),
  });
}

export function endWalkShare(credentials: WalkShareCredentials): Promise<{ readonly ok: true }> {
  return request(`/v1/walk-shares/${encodeURIComponent(credentials.viewToken)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${credentials.editToken}` },
  });
}

export { API_URL };
