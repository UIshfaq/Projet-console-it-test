import express from 'express';
const router = express.Router();
import {isAdmin} from '../middlewares/IsAdmin';
import {verifyToken} from "../middlewares/authMiddleware";

import * as dashbordAdminController from '../controllers/dashbordAdminController';

router.get('/interventions/today', verifyToken, isAdmin, dashbordAdminController.getIntervToday);

export default router;