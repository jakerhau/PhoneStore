const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports/reportsController');

router.get('/', reportController.index);
router.get('/show', reportController.show);

module.exports = router;
