import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/settings ────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings').all();
  const map = (settings as any[]).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  res.json(map);
});

// ─── PATCH /api/settings (admin/manager) ──────────────────────────────────────

router.patch('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ error: 'Ожидается объект с настройками' });
  }

  const upsert = db.prepare(`
    INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
  `);

  db.transaction((data: Record<string, string>) => {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') upsert.run(key, value);
    }
  })(updates);

  res.json({ message: 'Настройки сохранены' });
});

export default router;
