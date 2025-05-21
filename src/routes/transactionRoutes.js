const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions/transactionsController');

router.get('/', transactionController.show);

module.exports = router;
