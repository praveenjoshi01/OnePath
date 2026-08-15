import express from 'express';
import { getRooms, createRoom, getApplications } from '../db.js';

const router = express.Router();

// GET all rooms with capacity and current enrolled/pipeline counts
router.get('/', async (req, res) => {
  try {
    const rooms = await getRooms();
    const applications = await getApplications();

    const formatted = rooms.map(room => {
      const enrolled_count = applications.filter(a =>
        String(a.room_id) === String(room.id) &&
        ['offer_sent', 'deposit_pending', 'confirmed'].includes(a.stage)
      ).length;

      const pipeline_waitlist_count = applications.filter(a =>
        String(a.room_id) === String(room.id) &&
        ['interest_captured', 'classified', 'waiting_list'].includes(a.stage)
      ).length;

      const occupancyPct = room.capacity > 0 ? Math.min(100, Math.round((enrolled_count / room.capacity) * 100)) : 0;

      return {
        ...room,
        enrolled_count,
        pipeline_waitlist_count,
        occupancy_percentage: occupancyPct,
        available_places: Math.max(0, room.capacity - enrolled_count)
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new room
router.post('/', async (req, res) => {
  try {
    const { name, min_age_months, max_age_months, capacity, staff_ratio } = req.body;
    if (!name || min_age_months === undefined || max_age_months === undefined || !capacity || !staff_ratio) {
      return res.status(400).json({ success: false, error: 'Missing required room fields' });
    }

    const newRoom = await createRoom({ name, min_age_months, max_age_months, capacity, staff_ratio });
    res.status(201).json({ success: true, data: newRoom });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
