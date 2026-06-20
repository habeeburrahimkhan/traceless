import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase.js';
import { requireAdmin } from './lib/auth.js';
import { setCorsHeaders } from './lib/cors.js';

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
    const { error } = await supabase.from('activity_logs').delete().neq('id', '0');

    if (error) {
      console.error('Purge logs error:', error);
      return res.status(500).json({ error: error.message });
    }

    const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
    await supabase.from('activity_logs').insert([
      {
        id: logId,
        timestamp: new Date().toISOString(),
        document_id: 'SYSTEM',
        document_name: 'SYSTEM AUDIT',
        action: 'BURNED',
        ip_address: '185.190.140.2',
        location: '',
        details: 'Audit trail successfully purged.',
        severity: 'info',
      },
    ]);

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error('Clear logs exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
