import supabase from './supabase.js';

// Fallback in-memory/seed data if Supabase tables are not yet created in SQL Editor
const SAMPLE_ROOMS = [
  { id: 1, name: 'Baby Room (Buttercups)', min_age_months: 0, max_age_months: 12, capacity: 9, staff_ratio: '1:3' },
  { id: 2, name: 'Wobblers & Toddlers (Daisies)', min_age_months: 12, max_age_months: 24, capacity: 12, staff_ratio: '1:5' },
  { id: 3, name: 'Playgroup & Junior Preschool (Sunflowers)', min_age_months: 24, max_age_months: 36, capacity: 18, staff_ratio: '1:6' },
  { id: 4, name: 'ECCE Preschool Room A (Oak)', min_age_months: 36, max_age_months: 60, capacity: 22, staff_ratio: '1:11' }
];

const SAMPLE_APPLICATIONS = [
  {
    id: 1,
    child_first_name: 'Liam',
    child_last_name: 'O’Connor',
    date_of_birth: '2025-10-15',
    requested_start_date: '2026-09-01',
    parent_name: 'Siobhan O’Connor',
    parent_email: 'siobhan.oc@example.ie',
    parent_phone: '+353 87 123 4567',
    enquiry_source: 'Website',
    stage: 'interest_captured',
    room_id: 1,
    days_requested: 'Full-time (5 Days)',
    sibling_priority: true,
    deposit_paid: false,
    deposit_amount: 0,
    medical_notes: 'No known allergies',
    notes: 'Enquired via online form. Older brother Connor already in ECCE room.',
    created_at: '2026-07-20T09:30:00Z',
    room_name: 'Baby Room (Buttercups)'
  },
  {
    id: 2,
    child_first_name: 'Aoife',
    child_last_name: 'Murphy',
    date_of_birth: '2025-04-10',
    requested_start_date: '2026-08-15',
    parent_name: 'Ciarán Murphy',
    parent_email: 'ciaran.m@example.ie',
    parent_phone: '+353 86 987 6543',
    enquiry_source: 'Email',
    stage: 'classified',
    room_id: 2,
    days_requested: '3 Days (Mon, Wed, Fri)',
    sibling_priority: false,
    deposit_paid: false,
    deposit_amount: 0,
    medical_notes: 'Mild eczema - cream required',
    notes: 'Age classified as Wobbler for August start.',
    created_at: '2026-07-18T14:15:00Z',
    room_name: 'Wobblers & Toddlers (Daisies)'
  },
  {
    id: 3,
    child_first_name: 'Cillian',
    child_last_name: 'Walsh',
    date_of_birth: '2024-11-20',
    requested_start_date: '2026-09-01',
    parent_name: 'Fiona Walsh',
    parent_email: 'fiona.walsh@example.ie',
    parent_phone: '+353 85 456 7890',
    enquiry_source: 'Phone',
    stage: 'waiting_list',
    room_id: 2,
    days_requested: 'Full-time (5 Days)',
    sibling_priority: false,
    deposit_paid: false,
    deposit_amount: 0,
    medical_notes: 'Lactose sensitive',
    notes: 'Added to waiting list for September intake. Priority rank #2.',
    created_at: '2026-07-10T11:00:00Z',
    room_name: 'Wobblers & Toddlers (Daisies)'
  },
  {
    id: 4,
    child_first_name: 'Saoirse',
    child_last_name: 'Byrne',
    date_of_birth: '2023-08-05',
    requested_start_date: '2026-09-01',
    parent_name: 'Patrick Byrne',
    parent_email: 'paddy.b@example.ie',
    parent_phone: '+353 87 654 3210',
    enquiry_source: 'Referral',
    stage: 'offer_sent',
    room_id: 3,
    days_requested: 'Full-time (5 Days)',
    sibling_priority: true,
    deposit_paid: false,
    deposit_amount: 0,
    medical_notes: 'None',
    notes: 'Official offer email sent on 24th July.',
    created_at: '2026-07-05T16:45:00Z',
    room_name: 'Playgroup & Junior Preschool (Sunflowers)'
  },
  {
    id: 5,
    child_first_name: 'Fionn',
    child_last_name: 'McCarthy',
    date_of_birth: '2023-01-12',
    requested_start_date: '2026-09-01',
    parent_name: 'Niamh McCarthy',
    parent_email: 'niamh.mc@example.ie',
    parent_phone: '+353 86 333 4444',
    enquiry_source: 'Website',
    stage: 'deposit_pending',
    room_id: 4,
    days_requested: 'ECCE Full-time (5 Days)',
    sibling_priority: false,
    deposit_paid: true,
    deposit_amount: 150.00,
    medical_notes: 'Asthma - inhaler provided',
    notes: 'Deposit received (€150). Pending birth certificate copy for ECCE scheme verification.',
    created_at: '2026-06-28T10:00:00Z',
    room_name: 'ECCE Preschool Room A (Oak)'
  },
  {
    id: 6,
    child_first_name: 'Maeve',
    child_last_name: 'Doyle',
    date_of_birth: '2022-09-18',
    requested_start_date: '2026-09-01',
    parent_name: 'Sean Doyle',
    parent_email: 'sean.doyle@example.ie',
    parent_phone: '+353 89 222 1111',
    enquiry_source: 'Walk-in',
    stage: 'confirmed',
    room_id: 4,
    days_requested: 'ECCE Morning Session',
    sibling_priority: true,
    deposit_paid: true,
    deposit_amount: 150.00,
    medical_notes: 'Peanut allergy',
    notes: 'All documentation complete and verified.',
    created_at: '2026-06-15T13:20:00Z',
    room_name: 'ECCE Preschool Room A (Oak)'
  }
];

