const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier/supplierController');

// Hiển thị danh sách nhà cung cấp
router.get('/', supplierController.index);

// Thêm nhà cung cấp mới
router.get('/add', supplierController.viewAdd); 
router.post('/add', supplierController.add);

// Dừng nhà cung cấp
router.get('/stop/:id', supplierController.stopSupplier);

// Xem chi tiết nhà cung cấp
router.get('/:id', supplierController.view);

// Cập nhật nhà cung cấp
router.get('/edit/:id', supplierController.viewEdit);
router.post('/edit/:id', supplierController.edit);

module.exports = router;
