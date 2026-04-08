import { Router } from 'express';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения (JPEG, PNG, WebP) разрешены'));
  }
});

const SurrenderSchema = z.object({
  full_name: z.string().min(2).max(200),
  iin: z.string().max(20).optional(),
  phone: z.string().min(5).max(30),
  animal_type: z.string().max(100).optional(),
  animal_gender: z.string().max(20).optional(),
  health: z.string().max(500).optional(),
  breed: z.string().max(100).optional(),
  age: z.string().max(50).optional(),
  reason: z.string().max(1000).optional(),
  address: z.string().max(300).optional(),
});

// ─── POST /api/surrender (public) ────────────────────────────────────────────
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const { full_name, iin, phone, animal_type, animal_gender, health, breed, age, reason, address } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO surrender_requests (full_name, iin, phone, animal_type, animal_gender, health, breed, age, reason, address, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(full_name, iin ?? null, phone, animal_type ?? null, animal_gender ?? null, health ?? null, breed ?? null, age ?? null, reason ?? null, address ?? null, photo);

    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ─── GET /api/surrender (admin/manager) ──────────────────────────────────────
router.get('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const rows = db.prepare('SELECT * FROM surrender_requests ORDER BY created_at DESC').all();
  res.json(rows);
});

// ─── PATCH /api/surrender/:id (admin/manager) ────────────────────────────────
router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE surrender_requests SET status = ? WHERE id = ?').run(status, req.params.id);
  logAction((req as any).user.id, 'UPDATE_SURRENDER', 'surrender_request', Number(req.params.id), `Статус: ${status}`, req.ip);
  res.json({ ok: true });
});

export default router;
