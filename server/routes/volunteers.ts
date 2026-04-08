import { Router } from 'express';
import { db, logAction, createNotification } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, VolunteerApplicationSchema, ShiftSchema, ShiftSlotSchema } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/volunteers (admin/manager) ──────────────────────────────────────

router.get('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const volunteers = db.prepare(`
    SELECT va.*, u.name, u.email
    FROM volunteer_applications va
    JOIN users u ON va.user_id = u.id
    ORDER BY va.created_at DESC
  `).all();
  res.json(volunteers);
});

// ─── POST /api/volunteers (authenticated) ─────────────────────────────────────

router.post('/', authenticateToken, validate(VolunteerApplicationSchema), (req, res) => {
  const userId = (req as any).user.id;
  const { skills, experience } = req.body;

  const existing = db
    .prepare("SELECT id FROM volunteer_applications WHERE user_id = ? AND status != 'rejected'")
    .get(userId);
  if (existing) return res.status(409).json({ error: 'Вы уже подали заявку волонтёра' });

  const result = db
    .prepare('INSERT INTO volunteer_applications (user_id, skills, experience) VALUES (?, ?, ?)')
    .run(userId, skills, experience);

  createNotification(userId, 'Заявка волонтёра принята', 'Ваша заявка на участие в волонтёрской программе принята. Мы рассмотрим её в ближайшее время.');
  logAction(userId, 'CREATE_VOLUNTEER_APP', 'volunteer', Number(result.lastInsertRowid), undefined, req.ip);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Заявка подана' });
});

// ─── PATCH /api/volunteer_applications/:id ────────────────────────────────────

router.patch('/applications/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Недопустимый статус' });
  }

  const request = db.prepare('SELECT * FROM volunteer_applications WHERE id = ?').get(id) as any;
  if (!request) return res.status(404).json({ error: 'Заявка не найдена' });

  db.prepare('UPDATE volunteer_applications SET status = ? WHERE id = ?').run(status, id);

  if (status === 'approved') {
    createNotification(request.user_id, 'Вы приняты в команду волонтёров! 🎉', 'Поздравляем! Теперь вы можете записываться на смены в личном кабинете.');
  } else if (status === 'rejected') {
    createNotification(request.user_id, 'Заявка волонтёра отклонена', 'К сожалению, на данный момент мы не можем принять вашу заявку.');
  }

  logAction((req as any).user.id, 'UPDATE_VOLUNTEER', 'volunteer', Number(id), `Status: ${status}`, req.ip);
  res.json({ message: 'Статус обновлён' });
});

// ─── GET /api/volunteer_shifts ────────────────────────────────────────────────

router.get('/shifts', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const shifts = db.prepare(`
    SELECT vs.*, u.name as volunteer_name
    FROM volunteer_shifts vs
    JOIN users u ON vs.user_id = u.id
    ORDER BY vs.date DESC
  `).all();
  res.json(shifts);
});

// ─── POST /api/volunteer_shifts ───────────────────────────────────────────────

router.post('/shifts', authenticateToken, checkRole(['admin', 'manager']), validate(ShiftSchema), (req, res) => {
  const { user_id, date, start_time, end_time, task } = req.body;

  const result = db.prepare(`
    INSERT INTO volunteer_shifts (user_id, date, start_time, end_time, task)
    VALUES (?, ?, ?, ?, ?)
  `).run(user_id, date, start_time, end_time, task);

  createNotification(user_id, 'Назначена смена волонтёра', `Вам назначена смена ${date} с ${start_time} до ${end_time}. Задача: ${task}`);
  logAction((req as any).user.id, 'CREATE_SHIFT', 'shift', Number(result.lastInsertRowid), `Task: ${task}`, req.ip);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Смена создана' });
});

// ─── PATCH /api/volunteer_shifts/:id ─────────────────────────────────────────

router.patch('/shifts/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { id } = req.params;
  const { date, start_time, end_time, task, status } = req.body;

  const shift = db.prepare('SELECT id FROM volunteer_shifts WHERE id = ?').get(id);
  if (!shift) return res.status(404).json({ error: 'Смена не найдена' });

  db.prepare(`
    UPDATE volunteer_shifts SET date=?, start_time=?, end_time=?, task=?, status=? WHERE id=?
  `).run(date, start_time, end_time, task, status, id);

  logAction((req as any).user.id, 'UPDATE_SHIFT', 'shift', Number(id), `Task: ${task}`, req.ip);
  res.json({ message: 'Смена обновлена' });
});

// ─── DELETE /api/volunteer_shifts/:id ─────────────────────────────────────────

router.delete('/shifts/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const shift = db.prepare('SELECT id FROM volunteer_shifts WHERE id = ?').get(req.params.id);
  if (!shift) return res.status(404).json({ error: 'Смена не найдена' });

  db.prepare('DELETE FROM volunteer_shifts WHERE id = ?').run(req.params.id);
  logAction((req as any).user.id, 'DELETE_SHIFT', 'shift', Number(req.params.id), undefined, req.ip);
  res.json({ message: 'Смена удалена' });
});

// ─── GET /api/volunteers/slots (public) ──────────────────────────────────────

router.get('/slots', (req, res) => {
  const slots = db.prepare(`
    SELECT ss.*, COUNT(su.id) as signed_up
    FROM shift_slots ss
    LEFT JOIN shift_signups su ON su.slot_id = ss.id
    GROUP BY ss.id
    ORDER BY ss.date ASC, ss.time ASC
  `).all();
  res.json(slots);
});

// ─── GET /api/volunteers/slots/mine (authenticated) ───────────────────────────

router.get('/slots/mine', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const slots = db.prepare(`
    SELECT ss.*, COUNT(su2.id) as signed_up
    FROM shift_slots ss
    JOIN shift_signups su ON su.slot_id = ss.id AND su.user_id = ?
    LEFT JOIN shift_signups su2 ON su2.slot_id = ss.id
    GROUP BY ss.id
    ORDER BY ss.date ASC
  `).all(userId);
  res.json(slots);
});

// ─── POST /api/volunteers/slots/:id/signup (authenticated) ────────────────────

router.post('/slots/:id/signup', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const slotId = Number(req.params.id);

  const slot = db.prepare('SELECT * FROM shift_slots WHERE id = ?').get(slotId) as any;
  if (!slot) return res.status(404).json({ error: 'Смена не найдена' });

  const signedUp = (db.prepare('SELECT COUNT(*) as count FROM shift_signups WHERE slot_id = ?').get(slotId) as any).count;
  if (signedUp >= slot.slots) return res.status(409).json({ error: 'Все места заняты' });

  try {
    db.prepare('INSERT INTO shift_signups (user_id, slot_id) VALUES (?, ?)').run(userId, slotId);
  } catch {
    return res.status(409).json({ error: 'Вы уже записаны на эту смену' });
  }

  createNotification(userId, 'Запись на смену подтверждена', `Вы успешно записались на смену ${slot.date} (${slot.time}).`);
  logAction(userId, 'SIGNUP_SHIFT', 'shift_slot', slotId, undefined, req.ip);

  res.status(201).json({ message: 'Запись подтверждена' });
});

// ─── DELETE /api/volunteers/slots/:id/signup (authenticated) ──────────────────

router.delete('/slots/:id/signup', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const slotId = Number(req.params.id);

  const result = db.prepare('DELETE FROM shift_signups WHERE user_id = ? AND slot_id = ?').run(userId, slotId);
  if (result.changes === 0) return res.status(404).json({ error: 'Запись не найдена' });

  logAction(userId, 'CANCEL_SHIFT', 'shift_slot', slotId, undefined, req.ip);
  res.json({ message: 'Запись отменена' });
});

// ─── POST /api/volunteers/slots (admin/manager) ───────────────────────────────

router.post('/slots', authenticateToken, checkRole(['admin', 'manager']), validate(ShiftSlotSchema), (req, res) => {
  const { type, date, time, slots, description, location, contact } = req.body;
  const result = db.prepare(`
    INSERT INTO shift_slots (type, date, time, slots, description, location, contact)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(type, date, time, slots, description, location, contact);
  logAction((req as any).user.id, 'CREATE_SLOT', 'shift_slot', Number(result.lastInsertRowid), undefined, req.ip);
  res.status(201).json({ id: result.lastInsertRowid });
});

// ─── PATCH /api/volunteers/slots/:id (admin/manager) ─────────────────────────

router.patch('/slots/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { id } = req.params;
  const { type, date, time, slots, description, location, contact } = req.body;
  const slot = db.prepare('SELECT id FROM shift_slots WHERE id = ?').get(id);
  if (!slot) return res.status(404).json({ error: 'Смена не найдена' });
  db.prepare(`
    UPDATE shift_slots SET type=?, date=?, time=?, slots=?, description=?, location=?, contact=? WHERE id=?
  `).run(type, date, time, slots, description, location, contact, id);
  res.json({ message: 'Обновлено' });
});

// ─── DELETE /api/volunteers/slots/:id (admin/manager) ────────────────────────

router.delete('/slots/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const slot = db.prepare('SELECT id FROM shift_slots WHERE id = ?').get(req.params.id);
  if (!slot) return res.status(404).json({ error: 'Смена не найдена' });
  db.prepare('DELETE FROM shift_slots WHERE id = ?').run(req.params.id);
  res.json({ message: 'Удалено' });
});

export default router;
