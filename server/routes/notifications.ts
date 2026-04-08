import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, BroadcastSchema } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/notifications/my ─────────────────────────────────────────────────

router.get('/my', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(userId);
  const unreadCount = (db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as any).count;
  res.json({ notifications, unreadCount });
});

// ─── PATCH /api/notifications/:id/read ────────────────────────────────────────

router.patch('/:id/read', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, userId);
  if (result.changes === 0) return res.status(404).json({ error: 'Уведомление не найдено' });
  res.json({ message: 'Отмечено как прочитанное' });
});

// ─── PATCH /api/notifications/read-all ────────────────────────────────────────

router.patch('/read-all', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  res.json({ message: 'Все уведомления прочитаны' });
});

// ─── POST /api/notifications/broadcast (admin only) ───────────────────────────

router.post('/broadcast', authenticateToken, checkRole(['admin']), validate(BroadcastSchema), (req, res) => {
  const { title, message } = req.body;
  const users = db.prepare('SELECT id FROM users').all() as { id: number }[];

  const insert = db.prepare('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)');
  const transaction = db.transaction((users: { id: number }[]) => {
    for (const u of users) insert.run(u.id, title, message);
  });

  transaction(users);
  logAction((req as any).user.id, 'BROADCAST', 'notifications', 0, `Title: ${title}`, req.ip);
  res.json({ message: `Рассылка отправлена ${users.length} пользователям` });
});

export default router;
