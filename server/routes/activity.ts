import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// ─── GET /api/activity (public) ──────────────────────────────────────────────

router.get('/', (req, res) => {
  const adoptions = db.prepare(`
    SELECT ar.id, 'adoption' as type, u.name as user_name, p.name as pet_name, p.image as pet_image, ar.created_at
    FROM adoption_requests ar
    JOIN users u ON ar.user_id = u.id
    JOIN pets p ON ar.pet_id = p.id
    ORDER BY ar.created_at DESC
    LIMIT 5
  `).all();

  const volunteers = db.prepare(`
    SELECT va.id, 'volunteer' as type, u.name as user_name, NULL as pet_name, NULL as pet_image, va.created_at
    FROM volunteer_applications va
    JOIN users u ON va.user_id = u.id
    ORDER BY va.created_at DESC
    LIMIT 5
  `).all();

  const all = ([...adoptions, ...volunteers] as any[])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map((item: any) => ({
      ...item,
      // Expose only first name for privacy
      user_name: (item.user_name as string).split(' ')[0],
    }));

  res.json(all);
});

export default router;
