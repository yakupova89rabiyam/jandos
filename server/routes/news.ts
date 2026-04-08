import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, NewsSchema } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/news ─────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const { page, limit, category, featured } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page || '1'));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit || '20')));
  const offset = (pageNum - 1) * limitNum;

  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (category) {
    where += ' AND category = ?';
    params.push(category);
  }
  if (featured !== undefined) {
    where += ' AND featured = ?';
    params.push(featured === '1' ? 1 : 0);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM news ${where}`).get(...params) as any).count;
  const data = db.prepare(`SELECT * FROM news ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limitNum, offset);

  res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// ─── GET /api/news/:id ─────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Новость не найдена' });
  res.json(item);
});

// ─── POST /api/news ────────────────────────────────────────────────────────────

router.post('/', authenticateToken, checkRole(['admin', 'manager']), validate(NewsSchema), (req, res) => {
  const { title, content, excerpt, image, date, category, featured } = req.body;
  const result = db.prepare(`
    INSERT INTO news (title, content, excerpt, image, date, category, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, content, excerpt, image, date, category, featured);

  logAction((req as any).user.id, 'CREATE_NEWS', 'news', Number(result.lastInsertRowid), title, req.ip);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Новость добавлена' });
});

// ─── PATCH /api/news/:id ───────────────────────────────────────────────────────

router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), validate(NewsSchema), (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT id FROM news WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Новость не найдена' });

  const { title, content, excerpt, image, date, category, featured } = req.body;
  db.prepare(`
    UPDATE news SET title=?, content=?, excerpt=?, image=?, date=?, category=?, featured=? WHERE id=?
  `).run(title, content, excerpt, image, date, category, featured, id);

  logAction((req as any).user.id, 'UPDATE_NEWS', 'news', Number(id), title, req.ip);
  res.json({ message: 'Новость обновлена' });
});

// ─── DELETE /api/news/:id ──────────────────────────────────────────────────────

router.delete('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const item = db.prepare('SELECT id FROM news WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Новость не найдена' });

  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  logAction((req as any).user.id, 'DELETE_NEWS', 'news', Number(req.params.id), undefined, req.ip);
  res.json({ message: 'Новость удалена' });
});

export default router;