let memoryApps = [...SAMPLE_APPLICATIONS];
let memoryTasks = [
  { id: 1, application_id: 1, task_type: 'follow_up', title: 'Send welcome pack to Siobhan O’Connor', due_date: '2026-07-28', status: 'pending', child_first_name: 'Liam', child_last_name: 'O’Connor', parent_name: 'Siobhan O’Connor' },
  { id: 2, application_id: 4, task_type: 'deposit_reminder', title: 'Follow up on €150 deposit for Saoirse Byrne', due_date: '2026-07-29', status: 'pending', child_first_name: 'Saoirse', child_last_name: 'Byrne', parent_name: 'Patrick Byrne' },
  { id: 3, application_id: 5, task_type: 'missing_documents', title: 'Collect copy of birth certificate for ECCE entry', due_date: '2026-07-30', status: 'pending', child_first_name: 'Fionn', child_last_name: 'McCarthy', parent_name: 'Niamh McCarthy' }
];
let memorySyncLogs = [
  {
    id: 1,
    application_id: 6,
    target_platform: 'Famly',
    status: 'SUCCESS',
    payload: { child: 'Maeve Doyle', dob: '2022-09-18', parent: 'Sean Doyle', room: 'ECCE Preschool Room A (Oak)' },
    response_message: 'Child record successfully created in Famly via API v2',
    synced_at: '2026-07-25T15:05:00Z',
    child_first_name: 'Maeve',
    child_last_name: 'Doyle',
    parent_name: 'Sean Doyle'
  }
];

// Helper to calculate room based on age
export async function autoSuggestRoom(dob, requestedStartDate) {
  const birth = new Date(dob);
  const start = new Date(requestedStartDate);
  if (isNaN(birth.getTime()) || isNaN(start.getTime())) return null;

  let ageMonths = (start.getFullYear() - birth.getFullYear()) * 12 + (start.getMonth() - birth.getMonth());
  if (start.getDate() < birth.getDate()) ageMonths--;
  if (ageMonths < 0) ageMonths = 0;

  const rooms = await getRooms();
  const suggested = rooms.find(r => ageMonths >= r.min_age_months && ageMonths < r.max_age_months) || rooms[rooms.length - 1];

  return { ageMonths, suggestedRoom: suggested || null };
}

// Fetch all Crèche Rooms
export async function getRooms() {
  try {
    const { data, error } = await supabase.from('rooms').select('*').order('min_age_months', { ascending: true });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {
    // Fallback if table not created
  }
  return SAMPLE_ROOMS;
}

// Create Crèche Room
export async function createRoom(payload) {
  try {
    const { data, error } = await supabase.from('rooms').insert([payload]).select().single();
    if (!error && data) return data;
  } catch (e) {
    // Fallback
  }

  const newRoom = { id: Date.now(), ...payload };
  SAMPLE_ROOMS.push(newRoom);
  return newRoom;
}

// Fetch Applications with filters
export async function getApplications(filters = {}) {
  const { stage, room_id, search, source } = filters;
  try {
    let query = supabase.from('applications').select('*, room:rooms(*)').order('created_at', { ascending: false });
    if (stage) query = query.eq('stage', stage);
    if (room_id) query = query.eq('room_id', room_id);
    if (source) query = query.eq('enquiry_source', source);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      let result = data.map(app => ({
        ...app,
        room_name: app.room?.name || 'Unassigned',
        staff_ratio: app.room?.staff_ratio,
        room_capacity: app.room?.capacity
      }));

      if (search) {
        const term = search.toLowerCase();
        result = result.filter(a =>
          `${a.child_first_name} ${a.child_last_name}`.toLowerCase().includes(term) ||
          a.parent_name.toLowerCase().includes(term) ||
          a.parent_email.toLowerCase().includes(term)
        );
      }
      return result;
    }
  } catch (e) {
    // Fallback
  }

  let filtered = [...memoryApps];
  if (stage) filtered = filtered.filter(a => a.stage === stage);
  if (room_id) filtered = filtered.filter(a => String(a.room_id) === String(room_id));
  if (source) filtered = filtered.filter(a => a.enquiry_source === source);
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(a =>
      `${a.child_first_name} ${a.child_last_name}`.toLowerCase().includes(term) ||
      a.parent_name.toLowerCase().includes(term) ||
      a.parent_email.toLowerCase().includes(term)
    );
  }
  return filtered;
}

