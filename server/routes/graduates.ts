import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, GraduateSchema } from '../middleware/validate.js';

const router = Router();

router.get('/', (req, res) => {
  const graduates = db.prepare('SELECT * FROM graduates ORDER BY adoption_date DESC').all();
  res.json(graduates);
});

router.post('/', authenticateToken, checkRole(['admin', 'manager']), validate(GraduateSchema), (req, res) => {
  const { name, story, image, lat, lng, district, adoption_date } = req.body;
  const result = db.prepare(`
    INSERT INTO graduates (name, story, image, lat, lng, district, adoption_date) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, story, image, lat ?? null, lng ?? null, district || null, adoption_date);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const item = db.prepare('SELECT id FROM graduates WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Запись не найдена' });
  db.prepare('DELETE FROM graduates WHERE id = ?').run(req.params.id);
  res.json({ message: 'Удалено' });
});

export default router;
