const express = require('express');
const router = express.Router();
const productController = require('../controllers/products/productsController');
const { loggedIn, hasPermission } = require('../middleware/auth');
const { ROLES } = require('../models/User');

// Routes for product management - accessible by admin and warehouse staff
router.get('/', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), productController.index);
router.get('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), productController.add);
router.post('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), productController.store);
router.get('/edit/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), productController.edit);
router.put('/edit/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), productController.update);
router.delete('/delete/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), productController.delete);

module.exports = router;
