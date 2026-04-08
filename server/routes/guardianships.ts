import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/guardianships/my ────────────────────────────────────────────────
router.get('/my', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const rows = db.prepare(`
    SELECT g.id, g.type, g.monthly_amount, g.created_at,
           p.id as pet_id, p.name, p.image, p.breed, p.category
    FROM guardianships g
    JOIN pets p ON p.id = g.pet_id
    WHERE g.user_id = ?
    ORDER BY g.created_at DESC
  `).all(userId);
  res.json(rows);
});

// ─── POST /api/guardianships ──────────────────────────────────────────────────
router.post('/', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const { pet_id, type, monthly_amount } = req.body;

  if (!pet_id) return res.status(400).json({ error: 'pet_id обязателен' });

  const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(pet_id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });

  try {
    const result = db.prepare(
      'INSERT INTO guardianships (user_id, pet_id, type, monthly_amount) VALUES (?, ?, ?, ?)'
    ).run(userId, pet_id, type ?? 'food', monthly_amount ?? 0);

    logAction(userId, 'GUARDIANSHIP', 'pet', Number(pet_id), `Тип: ${type}, Сумма: ${monthly_amount} ₸/мес`, req.ip);
    res.json({ id: result.lastInsertRowid });
  } catch {
    res.status(409).json({ error: 'Вы уже являетесь опекуном этого питомца' });
  }
});

// ─── DELETE /api/guardianships/:pet_id ───────────────────────────────────────
router.delete('/:pet_id', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  db.prepare('DELETE FROM guardianships WHERE user_id = ? AND pet_id = ?').run(userId, req.params.pet_id);
  res.json({ ok: true });
});

export default router;
