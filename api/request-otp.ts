import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';
import { Resend } from 'resend';
import { setCorsHeaders } from './_lib/cors.js';
import { expireDocumentIfNeeded, fetchDocument, insertActivityLog } from './_lib/documents.js';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

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
    const { docId, email } = req.body;

    if (!docId || !email) {
      return res.status(400).json({ error: 'Missing docId or email parameters' });
    }

    let doc = await fetchDocument(docId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    doc = await expireDocumentIfNeeded(doc);

    if (doc.status !== 'active') {
      return res.status(410).json({ error: 'Document is no longer active or has expired' });
    }

    if (
      doc.require_email_verification &&
      doc.otp_email.trim().toLowerCase() !== email.trim().toLowerCase()
    ) {
      await insertActivityLog(req, {
        documentId: docId,
        documentName: doc.name,
        action: 'ATTACK_PREVENTED',
        details: `Intrusion Alert: Unauthorized access attempt with email: "${email}". Request rejected.`,
        severity: 'critical',
      });

      return res.status(403).json({ error: 'Unauthorized: Email is not authorized to decrypt this document' });
    }

    const otpCode = doc.otp_code || Math.floor(100000 + Math.random() * 900000).toString();

    if (!doc.otp_code) {
      await supabase.from('documents').update({ otp_code: otpCode }).eq('id', docId);
    }

    await insertActivityLog(req, {
      documentId: docId,
      documentName: doc.name,
      action: 'OTP_REQUESTED',
      details: `Zero-Trust verification OTP dispatched to ${email}`,
      severity: 'info',
    });

    if (resend) {
      try {
        await resend.emails.send({
          from: `TraceLess Access <${fromEmail}>`,
          to: email,
          subject: `Decryption OTP Code: ${doc.name}`,
          html: `
            <div style="font-family: monospace; background-color: #030303; color: #d4d4d8; padding: 24px; border: 1px solid #27272a; border-radius: 8px; max-width: 500px; margin: auto;">
              <h2 style="color: #10b981; border-bottom: 1px solid #18181b; padding-bottom: 12px; margin-top: 0; font-size: 18px; letter-spacing: 2px;">TRACELESS SECURE TRANSMISSION</h2>
              <p style="font-size: 12px; color: #a1a1aa; line-height: 1.6;">You have been sent a secure document envelope. Use the decryption OTP key below to unlock and view the file:</p>
              <div style="background-color: #09090b; border: 1px solid #10b981; border-radius: 6px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #10b981;">${otpCode}</span>
              </div>
              <p style="font-size: 10px; color: #71717a; margin-bottom: 0;">This security code is single-use and expires automatically.</p>
            </div>
          `,
        });
        return res.status(200).json({ success: true, emailSent: true });
      } catch (emailErr) {
        console.error('Resend delivery failed:', emailErr);
        return res.status(200).json({ success: true, emailSent: false, devOtp: otpCode });
      }
    }

    return res.status(200).json({ success: true, emailSent: false, devOtp: otpCode });
  } catch (err: unknown) {
    console.error('Request OTP exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
