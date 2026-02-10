import express from 'express';
import {verifyToken} from "../middlewares/authMiddleware";
import * as interventionController from "../controllers/interventionController";
import {isAdmin} from '../middlewares/IsAdmin';

const router = express.Router();

router.use(verifyToken);

router.get('/',interventionController.getAllInterventionsNonTermine );

router.post('/addInterv', interventionController.addIntervention );

router.get('/all',isAdmin ,interventionController.getAllInterventions );

router.get('/archived', interventionController.getAllInterventionsArchived );

router.get('/:id', interventionController.getInterventionById );

router.put('/:id', interventionController.terminerIntervention );

router.patch('/:id/archive', interventionController.archiverIntervention );

router.patch('/:id/modifier', interventionController.modifierNotes );

export default router;
