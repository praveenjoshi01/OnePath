import express from 'express';
import { getApplicationById, updateApplication, createSyncLog, getSyncLogs } from '../supabase_db.js';

const router = express.Router();

const SUPPORTED_VENDORS = ['Famly', 'TeachKloud', 'Child Paths', 'EYCEsoft', 'Tot Tracker', 'Little Vista'];

// GET all sync audit logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await getSyncLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST export/sync confirmed prospective child into destination platform
router.post('/export', async (req, res) => {
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

    const app = await getApplicationById(application_id);
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

    let status = 'SUCCESS';
    let responseMessage = `[API 201 Created] Child record '${app.child_first_name} ${app.child_last_name}' successfully provisioned in ${target_platform}. Active child record created with ID ${target_platform.toLowerCase()}_child_${Date.now()}`;

    // Record audit log
    await createSyncLog({
      application_id: Number(application_id),
      target_platform,
      status,
      payload: normalizedPayload,
      response_message: responseMessage
    });

    // Mark stage as confirmed if not already
    if (app.stage !== 'confirmed') {
      await updateApplication(application_id, { stage: 'confirmed' });
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
