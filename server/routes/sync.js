import express from 'express';
import db from '../db.js';

const router = express.Router();

// Supported destination platforms benchmarked in OnePath vendor research
const SUPPORTED_VENDORS = ['Famly', 'TeachKloud', 'Child Paths', 'EYCEsoft', 'Tot Tracker', 'Little Vista'];

// GET all sync audit logs
router.get('/logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT s.*, a.child_first_name, a.child_last_name, a.parent_name
      FROM sync_logs s
      JOIN applications a ON s.application_id = a.id
      ORDER BY s.synced_at DESC
    `).all();

    const parsedLogs = logs.map(log => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : null
    }));

    res.json({ success: true, count: parsedLogs.length, data: parsedLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST export/sync confirmed prospective child into destination platform
router.post('/export', (req, res) => {
  try {
    const { application_id, target_platform = 'Famly' } = req.body;

    if (!application_id) {
      return res.status(400).json({ success: false, error: 'application_id is required' });
    }

    if (!SUPPORTED_VENDORS.includes(target_platform)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported target platform. Must be one of: ${SUPPORTED_VENDORS.join(', ')}`
      });
    }

    const app = db.prepare(`
      SELECT a.*, r.name as room_name, r.staff_ratio
      FROM applications a
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.id = ?
    `).get(application_id);

    if (!app) {
      return res.status(404).json({ success: false, error: 'Application record not found' });
    }

    // Standardized OnePath Unified Child Data Payload
    const normalizedPayload = {
      onepath_reference_id: `OP-ENROL-${app.id}`,
      export_timestamp: new Date().toISOString(),
      destination_platform: target_platform,
      child_details: {
        first_name: app.child_first_name,
        last_name: app.child_last_name,
        date_of_birth: app.date_of_birth,
        requested_start_date: app.requested_start_date,
        assigned_room: app.room_name || 'Unassigned',
        days_requested: app.days_requested,
        medical_notes: app.medical_notes || 'None'
      },
      guardian_details: {
        full_name: app.parent_name,
        email: app.parent_email,
        phone: app.parent_phone
      },
      financial_status: {
        deposit_paid: Boolean(app.deposit_paid),
        deposit_amount_eur: app.deposit_amount
      },
      onepath_audit: {
        enquiry_source: app.enquiry_source,
        enrolled_at: app.created_at,
        sibling_priority: Boolean(app.sibling_priority)
      }
    };

    // Simulate API handoff validation
    let status = 'SUCCESS';
    let responseMessage = `[API 201 Created] Child record '${app.child_first_name} ${app.child_last_name}' successfully provisioned in ${target_platform}. Active child record created with ID ${target_platform.toLowerCase()}_child_${Date.now()}`;

    // Record audit log
    const stmt = db.prepare(`
      INSERT INTO sync_logs (application_id, target_platform, status, payload, response_message, synced_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(application_id, target_platform, status, JSON.stringify(normalizedPayload), responseMessage);

    // Optionally mark application stage as confirmed if not already
    if (app.stage !== 'confirmed') {
      db.prepare("UPDATE applications SET stage = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(application_id);
    }

    res.json({
      success: true,
      message: responseMessage,
      target_platform,
      synced_record: normalizedPayload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
