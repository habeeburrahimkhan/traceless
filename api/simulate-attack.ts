import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from './_lib/auth.js';
import { setCorsHeaders } from './_lib/cors.js';
import { insertActivityLog, fetchDocument } from './_lib/documents.js';
import { supabase } from './_lib/supabase.js';

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
    const { docId } = req.body;
    let documentId = docId || 'system-alert';
    let documentName = 'Platform Perimeter Security';
    
    if (docId) {
      const doc = await fetchDocument(docId);
      if (doc) {
        documentName = doc.name;
      }
    }

    const randomIps = [
      '72.229.28.185',
      '198.51.100.42',
      '203.0.113.88',
      '185.190.140.2',
      '93.184.216.34'
    ];
    const ipAddress = randomIps[Math.floor(Math.random() * randomIps.length)];

    await insertActivityLog(req, {
      documentId,
      documentName,
      action: 'ATTACK_PREVENTED',
      details: `Simulated intrusion block: Intercepted brute-force decryption signature verification attempts. Origin IP flagged by security ops.`,
      severity: 'critical',
      ipAddress,
    });

    return res.status(200).json({ success: true, message: 'Attack simulation recorded.' });
  } catch (err: unknown) {
    console.error('Simulate attack handler exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
