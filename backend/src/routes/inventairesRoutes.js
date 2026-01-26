const express = require('express');
const router = express.Router();
const inventairesController = require('../controllers/inventairesController');
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/IsAdmin");

router.use(verifyToken);


router.get('/', inventairesController.getAllInventaires );

//router.post('/', inventairesController.addInventaire );

router.get('/:id/materials', inventairesController.getMaterialsForIntervention );

router.put('/:id/materials/:materialId', inventairesController.toggleCheckMaterial);

module.exports = router;