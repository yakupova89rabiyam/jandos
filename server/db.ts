import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'jandos.db');

export const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ──────────────────────────────────────────────────────────────────

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
    notes TEXT DEFAULT '',
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

  CREATE TABLE IF NOT EXISTS shift_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL DEFAULT 'other',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    slots INTEGER NOT NULL DEFAULT 5,
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS needs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    quantity TEXT NOT NULL DEFAULT '',
    urgency TEXT NOT NULL DEFAULT 'medium',
    is_fulfilled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shift_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, slot_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(slot_id) REFERENCES shift_slots(id) ON DELETE CASCADE
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

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS surrender_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    iin TEXT,
    phone TEXT NOT NULL,
    animal_type TEXT,
    animal_gender TEXT,
    health TEXT,
    breed TEXT,
    age TEXT,
    reason TEXT,
    address TEXT,
    photo TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS guardianships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'food',
    monthly_amount INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pet_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, pet_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(pet_id) REFERENCES pets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS promised_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    need_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, need_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(need_id) REFERENCES needs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'one-time',
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    meta_description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS footer_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    address TEXT,
    phone TEXT,
    email TEXT,
    social_links TEXT,
    copyright TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default pages if not exists
const defaultPages = [
  { slug: 'about', title: 'О нас', content: '<p>Информация о приюте JanDós...</p>' },
  { slug: 'help', title: 'Помощь', content: '<p>Как помочь приюту...</p>' },
  { slug: 'contacts', title: 'Контакты', content: '<p>Наши контакты...</p>' }
];

for (const page of defaultPages) {
  try {
    db.prepare(`INSERT OR IGNORE INTO pages (slug, title, content) VALUES (?, ?, ?)`).run(page.slug, page.title, page.content);
  } catch { /* ignore */ }
}

// Insert default footer settings if not exists
try {
  db.prepare(`INSERT OR IGNORE INTO footer_settings (id) VALUES (1)`).run();
} catch { /* ignore */ }

// ─── Migrations (safe, idempotent) ───────────────────────────────────────────

const migrations = [
  'ALTER TABLE pets ADD COLUMN ageGroup TEXT',
  'ALTER TABLE pets ADD COLUMN color TEXT',
  'ALTER TABLE pets ADD COLUMN size TEXT',
  'ALTER TABLE news ADD COLUMN excerpt TEXT',
  'ALTER TABLE news ADD COLUMN featured INTEGER DEFAULT 0',
  'ALTER TABLE volunteer_shifts ADD COLUMN start_time TEXT',
  'ALTER TABLE volunteer_shifts ADD COLUMN end_time TEXT',
  'ALTER TABLE volunteer_shifts ADD COLUMN task TEXT',
  'ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0',
  'ALTER TABLE password_reset_tokens ADD COLUMN code TEXT',
  'ALTER TABLE users ADD COLUMN phone TEXT',
  'ALTER TABLE users ADD COLUMN birthday TEXT',
  'ALTER TABLE users ADD COLUMN country TEXT',
  'ALTER TABLE users ADD COLUMN city TEXT',
  'ALTER TABLE users ADD COLUMN about TEXT',
  'ALTER TABLE graduates ADD COLUMN district TEXT',
  'ALTER TABLE pets ADD COLUMN notes TEXT DEFAULT \'\'',
  'ALTER TABLE surrender_requests ADD COLUMN photo TEXT',
];

for (const sql of migrations) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

// Create pages table if not exists (migration)
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      meta_description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert default pages
  const defaultPages = [
    { slug: 'about', title: 'О нас', content: '<p>Информация о приюте JanDós...</p>' },
    { slug: 'help', title: 'Помощь', content: '<p>Как помочь приюту...</p>' },
    { slug: 'contacts', title: 'Контакты', content: '<p>Наши контакты...</p>' }
  ];
  
  for (const page of defaultPages) {
    try {
      db.prepare(`INSERT OR IGNORE INTO pages (slug, title, content) VALUES (?, ?, ?)`).run(page.slug, page.title, page.content);
    } catch { /* ignore */ }
  }
} catch { /* ignore */ }

// Create footer_settings table if not exists (migration)
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS footer_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      address TEXT,
      phone TEXT,
      email TEXT,
      social_links TEXT,
      copyright TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.prepare(`INSERT OR IGNORE INTO footer_settings (id) VALUES (1)`).run();
} catch { /* ignore */ }

// ─── Token Cleanup (runs on startup + every 6h) ──────────────────────────────

export function cleanupExpiredTokens() {
  const r1 = db.prepare("DELETE FROM password_reset_tokens WHERE expires_at < datetime('now')").run();
  const r2 = db.prepare("DELETE FROM refresh_tokens WHERE expires_at < datetime('now')").run();
  if (r1.changes || r2.changes) {
    console.log(`[Cleanup] Удалено токенов: reset=${r1.changes}, refresh=${r2.changes}`);
  }
}

