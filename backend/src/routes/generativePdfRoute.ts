import express from 'express';
const router = express.Router();
import {verifyToken} from "../middlewares/authMiddleware";
import * as generatePdfController from "../controllers/generatePdfController";

router.use(verifyToken);

router.get('/generate-pdf/:id', generatePdfController.generatePdf);

export default router;