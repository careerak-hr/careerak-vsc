const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }
  
  // تهيئة Socket.IO
  initialize(server) {
    // ملاحظة: يحتاج تثبيت socket.io أولاً
    // npm install socket.io
    
    try {
      const socketIO = require('socket.io');
      
      this.io = socketIO(server, {
        cors: {
          origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://careerak-vsc.vercel.app',
            'https://careerak.vercel.app'
          ],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });
      
      // Middleware للمصادقة
      this.io.use(async (socket, next) => {
        try {
          const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
          
          if (!token) {
            return next(new Error('Authentication error'));
          }
          
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
          socket.userId = decoded.id;
          next();
          
        } catch (error) {
          logger.error('Socket authentication error:', error);
          next(new Error('Authentication error'));
        }
      });
      
      // معالجة الاتصالات
      this.io.on('connection', (socket) => {
        this.handleConnection(socket);
      });
      
      logger.info('Socket.IO initialized successfully');
      
    } catch (error) {
      logger.warn('Socket.IO not available. Install with: npm install socket.io');
      logger.warn('Chat will work without real-time features');
    }
  }
  
  // معالجة اتصال جديد
  handleConnection(socket) {
    const userId = socket.userId;
    
    logger.info(`User connected: ${userId} (socket: ${socket.id})`);
    
    // حفظ معلومات الاتصال
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);
    
    // إرسال حالة "متصل" للمستخدمين الآخرين
    this.broadcastUserStatus(userId, 'online');
    
    // الانضمام لغرفة المستخدم الخاصة
    socket.join(`user:${userId}`);
    
    // معالجة الأحداث
    socket.on('join_conversation', (conversationId) => {
      this.handleJoinConversation(socket, conversationId);
    });
    
    socket.on('leave_conversation', (conversationId) => {
      this.handleLeaveConversation(socket, conversationId);
    });
    
    socket.on('send_message', (data) => {
      this.handleSendMessage(socket, data);
    });
    
    socket.on('typing', (data) => {
      this.handleTyping(socket, data);
    });
    
    socket.on('stop_typing', (data) => {
      this.handleStopTyping(socket, data);
    });
    
    socket.on('message_read', (data) => {
      this.handleMessageRead(socket, data);
    });
    
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }
  
  // الانضمام لمحادثة
  handleJoinConversation(socket, conversationId) {
    socket.join(`conversation:${conversationId}`);
    logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
  }
  
  // مغادرة محادثة
  handleLeaveConversation(socket, conversationId) {
    socket.leave(`conversation:${conversationId}`);
    logger.info(`User ${socket.userId} left conversation ${conversationId}`);
  }
  
  // إرسال رسالة
  handleSendMessage(socket, data) {
    const { conversationId, message } = data;
    
    // إرسال الرسالة لجميع المشاركين في المحادثة
    this.io.to(`conversation:${conversationId}`).emit('new_message', {
      conversationId,
      message
    });
    
    logger.info(`Message sent in conversation ${conversationId}`);
  }
  
  // المستخدم يكتب
  handleTyping(socket, data) {
    const { conversationId } = data;
    
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId: socket.userId
    });
  }
  
  // المستخدم توقف عن الكتابة
  handleStopTyping(socket, data) {
    const { conversationId } = data;
    
    socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
      conversationId,
      userId: socket.userId
    });
  }
  
  // تم قراءة الرسالة
  handleMessageRead(socket, data) {
    const { conversationId, messageId } = data;
    
    socket.to(`conversation:${conversationId}`).emit('message_read', {
      conversationId,
      messageId,
      userId: socket.userId
    });
  }
  
  // قطع الاتصال
  handleDisconnect(socket) {
    const userId = socket.userId;
    
    logger.info(`User disconnected: ${userId} (socket: ${socket.id})`);
    
    // حذف معلومات الاتصال
    this.connectedUsers.delete(userId);
    this.userSockets.delete(socket.id);
    
    // إرسال حالة "غير متصل" للمستخدمين الآخرين
    this.broadcastUserStatus(userId, 'offline', new Date());
  }
  
  // إرسال حالة المستخدم
  broadcastUserStatus(userId, status, lastSeen = null) {
    if (!this.io) return;
    
    this.io.emit('user_status_changed', {
      userId,
      status,
      lastSeen
    });
  }
  
  // إرسال إشعار لمستخدم معين
  sendNotificationToUser(userId, notification) {
    if (!this.io) return;
    
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit('notification', notification);
    }
  }
  
  // إرسال رسالة لمحادثة
  sendMessageToConversation(conversationId, message) {
    if (!this.io) return;
    
    this.io.to(`conversation:${conversationId}`).emit('new_message', {
      conversationId,
      message
    });
  }
  
  // التحقق من اتصال المستخدم
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
  
  // الحصول على عدد المستخدمين المتصلين
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }
  
  // الحصول على قائمة المستخدمين المتصلين
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}

module.exports = new SocketService();
