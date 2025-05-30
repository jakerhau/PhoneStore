const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Liên kết với phiên chat
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    // Nội dung tin nhắn
    content: {
        type: String,
        required: true
    },
    // Người gửi (customer hoặc admin)
    sender: {
        type: String,
        enum: ['customer', 'admin'],
        required: true
    },
    // ID của người gửi (nếu là admin)
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Trạng thái tin nhắn
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    // Thời gian gửi
    createdAt: {
        type: Date,
        default: Date.now
    }
});

messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
