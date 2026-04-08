import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const DonationSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['one-time', 'basic', 'extended']).default('one-time'),
  payment_method: z.string().max(50).optional(),
});

// ─── POST /api/donations ──────────────────────────────────────────────────────
router.post('/', authenticateToken, validate(DonationSchema), (req, res) => {
  const { amount, type, payment_method } = req.body;
  const userId = (req as any).user.id;

  const result = db.prepare(
    'INSERT INTO donations (user_id, amount, type, payment_method) VALUES (?, ?, ?, ?)'
  ).run(userId, amount, type, payment_method ?? null);

  logAction(userId, 'DONATION', 'donation', Number(result.lastInsertRowid), `Тип: ${type}, Сумма: ${amount} ₸`, req.ip);

  res.json({ id: result.lastInsertRowid, amount, type });
});

// ─── GET /api/donations/my ────────────────────────────────────────────────────
router.get('/my', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const rows = db.prepare(
    'SELECT id, amount, type, payment_method, created_at FROM donations WHERE user_id = ? ORDER BY created_at DESC'
  ).all(userId);
  res.json(rows);
});

export default router;
