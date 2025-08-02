import path from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import env from '../config/config.js';

export const uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const dbUrl = env.DBURL

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const workerPath = path.join(__dirname, '../workers/csvWorker.js');

  const worker = new Worker(workerPath, {
    workerData: { filePath, dbUrl },
  });

  worker.on('message', (msg) => {
    console.log('✅ Worker finished:', msg);
    res.status(200).json({ success: true, message: 'CSV processed successfully' });
  });

  worker.on('error', (error) => {
    console.error('❌ Worker error:', error);
    res.status(500).json({ success: false, message: 'Worker thread failed', error: error.message });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Worker stopped with exit code ${code}`);
    }
  });
};
