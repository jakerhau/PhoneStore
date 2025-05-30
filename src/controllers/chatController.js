const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');

const chatController = {

    // Trang chat cho admin
    async pageAdminChat(req, res) {
        try {
            const chats = await Chat.find()
                .sort({ updatedAt: -1 })
                .populate('assignedAdmin', 'name email');
            
            res.render('chat', {
                layout: 'layout',
                user: req.session.user,
                chats
            });
        } catch (error) {
            res.status(500).render('error', { message: error.message });
        }
    },

    // Tạo phiên chat mới cho khách hàng
    async createChat(req, res) {
        try {
            const sessionId = uuidv4();
            const chat = await Chat.create({
                sessionId,
                customer: {
                    name: req.body.name || 'Anonymous',
                    email: req.body.email,
                    phone: req.body.phone
                }
            });
            
            // Thông báo tới admin về chat mới qua Socket.IO
            const io = req.app.get('io');
            if (io) {
                io.emit('new-customer', {
                    sessionId: chat.sessionId,
                    customer: chat.customer,
                    createdAt: chat.createdAt
                });
            }
            
            res.json({ success: true, chat });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Lấy tin nhắn của một phiên chat
    async getMessages(req, res) {
        try {
            const { sessionId } = req.params;
            const chat = await Chat.findOne({ sessionId });
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            const messages = await Message.find({ chatId: chat._id })
                .sort({ createdAt: 1 });
            res.json({ success: true, messages });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Gửi tin nhắn từ khách hàng
    async sendCustomerMessage(req, res) {
        try {
            const { sessionId } = req.params;
            const { content } = req.body;

            const chat = await Chat.findOne({ sessionId });
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            const message = await Message.create({
                chatId: chat._id,
                content,
                sender: 'customer'
            });

            // Cập nhật thông tin chat
            chat.lastMessage = content;
            chat.unreadCount += 1;
            await chat.save();

            // Gửi tin nhắn qua Socket.IO
            const io = req.app.get('io');
            if (io) {
                // Gửi tin nhắn tới room cụ thể
                io.to(sessionId).emit('new-message', {
                    ...message.toObject(),
                    sessionId: sessionId
                });
                
                // Thông báo tới tất cả admin có tin nhắn mới
                io.emit('customer-message-update', {
                    sessionId: sessionId,
                    lastMessage: content,
                    unreadCount: chat.unreadCount,
                    customer: chat.customer
                });
            }

            res.json({ success: true, message });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Gửi tin nhắn từ admin
    async sendAdminMessage(req, res) {
        try {
            const { sessionId } = req.params;
            const { content } = req.body;
            const adminId = req.session.user._id;

            const chat = await Chat.findOne({ sessionId });
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            if (!chat.assignedAdmin) {
                chat.assignedAdmin = adminId;
            }

            const message = await Message.create({
                chatId: chat._id,
                content,
                sender: 'admin',
                senderId: adminId
            });

            // Cập nhật thông tin chat
            chat.lastMessage = content;
            chat.unreadCount = 0; // Reset vì admin đã trả lời
            await chat.save();

            // Gửi tin nhắn qua Socket.IO
            const io = req.app.get('io');
            if (io) {
                io.to(sessionId).emit('new-message', {
                    ...message.toObject(),
                    sessionId: sessionId
                });
            }

            res.json({ success: true, message });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Lấy danh sách chat cho admin
    async getAdminChats(req, res) {
        try {
            const chats = await Chat.find()
                .sort({ updatedAt: -1 })
                .populate('assignedAdmin', 'name email');
            
            // Thêm thông tin lastMessageTime cho frontend
            const chatsWithTime = chats.map(chat => ({
                ...chat.toObject(),
                lastMessageTime: chat.updatedAt
            }));
            
            res.json({ success: true, chats: chatsWithTime });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Lấy chi tiết một phiên chat
    async getChatDetail(req, res) {
        try {
            const { sessionId } = req.params;
            const chat = await Chat.findOne({ sessionId })
                .populate('assignedAdmin', 'name email');
            
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            const messages = await Message.find({ chatId: chat._id })
                .sort({ createdAt: 1 });

            res.json({ success: true, chat, messages });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Đánh dấu tin nhắn đã đọc
    async markAsRead(req, res) {
        try {
            const { sessionId } = req.params;
            const chat = await Chat.findOne({ sessionId });
            
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            // Reset unread count
            chat.unreadCount = 0;
            await chat.save();

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Cập nhật trạng thái chat
    async updateChatStatus(req, res) {
        try {
            const { sessionId } = req.params;
            const { status } = req.body;

            const chat = await Chat.findOne({ sessionId });
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            chat.status = status;
            await chat.save();

            res.json({ success: true, chat });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = chatController;
