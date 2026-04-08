import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, logAction } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const router = Router();

// ─── Multer Configuration ─────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения (jpeg, png, webp, gif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ─── GET /api/media ────────────────────────────────────────────────────────────

router.get('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
  res.json(media);
});

// ─── POST /api/media/upload (multipart) ───────────────────────────────────────

router.post('/upload', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Файл слишком большой. Максимум 5 МБ.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const url = `/uploads/${req.file.filename}`;
    const result = db.prepare(`
      INSERT INTO media (filename, url, mime_type, size, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.file.originalname, url, req.file.mimetype, req.file.size, (req as any).user.id);

    logAction((req as any).user.id, 'UPLOAD_MEDIA', 'media', Number(result.lastInsertRowid), req.file.originalname, req.ip);
    res.status(201).json({ id: result.lastInsertRowid, url, filename: req.file.originalname });
  });
});

// ─── POST /api/media (save URL without upload) ────────────────────────────────

router.post('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const { filename, url, mime_type, size } = req.body;
  if (!filename || !url) return res.status(400).json({ error: 'filename и url обязательны' });

  const result = db.prepare(`
    INSERT INTO media (filename, url, mime_type, size, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(filename, url, mime_type || 'image/jpeg', size || 0, (req as any).user.id);

  res.status(201).json({ id: result.lastInsertRowid, url });
});

// ─── DELETE /api/media/:id ─────────────────────────────────────────────────────

router.delete('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const item = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id) as any;
  if (!item) return res.status(404).json({ error: 'Медиафайл не найден' });

  // Delete physical file if it's a local upload
  if (item.url && item.url.startsWith('/uploads/')) {
    const filePath = path.join(UPLOAD_DIR, path.basename(item.url));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn(`[Media] Не удалось удалить файл: ${filePath}`, e);
      }
    }
  }

  db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  logAction((req as any).user.id, 'DELETE_MEDIA', 'media', Number(req.params.id), item.filename, req.ip);
  res.json({ message: 'Файл удалён' });
});

export default router;
export { UPLOAD_DIR };
