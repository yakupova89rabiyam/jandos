import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jandos_secret_key_2026';

if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET не задан в .env — используется дефолтный ключ. Небезопасно для продакшена!');
}

// ─── Authenticate Token ───────────────────────────────────────────────────────

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Необходима авторизация' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Токен недействителен или истёк' });

    const dbUser = db.prepare('SELECT is_banned FROM users WHERE id = ?').get(user.id) as any;
    if (!dbUser || dbUser.is_banned) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    req.user = user;
    next();
  });
};

// ─── Check Role ───────────────────────────────────────────────────────────────

export const checkRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }
    next();
  };
};

export { JWT_SECRET };
