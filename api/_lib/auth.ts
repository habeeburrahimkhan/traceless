import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.ADMIN_PASSCODE || 'admin123';
  const token = req.headers['x-admin-token'];

  if (token !== expected) {
    res.status(401).json({ error: 'Unauthorized: admin credentials required' });
    return false;
  }

  return true;
}
