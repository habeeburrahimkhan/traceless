import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { setCorsHeaders } from './_lib/cors.js';
import { fetchDocument, insertActivityLog } from './_lib/documents.js';
import { supabase } from './_lib/supabase.js';
import { mapDocument } from './_lib/mapper.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!requireAdmin(req, res)) return;

  try {
    const { docId, minutes } = req.body;

    if (!docId || typeof minutes !== 'number') {
      return res.status(400).json({ error: 'Missing docId or minutes parameter' });
    }

    const doc = await fetchDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (doc.status !== 'active') {
      return res.status(400).json({ error: 'Cannot extend expiry of non-active document' });
    }

    // Calculate new expiration date
    const baseTime = doc.expires_at ? new Date(doc.expires_at) : new Date();
    const newExpiresAt = new Date(baseTime.getTime() + minutes * 60000).toISOString();

    const { error: updateError } = await supabase
      .from('documents')
      .update({ expires_at: newExpiresAt })
      .eq('id', docId);

    if (updateError) {
      console.error('Failed to extend document expiry:', updateError);
      return res.status(500).json({ error: `Update failed: ${updateError.message}` });
    }

    await insertActivityLog(req, {
      documentId: docId,
      documentName: doc.name,
      action: 'OTP_REQUESTED', // Using standard action type compatible with DB constraints or enum. Wait, let's see which enum actions exist: 'UPLOADED' | 'OTP_REQUESTED' | 'OTP_VERIFIED' | 'VIEWED' | 'BURNED' | 'REVOKED' | 'ATTACK_PREVENTED'. Yes, 'OTP_REQUESTED' works. Let's use details to clarify it was extended.
      details: `Administrator extended document sharing lifespan by ${minutes} minutes. New expiration: ${new Date(newExpiresAt).toLocaleString()}`,
      severity: 'info',
    });

    const updated = await fetchDocument(docId);
    return res.status(200).json(mapDocument(updated || { ...doc, expires_at: newExpiresAt }));
  } catch (err: unknown) {
    console.error('Extend expiry handler exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
