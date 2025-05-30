const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // ID phiên chat duy nhất
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    // Thông tin khách hàng ẩn danh
    customer: {
        // Có thể lưu thông tin cơ bản nếu khách hàng cung cấp
        name: String,
        email: String,
        phone: String
    },
    // Trạng thái chat
    status: {
        type: String,
        enum: ['active', 'closed', 'pending'],
        default: 'active'
    },
    // Admin đang phụ trách chat
    assignedAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastMessage: {
        type: String,
        default: ''
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    // Thời gian tạo và cập nhật
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Tự động cập nhật updatedAt
chatSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

chatSchema.index({ sessionId: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ assignedAdmin: 1 });

// Thêm phương thức tiện ích
chatSchema.methods.getUnreadCount = async function() {
    return await Message.countDocuments({
        chatId: this._id,
        sender: 'customer',
        status: 'sent'
    });
};

module.exports = mongoose.model('Chat', chatSchema);
