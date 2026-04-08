import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, checkRole(['admin']), (req, res) => {
  const logs = db.prepare(`
    SELECT al.*, u.name as user_name
    FROM audit_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 200
  `).all();
  res.json(logs);
});

export default router;
