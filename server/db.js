import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const dbPath = isVercel
  ? path.join('/tmp', 'enrollment_manager.db')
  : path.join(__dirname, 'enrollment_manager.db');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      min_age_months INTEGER NOT NULL,
      max_age_months INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      staff_ratio TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_first_name TEXT NOT NULL,
      child_last_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      requested_start_date DATE NOT NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      enquiry_source TEXT DEFAULT 'Website',
      stage TEXT DEFAULT 'interest_captured',
      room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
      days_requested TEXT DEFAULT 'Full-time (5 Days)',
      sibling_priority INTEGER DEFAULT 0,
      deposit_paid INTEGER DEFAULT 0,
      deposit_amount REAL DEFAULT 0.00,
      medical_notes TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_contact_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      task_type TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      target_platform TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT,
      response_message TEXT,
      synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if seed needed for rooms
  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  if (roomCount === 0) {
    seedData();
  }

  // Check if seed needed for users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedUsers();
  }
}

function seedUsers() {
  console.log('Seeding initial users...');
  const insertUser = db.prepare(`
    INSERT INTO users (email, password, role, name)
    VALUES (?, ?, ?, ?)
  `);
  insertUser.run('admin@onepath.ie', 'admin123', 'admin', 'Crèche Admin');
  insertUser.run('manager@onepath.ie', 'manager123', 'manager', 'Crèche Manager');
  console.log('Users seeded successfully.');
}

