import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all tasks (optionally filter by status or application_id)
router.get('/', (req, res) => {
  try {
    const { status, application_id } = req.query;
    let query = `
      SELECT t.*, a.child_first_name, a.child_last_name, a.parent_name, a.parent_email
      FROM tasks t
      JOIN applications a ON t.application_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (application_id) {
      query += ` AND t.application_id = ?`;
      params.push(application_id);
    }

    query += ` ORDER BY t.due_date ASC`;

    const tasks = db.prepare(query).all(...params);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create task
router.post('/', (req, res) => {
  try {
    const { application_id, task_type, title, due_date } = req.body;
    if (!application_id || !task_type || !title || !due_date) {
      return res.status(400).json({ success: false, error: 'Missing required task fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (application_id, task_type, title, due_date, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(application_id, task_type, title, due_date);
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle task status
router.patch('/:id/toggle', (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(newStatus, req.params.id);

    res.json({ success: true, data: { ...task, status: newStatus } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE task
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
