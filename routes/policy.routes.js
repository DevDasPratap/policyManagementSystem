import express from 'express';
import { searchPolicyByUsername, getPolicyAggregateByUser } from '../controllers/policy.controller.js';

const router = express.Router();

// GET /api/policy/search/:name
router.get('/search/:name', searchPolicyByUsername);

// GET /api/policy/aggregate
router.get('/aggregate', getPolicyAggregateByUser);

export default router;
