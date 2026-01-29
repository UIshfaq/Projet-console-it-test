// 1. Importer Express et créer le routeur
const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/IsAdmin');
const verifyToken = require('../middlewares/authMiddleware'); // Importe-le !

// 2. Importer tous les outils
const authController = require('../controllers/authController');

router.post('/register', verifyToken, isAdmin, authController.addUser);
router.post('/login',authController.login);


module.exports = router;