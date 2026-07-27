import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DashboardStats from './components/DashboardStats.jsx';
import PipelineKanban from './components/PipelineKanban.jsx';
import EnquiriesTable from './components/EnquiriesTable.jsx';
import RoomPlanner from './components/RoomPlanner.jsx';
import TaskDrawer from './components/TaskDrawer.jsx';
import NewEnquiryModal from './components/NewEnquiryModal.jsx';
import SyncModal from './components/SyncModal.jsx';
import DetailModal from './components/DetailModal.jsx';
import { LayoutGrid, Table, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [enquiries, setEnquiries] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState('kanban'); // 'kanban' or 'table'
  const [showNewModal, setShowNewModal] = useState(false);
  const [syncTargetApp, setSyncTargetApp] = useState(null);
  const [detailTargetApp, setDetailTargetApp] = useState(null);

  const fetchAllData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch('/api/enquiries').then(res => res.json()),
      fetch('/api/rooms').then(res => res.json()),
      fetch('/api/tasks').then(res => res.json()),
      fetch('/api/enquiries/pipeline-summary').then(res => res.json())
    ])
      .then(([enqData, roomData, taskData, sumData]) => {
        setLoading(false);
        if (enqData.success) setEnquiries(enqData.data);
        if (roomData.success) setRooms(roomData.data);
        if (taskData.success) setTasks(taskData.data);
        if (sumData.success) setSummary(sumData);
      })
      .catch(err => {
        setLoading(false);
        setError('Failed to connect to backend server. Make sure Node.js server is running.');
      });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateStage = (id, newStage) => {
    fetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchAllData();
        }
      });
  };

  const handleCreateEnquiry = (newEnquiryData) => {
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnquiryData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setShowNewModal(false);
          fetchAllData();
        }
      });
  };

  const handleDeleteEnquiry = (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry record?')) {
      fetch(`/api/enquiries/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) fetchAllData();
        });
    }
  };

  const handleToggleTask = (taskId) => {
    fetch(`/api/tasks/${taskId}/toggle`, { method: 'PATCH' })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchAllData();
      });
  };

  const handleCreateTask = (taskPayload) => {
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchAllData();
      });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        onOpenNewModal={() => setShowNewModal(true)}
        onRefresh={fetchAllData}
        loading={loading}
      />

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1800px', margin: '0 auto', width: '100%' }}>
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={22} />
            <div>
              <strong>Connection Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Executive Metrics Header */}
        <DashboardStats summary={summary} taskCount={tasks.filter(t => t.status === 'pending').length} />

        {/* Room Capacity & Occupancy Monitor */}
        <RoomPlanner rooms={rooms} />

        {/* View Controls Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pre-Enrolment Application Pipeline</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Manage enquiry progress, age classification, deposit status, and active platform handoff
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--bg-surface)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              className={`btn btn-sm ${activeView === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveView('kanban')}
              style={{ border: 'none' }}
            >
              <LayoutGrid size={15} /> Kanban Board
            </button>
            <button
              className={`btn btn-sm ${activeView === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveView('table')}
              style={{ border: 'none' }}
            >
              <Table size={15} /> Data Table
            </button>
          </div>
        </div>

        {/* Active Pipeline View */}
        {activeView === 'kanban' ? (
          <PipelineKanban
            enquiries={enquiries}
            onUpdateStage={handleUpdateStage}
            onOpenSyncModal={(app) => setSyncTargetApp(app)}
            onOpenDetailModal={(app) => setDetailTargetApp(app)}
          />
        ) : (
          <EnquiriesTable
            enquiries={enquiries}
            rooms={rooms}
            onUpdateStage={handleUpdateStage}
            onOpenSyncModal={(app) => setSyncTargetApp(app)}
            onOpenDetailModal={(app) => setDetailTargetApp(app)}
            onDelete={handleDeleteEnquiry}
          />
        )}

        {/* Task Drawer Bottom Section */}
        <div style={{ marginTop: '36px' }}>
          <TaskDrawer
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onCreateTask={handleCreateTask}
            enquiries={enquiries}
          />
        </div>
      </main>

      {/* Modals */}
      {showNewModal && (
        <NewEnquiryModal
          rooms={rooms}
          onClose={() => setShowNewModal(false)}
          onSubmit={handleCreateEnquiry}
        />
      )}

      {syncTargetApp && (
        <SyncModal
          application={syncTargetApp}
          onClose={() => setSyncTargetApp(null)}
          onExportSuccess={fetchAllData}
        />
      )}

      {detailTargetApp && (
        <DetailModal
          application={detailTargetApp}
          onClose={() => setDetailTargetApp(null)}
          onUpdateStage={handleUpdateStage}
        />
      )}
    </div>
  );
}
