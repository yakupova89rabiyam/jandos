import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/promised_items/my ──────────────────────────────────────────────
router.get('/my', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const rows = db.prepare('SELECT need_id FROM promised_items WHERE user_id = ?').all(userId);
  res.json(rows.map((r: any) => r.need_id));
});

// ─── GET /api/promised_items/my/full ─────────────────────────────────────────
router.get('/my/full', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const rows = db.prepare(`
    SELECT pi.need_id as id, n.item, n.quantity, n.category, pi.created_at
    FROM promised_items pi
    JOIN needs n ON n.id = pi.need_id
    WHERE pi.user_id = ?
    ORDER BY pi.created_at DESC
  `).all(userId);
  res.json(rows);
});

// ─── POST /api/promised_items ─────────────────────────────────────────────────
router.post('/', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const { need_id } = req.body;
  if (!need_id) return res.status(400).json({ error: 'need_id обязателен' });

  const need = db.prepare('SELECT id FROM needs WHERE id = ?').get(need_id);
  if (!need) return res.status(404).json({ error: 'Нужда не найдена' });

  try {
    db.prepare('INSERT INTO promised_items (user_id, need_id) VALUES (?, ?)').run(userId, need_id);
    res.json({ ok: true });
  } catch {
    res.status(409).json({ error: 'Вы уже обещали этот предмет' });
  }
});

// ─── DELETE /api/promised_items/:need_id ─────────────────────────────────────
router.delete('/:need_id', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  db.prepare('DELETE FROM promised_items WHERE user_id = ? AND need_id = ?').run(userId, req.params.need_id);
  res.json({ ok: true });
});

export default router;
