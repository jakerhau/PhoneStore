const express = require('express');
const router = express.Router();
const userController = require('../controllers/users/usersController');
const { isAdmin, loggedIn } = require('../middleware/auth');

router.get('/', loggedIn, isAdmin, userController.index);
router.get('/create', loggedIn, isAdmin, userController.create);
router.post('/create', loggedIn, isAdmin, userController.store);
router.post('/resend', loggedIn, isAdmin, userController.resend);

module.exports = router;
