import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase.js';
import { setCorsHeaders } from './lib/cors.js';
import { expireDocumentIfNeeded } from './lib/documents.js';
import { mapDocument } from './lib/mapper.js';
import type { DbDocument } from './lib/mapper.js';

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
    const { code } = req.body;

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid OTP code format' });
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('otp_code', code)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ error: 'No active document matches this OTP key' });
    }

    let doc = data as DbDocument;
    doc = await expireDocumentIfNeeded(doc);

    if (doc.status !== 'active') {
      return res.status(410).json({ error: 'Document is no longer active' });
    }

    return res.status(200).json({ document: mapDocument(doc) });
  } catch (err: unknown) {
    console.error('Lookup OTP exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
