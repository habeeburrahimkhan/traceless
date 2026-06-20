import type { ActivityLog, Document } from '../context/SimulationContext';

const ADMIN_TOKEN_KEY = 'tl_admin_token';

export function getAdminToken(): string {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getShareUrl(docId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?page=viewer&docId=${encodeURIComponent(docId)}`;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const adminToken = getAdminToken();
  if (adminToken) {
    headers.set('X-Admin-Token', adminToken);
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Request failed');
  }

  return data as T;
}

export async function fetchDashboardData(): Promise<{
  documents: Document[];
  activityLogs: ActivityLog[];
}> {
  return apiFetch('/api/dashboard-data');
}

export async function uploadDocument(payload: {
  name: string;
  size: string;
  type: string;
  requireEmailVerification: boolean;
  otpEmail: string;
  requireWatermark: boolean;
  maxViews: number;
  expiresAt: string | null;
  content: string;
}): Promise<Document> {
  return apiFetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchDocumentMetadata(docId: string): Promise<Document> {
  const data = await apiFetch<{ document: Document }>(`/api/document?docId=${encodeURIComponent(docId)}`);
  return data.document;
}

export async function lookupDocumentByOtp(code: string): Promise<Document> {
  const data = await apiFetch<{ document: Document }>('/api/lookup-otp', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return data.document;
}

export async function requestOtp(docId: string, email: string): Promise<{ emailSent: boolean; devOtp?: string }> {
  return apiFetch('/api/request-otp', {
    method: 'POST',
    body: JSON.stringify({ docId, email }),
  });
}

export async function verifyOtp(docId: string, code: string): Promise<Document> {
  return apiFetch('/api/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ docId, code }),
  });
}

export async function burnDocumentApi(docId: string, actionType: 'burned' | 'expired' | 'revoked'): Promise<Document> {
  return apiFetch('/api/burn', {
    method: 'POST',
    body: JSON.stringify({ docId, actionType }),
  });
}

export async function clearLogsApi(): Promise<void> {
  await apiFetch('/api/clear-logs', { method: 'POST' });
}
