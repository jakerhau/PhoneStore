const socketIO = require('socket.io');

function initializeSocket(server) {
    const io = socketIO(server);

    // Lưu trữ các kết nối socket
    const connectedUsers = new Map();
    const adminSockets = new Set();

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Xử lý khi khách hàng tham gia chat
        socket.on('join-chat', (sessionId) => {
            socket.join(sessionId);
            connectedUsers.set(socket.id, { sessionId, type: 'customer' });
            console.log(`Customer joined chat: ${sessionId}`);
        });

        // Xử lý khi admin tham gia
        socket.on('admin-join', (adminId) => {
            socket.join(`admin-${adminId}`);
            adminSockets.add(socket.id);
            connectedUsers.set(socket.id, { adminId, type: 'admin' });
            console.log(`Admin joined: ${adminId}`);
        });

        // Xử lý khi admin join vào một chat cụ thể
        socket.on('admin-join-chat', (sessionId) => {
            socket.join(sessionId);
            const userInfo = connectedUsers.get(socket.id);
            if (userInfo) {
                userInfo.currentSessionId = sessionId;
            }
            console.log(`Admin joined chat room: ${sessionId}`);
        });

        // Xử lý tin nhắn mới (legacy support)
        socket.on('send-message', async (data) => {
            const { sessionId, message } = data;
            io.to(sessionId).emit('new-message', message);
        });

        // Xử lý trạng thái đang nhập từ customer
        socket.on('typing-start', (sessionId) => {
            if (sessionId) {
                socket.to(sessionId).emit('typing-start', sessionId);
            }
        });

        socket.on('typing-stop', (sessionId) => {
            if (sessionId) {
                socket.to(sessionId).emit('typing-stop', sessionId);
            }
        });

        // Xử lý trạng thái đang nhập từ admin
        socket.on('admin-typing-start', (sessionId) => {
            if (sessionId) {
                socket.to(sessionId).emit('admin-typing-start', sessionId);
            }
        });

        socket.on('admin-typing-stop', (sessionId) => {
            if (sessionId) {
                socket.to(sessionId).emit('admin-typing-stop', sessionId);
            }
        });

        // Xử lý ngắt kết nối
        socket.on('disconnect', () => {
            const userInfo = connectedUsers.get(socket.id);
            if (userInfo) {
                if (userInfo.type === 'customer' && userInfo.sessionId) {
                    console.log(`Customer disconnected from chat: ${userInfo.sessionId}`);
                } else if (userInfo.type === 'admin') {
                    console.log(`Admin disconnected: ${userInfo.adminId}`);
                    adminSockets.delete(socket.id);
                }
                connectedUsers.delete(socket.id);
            }
        });

        // Heartbeat để maintain connection
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    return io;
}

module.exports = initializeSocket;