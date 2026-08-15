# OnePath Enrollment Manager 🚀

> **Vendor-Independent Pre-Enrolment Workflow Intelligence & Interoperability Layer for Early Years Childcare Providers**

OnePath Enrollment Manager is an application designed specifically to bridge the friction gap in pre-enrolment administration for early-years and crèche providers. 

Rather than replacing incumbent operational childcare systems (such as *Famly*, *TeachKloud*, *Child Paths*, or *EYCEsoft*), **OnePath** operates as an intelligent workflow and interoperability layer above them. It manages the journey from first prospective enquiry to confirmed enrolment, normalises child & guardian records, automates SLA follow-ups, and securely synchronises approved child data via API.

---

## 🌟 Key Features

1. **6-Stage Pre-Enrolment Pipeline (Kanban & Table Views)**
   - Tracks prospective children through a structured lifecycle:
     1. `1. Interest Captured` (Website form, email, phone, walk-in)
     2. `2. Room Classified` (Auto-calculated age at requested start date)
     3. `3. Waiting List` (Prioritised demand queue with sibling priority support)
     4. `4. Offer Sent` (Official crèche place offers)
     5. `5. Deposit Pending` (€150 deposit tracking & verification)
     6. `6. Confirmed & Handoff` (Ready for API sync to active childcare software)

2. **Automated Age & Room Classification Engine**
   - Automatically calculates child age in months based on `date_of_birth` and `requested_start_date`.
   - Recommends the correct Irish early years room bracket and regulatory staff ratio:
     - **Buttercups Room (0 - 12 Months)** • Staff Ratio `1:3`
     - **Daisies Room (12 - 24 Months)** • Staff Ratio `1:5`
     - **Sunflowers Room (24 - 36 Months)** • Staff Ratio `1:6`
     - **ECCE Senior Preschool (36 - 60 Months)** • Staff Ratio `1:11`

3. **Real-time Crèche Room Occupancy Monitor**
   - Live visual capacity bars tracking enrolled/reserved places vs total room limits.
   - Computes available places and shows total waiting list volume per room.

4. **Follow-Up Tasks & SLA Reminder Manager**
   - Staff action task queue for deposit deadlines, birth certificate collections for ECCE entry, and welcome pack mailings.

5. **Vendor-Neutral Integration & API Handoff Engine**
   - Generates a validated OnePath Standardized API Payload (`OP-ENROL-xxx`).
   - Simulates single-click export handoff into destination platforms (**Famly**, **TeachKloud**, **Child Paths**, **EYCEsoft**, **Tot Tracker**, **Little Vista**).
   - Records audit logs for compliance and data traceability.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Modern Vanilla CSS Design System |
| **Backend** | Node.js, Express REST API (`better-sqlite3` driver) |
| **Database** | SQLite (Persistent Local Storage) — Auto-initialized and seeded in `server/db.js` |
| **Data Format** | JSON (REST API & Standardized Export Payload) |
| **Cloud Hosting**| Vercel (Pre-configured via `vercel.json` & `api/index.js` serverless function with SQLite in `/tmp`) |

---

## 🚀 Deploying to Vercel (1-Click Hosting)

OnePath Enrollment Manager is pre-configured with `vercel.json` and `api/index.js` for instant full-stack deployment on **Vercel**:

