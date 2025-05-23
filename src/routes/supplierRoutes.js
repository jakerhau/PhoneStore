const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier/supplierController');
const { loggedIn, hasPermission } = require('../middleware/auth');
const { ROLES } = require('../models/User');

router.get('/', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.index);
router.get('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.viewAdd);
router.post('/add', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.add);
router.get('/edit/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.viewEdit);
router.put('/edit/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.edit);
router.post('/stop/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.stopSupplier);
router.post('/active/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.activeSupplier);
router.get('/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), supplierController.view);

module.exports = router;
