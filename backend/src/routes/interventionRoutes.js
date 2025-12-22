const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const interventionController = require('../controllers/interventionController');

router.use(verifyToken);

router.get('/',interventionController.getAllInterventions );

router.get('/archived', interventionController.getAllInterventionsArchived );

router.get('/:id', interventionController.getInterventionById );

router.put('/:id', interventionController.terminerIntervention );

router.patch('/:id/archive', interventionController.archiverIntervention );

router.patch('/:id/modifier', interventionController.modifierNotes );

module.exports = router;
