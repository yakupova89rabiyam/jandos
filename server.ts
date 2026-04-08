import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('jandos.db');
const JWT_SECRET = process.env.JWT_SECRET || 'jandos_secret_key_2026';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'manager', 'user')) DEFAULT 'user',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    breed TEXT,
    age TEXT,
    ageGroup TEXT,
    gender TEXT,
    color TEXT,
    size TEXT,
    description TEXT,
    image TEXT,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fundraisers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    target_amount INTEGER NOT NULL,
    current_amount INTEGER DEFAULT 0,
    description TEXT,
    image TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image TEXT,
    date TEXT,
    category TEXT,
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS adoption_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(pet_id) REFERENCES pets(id)
  );

  CREATE TABLE IF NOT EXISTS volunteer_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    skills TEXT,
    experience TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS volunteer_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT,
    start_time TEXT,
    end_time TEXT,
    task TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uploaded_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS graduates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    story TEXT,
    image TEXT,
    lat REAL,
    lng REAL,
    adoption_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migrations for existing tables (run separately to avoid errors if columns already exist)
try { db.exec('ALTER TABLE pets ADD COLUMN ageGroup TEXT'); } catch (e) { }
try { db.exec('ALTER TABLE pets ADD COLUMN color TEXT'); } catch (e) { }
try { db.exec('ALTER TABLE pets ADD COLUMN size TEXT'); } catch (e) { }
try { db.exec('ALTER TABLE news ADD COLUMN excerpt TEXT'); } catch (e) { }
try { db.exec('ALTER TABLE news ADD COLUMN featured INTEGER DEFAULT 0'); } catch (e) { }
try { db.exec('ALTER TABLE volunteer_shifts ADD COLUMN start_time TEXT'); } catch (e) { }
try { db.exec('ALTER TABLE volunteer_shifts ADD COLUMN end_time TEXT'); } catch (e) { }
try { db.exec('ALTER TABLE volunteer_shifts ADD COLUMN task TEXT'); } catch (e) { }

// Helper for logging
const logAction = (userId: number, action: string, targetType: string, targetId?: number, details?: string, ip?: string) => {
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, action, targetType, targetId, details, ip);
};

// Mock Email Sender
async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
  console.log(`[MOCK EMAIL] Body: ${body}`);
  // In a real app, use nodemailer or a service like SendGrid/Postmark
  return true;
}

// Helper: Create Notification
const createNotification = async (userId: number, title: string, message: string) => {
  db.prepare(`
    INSERT INTO notifications (user_id, title, message)
    VALUES (?, ?, ?)
  `).run(userId, title, message);

  // Also send email
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as { email: string };
  if (user) {
    await sendEmail(user.email, title, message);
  }
};

