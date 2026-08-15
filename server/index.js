import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import enquiriesRouter from './routes/enquiries.js';
import roomsRouter from './routes/rooms.js';
import tasksRouter from './routes/tasks.js';
import syncRouter from './routes/sync.js';
import authRouter from './routes/auth.js';

dotenv.config();

// Initialize SQLite database
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/sync', syncRouter);
app.use('/api/auth', authRouter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'OnePath Enrollment Manager API',
    database: 'SQLite (Persistent)',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 OnePath Enrollment Manager Server running on port ${PORT}`);
  console.log(`⚡ Database: SQLite Persistent (Initialized)`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
