const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions/transactionsController');

router.get('/', transactionController.index);
router.get('/add', transactionController.add);
router.get('/promotions', transactionController.getPromotions);
router.post('/check-customer', transactionController.checkCustomer);
router.post('/create', transactionController.create);
router.get('/show', transactionController.show);

module.exports = router;
