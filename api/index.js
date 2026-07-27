import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import enquiriesRouter from '../server/routes/enquiries.js';
import roomsRouter from '../server/routes/rooms.js';
import tasksRouter from '../server/routes/tasks.js';
import syncRouter from '../server/routes/sync.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/sync', syncRouter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'OnePath Enrollment Manager API (Vercel Serverless)',
    database: 'Supabase Cloud (PostgreSQL)',
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fkmzuwdtssuiokfnmorf.supabase.co',
    timestamp: new Date().toISOString()
  });
});

export default app;