// Seed Data
const seedData = () => {
  // Users seed
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const users = [
      { email: 'admin@jandos.kz', password: 'admin123', name: 'Администратор', role: 'admin' },
      { email: 'manager@jandos.kz', password: 'manager123', name: 'Менеджер', role: 'manager' },
      { email: 'user@jandos.kz', password: 'user123', name: 'Пользователь', role: 'user' }
    ];
    const insert = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    users.forEach(u => insert.run(u.email, bcrypt.hashSync(u.password, salt), u.name, u.role));
    console.log('Seed users created.');
  }

  // Site Settings seed
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const settings = [
      { key: 'hero_title', value: 'Найди своего верного друга в JanDós' },
      { key: 'hero_subtitle', value: 'Мы помогаем бездомным животным найти любящую семью. Каждый хвостик заслуживает счастья.' },
      { key: 'about_text', value: 'JanDós — это не просто приют, это место надежды. Мы работаем с 2015 года, спасая и пристраивая животных в добрые руки.' },
      { key: 'contact_email', value: 'info@jandos.kz' },
      { key: 'contact_phone', value: '+7 (777) 123-45-67' },
      { key: 'contact_address', value: 'г. Алматы, ул. Дружбы, 123' }
    ];
    const insert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    settings.forEach(s => insert.run(s.key, s.value));
    console.log('Seed settings created.');
  }

  // Seed some sample audit logs
  const logCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as { count: number };
  if (logCount.count === 0) {
    logAction(1, 'SYSTEM_INIT', 'system', 0, 'Database initialized with seed data');
  }

  // Pets seed
  const petCount = db.prepare('SELECT COUNT(*) as count FROM pets').get() as { count: number };
  if (petCount.count === 0) {
    const pets = [
      {
        name: 'Барни',
        category: 'Собаки',
        breed: 'Золотистый ретривер',
        age: '2 года',
        ageGroup: '1-3 года',
        gender: 'male',
        color: 'Золотистый',
        size: 'Средний',
        description: 'Дружелюбный и энергичный пес, обожает играть с мячом и очень любит детей. Идеальный компаньон для активной семьи.',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Мурка',
        category: 'Кошки',
        breed: 'Британская короткошерстная',
        age: '1 год',
        ageGroup: '1-3 года',
        gender: 'female',
        color: 'Серый',
        size: 'Маленький',
        description: 'Спокойная и ласковая кошка, любит тепло и уют. Приучена к лотку и когтеточке.',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Рекс',
        category: 'Собаки',
        breed: 'Немецкая овчарка',
        age: '4 года',
        ageGroup: '3-7 лет',
        gender: 'male',
        color: 'Черно-рыжий',
        size: 'Большой',
        description: 'Умный и преданный защитник. Знает базовые команды, отлично ладит с другими собаками.',
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Луна',
        category: 'Кошки',
        breed: 'Сиамская',
        age: '6 месяцев',
        ageGroup: 'До 1 года',
        gender: 'female',
        color: 'Колор-пойнт',
        size: 'Маленький',
        description: 'Любопытный котенок с голубыми глазами. Очень общительная и игривая.',
        image: 'https://images.unsplash.com/photo-1513245533418-2975e90460a1?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Арчи',
        category: 'Собаки',
        breed: 'Джек-рассел-терьер',
        age: '5 лет',
        ageGroup: '3-7 лет',
        gender: 'male',
        color: 'Бело-рыжий',
        size: 'Маленький',
        description: 'Маленький комок энергии. Обожает долгие прогулки и активные игры.',
        image: 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Белла',
        category: 'Кошки',
        breed: 'Мейн-кун',
        age: '3 года',
        ageGroup: '3-7 лет',
        gender: 'female',
        color: 'Рыжий табби',
        size: 'Большой',
        description: 'Величественная кошка с кисточками на ушах. Обладает спокойным и уравновешенным характером.',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Тай',
        category: 'Собаки',
        breed: 'Хаски',
        age: '2 года',
        ageGroup: '1-3 года',
        gender: 'male',
        color: 'Серо-белый',
        size: 'Средний',
        description: 'Красавец с голубыми глазами. Требует много внимания и физических нагрузок.',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Джесси',
        category: 'Собаки',
        breed: 'Лабрадор',
        age: '3 месяца',
        ageGroup: 'До 1 года',
        gender: 'female',
        color: 'Черный',
        size: 'Средний',
        description: 'Ласковая активная кошечка, любит длительные прогулки и активные игры, может сопровождать вас в любой поездке',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      },
      {
        name: 'Самал',
        category: 'Собаки',
        breed: 'Без породы',
        age: '2 месяца',
        ageGroup: 'До 1 года',
        gender: 'male',
        color: 'Коричневый',
        size: 'Маленький',
        description: 'Милый песик Самал, быстро привыкает к людям, обожает когда его гладят и чешут, очень верный друг',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop',
        status: 'available'
      }
    ];
    const insert = db.prepare('INSERT INTO pets (name, category, breed, age, ageGroup, gender, color, size, description, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    pets.forEach(p => insert.run(p.name, p.category, p.breed, p.age, p.ageGroup, p.gender, p.color, p.size, p.description, p.image, p.status));
    console.log('Seed pets created.');
  }

  // Fundraisers seed
  const fundraiserCount = db.prepare('SELECT COUNT(*) as count FROM fundraisers').get() as { count: number };
  if (fundraiserCount.count === 0) {
    const fundraisers = [
      {
        title: 'Помощь приюту "JanDós"',
        target_amount: 500000,
        current_amount: 150000,
        description: 'Сбор средств на закупку корма и медикаментов для наших подопечных на зимний период.',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
        status: 'active'
      },
      {
        title: 'Операция для Борика',
        target_amount: 120000,
        current_amount: 45000,
        description: 'Борику требуется срочная операция на лапе после травмы. Помогите малышу снова бегать!',
        image: 'https://images.unsplash.com/photo-1589965716319-4a041b58fa8a?q=80&w=800&auto=format&fit=crop',
        status: 'active'
      }
    ];
    const insert = db.prepare('INSERT INTO fundraisers (title, target_amount, current_amount, description, image, status) VALUES (?, ?, ?, ?, ?, ?)');
    fundraisers.forEach(f => insert.run(f.title, f.target_amount, f.current_amount, f.description, f.image, f.status));
    console.log('Seed fundraisers created.');
  }

  // News seed
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number };
  if (newsCount.count === 0) {
    const news = [
      {
        title: 'День открытых дверей в JanDós',
        content: 'Приходите познакомиться с нашими подопечными в это воскресенье! Вас ждут экскурсии по приюту, общение с животными и мастер-классы от кинологов.',
        excerpt: 'Приходите познакомиться с нашими подопечными в это воскресенье! Вас ждут экскурсии и мастер-классы.',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
        date: '15.03.2026',
        category: 'События',
        featured: 1
      },
      {
        title: 'История спасения: как Барни нашел дом',
        content: 'Барни попал к нам в тяжелом состоянии, но благодаря вашей поддержке он выздоровел и теперь живет в любящей семье в Алматы.',
        excerpt: 'Барни попал к нам в тяжелом состоянии, но теперь он счастлив в новой семье.',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop',
        date: '10.03.2026',
        category: 'Счастливые истории',
        featured: 0
      },
      {
        title: 'Нам нужна ваша помощь с кормом',
        content: 'Запасы корма для собак подходят к концу. Будем благодарны за любую помощь в закупке питания для наших хвостиков.',
        excerpt: 'Запасы корма для собак подходят к концу. Будем благодарны за любую помощь.',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
        date: '05.03.2026',
        category: 'Нужды приюта',
        featured: 0
      }
    ];
    const insert = db.prepare('INSERT INTO news (title, content, excerpt, image, date, category, featured) VALUES (?, ?, ?, ?, ?, ?, ?)');
    news.forEach(n => insert.run(n.title, n.content, n.excerpt, n.image, n.date, n.category, n.featured));
    console.log('Seed news created.');
  }
};

