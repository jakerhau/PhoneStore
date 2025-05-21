const express = require('express');
const router = express.Router();
const productController = require('../controllers/products/productsController');
const { isAdmin } = require('../middleware/auth');

router.get('/', productController.index);
router.get('/add', isAdmin, productController.add);

router.delete('/', isAdmin, productController.delete);
router.post('/', isAdmin, productController.store);


module.exports = router;
