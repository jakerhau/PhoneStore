const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion/promotionController');
const { loggedIn, hasPermission}= require('../middleware/auth');
const { ROLES } = require('../models/User');

// Routes for promotion management - accessible by admin and sales staff
router.get('/', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.index);
router.get('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.add);
router.post('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.store);
router.get('/edit/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.edit);
router.get('/edit/:id/view', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.viewEdit);
router.put('/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.update);
router.delete('/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.SALES_STAFF]), promotionController.delete);

module.exports = router;
