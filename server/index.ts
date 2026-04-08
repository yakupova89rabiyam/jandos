import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { seedDatabase } from './db.js';

// Routes
import authRoutes from './routes/auth.js';
import petsRoutes from './routes/pets.js';
import newsRoutes from './routes/news.js';
import fundraisersRoutes from './routes/fundraisers.js';
import adoptionRoutes from './routes/adoption.js';
import volunteersRoutes from './routes/volunteers.js';
import usersRoutes from './routes/users.js';
import mediaRoutes from './routes/media.js';
import analyticsRoutes from './routes/analytics.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import feedbackRoutes from './routes/feedback.js';
import graduatesRoutes from './routes/graduates.js';
import auditRoutes from './routes/audit.js';
import activityRoutes from './routes/activity.js';
import needsRoutes from './routes/needs.js';
import donationsRoutes from './routes/donations.js';
import surrenderRoutes from './routes/surrender.js';
import promisedItemsRoutes from './routes/promised_items.js';
import favoritesRoutes from './routes/favorites.js';
import guardianshipsRoutes from './routes/guardianships.js';
import pagesRoutes from './routes/pages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Seed DB ──────────────────────────────────────────────────────────────────

seedDatabase();

// ─── Express App ──────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://jandos.kz']
      : true,
    credentials: true,
  }));

  // Serve uploaded files as static
  app.use('/uploads', express.static(UPLOAD_DIR));

  // ─── Rate Limiting ──────────────────────────────────────────────────────────

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много попыток. Попробуйте через 15 минут.' },
  });

  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', apiLimiter);

  // ─── API Routes ──────────────────────────────────────────────────────────────

  app.use('/api/auth/login', loginLimiter);
  app.use('/api/auth/register', loginLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/pets', petsRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/fundraisers', fundraisersRoutes);
  app.use('/api/adoption_requests', adoptionRoutes);
  app.use('/api/volunteers', volunteersRoutes);
  app.use('/api/volunteer_applications', volunteersRoutes); // alias
  app.use('/api/volunteer_shifts', (req, res, next) => {
    // Remap /api/volunteer_shifts → /api/volunteers/shifts
    req.url = '/shifts' + req.url.replace(/^\//, '/');
    volunteersRoutes(req, res, next);
  });
  app.use('/api/users', usersRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/graduates', graduatesRoutes);
  app.use('/api/audit_logs', auditRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/needs', needsRoutes);
  app.use('/api/donations', donationsRoutes);
  app.use('/api/surrender', surrenderRoutes);
  app.use('/api/promised_items', promisedItemsRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/guardianships', guardianshipsRoutes);
  app.use('/api/pages', pagesRoutes);

  // Legacy aliases (keep compatibility with existing frontend)
  app.get('/api/my_requests', (req, res, next) => {
    req.url = '/me/requests';
    usersRoutes(req, res, next);
  });

  // ─── Error Handler ────────────────────────────────────────────────────────────

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[ERROR]', err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: err.message || 'Внутренняя ошибка сервера' });
  });

  // ─── Vite / Static ────────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ─── Listen ───────────────────────────────────────────────────────────────────

  const PORT = parseInt(process.env.PORT || '3000');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🐾 JanDós сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 Загрузки: ${UPLOAD_DIR}`);
    console.log(`🔑 Режим: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

startServer().catch(err => {
  console.error('Ошибка запуска сервера:', err);
  process.exit(1);
});
