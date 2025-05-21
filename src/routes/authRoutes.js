const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const { isAuth, ensureFirstLogin } = require('../middleware/auth');

// Routes cần kiểm tra session
router.get('/login', isAuth, authController.login);
router.post('/login', ensureFirstLogin, authController.validateLogin);
router.post('/logout', authController.logout);
router.post('/changepwsale', authController.changePassword);

// Routes không cần kiểm tra session
router.get('/validate', authController.validate);

module.exports = router;