import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const NeedSchema = z.object({
  item: z.string().min(1).max(200),
  category: z.enum(['food', 'medical', 'tools', 'other']),
  quantity: z.string().max(100).default(''),
  urgency: z.enum(['high', 'medium', 'low']).default('medium'),
});

// ─── GET /api/needs (public) ──────────────────────────────────────────────────

router.get('/', (req, res) => {
  const needs = db.prepare(`
    SELECT * FROM needs WHERE is_fulfilled = 0 ORDER BY
      CASE urgency WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      created_at DESC
  `).all();
  res.json(needs);
});

// ─── POST /api/needs (admin/manager) ─────────────────────────────────────────

router.post('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const parsed = NeedSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { item, category, quantity, urgency } = parsed.data;
  const result = db.prepare(
    'INSERT INTO needs (item, category, quantity, urgency) VALUES (?, ?, ?, ?)'
  ).run(item, category, quantity, urgency);

  logAction((req as any).user.id, 'CREATE_NEED', 'needs', result.lastInsertRowid as number, item);
  res.status(201).json({ id: result.lastInsertRowid, item, category, quantity, urgency, is_fulfilled: 0 });
});

// ─── PATCH /api/needs/:id (admin/manager) ─────────────────────────────────────

router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const id = parseInt(req.params.id);
  const existing = db.prepare('SELECT * FROM needs WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Не найдено' });

  const parsed = NeedSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const fields = parsed.data;
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(fields), id];
  db.prepare(`UPDATE needs SET ${sets} WHERE id = ?`).run(...vals);

  res.json(db.prepare('SELECT * FROM needs WHERE id = ?').get(id));
});

// ─── DELETE /api/needs/:id (admin/manager) ────────────────────────────────────

router.delete('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM needs WHERE id = ?').run(id);
  res.json({ ok: true });
});

// ─── POST /api/needs/:id/fulfill (admin/manager) ─────────────────────────────

router.post('/:id/fulfill', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('UPDATE needs SET is_fulfilled = 1 WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
