const express = require('express');
const router = express.Router();
const customerPageController = require('../controllers/customer/customerPageController');

router.get('/', customerPageController.index);
router.get('/products', customerPageController.products);
router.get('/contact', customerPageController.contact);
router.get('/points', customerPageController.points);
router.post('/points', customerPageController.searchPoints);
router.post('/products/preorder', customerPageController.preorder);


module.exports = router; 