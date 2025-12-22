// 1. Importer Express et créer le routeur
const express = require('express');
const router = express.Router();

// 2. Importer tous les outils
const authController = require('../controllers/authController');

router.post('/register',authController.register);
router.post('/login',authController.login);


module.exports = router;