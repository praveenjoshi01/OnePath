import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all rooms with capacity and current enrolled/pipeline counts
router.get('/', (req, res) => {
  try {
    const rooms = db.prepare(`
      SELECT 
        r.*,
        (
          SELECT COUNT(*) FROM applications a 
          WHERE a.room_id = r.id AND a.stage IN ('offer_sent', 'deposit_pending', 'confirmed')
        ) as enrolled_count,
        (
          SELECT COUNT(*) FROM applications a 
          WHERE a.room_id = r.id AND a.stage IN ('interest_captured', 'classified', 'waiting_list')
        ) as pipeline_waitlist_count
      FROM rooms r
      ORDER BY r.min_age_months ASC
    `).all();

    const formatted = rooms.map(r => ({
      ...r,
      occupancy_percentage: r.capacity > 0 ? Math.min(100, Math.round((r.enrolled_count / r.capacity) * 100)) : 0,
      available_places: Math.max(0, r.capacity - r.enrolled_count)
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new room
router.post('/', (req, res) => {
  try {
    const { name, min_age_months, max_age_months, capacity, staff_ratio } = req.body;
    if (!name || min_age_months === undefined || max_age_months === undefined || !capacity || !staff_ratio) {
      return res.status(400).json({ success: false, error: 'Missing required room fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO rooms (name, min_age_months, max_age_months, capacity, staff_ratio)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, min_age_months, max_age_months, capacity, staff_ratio);
    const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newRoom });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update room details
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, staff_ratio, min_age_months, max_age_months } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (capacity !== undefined) { updates.push('capacity = ?'); params.push(capacity); }
    if (staff_ratio !== undefined) { updates.push('staff_ratio = ?'); params.push(staff_ratio); }
    if (min_age_months !== undefined) { updates.push('min_age_months = ?'); params.push(min_age_months); }
    if (max_age_months !== undefined) { updates.push('max_age_months = ?'); params.push(max_age_months); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No update fields provided' });
    }

    params.push(id);
    db.prepare(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
