import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './lib/cors.js';
import { expireDocumentIfNeeded, fetchDocument } from './lib/documents.js';
import { mapDocument } from './lib/mapper.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const docId = typeof req.query.docId === 'string' ? req.query.docId : '';

    if (!docId) {
      return res.status(400).json({ error: 'Missing docId query parameter' });
    }

    let doc = await fetchDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    doc = await expireDocumentIfNeeded(doc);

    return res.status(200).json({ document: mapDocument(doc) });
  } catch (err: unknown) {
    console.error('Document handler exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
