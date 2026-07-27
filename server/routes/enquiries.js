import express from 'express';
import db from '../db.js';

const router = express.Router();

// Helper to calculate room based on age in months at requested start date
function autoSuggestRoom(dob, requestedStartDate) {
  const birth = new Date(dob);
  const start = new Date(requestedStartDate);
  
  if (isNaN(birth.getTime()) || isNaN(start.getTime())) return null;

  let ageMonths = (start.getFullYear() - birth.getFullYear()) * 12 + (start.getMonth() - birth.getMonth());
  if (start.getDate() < birth.getDate()) ageMonths--;
  if (ageMonths < 0) ageMonths = 0;

  const room = db.prepare(`
    SELECT * FROM rooms 
    WHERE ? >= min_age_months AND ? < max_age_months 
    ORDER BY min_age_months DESC LIMIT 1
  `).get(ageMonths, ageMonths);

  return { ageMonths, suggestedRoom: room || null };
}

// GET all enquiries / prospective children with filtering
router.get('/', (req, res) => {
  try {
    const { stage, room_id, search, source } = req.query;
    let query = `
      SELECT a.*, r.name as room_name, r.staff_ratio, r.capacity as room_capacity
      FROM applications a
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (stage) {
      query += ` AND a.stage = ?`;
      params.push(stage);
    }
    if (room_id) {
      query += ` AND a.room_id = ?`;
      params.push(room_id);
    }
    if (source) {
      query += ` AND a.enquiry_source = ?`;
      params.push(source);
    }
    if (search) {
      query += ` AND (a.child_first_name LIKE ? OR a.child_last_name LIKE ? OR a.parent_name LIKE ? OR a.parent_email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY a.created_at DESC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET summary metrics / pipeline breakdown
router.get('/pipeline-summary', (req, res) => {
  try {
    const stageCounts = db.prepare(`
      SELECT stage, COUNT(*) as count 
      FROM applications 
      GROUP BY stage
    `).all();

    const roomOccupancy = db.prepare(`
      SELECT r.id, r.name, r.capacity, COUNT(a.id) as enrolled_count
      FROM rooms r
      LEFT JOIN applications a ON a.room_id = r.id AND a.stage IN ('offer_sent', 'deposit_pending', 'confirmed')
      GROUP BY r.id
    `).all();

    const totalApplications = db.prepare('SELECT COUNT(*) as total FROM applications').get().total;
    const confirmedCount = db.prepare("SELECT COUNT(*) as count FROM applications WHERE stage = 'confirmed'").get().count;

    res.json({
      success: true,
      totalApplications,
      confirmedCount,
      conversionRate: totalApplications > 0 ? ((confirmedCount / totalApplications) * 100).toFixed(1) + '%' : '0%',
      stageCounts,
      roomOccupancy
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single application by ID
router.get('/:id', (req, res) => {
  try {
    const app = db.prepare(`
      SELECT a.*, r.name as room_name, r.staff_ratio
      FROM applications a
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const tasks = db.prepare('SELECT * FROM tasks WHERE application_id = ? ORDER BY due_date ASC').all(req.params.id);
    const syncLogs = db.prepare('SELECT * FROM sync_logs WHERE application_id = ? ORDER BY synced_at DESC').all(req.params.id);

    res.json({ success: true, data: { ...app, tasks, syncLogs } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST calculate auto-room suggestion
router.post('/suggest-room', (req, res) => {
  try {
    const { date_of_birth, requested_start_date } = req.body;
    if (!date_of_birth || !requested_start_date) {
      return res.status(400).json({ success: false, error: 'date_of_birth and requested_start_date are required' });
    }
    const suggestion = autoSuggestRoom(date_of_birth, requested_start_date);
    res.json({ success: true, data: suggestion });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new prospective child enquiry
router.post('/', (req, res) => {
  try {
    const {
      child_first_name,
      child_last_name,
      date_of_birth,
      requested_start_date,
      parent_name,
      parent_email,
      parent_phone,
      enquiry_source = 'Website',
      stage = 'interest_captured',
      room_id,
      days_requested = 'Full-time (5 Days)',
      sibling_priority = 0,
      medical_notes = '',
      notes = ''
    } = req.body;

    if (!child_first_name || !child_last_name || !date_of_birth || !requested_start_date || !parent_name || !parent_email) {
      return res.status(400).json({ success: false, error: 'Missing required child or parent details' });
    }

    let assignedRoomId = room_id;
    if (!assignedRoomId) {
      const suggestion = autoSuggestRoom(date_of_birth, requested_start_date);
      if (suggestion && suggestion.suggestedRoom) {
        assignedRoomId = suggestion.suggestedRoom.id;
      }
    }

    const stmt = db.prepare(`
      INSERT INTO applications (
        child_first_name, child_last_name, date_of_birth, requested_start_date,
        parent_name, parent_email, parent_phone, enquiry_source, stage, room_id,
        days_requested, sibling_priority, medical_notes, notes, created_at, updated_at, last_contact_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      child_first_name, child_last_name, date_of_birth, requested_start_date,
      parent_name, parent_email, parent_phone || '', enquiry_source, stage, assignedRoomId || null,
      days_requested, sibling_priority ? 1 : 0, medical_notes, notes
    );

    const newApp = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newApp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update application
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const fields = [
      'child_first_name', 'child_last_name', 'date_of_birth', 'requested_start_date',
      'parent_name', 'parent_email', 'parent_phone', 'enquiry_source', 'stage',
      'room_id', 'days_requested', 'sibling_priority', 'deposit_paid', 'deposit_amount',
      'medical_notes', 'notes'
    ];

    const updates = [];
    const params = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.json({ success: true, data: existing, message: 'No changes provided' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    updates.push('last_contact_date = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE applications SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...params);

    const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE application
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
