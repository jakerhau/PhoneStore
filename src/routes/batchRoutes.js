const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch/batchController');

//thêm lô hàng tương ứng với nhà cung cấp
router.get('/add/:supplierId', batchController.viewAdd);
router.post('/add/:supplierId', batchController.add);

// xem chi tiết lô hàng
// router.get('/:id', batchController.view);

// cập nhật lô hàng
router.get('/edit/:id', batchController.edit);
router.post('/edit/:id', batchController.edit);

module.exports = router;