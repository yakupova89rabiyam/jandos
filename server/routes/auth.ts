import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db, logAction, createNotification } from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import {
  validate,
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
  VerifyCodeSchema,
} from '../middleware/validate.js';

const router = Router();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_EXPIRES_DAYS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function issueTokens(userId: number, email: string, role: string) {
  const accessToken = jwt.sign({ id: userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  db.prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
    .run(userId, refreshToken, expiresAt);

  return { accessToken, refreshToken };
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get('/me', authenticateToken, (req, res) => {
  const user = db
    .prepare('SELECT id, email, name, role, avatar, phone, birthday, country, city, about FROM users WHERE id = ?')
    .get((req as any).user.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json({ user });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', validate(LoginSchema), (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }

  if (user.is_banned) {
    return res.status(403).json({ error: 'Аккаунт заблокирован' });
  }

  const { accessToken, refreshToken } = issueTokens(user.id, user.email, user.role);
  logAction(user.id, 'LOGIN', 'user', user.id, undefined, req.ip);

  res.json({
    token: accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
  });
});

// ─── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', validate(RegisterSchema), (req, res) => {
  const { email, name, password } = req.body;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)')
    .run(email, name, hashedPassword, 'user');

  const userId = Number(result.lastInsertRowid);
  const { accessToken, refreshToken } = issueTokens(userId, email, 'user');

  logAction(userId, 'REGISTER', 'user', userId, email, req.ip);
  createNotification(
    userId,
    'Добро пожаловать в JanDós!',
    'Ваш аккаунт успешно создан. Вы можете подать заявки на адопцию или стать волонтёром.',
  );

  res.status(201).json({
    token: accessToken,
    refreshToken,
    user: { id: userId, email, name, role: 'user', avatar: null },
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Необходим refresh token' });

  const record = db.prepare(`
    SELECT rt.*, u.email, u.role, u.is_banned
    FROM refresh_tokens rt
    JOIN users u ON rt.user_id = u.id
    WHERE rt.token = ? AND rt.expires_at > datetime('now')
  `).get(refreshToken) as any;

  if (!record) return res.status(401).json({ error: 'Refresh token недействителен или истёк' });

  if (record.is_banned) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    return res.status(403).json({ error: 'Аккаунт заблокирован' });
  }

  // Rotate: delete old, issue new pair
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = issueTokens(
    record.user_id,
    record.email,
    record.role,
  );

  res.json({ token: accessToken, refreshToken: newRefreshToken });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post('/logout', authenticateToken, (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ? AND user_id = ?')
      .run(refreshToken, (req as any).user.id);
  }
  logAction((req as any).user.id, 'LOGOUT', 'user', (req as any).user.id, undefined, req.ip);
  res.json({ message: 'Выход выполнен' });
});

// ─── PATCH /api/auth/profile ───────────────────────────────────────────────────

router.patch('/profile', authenticateToken, validate(UpdateProfileSchema), (req, res) => {
  const userId = (req as any).user.id;
  const { name, avatar, phone, birthday, country, city, about } = req.body;

  db.prepare(`
    UPDATE users SET
      name    = COALESCE(?, name),
      avatar  = COALESCE(?, avatar),
      phone   = COALESCE(?, phone),
      birthday= COALESCE(?, birthday),
      country = COALESCE(?, country),
      city    = COALESCE(?, city),
      about   = COALESCE(?, about)
    WHERE id = ?
  `).run(
    name ?? null, avatar ?? null, phone ?? null,
    birthday ?? null, country ?? null, city ?? null,
    about ?? null, userId,
  );

  const updated = db
    .prepare('SELECT id, email, name, role, avatar, phone, birthday, country, city, about FROM users WHERE id = ?')
    .get(userId) as any;
  logAction(userId, 'UPDATE_PROFILE', 'user', userId, undefined, req.ip);

  res.json({ user: updated });
});

// ─── POST /api/auth/change-password ───────────────────────────────────────────

router.post('/change-password', authenticateToken, validate(ChangePasswordSchema), (req, res) => {
  const userId = (req as any).user.id;
  const { currentPassword, newPassword } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Текущий пароль неверен' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, userId);
  // Invalidate all refresh tokens on password change
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
  logAction(userId, 'CHANGE_PASSWORD', 'user', userId, undefined, req.ip);

  res.json({ message: 'Пароль успешно изменён' });
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────

router.post('/forgot-password', validate(ForgotPasswordSchema), (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ message: 'Если такой аккаунт существует, код был отправлен' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  // Invalidate previous tokens for this user
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0').run(user.id);

  db.prepare('INSERT INTO password_reset_tokens (user_id, token, code, expires_at) VALUES (?, ?, ?, ?)')
    .run(user.id, token, code, expiresAt);

  console.log(`[SMS CODE] email=${email} code=${code} (истекает через 15 минут)`);

  // Local mode: return code directly in response for simulation
  res.json({ message: 'Код сгенерирован', code });
});

// ─── POST /api/auth/verify-code ───────────────────────────────────────────────

router.post('/verify-code', validate(VerifyCodeSchema), (req, res) => {
  const { email, code } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;

  // Don't reveal whether email exists
  if (!user) return res.status(400).json({ error: 'Неверный код' });

  const record = db.prepare(`
    SELECT token FROM password_reset_tokens
    WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
  `).get(user.id, code) as any;

  if (!record) return res.status(400).json({ error: 'Неверный или истёкший код' });

  res.json({ token: record.token });
});

// ─── POST /api/auth/reset-password ────────────────────────────────────────────

router.post('/reset-password', validate(ResetPasswordSchema), (req, res) => {
  const { token, newPassword } = req.body;

  const record = db.prepare(`
    SELECT * FROM password_reset_tokens
    WHERE token = ? AND used = 0 AND expires_at > datetime('now')
  `).get(token) as any;

  if (!record) {
    return res.status(400).json({ error: 'Токен недействителен или истёк' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, record.user_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(record.id);
  // Invalidate all refresh tokens on password reset
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(record.user_id);

  logAction(record.user_id, 'RESET_PASSWORD', 'user', record.user_id);
  createNotification(record.user_id, 'Пароль изменён', 'Ваш пароль был успешно сброшен.');

  res.json({ message: 'Пароль успешно изменён' });
});

export default router;
