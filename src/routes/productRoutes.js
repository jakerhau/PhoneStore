const express = require('express');
const router = express.Router();
const productController = require('../controllers/products/productsController');
const { isAdmin } = require('../middleware/auth');

router.get('/', productController.show);
router.get('/edit', isAdmin, productController.edit);
router.post('/update', isAdmin, productController.update);

module.exports = router;
