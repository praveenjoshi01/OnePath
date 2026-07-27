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
      room_id INTEGER REFERENCES rooms(id),
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
  `);

  // Check if seed needed
  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  if (roomCount === 0) {
    seedData();
  }
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
      'Full-time (5 Days)', 1, 0, 0, 'No known allergies',
      'Enquired via online form. Older brother Connor already in ECCE room.',
      '2026-07-20 09:30:00', '2026-07-20 09:30:00'
    ],
    [
      'Aoife', 'Murphy', '2025-04-10', '2026-08-15',
      'Ciarán Murphy', 'ciaran.m@example.ie', '+353 86 987 6543',
      'Email', 'classified', 2,
      '3 Days (Mon, Wed, Fri)', 0, 0, 0, 'Mild eczema - cream required',
      'Age classified as Wobbler for August start. Room capacity available.',
      '2026-07-18 14:15:00', '2026-07-22 10:00:00'
    ],
    [
      'Cillian', 'Walsh', '2024-11-20', '2026-09-01',
      'Fiona Walsh', 'fiona.walsh@example.ie', '+353 85 456 7890',
      'Phone', 'waiting_list', 2,
      'Full-time (5 Days)', 0, 0, 0, 'Lactose sensitive',
      'Added to waiting list for September intake. Priority rank #2.',
      '2026-07-10 11:00:00', '2026-07-15 16:20:00'
    ],
    [
      'Saoirse', 'Byrne', '2023-08-05', '2026-09-01',
      'Patrick Byrne', 'paddy.b@example.ie', '+353 87 654 3210',
      'Referral', 'offer_sent', 3,
      'Full-time (5 Days)', 1, 0, 0, 'None',
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
    insertApp.run(...app);
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

export default db;
