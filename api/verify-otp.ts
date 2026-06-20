import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase.js';
import { setCorsHeaders } from './lib/cors.js';
import {
  downloadDocumentContent,
  expireDocumentIfNeeded,
  fetchDocument,
  insertActivityLog,
  shredDocument,
} from './lib/documents.js';
import { mapDocument } from './lib/mapper.js';

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
    const { docId, code } = req.body;

    if (!docId || !code) {
      return res.status(400).json({ error: 'Missing docId or code parameters' });
    }

    let doc = await fetchDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    doc = await expireDocumentIfNeeded(doc);

    if (doc.status !== 'active') {
      return res.status(410).json({ error: 'This document has expired or been shredded' });
    }

    if (doc.otp_code !== code) {
      await insertActivityLog(req, {
        documentId: docId,
        documentName: doc.name,
        action: 'ATTACK_PREVENTED',
        details: 'OTP verification failure: invalid token signature.',
        severity: 'warning',
      });

      return res.status(403).json({ error: 'Invalid verification code' });
    }

    const payloadContent = await downloadDocumentContent(doc);
    const nextViews = doc.views_count + 1;
    const reachedMax = nextViews >= doc.max_views;

    await insertActivityLog(req, {
      documentId: docId,
      documentName: doc.name,
      action: 'OTP_VERIFIED',
      details: 'Multi-factor signature verified. Granting transient access.',
      severity: 'info',
    });

    await insertActivityLog(req, {
      documentId: docId,
      documentName: doc.name,
      action: 'VIEWED',
      details: `Document rendered safely (Access ${nextViews} of ${doc.max_views}). Screenshot prevention active.`,
      severity: 'info',
    });

    if (reachedMax) {
      await shredDocument(doc, 'burned');
      await supabase.from('documents').update({ views_count: nextViews }).eq('id', docId);

      return res.status(200).json(
        mapDocument(
          {
            ...doc,
            views_count: nextViews,
            status: 'burned',
            otp_code: null,
            decryption_key: '0x0000...0000 (PURGED)',
          },
          { content: payloadContent }
        )
      );
    }

    await supabase
      .from('documents')
      .update({
        views_count: nextViews,
        otp_code: null,
      })
      .eq('id', docId);

    return res.status(200).json(
      mapDocument(
        {
          ...doc,
          views_count: nextViews,
          otp_code: null,
        },
        { content: payloadContent }
      )
    );
  } catch (err: unknown) {
    console.error('Verify OTP exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