function seedData() {
  console.log('Seeding initial database...');

  const insertRoom = db.prepare(`
    INSERT INTO rooms (name, min_age_months, max_age_months, capacity, staff_ratio)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertRoom.run('Baby Room (Buttercups)', 0, 12, 9, '1:3');
  insertRoom.run('Wobblers & Toddlers (Daisies)', 12, 24, 12, '1:5');
  insertRoom.run('Playgroup & Junior Preschool (Sunflowers)', 24, 36, 18, '1:6');
  insertRoom.run('ECCE Preschool Room A (Oak)', 36, 60, 22, '1:11');

  const insertApp = db.prepare(`
    INSERT INTO applications (
      child_first_name, child_last_name, date_of_birth, requested_start_date,
      parent_name, parent_email, parent_phone, enquiry_source, stage, room_id,
      days_requested, sibling_priority, deposit_paid, deposit_amount, medical_notes, notes, created_at, last_contact_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const apps = [
    [
      'Liam', 'O’Connor', '2025-10-15', '2026-09-01',
      'Siobhan O’Connor', 'siobhan.oc@example.ie', '+353 87 123 4567',
      'Website', 'interest_captured', 1,
      'Full-time (5 Days)', 1, 0, 0.00, 'No known allergies',
      'Enquired via online form. Older brother Connor already in ECCE room.',
      '2026-07-20 09:30:00', '2026-07-20 09:30:00'
    ],
    [
      'Aoife', 'Murphy', '2025-04-10', '2026-08-15',
      'Ciarán Murphy', 'ciaran.m@example.ie', '+353 86 987 6543',
      'Email', 'classified', 2,
      '3 Days (Mon, Wed, Fri)', 0, 0, 0.00, 'Mild eczema - cream required',
      'Age classified as Wobbler for August start. Room capacity available.',
      '2026-07-18 14:15:00', '2026-07-22 10:00:00'
    ],
    [
      'Cillian', 'Walsh', '2024-11-20', '2026-09-01',
      'Fiona Walsh', 'fiona.walsh@example.ie', '+353 85 456 7890',
      'Phone', 'waiting_list', 2,
      'Full-time (5 Days)', 0, 0, 0.00, 'Lactose sensitive',
      'Added to waiting list for September intake. Priority rank #2.',
      '2026-07-10 11:00:00', '2026-07-15 16:20:00'
    ],
    [
      'Saoirse', 'Byrne', '2023-08-05', '2026-09-01',
      'Patrick Byrne', 'paddy.b@example.ie', '+353 87 654 3210',
      'Referral', 'offer_sent', 3,
      'Full-time (5 Days)', 1, 0, 0.00, 'None',
      'Official offer email sent on 24th July. Awaiting deposit and signed terms.',
      '2026-07-05 16:45:00', '2026-07-24 11:30:00'
    ],
    [
      'Fionn', 'McCarthy', '2023-01-12', '2026-09-01',
      'Niamh McCarthy', 'niamh.mc@example.ie', '+353 86 333 4444',
      'Website', 'deposit_pending', 4,
      'ECCE Full-time (5 Days)', 0, 1, 150.00, 'Asthma - inhaler provided',
      'Deposit received (€150). Pending birth certificate copy for ECCE scheme verification.',
      '2026-06-28 10:00:00', '2026-07-25 09:15:00'
    ],
    [
      'Maeve', 'Doyle', '2022-09-18', '2026-09-01',
      'Sean Doyle', 'sean.doyle@example.ie', '+353 89 222 1111',
      'Walk-in', 'confirmed', 4,
      'ECCE Morning Session', 1, 1, 150.00, 'Peanut allergy',
      'All documentation complete and verified. Ready for sync into active childcare system.',
      '2026-06-15 13:20:00', '2026-07-25 15:00:00'
    ]
  ];

  for (const app of apps) {
    const info = insertApp.run(...app);
    const appId = info.lastInsertRowid;
    // Log initial activity
    db.prepare('INSERT INTO activity_logs (application_id, action, notes) VALUES (?, ?, ?)')
      .run(appId, 'Application Captured', `Initial record added via ${app[7]}.`);
    db.prepare('INSERT INTO activity_logs (application_id, action, notes) VALUES (?, ?, ?)')
      .run(appId, 'Room Classified', `Auto-assigned to room based on age.`);
  }

  const insertTask = db.prepare(`
    INSERT INTO tasks (application_id, task_type, title, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertTask.run(1, 'follow_up', 'Send welcome pack to Siobhan O’Connor', '2026-07-28', 'pending');
  insertTask.run(4, 'deposit_reminder', 'Follow up on €150 deposit for Saoirse Byrne', '2026-07-29', 'pending');
  insertTask.run(5, 'missing_documents', 'Collect copy of birth certificate for ECCE entry', '2026-07-30', 'pending');

  const insertSync = db.prepare(`
    INSERT INTO sync_logs (application_id, target_platform, status, payload, response_message, synced_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertSync.run(
    6, 'Famly', 'SUCCESS',
    JSON.stringify({ child: 'Maeve Doyle', dob: '2022-09-18', parent: 'Sean Doyle', room: 'ECCE Preschool Room A (Oak)' }),
    'Child record successfully created in Famly via API v2', '2026-07-25 15:05:00'
  );

  console.log('Database seeded successfully.');
}

// User Authentication
export function authenticateUser(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (user && user.password === password) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  return null;
}

// Crèche Rooms
export function getRooms() {
  return db.prepare('SELECT * FROM rooms ORDER BY min_age_months ASC').all();
}

export function createRoom(payload) {
  const { name, min_age_months, max_age_months, capacity, staff_ratio } = payload;
  const info = db.prepare(`
    INSERT INTO rooms (name, min_age_months, max_age_months, capacity, staff_ratio)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, min_age_months, max_age_months, capacity, staff_ratio);
  
  return { id: info.lastInsertRowid, ...payload };
}

// Age & Room suggestion helper
export function autoSuggestRoom(dob, requestedStartDate) {
  const birth = new Date(dob);
  const start = new Date(requestedStartDate);
  if (isNaN(birth.getTime()) || isNaN(start.getTime())) return null;

  let ageMonths = (start.getFullYear() - birth.getFullYear()) * 12 + (start.getMonth() - birth.getMonth());
  if (start.getDate() < birth.getDate()) ageMonths--;
  if (ageMonths < 0) ageMonths = 0;

  const rooms = getRooms();
  const suggested = rooms.find(r => ageMonths >= r.min_age_months && ageMonths < r.max_age_months) || rooms[rooms.length - 1];

  return { ageMonths, suggestedRoom: suggested || null };
}

// Applications / Enquiries
export function getApplications(filters = {}) {
  const { stage, room_id, search, source } = filters;
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
    query += ` AND (
      (a.child_first_name || ' ' || a.child_last_name) LIKE ? OR
      a.parent_name LIKE ? OR
      a.parent_email LIKE ?
    )`;
    const likeVal = `%${search}%`;
    params.push(likeVal, likeVal, likeVal);
  }

  query += ` ORDER BY a.created_at DESC`;

  const rows = db.prepare(query).all(...params);

  // Convert integers back to booleans
  return rows.map(row => ({
    ...row,
    sibling_priority: !!row.sibling_priority,
    deposit_paid: !!row.deposit_paid
  }));
}

export function getApplicationById(id) {
  const app = db.prepare(`
    SELECT a.*, r.name as room_name, r.staff_ratio, r.capacity as room_capacity
    FROM applications a
    LEFT JOIN rooms r ON a.room_id = r.id
    WHERE a.id = ?
  `).get(id);

  if (!app) return null;

  app.sibling_priority = !!app.sibling_priority;
  app.deposit_paid = !!app.deposit_paid;

  const tasks = db.prepare('SELECT * FROM tasks WHERE application_id = ?').all(id);
  const syncLogs = db.prepare('SELECT * FROM sync_logs WHERE application_id = ? ORDER BY synced_at DESC').all(id);
  const activityLogs = db.prepare('SELECT * FROM activity_logs WHERE application_id = ? ORDER BY created_at DESC').all(id);

  return {
    ...app,
    tasks,
    syncLogs,
    activityLogs
  };
}

export function createApplication(payload) {
  const {
    child_first_name,
    child_last_name,
    date_of_birth,
    requested_start_date,
    parent_name,
    parent_email,
    parent_phone,
    enquiry_source,
    stage,
    room_id,
    days_requested,
    sibling_priority,
    medical_notes,
    notes
  } = payload;

  const siblingVal = sibling_priority ? 1 : 0;

  const info = db.prepare(`
    INSERT INTO applications (
      child_first_name, child_last_name, date_of_birth, requested_start_date,
      parent_name, parent_email, parent_phone, enquiry_source, stage, room_id,
      days_requested, sibling_priority, deposit_paid, deposit_amount, medical_notes, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0.00, ?, ?)
  `).run(
    child_first_name, child_last_name, date_of_birth, requested_start_date,
    parent_name, parent_email, parent_phone || '', enquiry_source || 'Website', stage || 'interest_captured',
    room_id || null, days_requested || 'Full-time (5 Days)', siblingVal, medical_notes || '', notes || ''
  );

  const appId = info.lastInsertRowid;

  // Log activity
  createActivityLog(appId, 'Application Captured', `Application submitted via ${enquiry_source || 'Website'}.`);
  if (room_id) {
    const room = db.prepare('SELECT name FROM rooms WHERE id = ?').get(room_id);
    if (room) {
      createActivityLog(appId, 'Room Classified', `Assigned to ${room.name}.`);
    }
  }

  return getApplicationById(appId);
}

export function updateApplication(id, updates) {
  const allowed = [
    'child_first_name', 'child_last_name', 'date_of_birth', 'requested_start_date',
    'parent_name', 'parent_email', 'parent_phone', 'enquiry_source', 'stage',
    'room_id', 'days_requested', 'sibling_priority', 'deposit_paid', 'deposit_amount',
    'medical_notes', 'notes'
  ];

  const sets = [];
  const params = [];

  // Track if stage is changing to log activity
  const currentApp = db.prepare('SELECT stage, deposit_paid FROM applications WHERE id = ?').get(id);

  for (const k of Object.keys(updates)) {
    if (allowed.includes(k)) {
      sets.push(`${k} = ?`);
      let val = updates[k];
      if (k === 'sibling_priority' || k === 'deposit_paid') {
        val = val ? 1 : 0;
      }
      params.push(val);
    }
  }

  if (sets.length === 0) return getApplicationById(id);

  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  db.prepare(`
    UPDATE applications
    SET ${sets.join(', ')}
    WHERE id = ?
  `).run(...params);

  // Check if stage changed
  if (updates.stage && currentApp && currentApp.stage !== updates.stage) {
    const labels = {
      interest_captured: 'Interest Captured',
      classified: 'Room Classified',
      waiting_list: 'Added to Waiting List',
      offer_sent: 'Place Offered',
      deposit_pending: 'Acceptance Received / Deposit Requested',
      confirmed: 'Deposit Verified / Enrolment Confirmed'
    };
    createActivityLog(id, 'Stage Advanced', `Stage updated to: ${labels[updates.stage] || updates.stage}.`);

    // Auto-create follow up task for deposit verification (Workflow 4)
    if (updates.stage === 'offer_sent') {
      const fullApp = db.prepare('SELECT child_first_name, child_last_name FROM applications WHERE id = ?').get(id);
      createTask({
        application_id: id,
        task_type: 'deposit_reminder',
        title: `Collect €150 deposit for ${fullApp.child_first_name} ${fullApp.child_last_name}`,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending'
      });
    }
  }

  // Check if deposit paid status changed
  if (updates.deposit_paid !== undefined && currentApp && !!currentApp.deposit_paid !== !!updates.deposit_paid) {
    if (updates.deposit_paid) {
      createActivityLog(id, 'Deposit Received', `Deposit of €${updates.deposit_amount || '150.00'} verified.`);
    }
  }

  return getApplicationById(id);
}

export function deleteApplication(id) {
  const info = db.prepare('DELETE FROM applications WHERE id = ?').run(id);
  return info.changes > 0;
}

// Tasks
export function getTasks(status = null, application_id = null) {
  let query = `
    SELECT t.*, a.child_first_name, a.child_last_name, a.parent_name
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
  return db.prepare(query).all(...params);
}

export function createTask(payload) {
  const { application_id, task_type, title, due_date, status } = payload;
  const info = db.prepare(`
    INSERT INTO tasks (application_id, task_type, title, due_date, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(application_id, task_type, title, due_date, status || 'pending');

  const taskId = info.lastInsertRowid;
  const app = db.prepare('SELECT child_first_name, child_last_name, parent_name FROM applications WHERE id = ?').get(application_id);

  // Log activity
  createActivityLog(application_id, 'Task Created', `New follow-up task added: "${title}" (Due: ${due_date}).`);

  return {
    id: taskId,
    application_id,
    task_type,
    title,
    due_date,
    status: status || 'pending',
    child_first_name: app?.child_first_name || '',
    child_last_name: app?.child_last_name || '',
    parent_name: app?.parent_name || ''
  };
}

export function toggleTask(id) {
  const task = db.prepare('SELECT status, application_id, title FROM tasks WHERE id = ?').get(id);
  if (!task) return null;

  const newStatus = task.status === 'pending' ? 'completed' : 'pending';
  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(newStatus, id);

  // Log activity
  createActivityLog(task.application_id, 'Task Completed', `Follow-up task completed: "${task.title}".`);

  const updated = db.prepare(`
    SELECT t.*, a.child_first_name, a.child_last_name, a.parent_name
    FROM tasks t
    JOIN applications a ON t.application_id = a.id
    WHERE t.id = ?
  `).get(id);

  return updated;
}

// Sync Audit Logs
export function createSyncLog(payload) {
  const { application_id, target_platform, status, response_message, payload: rawPayload } = payload;
  const stringPayload = typeof rawPayload === 'object' ? JSON.stringify(rawPayload) : rawPayload;

  const info = db.prepare(`
    INSERT INTO sync_logs (application_id, target_platform, status, payload, response_message)
    VALUES (?, ?, ?, ?, ?)
  `).run(application_id, target_platform, status, stringPayload, response_message);

  // Log activity
  createActivityLog(
    application_id,
    status === 'SUCCESS' ? 'Platform Synced' : 'Sync Failed',
    `Attempted sync to ${target_platform}. Status: ${status}. Result: ${response_message}`
  );

  const newLogId = info.lastInsertRowid;
  const app = db.prepare('SELECT child_first_name, child_last_name, parent_name FROM applications WHERE id = ?').get(application_id);

  return {
    id: newLogId,
    application_id,
    target_platform,
    status,
    payload: stringPayload,
    response_message,
    synced_at: new Date().toISOString(),
    child_first_name: app?.child_first_name || '',
    child_last_name: app?.child_last_name || '',
    parent_name: app?.parent_name || ''
  };
}

export function getSyncLogs() {
  const logs = db.prepare(`
    SELECT s.*, a.child_first_name, a.child_last_name, a.parent_name
    FROM sync_logs s
    JOIN applications a ON s.application_id = a.id
    ORDER BY s.synced_at DESC
  `).all();

  return logs;
}

// Activity History Logs
export function createActivityLog(application_id, action, notes) {
  const info = db.prepare(`
    INSERT INTO activity_logs (application_id, action, notes)
    VALUES (?, ?, ?)
  `).run(application_id, action, notes);

  return {
    id: info.lastInsertRowid,
    application_id,
    action,
    notes,
    created_at: new Date().toISOString()
  };
}

export function getActivityLogs(application_id) {
  return db.prepare('SELECT * FROM activity_logs WHERE application_id = ? ORDER BY created_at DESC').all(application_id);
}

export default db;