seedData();

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const checkRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  };

  // API Routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }
    });
  });

  app.get('/api/users', authenticateToken, checkRole(['admin']), (req, res) => {
    const users = db.prepare('SELECT id, email, name, role, created_at FROM users').all();
    res.json(users);
  });

  app.patch('/api/users/:id/role', authenticateToken, checkRole(['admin']), (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ message: 'Role updated' });
  });

  // Site Settings API
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM site_settings').all();
    const settingsMap = (settings as any[]).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  });

  app.patch('/api/settings', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const updates = req.body;
    const updateStmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');

    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        updateStmt.run(key, value);
      }
    });

    transaction(updates);
    res.json({ message: 'Settings updated' });
  });

  // News API
  app.get('/api/news', (req, res) => {
    const news = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
    res.json(news);
  });

  app.post('/api/news', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { title, content, image, date, category } = req.body;
    const result = db.prepare(`
      INSERT INTO news (title, content, image, date, category)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, image, date, category);
    logAction((req as any).user.id, 'CREATE_NEWS', 'news', Number(result.lastInsertRowid), title);
    res.json({ id: result.lastInsertRowid, message: 'News added' });
  });

  app.patch('/api/news/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { id } = req.params;
    const { title, content, image, date, category } = req.body;
    db.prepare(`
      UPDATE news 
      SET title = ?, content = ?, image = ?, date = ?, category = ?
      WHERE id = ?
    `).run(title, content, image, date, category, id);
    logAction((req as any).user.id, 'UPDATE_NEWS', 'news', Number(id), title);
    res.json({ message: 'News updated' });
  });

  app.delete('/api/news/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
    logAction((req as any).user.id, 'DELETE_NEWS', 'news', Number(req.params.id));
    res.json({ message: 'News deleted' });
  });

  // Pets API
  app.get('/api/pets', (req, res) => {
    const pets = db.prepare('SELECT * FROM pets ORDER BY created_at DESC').all();
    res.json(pets);
  });

  app.post('/api/pets', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { name, category, breed, age, ageGroup, gender, color, size, description, image } = req.body;
    const result = db.prepare(`
      INSERT INTO pets (name, category, breed, age, ageGroup, gender, color, size, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, breed, age, ageGroup, gender, color, size, description, image);
    logAction((req as any).user.id, 'CREATE_PET', 'pet', Number(result.lastInsertRowid), name);
    res.json({ id: result.lastInsertRowid, message: 'Pet added' });
  });

  app.patch('/api/pets/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { id } = req.params;
    const { name, category, breed, age, ageGroup, gender, color, size, description, image, status } = req.body;
    db.prepare(`
      UPDATE pets 
      SET name = ?, category = ?, breed = ?, age = ?, ageGroup = ?, gender = ?, color = ?, size = ?, description = ?, image = ?, status = ?
      WHERE id = ?
    `).run(name, category, breed, age, ageGroup, gender, color, size, description, image, status, id);
    logAction((req as any).user.id, 'UPDATE_PET', 'pet', Number(id), name);
    res.json({ message: 'Pet updated' });
  });

  app.delete('/api/pets/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    db.prepare('DELETE FROM pets WHERE id = ?').run(req.params.id);
    logAction((req as any).user.id, 'DELETE_PET', 'pet', Number(req.params.id));
    res.json({ message: 'Pet deleted' });
  });

  // Fundraisers API
  app.get('/api/fundraisers', (req, res) => {
    const fundraisers = db.prepare('SELECT * FROM fundraisers ORDER BY created_at DESC').all();
    res.json(fundraisers);
  });

  app.post('/api/fundraisers', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { title, target_amount, description, image } = req.body;
    const result = db.prepare(`
      INSERT INTO fundraisers (title, target_amount, description, image)
      VALUES (?, ?, ?, ?)
    `).run(title, target_amount, description, image);
    logAction((req as any).user.id, 'CREATE_FUNDRAISER', 'fundraiser', Number(result.lastInsertRowid), title);
    res.json({ id: result.lastInsertRowid, message: 'Fundraiser created' });
  });

  app.patch('/api/fundraisers/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { id } = req.params;
    const { title, target_amount, current_amount, description, image, status } = req.body;
    db.prepare(`
      UPDATE fundraisers 
      SET title = ?, target_amount = ?, current_amount = ?, description = ?, image = ?, status = ?
      WHERE id = ?
    `).run(title, target_amount, current_amount, description, image, status, id);
    logAction((req as any).user.id, 'UPDATE_FUNDRAISER', 'fundraiser', Number(id), title);
    res.json({ message: 'Fundraiser updated' });
  });

  app.delete('/api/fundraisers/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    db.prepare('DELETE FROM fundraisers WHERE id = ?').run(req.params.id);
    logAction((req as any).user.id, 'DELETE_FUNDRAISER', 'fundraiser', Number(req.params.id));
    res.json({ message: 'Fundraiser deleted' });
  });

  // Adoption Requests API
  app.get('/api/adoption_requests', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const requests = db.prepare(`
      SELECT ar.*, u.name as user_name, u.email as user_email, p.name as pet_name 
      FROM adoption_requests ar
      JOIN users u ON ar.user_id = u.id
      JOIN pets p ON ar.pet_id = p.id
      ORDER BY ar.created_at DESC
    `).all();
    res.json(requests);
  });

  // Volunteers API
  app.get('/api/volunteers', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const volunteers = db.prepare(`
      SELECT va.*, u.name, u.email 
      FROM volunteer_applications va
      JOIN users u ON va.user_id = u.id
      ORDER BY va.created_at DESC
    `).all();
    res.json(volunteers);
  });

  // User's own data
  app.get('/api/my_requests', authenticateToken, (req, res) => {
    const userId = (req as any).user.id;
    const adoptions = db.prepare('SELECT * FROM adoption_requests WHERE user_id = ?').all(userId);
    const volunteers = db.prepare('SELECT * FROM volunteer_applications WHERE user_id = ?').all(userId);
    const shifts = db.prepare('SELECT * FROM volunteer_shifts WHERE user_id = ?').all(userId);
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    res.json({ adoptions, volunteers, shifts, notifications });
  });

  // Notifications API
  app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, (req as any).user.id);
    res.json({ message: 'Notification marked as read' });
  });

  // Feedback API
  app.post('/api/feedback', (req, res) => {
    const { name, email, subject, message } = req.body;
    db.prepare('INSERT INTO feedback (name, email, subject, message) VALUES (?, ?, ?, ?)').run(name, email, subject, message);
    res.json({ message: 'Feedback received' });
  });

  app.get('/api/feedback', authenticateToken, checkRole(['admin']), (req, res) => {
    const feedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all();
    res.json(feedback);
  });

  // Donation Simulation API
  app.post('/api/donations', authenticateToken, (req, res) => {
    const { fundraiser_id, amount } = req.body;
    const userId = (req as any).user.id;

    db.transaction(() => {
      db.prepare('UPDATE fundraisers SET current_amount = current_amount + ? WHERE id = ?').run(amount, fundraiser_id);
      db.prepare('INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)')
        .run(userId, 'DONATION', 'fundraiser', fundraiser_id, `Amount: ${amount}`);
    })();

    res.json({ message: 'Donation successful' });
  });

  // Update adoption request status with notification
  app.patch('/api/adoption_requests/:id', authenticateToken, checkRole(['admin', 'manager']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = db.prepare('SELECT * FROM adoption_requests WHERE id = ?').get(id) as any;

    db.prepare('UPDATE adoption_requests SET status = ? WHERE id = ?').run(status, id);

    if (request) {
      const title = status === 'approved' ? 'Заявка на адопцию одобрена!' : 'Заявка на адопцию отклонена';
      const message = status === 'approved'
        ? `Ваша заявка на питомца #${request.pet_id} была одобрена. Мы свяжемся с вами в ближайшее время.`
        : `К сожалению, ваша заявка на питомца #${request.pet_id} была отклонена.`;
      await createNotification(request.user_id, title, message);
    }

    logAction((req as any).user.id, 'UPDATE_ADOPTION', 'adoption', Number(id), `Status: ${status}`);
    res.json({ message: 'Status updated' });
  });

  // Update volunteer application status with notification
  app.patch('/api/volunteer_applications/:id', authenticateToken, checkRole(['admin', 'manager']), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const request = db.prepare('SELECT * FROM volunteer_applications WHERE id = ?').get(id) as any;

    db.prepare('UPDATE volunteer_applications SET status = ? WHERE id = ?').run(status, id);

    if (request) {
      const title = status === 'approved' ? 'Вы приняты в команду волонтеров!' : 'Заявка волонтера отклонена';
      const message = status === 'approved'
        ? 'Поздравляем! Ваша заявка волонтера одобрена. Теперь вы можете записываться на смены.'
        : 'К сожалению, на данный момент мы не можем принять вашу заявку волонтера.';
      await createNotification(request.user_id, title, message);
    }

    logAction((req as any).user.id, 'UPDATE_VOLUNTEER', 'volunteer', Number(id), `Status: ${status}`);
    res.json({ message: 'Status updated' });
  });

  // Volunteer Shifts API
  app.get('/api/volunteer_shifts', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const shifts = db.prepare(`
      SELECT vs.*, u.name as volunteer_name 
      FROM volunteer_shifts vs
      JOIN users u ON vs.user_id = u.id
      ORDER BY vs.date DESC
    `).all();
    res.json(shifts);
  });

  app.post('/api/volunteer_shifts', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { user_id, date, start_time, end_time, task } = req.body;
    const result = db.prepare(`
      INSERT INTO volunteer_shifts (user_id, date, start_time, end_time, task)
      VALUES (?, ?, ?, ?, ?)
    `).run(user_id, date, start_time, end_time, task);
    logAction((req as any).user.id, 'CREATE_SHIFT', 'shift', Number(result.lastInsertRowid), `Task: ${task}`);
    res.json({ id: result.lastInsertRowid, message: 'Shift created' });
  });

  app.patch('/api/volunteer_shifts/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { id } = req.params;
    const { date, start_time, end_time, task, status } = req.body;
    db.prepare(`
      UPDATE volunteer_shifts 
      SET date = ?, start_time = ?, end_time = ?, task = ?, status = ?
      WHERE id = ?
    `).run(date, start_time, end_time, task, status, id);
    logAction((req as any).user.id, 'UPDATE_SHIFT', 'shift', Number(id), `Task: ${task}`);
    res.json({ message: 'Shift updated' });
  });

  app.delete('/api/volunteer_shifts/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    db.prepare('DELETE FROM volunteer_shifts WHERE id = ?').run(req.params.id);
    logAction((req as any).user.id, 'DELETE_SHIFT', 'shift', Number(req.params.id));
    res.json({ message: 'Shift deleted' });
  });

  // Audit Logs API
  app.get('/api/audit_logs', authenticateToken, checkRole(['admin']), (req, res) => {
    const logs = db.prepare(`
      SELECT al.*, u.name as user_name 
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `).all();
    res.json(logs);
  });

  // Media API
  app.get('/api/media', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const media = db.prepare('SELECT * FROM media ORDER BY created_at DESC').all();
    res.json(media);
  });

  app.post('/api/media', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { filename, url, mime_type, size } = req.body;
    const result = db.prepare(`
      INSERT INTO media (filename, url, mime_type, size, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename, url, mime_type, size, (req as any).user.id);
    res.json({ id: result.lastInsertRowid, url });
  });

  app.delete('/api/media/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
    res.json({ message: 'Media deleted' });
  });

  // Graduates API
  app.get('/api/graduates', (req, res) => {
    const graduates = db.prepare('SELECT * FROM graduates ORDER BY adoption_date DESC').all();
    res.json(graduates);
  });

  app.post('/api/graduates', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { name, story, image, lat, lng, adoption_date } = req.body;
    const result = db.prepare(`
      INSERT INTO graduates (name, story, image, lat, lng, adoption_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, story, image, lat, lng, adoption_date);
    res.json({ id: result.lastInsertRowid });
  });

  app.delete('/api/graduates/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    db.prepare('DELETE FROM graduates WHERE id = ?').run(req.params.id);
    res.json({ message: 'Graduate removed' });
  });

  // Enhanced Analytics API
  // Broadcast notification to all users
  app.post('/api/notifications/broadcast', authenticateToken, checkRole(['admin']), (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });

    try {
      const users = db.prepare('SELECT id FROM users').all() as { id: number }[];
      const insert = db.prepare('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)');

      const transaction = db.transaction((users) => {
        for (const u of users) {
          insert.run(u.id, title, message);
        }
      });

      transaction(users);
      logAction((req as any).user!.id, 'broadcast', 'notifications', 0, `Broadcast: ${title}`, req.ip);
      res.json({ message: 'Broadcast sent successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Ban user
  app.post('/api/users/:id/ban', authenticateToken, checkRole(['admin']), (req, res) => {
    const { id } = req.params;
    try {
      const result = db.prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(id);
      if (result.changes === 0) return res.status(404).json({ error: 'User not found or cannot ban admin' });

      logAction((req as any).user!.id, 'ban', 'users', parseInt(id), 'User banned and deleted', req.ip);
      res.json({ message: 'User banned' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Media upload (simulated)
  app.post('/api/media/upload', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const { filename, url, type, size } = req.body;
    if (!filename || !url) return res.status(400).json({ error: 'Filename and URL required' });

    try {
      const result = db.prepare(`
      INSERT INTO media (filename, url, type, size, uploaded_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename, url, type || 'image', size || 0, (req as any).user!.id);

      logAction((req as any).user!.id, 'upload', 'media', result.lastInsertRowid as number, `Uploaded: ${filename}`, req.ip);
      res.json({ id: result.lastInsertRowid, message: 'File uploaded' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/analytics', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
    const stats = {
      summary: {
        totalDonations: (db.prepare('SELECT SUM(current_amount) as total FROM fundraisers').get() as any).total || 0,
        activePets: (db.prepare("SELECT COUNT(*) as count FROM pets WHERE status = 'available'").get() as any).count,
        pendingAdoptions: (db.prepare("SELECT COUNT(*) as count FROM adoption_requests WHERE status = 'pending'").get() as any).count,
        totalUsers: (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count,
      },
      petStats: db.prepare('SELECT status, COUNT(*) as count FROM pets GROUP BY status').all(),
      adoptionStats: db.prepare('SELECT status, COUNT(*) as count FROM adoption_requests GROUP BY status').all(),
      monthlyDonations: [
        { name: 'Янв', amount: 45000 },
        { name: 'Фев', amount: 52000 },
        { name: 'Мар', amount: 61000 },
        { name: 'Апр', amount: 48000 },
        { name: 'Май', amount: 72000 },
        { name: 'Июн', amount: 85000 },
      ],
      adoptionTrends: [
        { name: 'Янв', count: 5 },
        { name: 'Фев', count: 8 },
        { name: 'Мар', count: 12 },
        { name: 'Апр', count: 7 },
        { name: 'Май', count: 15 },
        { name: 'Июн', count: 10 },
      ]
    };
    res.json(stats);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
