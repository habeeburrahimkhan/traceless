import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase.js';
import { setCorsHeaders } from './_lib/cors.js';
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
    const {
      id: customId,
      name,
      size,
      type,
      requireEmailVerification,
      otpEmail,
      requireWatermark,
      maxViews,
      expiresAt,
      content,
      otpCode,
      decryptionKey,
    } = req.body;

    if (!name || !content) {
      return res.status(400).json({ error: 'Missing name or content file payload' });
    }

    const id = customId || `doc-${Math.random().toString(36).substring(2, 9)}`;
    const generatedOTP = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
    const hexChars = '0123456789ABCDEF';
    let mockKey = '0x';
    for (let i = 0; i < 8; i++) mockKey += hexChars[Math.floor(Math.random() * 16)];
    mockKey += '...';
    for (let i = 0; i < 4; i++) mockKey += hexChars[Math.floor(Math.random() * 16)];

    const finalDecryptionKey = decryptionKey || mockKey;

    const isBase64 = content.startsWith('data:');
    const base64Clean = isBase64 ? content.split(',')[1] : content;
    const fileBuffer = Buffer.from(base64Clean, (isBase64 || decryptionKey) ? 'base64' : 'utf-8');

    const bucketName = 'traceless-files';
    const filePath = `${id}/${name}`;

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, fileBuffer, {
      contentType: isBase64 ? content.split(';')[0].split(':')[1] : 'text/plain',
      upsert: true,
    });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return res.status(500).json({ error: `Storage upload failed: ${uploadError.message}` });
    }

    const newDoc = {
      id,
      name,
      size,
      type,
      uploaded_at: new Date().toISOString(),
      expires_at: expiresAt || null,
      max_views: maxViews,
      views_count: 0,
      otp_email: requireEmailVerification ? otpEmail : '',
      otp_code: generatedOTP,
      require_watermark: requireWatermark,
      require_email_verification: requireEmailVerification ?? false,
      status: 'active',
      decryption_key: finalDecryptionKey,
      storage_path: filePath,
    };

    const { error: dbError } = await supabase.from('documents').insert([newDoc]);

    if (dbError) {
      console.error('Supabase Database error:', dbError);
      return res.status(500).json({ error: `Database entry failed: ${dbError.message}` });
    }

    const logId = `log-${Math.random().toString(36).substring(2, 9)}`;
    await supabase.from('activity_logs').insert([
      {
        id: logId,
        timestamp: new Date().toISOString(),
        document_id: id,
        document_name: name,
        action: 'UPLOADED',
        ip_address: '185.190.140.2',
        location: '',
        details: `Secure document created. Access Tier: ${requireEmailVerification ? `Highly Confidential (${otpEmail})` : 'Standard (OTP Only)'}. Rules: max views = ${maxViews}, lifespan = ${expiresAt ? 'timed' : 'unlimited'}. Cryptographic key generated and registered.`,
        severity: 'info',
      },
    ]);

    return res.status(200).json(mapDocument(newDoc, { includeSecrets: true }));
  } catch (err: unknown) {
    console.error('Upload handler exception:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return res.status(500).json({ error: message });
  }
}