### Steps to Host on Vercel:
1. Go to your **Vercel Dashboard** ([vercel.com/new](https://vercel.com/new)).
2. Click **"Import Project"** and select your GitHub repository: `https://github.com/praveenjoshi01/OnePath`.
3. Vercel will automatically detect `vercel.json`:
   - **Framework Preset**: Vite / Other
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
4. Click **Deploy**. Vercel will host:
   - **Frontend UI**: React Vite SPA hosted at your Vercel URL.
   - **Backend API**: Express serverless functions at `/api/*` (auto-seeded SQLite in `/tmp`).

---

## 📁 Repository & Code Layout

```text
OnePath/
├── Code/
│   ├── client/                  # React 18 + Vite Frontend Application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Header.jsx           # Top navbar & action trigger
│   │   │   │   ├── DashboardStats.jsx   # Executive pipeline metrics
│   │   │   │   ├── PipelineKanban.jsx   # 6-Stage Kanban board
│   │   │   │   ├── EnquiriesTable.jsx   # Tabular filterable list
│   │   │   │   ├── RoomPlanner.jsx      # Crèche room capacity monitor
│   │   │   │   ├── TaskDrawer.jsx       # SLA follow-up task queue
│   │   │   │   ├── NewEnquiryModal.jsx  # New enquiry capture & auto-room
│   │   │   │   ├── SyncModal.jsx        # Vendor API handoff exporter
│   │   │   │   └── DetailModal.jsx      # Child profile inspector
│   │   │   ├── App.jsx                  # Main dashboard layout
│   │   │   ├── index.css                # Glassmorphism design system
│   │   │   └── main.jsx                 # React DOM entry point
│   │   ├── vite.config.js               # Dev server & API proxy (/api -> 3001)
│   │   └── package.json
│   ├── server/                  # Node.js + Express + SQLite Backend
│   │   ├── routes/
│   │   │   ├── enquiries.js             # Pipeline & application CRUD
│   │   │   ├── rooms.js                 # Crèche room capacity APIs
│   │   │   ├── tasks.js                 # Follow-up task APIs
│   │   │   └── sync.js                  # Vendor export & audit logs
│   │   ├── db.js                        # SQLite schema & initial seed data
│   │   ├── index.js                     # Express server entry point
│   │   └── package.json
│   ├── package.json             # Top-level workspace script manager
│   └── README.md                # Project documentation
└── Docs/
    └── Enrollment Manager/      # Strategic & market intelligence specifications
```

---

## ⚡ Quick Start & Local Running Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed:
```bash
node -v
npm -v
```

### 2. Installation
Navigate into the `Code/` directory and install dependencies for both server and client:
```bash
cd Code
npm run install:all
```
*(Or install manually in `server/` and `client/` directories)*

### 3. Start Local Development Environment

#### Option A: Running Backend & Frontend in separate terminals

**Terminal 1 (Backend Server):**
```bash
cd Code/server
npm run dev
```
*Backend API will run at `http://localhost:3001`*

**Terminal 2 (Frontend Client):**
```bash
cd Code/client
npm run dev
```
*Frontend Web Application will run at `http://localhost:3000`*

---

## 📊 Database Schema (SQLite)

The SQLite database file is created automatically at `Code/server/enrollment_manager.db` upon initial server launch and seeded with sample Irish crèche prospective records.

### Tables Overview
- **`rooms`**: Crèche rooms, age min/max in months, max capacity, staff ratio.
- **`applications`**: Prospective child profiles, requested start date, parent contact details, pipeline stage, deposit status, room assignment, sibling priority flag, and notes.
- **`tasks`**: Action items linked to applications with due dates and completion status.
- **`sync_logs`**: Audit trail of API exports to external vendor platforms (*Famly*, *TeachKloud*, etc.).
- **`users`**: Store credentials, name, and role for administrator access.
- **`activity_logs`**: Store detailed, chronological history logs for child applications (e.g. stage updates, task completions, sync actions).

---

## 🔐 Evaluation & Default Credentials

When launching the application, you will be prompted with a visual login screen. To keep the login screen clean, the default quick-fill credentials panel has been removed. You can find the seeded evaluation accounts documented locally in [credentials.md](file:///Users/praveenjoshi/Code/Code2026/OnePath/Code/credentials.md) (which is ignored by Git).

---

## 🔄 Visual Workflows Integration

As outlined in `Docs/OnePath_Enrollment_Visual_Workflows.docx`, the product implements the complete enrollment lifecycle:

1. **Workflow 1: Parent Enrollment Journey**: Parents can submit applications via a beautiful, public-facing multi-step wizard by clicking the "Parent Portal" link on the login screen. It features real-time regulatory room suggestion based on the child's age, schedules selection, sibling priority declarations, and displays a summary review before generating a reference ID.
2. **Workflow 2: Admin reviews new enrollment**: Administrators can open any profile modal to inspect details, see the child's age in months, view recommended rooms, check current room capacity context, and review internally.
3. **Workflow 3: Waiting List to Place Opportunity**: If a room has vacancies (`enrolled_count < capacity`), OnePath displays a glowing alert on the admin dashboard. Clicking "Match Waitlist Candidates" ranks the candidates using sibling priority (highest) and date of application (FIFO), allowing admins to easily offer places.
4. **Workflow 4: Place Offer to Confirmed Enrollment**: When a place is offered, OnePath automatically creates a follow-up task to collect the deposit. In the child profile, admins can record parent acceptance (advances to `deposit_pending`) and verify the deposit payment (advances to `confirmed` and marks deposit as paid).
5. **Activity Log Feed**: Every child record maintains a persistent audit timeline tracking creation, room classifications, stage advances, task completions, and external API sync histories.

---

## 🔌 API Documentation

### User Authentication
- `POST /api/auth/login` — Authenticate user with email and password.

### Enquiries & Pipeline
- `GET /api/enquiries` — Fetch prospective children (supports filtering by `stage`, `room_id`, `source`, `search`).
- `GET /api/enquiries/pipeline-summary` — Get high-level conversion rate, stage counts, and occupancy.
- `GET /api/enquiries/:id` — Fetch single child profile with task list, sync history, and activity timeline.
- `POST /api/enquiries` — Create a new prospective child application.
- `POST /api/enquiries/suggest-room` — Auto-calculate suggested crèche room from DOB & start date.
- `PATCH /api/enquiries/:id` — Update application stage, room, deposit, or notes.
- `DELETE /api/enquiries/:id` — Delete application record.

### Crèche Rooms
- `GET /api/rooms` — List rooms with active occupancy percentages and available places.
- `POST /api/rooms` — Add new crèche room.

### Tasks & SLA Reminders
- `GET /api/tasks` — List staff follow-up tasks.
- `POST /api/tasks` — Create task for an application.
- `PATCH /api/tasks/:id/toggle` — Toggle task completion (`pending` / `completed`).

### Vendor Export & Interoperability
- `POST /api/sync/export` — Export confirmed prospective child record to target vendor API (*Famly*, *TeachKloud*, *Child Paths*, *EYCEsoft*).
- `GET /api/sync/logs` — Fetch API handoff audit trail.

---

## 💡 Strategic Context (OnePath Positioning)

As outlined in `Docs/Enrollment Manager/OnePath_Enrollment_Automation_CoFounder_v2.docx`:
- **Problem**: Ireland has over 4,300 early-years providers with widespread waiting list pressure (66.5% of pre-primary settings reporting waiting list queues). Pre-enrolment administration is fragmented across paper forms, emails, and spreadsheets.
- **OnePath Solution**: OnePath acts as the **Integration, Intelligence & Interoperability Layer**. It does not replace daily attendance or billing, but instead streamlines the enquiry-to-offer journey and writes approved records directly into whichever platform the crèche already uses.
