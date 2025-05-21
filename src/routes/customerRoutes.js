const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customers/customersController');

router.get('/', customerController.show);

module.exports = router;
