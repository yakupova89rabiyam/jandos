import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/favorites/my ────────────────────────────────────────────────────
router.get('/my', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const rows = db.prepare(`
    SELECT p.* FROM favorites f
    JOIN pets p ON p.id = f.pet_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(userId);
  res.json(rows);
});

// ─── POST /api/favorites ──────────────────────────────────────────────────────
router.post('/', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const { pet_id } = req.body;
  if (!pet_id) return res.status(400).json({ error: 'pet_id обязателен' });

  const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(pet_id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });

  try {
    db.prepare('INSERT INTO favorites (user_id, pet_id) VALUES (?, ?)').run(userId, pet_id);
    res.json({ ok: true });
  } catch {
    res.status(409).json({ error: 'Уже в избранном' });
  }
});

// ─── DELETE /api/favorites/:pet_id ───────────────────────────────────────────
router.delete('/:pet_id', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND pet_id = ?').run(userId, req.params.pet_id);
  res.json({ ok: true });
});

export default router;
