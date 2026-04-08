import { Router } from 'express';
import { db, logAction, createNotification } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, AdoptionRequestSchema } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/adoption_requests (admin/manager) ────────────────────────────────

router.get('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { status } = req.query as Record<string, string>;
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (status) {
    where += ' AND ar.status = ?';
    params.push(status);
  }

  const requests = db.prepare(`
    SELECT ar.*, u.name as user_name, u.email as user_email, p.name as pet_name, p.image as pet_image
    FROM adoption_requests ar
    JOIN users u ON ar.user_id = u.id
    JOIN pets p ON ar.pet_id = p.id
    ${where}
    ORDER BY ar.created_at DESC
  `).all(...params);

  res.json(requests);
});

// ─── POST /api/adoption_requests (authenticated) ───────────────────────────────

router.post('/', authenticateToken, validate(AdoptionRequestSchema), (req, res) => {
  const userId = (req as any).user.id;
  const { pet_id, message } = req.body;

  const pet = db.prepare("SELECT id, name FROM pets WHERE id = ? AND status = 'available'").get(pet_id) as any;
  if (!pet) return res.status(404).json({ error: 'Питомец не найден или уже занят' });

  // Check if already applied
  const existing = db
    .prepare("SELECT id FROM adoption_requests WHERE user_id = ? AND pet_id = ? AND status != 'rejected'")
    .get(userId, pet_id);
  if (existing) return res.status(409).json({ error: 'Вы уже подали заявку на этого питомца' });

  const result = db
    .prepare('INSERT INTO adoption_requests (user_id, pet_id, status, message) VALUES (?, ?, ?, ?)')
    .run(userId, pet_id, 'pending', message);

  logAction(userId, 'CREATE_ADOPTION_REQUEST', 'adoption', Number(result.lastInsertRowid), `Pet: ${pet.name}`, req.ip);
  createNotification(userId, 'Заявка принята', `Ваша заявка на питомца ${pet.name} принята. Мы свяжемся с вами.`);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Заявка подана' });
});

// ─── PATCH /api/adoption_requests/:id (admin/manager) ─────────────────────────

router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Недопустимый статус' });
  }

  const request = db.prepare('SELECT * FROM adoption_requests WHERE id = ?').get(id) as any;
  if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

  db.prepare('UPDATE adoption_requests SET status = ? WHERE id = ?').run(status, id);

  // Notify user
  const pet = db.prepare('SELECT name FROM pets WHERE id = ?').get(request.pet_id) as any;
  const petName = pet?.name || `#${request.pet_id}`;
  if (status === 'approved') {
    createNotification(request.user_id, 'Заявка одобрена! 🎉', `Ваша заявка на питомца ${petName} одобрена. Свяжитесь с нами для оформления.`);
    // Mark pet as reserved
    db.prepare("UPDATE pets SET status = 'reserved' WHERE id = ?").run(request.pet_id);
  } else if (status === 'rejected') {
    createNotification(request.user_id, 'Заявка отклонена', `К сожалению, ваша заявка на питомца ${petName} была отклонена.`);
  }

  logAction((req as any).user.id, 'UPDATE_ADOPTION', 'adoption', Number(id), `Status: ${status}`, req.ip);
  res.json({ message: 'Статус обновлён' });
});

export default router;
