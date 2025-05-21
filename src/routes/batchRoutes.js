const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch/batchController');
const { loggedIn, hasPermission } = require('../middleware/auth');
const { ROLES } = require('../models/User');

router.get('/add/:supplierId', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), batchController.viewAdd);
router.post('/add/:supplierId', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), batchController.add);
router.put('/edit/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), batchController.edit);
router.delete('/delete/:id', loggedIn, hasPermission([ROLES.ADMIN, ROLES.WAREHOUSE_STAFF]), batchController.delete);

module.exports = router;