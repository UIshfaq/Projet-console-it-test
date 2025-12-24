const express = require('express');
const router = express.Router();
const inventairesController = require('../controllers/inventairesController');
const verifyToken = require("../middlewares/authMiddleware");

router.use(verifyToken);


router.get('/', inventairesController.getAllInventaires );

router.post('/', inventairesController.addInventaire );

router.get('/:id/materials', inventairesController.getMaterialsForIntervention );

module.exports = router;