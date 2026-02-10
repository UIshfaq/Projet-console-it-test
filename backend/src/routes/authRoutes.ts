// 1. Importer Express et créer le routeur
import express from 'express';
const router = express.Router();
import {isAdmin} from '../middlewares/IsAdmin';
import {verifyToken} from "../middlewares/authMiddleware";

// 2. Importer tous les outils
import * as authController from '../controllers/authController';

router.post('/register', verifyToken, isAdmin, authController.addUser);
router.post('/login',authController.login);


export default router;