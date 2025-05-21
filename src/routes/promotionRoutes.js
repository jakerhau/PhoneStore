const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion/promotionController');

router.get('/', promotionController.index);
router.get('/add', promotionController.add);
router.post('/add', promotionController.store);
router.get('/edit/:id', promotionController.edit);
router.put('/:id', promotionController.update);
router.delete('/:id', promotionController.delete);

module.exports = router;
