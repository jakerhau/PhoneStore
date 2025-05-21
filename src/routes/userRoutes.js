const express = require('express');
const router = express.Router();
const userController = require('../controllers/users/usersController');

router.get('/', userController.show);
router.get('/profile', userController.profile);
router.get('/profile/edit', userController.editprofile);
router.post('/updateMe', userController.updateImage);
router.get('/edit', userController.edit);
router.post('/update', userController.update);
router.get('/changepassword', userController.editPassword);
router.post('/changepassword', userController.changePassword);

module.exports = router;
