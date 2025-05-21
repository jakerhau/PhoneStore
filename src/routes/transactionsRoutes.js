const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions/transactionsController');
const { loggedIn, hasPermission}= require('../middleware/auth');
const { ROLES } = require('../models/User');

// Routes for transaction management - accessible by admin and sales staff
router.get('/', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), transactionController.index);
router.get('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), transactionController.add);
router.post('/create', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), transactionController.create);
router.get('/show', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), transactionController.show);
router.get('/promotions', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), transactionController.getPromotions);
router.post('/check-customer', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), transactionController.checkCustomer);

module.exports = router;
