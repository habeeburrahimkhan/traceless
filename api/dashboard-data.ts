import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase.js';
import { requireAdmin } from './lib/auth.js';
import { setCorsHeaders } from './lib/cors.js';
import { mapActivityLog, mapDocument } from './lib/mapper.js';
import type { DbActivityLog, DbDocument } from './lib/mapper.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!requireAdmin(req, res)) return;

  try {
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (docsError) {
      console.error('Dashboard fetch docs error:', docsError);
      return res.status(500).json({ error: docsError.message });
    }

    const { data: activityLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (logsError) {
      console.error('Dashboard fetch logs error:', logsError);
      return res.status(500).json({ error: logsError.message });
    }

    return res.status(200).json({
      documents: ((documents || []) as DbDocument[]).map((doc) =>
        mapDocument(doc, { includeSecrets: true })
      ),
      activityLogs: ((activityLogs || []) as DbActivityLog[]).map(mapActivityLog),
    });
  } catch (err: unknown) {
    console.error('Dashboard handler exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
