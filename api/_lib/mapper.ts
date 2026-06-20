export interface DbDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploaded_at: string;
  expires_at: string | null;
  max_views: number;
  views_count: number;
  otp_email: string;
  otp_code: string | null;
  require_watermark: boolean;
  require_email_verification: boolean;
  status: string;
  decryption_key: string;
  storage_path: string;
}

export interface DbActivityLog {
  id: string;
  timestamp: string;
  document_id: string;
  document_name: string;
  action: string;
  ip_address: string;
  location: string;
  details: string;
  severity: string;
}

export function mapDocument(row: DbDocument, extras: { content?: string; includeSecrets?: boolean } = {}) {
  const includeSecrets = extras.includeSecrets ?? false;

  return {
    id: row.id,
    name: row.name,
    size: row.size,
    type: row.type,
    uploadedAt: row.uploaded_at,
    expiresAt: row.expires_at,
    maxViews: row.max_views,
    viewsCount: row.views_count,
    otpEmail: row.otp_email || '',
    requireWatermark: row.require_watermark,
    requireEmailVerification: row.require_email_verification,
    status: row.status,
    content: extras.content ?? '',
    ...(includeSecrets
      ? {
          otpCode: row.otp_code,
          decryptionKey: row.decryption_key,
        }
      : {}),
  };
}

export function mapActivityLog(row: DbActivityLog) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    documentId: row.document_id,
    documentName: row.document_name,
    action: row.action,
    ipAddress: row.ip_address,
    location: row.location || '',
    details: row.details,
    severity: row.severity,
  };
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '0.0.0.0';
}