// Get Single Application by ID
export async function getApplicationById(id) {
  try {
    const { data, error } = await supabase.from('applications').select('*, room:rooms(*)').eq('id', id).single();
    if (!error && data) {
      const { data: tasks } = await supabase.from('tasks').select('*').eq('application_id', id);
      const { data: syncLogs } = await supabase.from('sync_logs').select('*').eq('application_id', id);

      return {
        ...data,
        room_name: data.room?.name || 'Unassigned',
        tasks: tasks || [],
        syncLogs: syncLogs || []
      };
    }
  } catch (e) {
    // Fallback
  }

  const app = memoryApps.find(a => String(a.id) === String(id));
  if (!app) return null;
  return {
    ...app,
    tasks: memoryTasks.filter(t => String(t.application_id) === String(id)),
    syncLogs: memorySyncLogs.filter(s => String(s.application_id) === String(id))
  };
}

// Create New Prospective Application
export async function createApplication(payload) {
  try {
    const { data, error } = await supabase.from('applications').insert([payload]).select().single();
    if (!error && data) return data;
  } catch (e) {
    // Fallback
  }

  const rooms = await getRooms();
  const room = rooms.find(r => String(r.id) === String(payload.room_id));

  const newApp = {
    id: Date.now(),
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    room_name: room ? room.name : 'Unassigned'
  };
  memoryApps.unshift(newApp);
  return newApp;
}

// Update Application Stage / Details
export async function updateApplication(id, updates) {
  try {
    const { data, error } = await supabase.from('applications').update({
      ...updates,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (!error && data) return data;
  } catch (e) {
    // Fallback
  }

  const index = memoryApps.findIndex(a => String(a.id) === String(id));
  if (index !== -1) {
    memoryApps[index] = { ...memoryApps[index], ...updates, updated_at: new Date().toISOString() };
    return memoryApps[index];
  }
  return null;
}

// Delete Application
export async function deleteApplication(id) {
  try {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) return true;
  } catch (e) {
    // Fallback
  }

  memoryApps = memoryApps.filter(a => String(a.id) !== String(id));
  return true;
}

// Fetch Tasks
export async function getTasks(status = null, application_id = null) {
  try {
    let query = supabase.from('tasks').select('*, application:applications(child_first_name, child_last_name, parent_name)').order('due_date', { ascending: true });
    if (status) query = query.eq('status', status);
    if (application_id) query = query.eq('application_id', application_id);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(t => ({
        ...t,
        child_first_name: t.application?.child_first_name,
        child_last_name: t.application?.child_last_name,
        parent_name: t.application?.parent_name
      }));
    }
  } catch (e) {
    // Fallback
  }

  let filtered = [...memoryTasks];
  if (status) filtered = filtered.filter(t => t.status === status);
  if (application_id) filtered = filtered.filter(t => String(t.application_id) === String(application_id));
  return filtered;
}

// Create Task
export async function createTask(payload) {
  try {
    const { data, error } = await supabase.from('tasks').insert([payload]).select().single();
    if (!error && data) return data;
  } catch (e) {
    // Fallback
  }

  const app = memoryApps.find(a => String(a.id) === String(payload.application_id));
  const newTask = {
    id: Date.now(),
    ...payload,
    status: 'pending',
    child_first_name: app?.child_first_name || '',
    child_last_name: app?.child_last_name || '',
    parent_name: app?.parent_name || ''
  };
  memoryTasks.unshift(newTask);
  return newTask;
}

// Toggle Task Completion
export async function toggleTask(id) {
  try {
    const { data: current } = await supabase.from('tasks').select('status').eq('id', id).single();
    if (current) {
      const newStatus = current.status === 'pending' ? 'completed' : 'pending';
      const { data, error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id).select().single();
      if (!error && data) return data;
    }
  } catch (e) {
    // Fallback
  }

  const task = memoryTasks.find(t => String(t.id) === String(id));
  if (task) {
    task.status = task.status === 'pending' ? 'completed' : 'pending';
    return task;
  }
  return null;
}

// Add Sync Audit Log
export async function createSyncLog(payload) {
  try {
    const { data, error } = await supabase.from('sync_logs').insert([payload]).select().single();
    if (!error && data) return data;
  } catch (e) {
    // Fallback
  }

  const app = memoryApps.find(a => String(a.id) === String(payload.application_id));
  const newLog = {
    id: Date.now(),
    ...payload,
    synced_at: new Date().toISOString(),
    child_first_name: app?.child_first_name || '',
    child_last_name: app?.child_last_name || '',
    parent_name: app?.parent_name || ''
  };
  memorySyncLogs.unshift(newLog);
  return newLog;
}

// Fetch Sync Audit Logs
export async function getSyncLogs() {
  try {
    const { data, error } = await supabase.from('sync_logs').select('*, application:applications(child_first_name, child_last_name, parent_name)').order('synced_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(s => ({
        ...s,
        child_first_name: s.application?.child_first_name,
        child_last_name: s.application?.child_last_name,
        parent_name: s.application?.parent_name
      }));
    }
  } catch (e) {
    // Fallback
  }

  return memorySyncLogs;
}
