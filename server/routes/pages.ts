import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = Router();

// Get all pages (public)
router.get('/', (req, res) => {
  try {
    const pages = db.prepare('SELECT id, slug, title, meta_description, updated_at FROM pages ORDER BY id').all();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении страниц' });
  }
});

// Get single page by slug (public)
router.get('/:slug', (req, res) => {
  try {
    const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении страницы' });
  }
});

// Create new page (admin/manager only)
router.post('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  try {
    const { slug, title, content, meta_description } = req.body;
    
    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug и title обязательны' });
    }

    const result = db.prepare(`
      INSERT INTO pages (slug, title, content, meta_description) 
      VALUES (?, ?, ?, ?)
    `).run(slug, title, content || '', meta_description || '');

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      slug, 
      title, 
      content, 
      meta_description 
    });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Страница с таким slug уже существует' });
    }
    res.status(500).json({ error: 'Ошибка при создании страницы' });
  }
});

// Update page (admin/manager only)
router.patch('/:id', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  try {
    const { title, content, meta_description } = req.body;
    const id = req.params.id;

    const page = db.prepare('SELECT id FROM pages WHERE id = ?').get(id);
    if (!page) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }

    db.prepare(`
      UPDATE pages 
      SET title = COALESCE(?, title), 
          content = COALESCE(?, content), 
          meta_description = COALESCE(?, meta_description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, meta_description, id);

    res.json({ message: 'Страница обновлена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении страницы' });
  }
});

// Delete page (admin only)
router.delete('/:id', authenticateToken, checkRole(['admin']), (req, res) => {
  try {
    const id = req.params.id;
    
    const page = db.prepare('SELECT slug FROM pages WHERE id = ?').get(id) as { slug: string } | undefined;
    if (!page) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }

    // Prevent deletion of system pages
    const systemPages = ['about', 'help', 'contacts'];
    if (systemPages.includes(page.slug)) {
      return res.status(400).json({ error: 'Нельзя удалить системную страницу' });
    }

    db.prepare('DELETE FROM pages WHERE id = ?').run(id);
    res.json({ message: 'Страница удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении страницы' });
  }
});

// Get footer settings (public)
router.get('/settings/footer', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM footer_settings WHERE id = 1').get();
    if (!settings) {
      return res.json({
        address: '',
        phone: '',
        email: '',
        social_links: '[]',
        copyright: '© JanDós'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении настроек футера' });
  }
});

// Update footer settings (admin/manager only)
router.patch('/settings/footer', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  try {
    const { address, phone, email, social_links, copyright } = req.body;

    db.prepare(`
      INSERT INTO footer_settings (id, address, phone, email, social_links, copyright, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        social_links = COALESCE(?, social_links),
        copyright = COALESCE(?, copyright),
        updated_at = CURRENT_TIMESTAMP
    `).run(
      address, phone, email, social_links, copyright,
      address, phone, email, social_links, copyright
    );

    res.json({ message: 'Настройки футера обновлены' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении настроек футера' });
  }
});

export default router;
