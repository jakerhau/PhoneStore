const express = require('express');
const router = express.Router();
const preorderController = require('../controllers/preoder/preorderController');

// Routes cho khách hàng
router.post('/create', preorderController.createPreorder);

// Routes cho admin
router.get("/", preorderController.getPreorders);
router.post('/update-status', preorderController.updateStatus);


module.exports = router; 