cleanupExpiredTokens();
setInterval(cleanupExpiredTokens, 6 * 60 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const logAction = (
  userId: number,
  action: string,
  targetType: string,
  targetId?: number,
  details?: string,
  ip?: string,
) => {
  db.prepare(`
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, action, targetType, targetId ?? null, details ?? null, ip ?? null);
};

export const createNotification = (userId: number, title: string, message: string) => {
  db.prepare(`
    INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)
  `).run(userId, title, message);
};

// ─── Seed ─────────────────────────────────────────────────────────────────────

export function seedDatabase() {
  // Users
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const users = [
      { email: 'admin@jandos.kz', password: 'admin123', name: 'Администратор', role: 'admin' },
      { email: 'manager@jandos.kz', password: 'manager123', name: 'Менеджер', role: 'manager' },
      { email: 'user@jandos.kz', password: 'user123', name: 'Пользователь', role: 'user' },
    ];
    const insert = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    users.forEach(u => insert.run(u.email, bcrypt.hashSync(u.password, salt), u.name, u.role));
    console.log('✅ Seed users created');
  }

  // Settings
  const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as any).count;
  if (settingsCount === 0) {
    const settings = [
      { key: 'hero_title', value: 'Найди своего верного друга в JanDós' },
      { key: 'hero_subtitle', value: 'Мы помогаем бездомным животным найти любящую семью.' },
      { key: 'about_text', value: 'JanDós — это не просто приют, это место надежды.' },
      { key: 'contact_email', value: 'info@jandos.kz' },
      { key: 'contact_phone', value: '+7 (777) 123-45-67' },
      { key: 'contact_address', value: 'г. Алматы, ул. Дружбы, 123' },
    ];
    const insert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    settings.forEach(s => insert.run(s.key, s.value));
    console.log('✅ Seed settings created');
  }

  // Shift Slots
  const slotCount = (db.prepare('SELECT COUNT(*) as count FROM shift_slots').get() as any).count;
  if (slotCount === 0) {
    const slots = [
      { type: 'walking', date: '2026-04-10', time: '09:00 - 11:00', slots: 5, description: 'Выгул собак в парке рядом с приютом. Наденьте удобную обувь и одежду, которую не жалко испачкать.', location: 'Главный вход приюта', contact: '+7 (777) 123-45-67 (Марина)' },
      { type: 'cleaning', date: '2026-04-10', time: '12:00 - 14:00', slots: 3, description: 'Уборка вольеров и общей территории. Мы предоставим все необходимые инструменты и перчатки.', location: 'Хозяйственный блок', contact: '+7 (777) 234-56-78 (Игорь)' },
      { type: 'feeding', date: '2026-04-12', time: '08:00 - 10:00', slots: 2, description: 'Помощь в приготовлении и раздаче еды. Важно соблюдать пропорции и диетические рекомендации.', location: 'Кухня приюта', contact: '+7 (777) 345-67-89 (Ольга)' },
      { type: 'walking', date: '2026-04-15', time: '16:00 - 18:00', slots: 4, description: 'Вечерний выгул активных собак. Требуется хорошая физическая форма!', location: 'Главный вход приюта', contact: '+7 (777) 123-45-67 (Марина)' },
      { type: 'cleaning', date: '2026-04-17', time: '10:00 - 13:00', slots: 6, description: 'Генеральная уборка медицинского блока. Требуется особая тщательность и дезинфекция.', location: 'Медпункт', contact: '+7 (777) 456-78-90 (Доктор Анна)' },
      { type: 'feeding', date: '2026-04-20', time: '09:00 - 11:00', slots: 3, description: 'Утреннее кормление котиков. Любовь к кошкам обязательна!', location: 'Кошачий блок', contact: '+7 (777) 345-67-89 (Ольга)' },
      { type: 'walking', date: '2026-05-05', time: '10:00 - 12:00', slots: 5, description: 'Весенний выгул: большая группа добровольцев и много счастливых собак!', location: 'Главный вход приюта', contact: '+7 (777) 123-45-67 (Марина)' },
    ];
    const insert = db.prepare('INSERT INTO shift_slots (type, date, time, slots, description, location, contact) VALUES (?, ?, ?, ?, ?, ?, ?)');
    slots.forEach(s => insert.run(s.type, s.date, s.time, s.slots, s.description, s.location, s.contact));
    console.log('✅ Seed shift_slots created');
  }

  // Graduates
  const graduateCount = (db.prepare('SELECT COUNT(*) as count FROM graduates').get() as any).count;
  if (graduateCount === 0) {
    const grads = [
      { name: 'Барни', story: 'Нашел любящую семью с двумя детьми.', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400', lat: 43.259, lng: 76.924, district: 'almaty', adoption_date: '2025-11-15' },
      { name: 'Снежок', story: 'Живет в теплом доме в Бостандыкском районе.', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400', lat: 43.271, lng: 76.899, district: 'bostandyk', adoption_date: '2025-12-03' },
      { name: 'Рыжик', story: 'Обожает своего нового хозяина-пенсионера.', image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=400', lat: 43.264, lng: 76.952, district: 'medeu', adoption_date: '2025-10-20' },
      { name: 'Чарли', story: 'Теперь охраняет частный дом в Ауэзовском районе.', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=400', lat: 43.240, lng: 76.877, district: 'auezov', adoption_date: '2026-01-08' },
      { name: 'Персик', story: 'Живет в квартире с молодой семьей.', image: 'https://images.unsplash.com/photo-1513245533418-2975e90460a1?q=80&w=400', lat: 43.255, lng: 76.945, district: 'jetysu', adoption_date: '2026-02-14' },
      { name: 'Граф', story: 'Умный пес нашел хозяина на севере города.', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400', lat: 43.285, lng: 76.965, district: 'turksib', adoption_date: '2025-09-30' },
      { name: 'Люси', story: 'Теперь ходит на прогулки в парк Горького.', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400', lat: 43.268, lng: 76.912, district: 'almaty', adoption_date: '2026-01-22' },
      { name: 'Мотя', story: 'Кот нашел тихий уютный дом.', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400', lat: 43.278, lng: 76.888, district: 'bostandyk', adoption_date: '2026-03-01' },
      { name: 'Арес', story: 'Живет с активной семьей в горном районе.', image: 'https://images.unsplash.com/photo-1589965716319-4a041b58fa8a?q=80&w=400', lat: 43.252, lng: 76.960, district: 'medeu', adoption_date: '2025-12-20' },
      { name: 'Белла', story: 'Красавица мейн-кун нашла ценителей породы.', image: 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?q=80&w=400', lat: 43.248, lng: 76.882, district: 'auezov', adoption_date: '2026-02-05' },
    ];
    const insert = db.prepare('INSERT INTO graduates (name, story, image, lat, lng, district, adoption_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
    grads.forEach(g => insert.run(g.name, g.story, g.image, g.lat, g.lng, g.district, g.adoption_date));
    console.log('✅ Seed graduates created');
  }

  // Needs
  const needsCount = (db.prepare('SELECT COUNT(*) as count FROM needs').get() as any).count;
  if (needsCount === 0) {
    const needs = [
      { item: 'Сухой корм для щенков (Royal Canin)', category: 'food', quantity: '10 кг', urgency: 'high' },
      { item: 'Пеленки одноразовые 60×90', category: 'other', quantity: '5 пачек', urgency: 'medium' },
      { item: 'Антибиотик Синулокс 250мг', category: 'medical', quantity: '2 упаковки', urgency: 'high' },
      { item: 'Металлические миски (2л)', category: 'tools', quantity: '4 шт', urgency: 'low' },
      { item: 'Ошейники для средних собак', category: 'tools', quantity: '5 шт', urgency: 'medium' },
      { item: 'Влажный корм для кошек', category: 'food', quantity: '20 банок', urgency: 'medium' },
      { item: 'Антисептик хлоргексидин 0.05%', category: 'medical', quantity: '5 флаконов', urgency: 'low' },
    ];
    const ins = db.prepare('INSERT INTO needs (item, category, quantity, urgency) VALUES (?, ?, ?, ?)');
    needs.forEach(n => ins.run(n.item, n.category, n.quantity, n.urgency));
    console.log('✅ Seed needs created');
  }

  // Audit init log
  const logCount = (db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as any).count;
  if (logCount === 0) {
    logAction(1, 'SYSTEM_INIT', 'system', 0, 'Database initialized');
  }

  // Pets
  const petCount = (db.prepare('SELECT COUNT(*) as count FROM pets').get() as any).count;
  if (petCount === 0) {
    const pets = [
      { name: 'Барни', category: 'Собаки', breed: 'Золотистый ретривер', age: '2 года', ageGroup: '1-3 года', gender: 'male', color: 'Золотистый', size: 'Средний', description: 'Дружелюбный и энергичный пес, обожает играть с мячом и очень любит детей.', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Мурка', category: 'Кошки', breed: 'Британская короткошерстная', age: '1 год', ageGroup: '1-3 года', gender: 'female', color: 'Серый', size: 'Маленький', description: 'Спокойная и ласковая кошка, любит тепло и уют.', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Рекс', category: 'Собаки', breed: 'Немецкая овчарка', age: '4 года', ageGroup: '3-7 лет', gender: 'male', color: 'Черно-рыжий', size: 'Большой', description: 'Умный и преданный защитник. Знает базовые команды.', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Луна', category: 'Кошки', breed: 'Сиамская', age: '6 месяцев', ageGroup: 'До 1 года', gender: 'female', color: 'Колор-пойнт', size: 'Маленький', description: 'Любопытный котенок с голубыми глазами. Очень общительная.', image: 'https://images.unsplash.com/photo-1513245533418-2975e90460a1?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Арчи', category: 'Собаки', breed: 'Джек-рассел-терьер', age: '5 лет', ageGroup: '3-7 лет', gender: 'male', color: 'Бело-рыжий', size: 'Маленький', description: 'Маленький комок энергии. Обожает долгие прогулки.', image: 'https://images.unsplash.com/photo-1593134257782-e89567b7718a?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Белла', category: 'Кошки', breed: 'Мейн-кун', age: '3 года', ageGroup: '3-7 лет', gender: 'female', color: 'Рыжий табби', size: 'Большой', description: 'Величественная кошка с кисточками на ушах.', image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Тай', category: 'Собаки', breed: 'Хаски', age: '2 года', ageGroup: '1-3 года', gender: 'male', color: 'Серо-белый', size: 'Средний', description: 'Красавец с голубыми глазами. Требует много внимания.', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Джесси', category: 'Собаки', breed: 'Лабрадор', age: '3 месяца', ageGroup: 'До 1 года', gender: 'female', color: 'Черный', size: 'Средний', description: 'Ласковая активная девочка, любит прогулки.', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop', status: 'available' },
      { name: 'Самал', category: 'Собаки', breed: 'Без породы', age: '2 месяца', ageGroup: 'До 1 года', gender: 'male', color: 'Коричневый', size: 'Маленький', description: 'Милый песик, быстро привыкает к людям.', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop', status: 'available' },
    ];
    const insert = db.prepare('INSERT INTO pets (name,category,breed,age,ageGroup,gender,color,size,description,image,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    pets.forEach(p => insert.run(p.name, p.category, p.breed, p.age, p.ageGroup, p.gender, p.color, p.size, p.description, p.image, p.status));
    console.log('✅ Seed pets created');
  }

  // Fundraisers
  const fundraiserCount = (db.prepare('SELECT COUNT(*) as count FROM fundraisers').get() as any).count;
  if (fundraiserCount === 0) {
    const fundraisers = [
      { title: 'Помощь приюту "JanDós"', target_amount: 500000, current_amount: 150000, description: 'Сбор средств на закупку корма и медикаментов на зимний период.', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop', status: 'active' },
      { title: 'Операция для Борика', target_amount: 120000, current_amount: 45000, description: 'Борику требуется срочная операция на лапе после травмы.', image: 'https://images.unsplash.com/photo-1589965716319-4a041b58fa8a?q=80&w=800&auto=format&fit=crop', status: 'active' },
    ];
    const insert = db.prepare('INSERT INTO fundraisers (title,target_amount,current_amount,description,image,status) VALUES (?,?,?,?,?,?)');
    fundraisers.forEach(f => insert.run(f.title, f.target_amount, f.current_amount, f.description, f.image, f.status));
    console.log('✅ Seed fundraisers created');
  }

  // News
  const newsCount = (db.prepare('SELECT COUNT(*) as count FROM news').get() as any).count;
  if (newsCount === 0) {
    const news = [
      { title: 'День открытых дверей в JanDós', content: 'Приходите познакомиться с нашими подопечными в это воскресенье!', excerpt: 'Приходите познакомиться с нашими подопечными в это воскресенье!', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop', date: '15.03.2026', category: 'События', featured: 1 },
      { title: 'История спасения: как Барни нашел дом', content: 'Барни попал к нам в тяжелом состоянии, но теперь живет в любящей семье.', excerpt: 'Барни попал к нам в тяжелом состоянии, но теперь он счастлив.', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop', date: '10.03.2026', category: 'Счастливые истории', featured: 0 },
      { title: 'Нам нужна ваша помощь с кормом', content: 'Запасы корма для собак подходят к концу. Будем благодарны за любую помощь.', excerpt: 'Запасы корма для собак подходят к концу.', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop', date: '05.03.2026', category: 'Нужды приюта', featured: 0 },
    ];
    const insert = db.prepare('INSERT INTO news (title,content,excerpt,image,date,category,featured) VALUES (?,?,?,?,?,?,?)');
    news.forEach(n => insert.run(n.title, n.content, n.excerpt, n.image, n.date, n.category, n.featured));
    console.log('✅ Seed news created');
  }
}
