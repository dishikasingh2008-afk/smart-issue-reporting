import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/authRoutes';
import issueRoutes from './routes/issueRoutes';
import adminIssueRoutes from './routes/adminIssueRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import pollRoutes from './routes/pollRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', adminIssueRoutes); // status/priority/assign/comments live under /api/issues/:id/...
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/polls', pollRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Smart Campus API listening on http://localhost:${PORT}`);
});
