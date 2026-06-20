import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { setCorsHeaders } from './_lib/cors.js';
import { fetchDocument, shredDocument } from './_lib/documents.js';
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

  try {
    const { docId, actionType } = req.body;

    if (actionType === 'revoked') {
      if (!requireAdmin(req, res)) return;
    }

    if (!docId) {
      return res.status(400).json({ error: 'Missing docId parameter' });
    }

    const doc = await fetchDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const burnType = actionType === 'revoked' ? 'revoked' : actionType === 'expired' ? 'expired' : 'burned';

    if (doc.status === 'active') {
      await shredDocument(doc, burnType);
    }

    const updated = await fetchDocument(docId);
    return res.status(200).json(mapDocument(updated || { ...doc, status: burnType }));
  } catch (err: unknown) {
    console.error('Burn handler exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
