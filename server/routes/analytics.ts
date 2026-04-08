import { Router } from 'express';
import { db } from '../db.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/analytics ────────────────────────────────────────────────────────

router.get('/', authenticateToken, checkRole(['admin', 'manager']), (req, res) => {
  const summary = {
    totalDonations: (db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM donations').get() as any).total,
    activePets: (db.prepare("SELECT COUNT(*) as count FROM pets WHERE status = 'available'").get() as any).count,
    pendingAdoptions: (db.prepare("SELECT COUNT(*) as count FROM adoption_requests WHERE status = 'pending'").get() as any).count,
    totalUsers: (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count,
    totalAdopted: (db.prepare("SELECT COUNT(*) as count FROM pets WHERE status = 'adopted'").get() as any).count,
    totalFundraisers: (db.prepare("SELECT COUNT(*) as count FROM fundraisers WHERE status = 'active'").get() as any).count,
    totalVolunteers: (db.prepare("SELECT COUNT(*) as count FROM volunteer_applications WHERE status = 'approved'").get() as any).count,
    pendingVolunteers: (db.prepare("SELECT COUNT(*) as count FROM volunteer_applications WHERE status = 'pending'").get() as any).count,
  };

  const petStats = db.prepare('SELECT status, COUNT(*) as count FROM pets GROUP BY status').all();
  const adoptionStats = db.prepare('SELECT status, COUNT(*) as count FROM adoption_requests GROUP BY status').all();
  const categoryStats = db.prepare('SELECT category, COUNT(*) as count FROM pets GROUP BY category').all();

  // Recent activity (last 7 audit log entries)
  const recentActivity = db.prepare(`
    SELECT al.*, u.name as user_name
    FROM audit_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 20
  `).all();

  // Donations per fundraiser
  const fundraiserProgress = db.prepare(`
    SELECT id, title, target_amount, current_amount, status,
      ROUND(CAST(current_amount AS REAL) / CAST(target_amount AS REAL) * 100, 1) as progress_percent
    FROM fundraisers
    ORDER BY current_amount DESC
  `).all();

  // Adoptions trend: last 7 days
  const adoptionsTrend = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM adoption_requests
    WHERE created_at >= date('now', '-6 days')
    GROUP BY date(created_at)
    ORDER BY date
  `).all();

  // New users trend: last 7 days
  const usersTrend = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at >= date('now', '-6 days')
    GROUP BY date(created_at)
    ORDER BY date
  `).all();

  // Donations trend: last 7 days (from donations table)
  const donationsTrend = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM donations
    WHERE created_at >= date('now', '-6 days')
    GROUP BY date(created_at)
    ORDER BY date
  `).all();

  // Fill missing days with 0
  function fillDays(data: any[], days = 7) {
    const map = new Map((data as any[]).map((r: any) => [r.date, r.count]));
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: map.get(key) ?? 0 };
    });
  }

  res.json({
    summary,
    petStats,
    adoptionStats,
    categoryStats,
    recentActivity,
    fundraiserProgress,
    trends: {
      adoptions: fillDays(adoptionsTrend),
      users: fillDays(usersTrend),
      donations: fillDays(donationsTrend),
    },
  });
});

export default router;
