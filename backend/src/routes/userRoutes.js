const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require("../middlewares/authMiddleware");
const isAdmin = require('../middlewares/IsAdmin');

router.use(verifyToken);

router.get('/me',userController.getProfil);

router.get('/all',isAdmin ,userController.getAllUsers);

router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;