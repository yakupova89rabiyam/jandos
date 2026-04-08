import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, FundraiserSchema, DonationSchema } from '../middleware/validate.js';

const router = Router();

// ─── GET /api/fundraisers ──────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const { status } = req.query as Record<string, string>;
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }

  const data = db.prepare(`SELECT * FROM fundraisers ${where} ORDER BY created_at DESC`).all(...params);
  res.json(data);
});

// ─── POST /api/fundraisers ─────────────────────────────────────────────────────

router.post('/', authenticateToken, checkRole(['admin', 'manager']), validate(FundraiserSchema), (req, res) => {
  const { title, target_amount, current_amount, description, image, status } = req.body;
  const result = db.prepare(`
    INSERT INTO fundraisers (title, target_amount, current_amount, description, image, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, target_amount, current_amount, description, image, status);

  logAction((req as any).user.id, 'CREATE_FUNDRAISER', 'fundraiser', Number(result.lastInsertRowid), title, req.ip);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Сбор создан' });
});

// ─── PATCH /api/fundraisers/:id ────────────────────────────────────────────────

router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), validate(FundraiserSchema), (req, res) => {
  const { id } = req.params;
  const item = db.prepare('SELECT id FROM fundraisers WHERE id = ?').get(id);
  if (!item) return res.status(404).json({ error: 'Сбор не найден' });

  const { title, target_amount, current_amount, description, image, status } = req.body;
  db.prepare(`
    UPDATE fundraisers SET title=?, target_amount=?, current_amount=?, description=?, image=?, status=? WHERE id=?
  `).run(title, target_amount, current_amount, description, image, status, id);

  logAction((req as any).user.id, 'UPDATE_FUNDRAISER', 'fundraiser', Number(id), title, req.ip);
  res.json({ message: 'Сбор обновлён' });
});

// ─── DELETE /api/fundraisers/:id ───────────────────────────────────────────────

router.delete('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const item = db.prepare('SELECT id FROM fundraisers WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Сбор не найден' });

  db.prepare('DELETE FROM fundraisers WHERE id = ?').run(req.params.id);
  logAction((req as any).user.id, 'DELETE_FUNDRAISER', 'fundraiser', Number(req.params.id), undefined, req.ip);
  res.json({ message: 'Сбор удалён' });
});

// ─── POST /api/fundraisers/donate ─────────────────────────────────────────────

router.post('/donate', authenticateToken, validate(DonationSchema), (req, res) => {
  const { fundraiser_id, amount } = req.body;
  const userId = (req as any).user.id;

  const fundraiser = db.prepare('SELECT id FROM fundraisers WHERE id = ? AND status = ?').get(fundraiser_id, 'active');
  if (!fundraiser) return res.status(404).json({ error: 'Активный сбор не найден' });

  db.transaction(() => {
    db.prepare('UPDATE fundraisers SET current_amount = current_amount + ? WHERE id = ?').run(amount, fundraiser_id);
    db.prepare('INSERT INTO donations (user_id, amount, type, payment_method) VALUES (?, ?, ?, ?)')
      .run(userId, amount, 'one-time', `fundraiser:${fundraiser_id}`);
    db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'DONATION', 'fundraiser', fundraiser_id, `Сумма: ${amount} ₸`);
  })();

  res.json({ message: 'Пожертвование принято, спасибо!' });
});

export default router;
