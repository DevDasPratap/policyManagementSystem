// routes/upload.routes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadCSV } from '../controllers/upload.controller.js';

const router = express.Router();

// Configure multer to store CSV in /data/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'data/uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// POST /api/upload
router.post('/', upload.single('file'), uploadCSV);

export default router;
