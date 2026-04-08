import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, FeedbackSchema } from '../middleware/validate.js';

const router = Router();

// ─── POST /api/feedback ────────────────────────────────────────────────────────

router.post('/', validate(FeedbackSchema), (req, res) => {
  const { name, email, subject, message } = req.body;
  db.prepare('INSERT INTO feedback (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(name, email, subject, message);
  res.status(201).json({ message: 'Сообщение отправлено, спасибо!' });
});

// ─── GET /api/feedback (admin only) ───────────────────────────────────────────

router.get('/', authenticateToken, checkRole(['admin']), (req, res) => {
  const { status } = req.query as Record<string, string>;
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const feedback = db.prepare(`SELECT * FROM feedback ${where} ORDER BY created_at DESC`).all(...params);
  res.json(feedback);
});

// ─── PATCH /api/feedback/:id (admin only) ────────────────────────────────────

router.patch('/:id', authenticateToken, checkRole(['admin']), (req, res) => {
  const { status } = req.body;
  if (!['new', 'read', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Недопустимый статус' });
  }
  db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Статус обновлён' });
});

export default router;
