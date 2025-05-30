const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { loggedIn } = require('../middleware/auth');

// Routes cho khách hàng (public)
router.post('/customer/chat', chatController.createChat);
router.get('/customer/chat/:sessionId/messages', chatController.getMessages);
router.post('/customer/chat/:sessionId/messages', chatController.sendCustomerMessage);

// Routes cho admin (yêu cầu đăng nhập)
router.get('/admin/chat-page', loggedIn, chatController.pageAdminChat);
router.get('/admin/chats', loggedIn, chatController.getAdminChats);
router.get('/admin/chat/:sessionId', loggedIn, chatController.getChatDetail);
router.post('/admin/chat/:sessionId/messages', loggedIn, chatController.sendAdminMessage);
router.post('/admin/chat/:sessionId/read', loggedIn, chatController.markAsRead);

module.exports = router;