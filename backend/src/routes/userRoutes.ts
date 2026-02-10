import express from 'express';
import {verifyToken} from '../middlewares/authMiddleware';

import * as userController from '../controllers/userController';
import {isAdmin} from '../middlewares/IsAdmin';

const router = express.Router();
router.use(verifyToken);

router.get('/me',userController.getProfil);

router.get('/all',isAdmin ,userController.getAllUsers);

router.delete('/:id', isAdmin, userController.deleteUser);

export default router