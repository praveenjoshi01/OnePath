import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from '../server/db.js';
import enquiriesRouter from '../server/routes/enquiries.js';
import roomsRouter from '../server/routes/rooms.js';
import tasksRouter from '../server/routes/tasks.js';
import syncRouter from '../server/routes/sync.js';
import authRouter from '../server/routes/auth.js';

dotenv.config();

// Initialize SQLite database
initDb();

const app = express();

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
    app: 'OnePath Enrollment Manager API (Vercel Serverless)',
    database: 'SQLite (Persistent)',
    timestamp: new Date().toISOString()
  });
});

export default app;
