import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  autoSuggestRoom,
  getRooms
} from '../db.js';

const router = express.Router();

// GET all enquiries / prospective children with filtering
router.get('/', async (req, res) => {
  try {
    const { stage, room_id, search, source } = req.query;
    const applications = await getApplications({ stage, room_id, search, source });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET summary metrics / pipeline breakdown
router.get('/pipeline-summary', async (req, res) => {
  try {
    const applications = await getApplications();
    const rooms = await getRooms();

    const totalApplications = applications.length;
    const confirmedCount = applications.filter(a => a.stage === 'confirmed').length;

    // Stage breakdown
    const stageCountsMap = applications.reduce((acc, app) => {
      acc[app.stage] = (acc[app.stage] || 0) + 1;
      return acc;
    }, {});

    const stageCounts = Object.keys(stageCountsMap).map(stage => ({
      stage,
      count: stageCountsMap[stage]
    }));

    // Room breakdown
    const roomOccupancy = rooms.map(room => {
      const enrolled_count = applications.filter(a =>
        String(a.room_id) === String(room.id) &&
        ['offer_sent', 'deposit_pending', 'confirmed'].includes(a.stage)
      ).length;

      return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        enrolled_count
      };
    });

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
router.get('/:id', async (req, res) => {
  try {
    const app = await getApplicationById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST calculate auto-room suggestion
router.post('/suggest-room', async (req, res) => {
  try {
    const { date_of_birth, requested_start_date } = req.body;
    if (!date_of_birth || !requested_start_date) {
      return res.status(400).json({ success: false, error: 'date_of_birth and requested_start_date are required' });
    }
    const suggestion = await autoSuggestRoom(date_of_birth, requested_start_date);
    res.json({ success: true, data: suggestion });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new prospective child enquiry
router.post('/', async (req, res) => {
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
      sibling_priority = false,
      medical_notes = '',
      notes = ''
    } = req.body;

    if (!child_first_name || !child_last_name || !date_of_birth || !requested_start_date || !parent_name || !parent_email) {
      return res.status(400).json({ success: false, error: 'Missing required child or parent details' });
    }

    let assignedRoomId = room_id;
    if (!assignedRoomId) {
      const suggestion = await autoSuggestRoom(date_of_birth, requested_start_date);
      if (suggestion && suggestion.suggestedRoom) {
        assignedRoomId = suggestion.suggestedRoom.id;
      }
    }

    const payload = {
      child_first_name,
      child_last_name,
      date_of_birth,
      requested_start_date,
      parent_name,
      parent_email,
      parent_phone: parent_phone || '',
      enquiry_source,
      stage,
      room_id: assignedRoomId || null,
      days_requested,
      sibling_priority: Boolean(sibling_priority),
      medical_notes,
      notes
    };

    const newApp = await createApplication(payload);
    res.status(201).json({ success: true, data: newApp });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update application
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateApplication(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE application
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteApplication(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
