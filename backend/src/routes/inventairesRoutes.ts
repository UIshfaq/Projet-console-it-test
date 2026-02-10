import express from 'express';
const router = express.Router();
import {verifyToken} from "../middlewares/authMiddleware";
import * as inventairesController from "../controllers/inventairesController";

router.use(verifyToken);


router.get('/', inventairesController.getAllInventaires );

//router.post('/', inventairesController.addInventaire );

router.get('/:id/materials', inventairesController.getMaterialsForIntervention );

router.put('/:id/materials/:materialId', inventairesController.toggleCheckMaterial);

export default router