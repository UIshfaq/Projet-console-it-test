const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/IsAdmin');
const verifyToken = require('../middlewares/authMiddleware');

const dashbordAdminController = require('../controllers/dashbordAdminController');

router.get('/interventions/today', verifyToken, isAdmin, dashbordAdminController.getIntervToday);

module.exports = router;