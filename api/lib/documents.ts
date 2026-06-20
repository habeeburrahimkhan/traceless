import { supabase } from './supabase.js';
import type { DbDocument } from './mapper.js';
import { getClientIp } from './mapper.js';
import type { VercelRequest } from '@vercel/node';

const BUCKET = 'traceless-files';

export async function fetchDocument(docId: string): Promise<DbDocument | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbDocument;
}

export async function expireDocumentIfNeeded(doc: DbDocument): Promise<DbDocument> {
  if (doc.status !== 'active' || !doc.expires_at) return doc;

  if (new Date(doc.expires_at) <= new Date()) {
    await shredDocument(doc, 'expired');
    return { ...doc, status: 'expired', otp_code: null, decryption_key: '0x0000...0000 (PURGED)' };
  }

  return doc;
}

export async function shredDocument(
  doc: DbDocument,
  actionType: 'burned' | 'expired' | 'revoked'
) {
  if (doc.storage_path) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const status = actionType === 'revoked' ? 'revoked' : actionType === 'expired' ? 'expired' : 'burned';
  const keyLabel =
    actionType === 'revoked' ? '0x0000...0000 (REVOKED)' : '0x0000...0000 (PURGED)';

  await supabase
    .from('documents')
    .update({
      status,
      otp_code: null,
      decryption_key: keyLabel,
    })
    .eq('id', doc.id);

  const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
  await supabase.from('activity_logs').insert([
    {
      id: logId,
      timestamp: new Date().toISOString(),
      document_id: doc.id,
      document_name: doc.name,
      action: actionType === 'revoked' ? 'REVOKED' : 'BURNED',
      ip_address: actionType === 'revoked' ? '185.190.140.2' : '0.0.0.0 (System)',
      location: '',
      details:
        actionType === 'revoked'
          ? 'Admin revoked sharing credentials manually. Secure link invalidated.'
          : actionType === 'expired'
            ? 'Document lifespan expired. Shredding in memory structures.'
            : 'Access count ceiling met. Cryptographic key purged.',
      severity: actionType === 'revoked' ? 'critical' : 'warning',
    },
  ]);
}

export async function downloadDocumentContent(doc: DbDocument): Promise<string> {
  const { data: storageFile, error } = await supabase.storage.from(BUCKET).download(doc.storage_path);

  if (error || !storageFile) {
    throw new Error('Decrypted payload buffer download failed');
  }

  if (doc.type === 'text') {
    return storageFile.text();
  }

  const arrayBuffer = await storageFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  if (doc.type === 'pdf') {
    return `data:application/pdf;base64,${base64}`;
  }

  if (doc.type === 'image') {
    const ext = doc.name.split('.').pop()?.toLowerCase();
    const mime =
      ext === 'jpg' || ext === 'jpeg'
        ? 'image/jpeg'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'gif'
            ? 'image/gif'
            : 'image/png';
    return `data:${mime};base64,${base64}`;
  }

  return `data:application/octet-stream;base64,${base64}`;
}

export async function insertActivityLog(
  req: VercelRequest,
  entry: {
    documentId: string;
    documentName: string;
    action: string;
    details: string;
    severity: string;
    ipAddress?: string;
  }
) {
  const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
  await supabase.from('activity_logs').insert([
    {
      id: logId,
      timestamp: new Date().toISOString(),
      document_id: entry.documentId,
      document_name: entry.documentName,
      action: entry.action,
      ip_address: entry.ipAddress || getClientIp(req),
      location: '',
      details: entry.details,
      severity: entry.severity,
    },
  ]);
}
