import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import subjectsRoutes from './routes/subjects.routes';
import chaptersRoutes from './routes/chapters.routes';
import lessonsRoutes from './routes/lessons.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import authRoutes from './routes/auth.routes';
import { protect } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

const allowedOrigins = [
  'http://localhost:3000',
  'https://next-chapter-tawny.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// IMPORTANT
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Next Chapter API is running 🚀' });
});

// Routes
app.use('/api/subjects', protect, subjectsRoutes);
app.use('/api/chapters', protect, chaptersRoutes);
app.use('/api/lessons', protect, lessonsRoutes);
app.use('/api/ai', protect, aiRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/auth', authRoutes); // public — no protect

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Next Chapter API running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);

export default app;
