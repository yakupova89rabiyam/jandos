import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/users (admin only) ──────────────────────────────────────────────

router.get('/', authenticateToken, checkRole(['admin']), (req, res) => {
  const users = db.prepare('SELECT id, email, name, role, avatar, is_banned, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// ─── PATCH /api/users/:id/role (admin only) ───────────────────────────────────

router.patch('/:id/role', authenticateToken, checkRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const adminId = (req as any).user.id;

  if (!['admin', 'manager', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' });
  }

  if (Number(id) === adminId) {
    return res.status(400).json({ error: 'Нельзя изменить собственную роль' });
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  logAction(adminId, 'CHANGE_ROLE', 'user', Number(id), `New role: ${role}`, req.ip);

  res.json({ message: 'Роль обновлена' });
});

// ─── POST /api/users/:id/ban (admin only) ─────────────────────────────────────

router.post('/:id/ban', authenticateToken, checkRole(['admin']), (req, res) => {
  const { id } = req.params;
  const adminId = (req as any).user.id;

  if (Number(id) === adminId) {
    return res.status(400).json({ error: 'Нельзя заблокировать себя' });
  }

  const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Нельзя заблокировать администратора' });

  db.prepare('UPDATE users SET is_banned = 1 WHERE id = ?').run(id);
  logAction(adminId, 'BAN_USER', 'user', Number(id), 'User banned', req.ip);
  res.json({ message: 'Пользователь заблокирован' });
});

// ─── POST /api/users/:id/unban (admin only) ───────────────────────────────────

router.post('/:id/unban', authenticateToken, checkRole(['admin']), (req, res) => {
  const { id } = req.params;
  const adminId = (req as any).user.id;

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

  db.prepare('UPDATE users SET is_banned = 0 WHERE id = ?').run(id);
  logAction(adminId, 'UNBAN_USER', 'user', Number(id), 'User unbanned', req.ip);
  res.json({ message: 'Пользователь разблокирован' });
});

// ─── GET /api/users/me/requests ───────────────────────────────────────────────

router.get('/me/requests', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;

  const adoptions = db.prepare(`
    SELECT ar.*, p.name as pet_name, p.image as pet_image
    FROM adoption_requests ar
    JOIN pets p ON ar.pet_id = p.id
    WHERE ar.user_id = ?
    ORDER BY ar.created_at DESC
  `).all(userId);

  const volunteers = db.prepare('SELECT * FROM volunteer_applications WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  const shifts = db.prepare('SELECT * FROM volunteer_shifts WHERE user_id = ? ORDER BY date DESC').all(userId);
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId);
  const unreadCount = (db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as any).count;

  res.json({ adoptions, volunteers, shifts, notifications, unreadCount });
});

export default router;
