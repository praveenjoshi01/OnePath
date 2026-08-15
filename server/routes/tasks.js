import express from 'express';
import { getTasks, createTask, toggleTask } from '../db.js';

const router = express.Router();

// GET all tasks (optionally filter by status or application_id)
router.get('/', async (req, res) => {
  try {
    const { status, application_id } = req.query;
    const tasks = await getTasks(status, application_id);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create task
router.post('/', async (req, res) => {
  try {
    const { application_id, task_type, title, due_date } = req.body;
    if (!application_id || !task_type || !title || !due_date) {
      return res.status(400).json({ success: false, error: 'Missing required task fields' });
    }

    const newTask = await createTask({ application_id, task_type, title, due_date, status: 'pending' });
    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle task status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const toggled = await toggleTask(req.params.id);
    if (!toggled) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, data: toggled });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
