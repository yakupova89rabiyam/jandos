import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, PetSchema } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/pets ─────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const { page, limit, category, status, search } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page || '1'));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '50')));
  const offset = (pageNum - 1) * limitNum;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'Все') {
    where += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND (name LIKE ? OR breed LIKE ? OR description LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM pets ${where}`).get(...params) as any).count;
  const data = db.prepare(`SELECT * FROM pets ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// ─── GET /api/pets/:id ─────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });
  res.json(pet);
});

// ─── POST /api/pets ────────────────────────────────────────────────────────────

router.post('/', authenticateToken, checkRole(['admin', 'manager']), validate(PetSchema), (req, res) => {
  const { name, category, breed, age, ageGroup, gender, color, size, description, notes, image, status } = req.body;
  const result = db.prepare(`
    INSERT INTO pets (name, category, breed, age, ageGroup, gender, color, size, description, notes, image, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, category, breed, age, ageGroup, gender, color, size, description, notes || '', image, status);

  logAction((req as any).user.id, 'CREATE_PET', 'pet', Number(result.lastInsertRowid), name, req.ip);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Питомец добавлен' });
});

// ─── PATCH /api/pets/:id ───────────────────────────────────────────────────────

router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), validate(PetSchema), (req, res) => {
  const { id } = req.params;
  const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(id);
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });

  const { name, category, breed, age, ageGroup, gender, color, size, description, notes, image, status } = req.body;
  db.prepare(`
    UPDATE pets SET name=?, category=?, breed=?, age=?, ageGroup=?, gender=?, color=?, size=?, description=?, notes=?, image=?, status=?
    WHERE id=?
  `).run(name, category, breed, age, ageGroup, gender, color, size, description, notes || '', image, status, id);

  logAction((req as any).user.id, 'UPDATE_PET', 'pet', Number(id), name, req.ip);
  res.json({ message: 'Питомец обновлён' });
});

// ─── DELETE /api/pets/:id ──────────────────────────────────────────────────────

router.delete('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const pet = db.prepare('SELECT id, name FROM pets WHERE id = ?').get(req.params.id) as any;
  if (!pet) return res.status(404).json({ error: 'Питомец не найден' });

  db.prepare('DELETE FROM pets WHERE id = ?').run(req.params.id);
  logAction((req as any).user.id, 'DELETE_PET', 'pet', Number(req.params.id), pet.name, req.ip);
  res.json({ message: 'Питомец удалён' });
});

export default router;
