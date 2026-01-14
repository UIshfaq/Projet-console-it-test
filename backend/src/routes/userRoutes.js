const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require("../middlewares/authMiddleware");

router.use(verifyToken);

router.get('/me',userController.getProfil);

router.get('/all',userController.getAllUsers);

module.exports = router;