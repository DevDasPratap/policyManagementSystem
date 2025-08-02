import express from 'express';
import { scheduleMessage } from '../controllers/post.controller.js';

const router = express.Router();

// POST /api/post/schedule
router.post('/schedule', scheduleMessage);

export default router;
