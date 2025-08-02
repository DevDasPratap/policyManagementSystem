// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import env from './config/config.js';

// Routes
import uploadRoutes from './routes/upload.routes.js';
import policyRoutes from './routes/policy.routes.js';
import postRoutes from './routes/post.routes.js';

// utils
import { startCPUMonitor } from './utils/cpuMonitor.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// File path helpers (for __dirname equivalent in ES6)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

startCPUMonitor(); // Run CPU monitor in background
// Connect to DB
connectDB();

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/post', postRoutes);

// Root
app.get('/', (req, res) => {
  res.send('🚀 Server running');
});

// Error Handling (Optional)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
app.listen(env.PORT, () => {
  console.log(`✅ Server listening on port ${env.PORT}`);
});
