const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers/customersController');
const { loggedIn, hasPermission } = require('../middleware/auth');
const { ROLES } = require('../models/User');

// Routes for customer management - accessible by admin and sales staff
router.get('/', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), customersController.index);
router.get('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), customersController.add);
router.post('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), customersController.store);
router.get('/edit', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), customersController.edit);
router.put('/edit', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), customersController.update);
router.get('/show', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), customersController.show);

module.exports = router;
