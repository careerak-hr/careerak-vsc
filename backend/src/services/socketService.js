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
    
    // أحداث الدردشة أثناء مقابلة الفيديو
    socket.on('join_video_interview', (interviewId) => {
      this.handleJoinVideoInterview(socket, interviewId);
    });
    
    socket.on('leave_video_interview', (interviewId) => {
      this.handleLeaveVideoInterview(socket, interviewId);
    });
    
    socket.on('video_chat_message', (data) => {
      this.handleVideoChatMessage(socket, data);
    });
    
    socket.on('video_chat_typing', (data) => {
      this.handleVideoChatTyping(socket, data);
    });
    
    socket.on('video_chat_stop_typing', (data) => {
      this.handleVideoChatStopTyping(socket, data);
    });
    
    // === أحداث WebRTC Signaling ===
    socket.on('webrtc:join_room', (data) => {
      this.handleWebRTCJoinRoom(socket, data);
    });
    
    socket.on('webrtc:leave_room', (data) => {
      this.handleWebRTCLeaveRoom(socket, data);
    });
    
    socket.on('webrtc:offer', (data) => {
      this.handleWebRTCOffer(socket, data);
    });
    
    socket.on('webrtc:answer', (data) => {
      this.handleWebRTCAnswer(socket, data);
    });
    
    socket.on('webrtc:ice_candidate', (data) => {
      this.handleWebRTCIceCandidate(socket, data);
    });
    
    socket.on('webrtc:screen_share_start', (data) => {
      this.handleScreenShareStart(socket, data);
    });
    
    socket.on('webrtc:screen_share_stop', (data) => {
      this.handleScreenShareStop(socket, data);
    });
    
    socket.on('webrtc:recording_start', (data) => {
      this.handleRecordingStart(socket, data);
    });
    
    socket.on('webrtc:recording_stop', (data) => {
      this.handleRecordingStop(socket, data);
    });
    
    socket.on('webrtc:connection_quality', (data) => {
      this.handleConnectionQuality(socket, data);
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
  
  // === أحداث الدردشة أثناء مقابلة الفيديو ===
  
  // الانضمام لمقابلة فيديو
  handleJoinVideoInterview(socket, interviewId) {
    socket.join(`video_interview:${interviewId}`);
    logger.info(`User ${socket.userId} joined video interview ${interviewId}`);
  }
  
  // مغادرة مقابلة فيديو
  handleLeaveVideoInterview(socket, interviewId) {
    socket.leave(`video_interview:${interviewId}`);
    logger.info(`User ${socket.userId} left video interview ${interviewId}`);
  }
  
  // إرسال رسالة دردشة أثناء الفيديو
  handleVideoChatMessage(socket, data) {
    const { interviewId, message } = data;
    
    // إرسال الرسالة لجميع المشاركين في المقابلة
    this.io.to(`video_interview:${interviewId}`).emit('video_chat_message', {
      interviewId,
      message
    });
    
    logger.info(`Video chat message sent in interview ${interviewId}`);
  }
  
  // المستخدم يكتب في دردشة الفيديو
  handleVideoChatTyping(socket, data) {
    const { interviewId, userId } = data;
    
    socket.to(`video_interview:${interviewId}`).emit('video_chat_typing', {
      interviewId,
      userId
    });
  }
  
  // المستخدم توقف عن الكتابة في دردشة الفيديو
  handleVideoChatStopTyping(socket, data) {
    const { interviewId, userId } = data;
    
    socket.to(`video_interview:${interviewId}`).emit('video_chat_stop_typing', {
      interviewId,
      userId
    });
  }
  
  // إرسال رسالة دردشة لمقابلة فيديو
  sendVideoChatMessage(interviewId, message) {
    if (!this.io) return;
    
    this.io.to(`video_interview:${interviewId}`).emit('video_chat_message', {
      interviewId,
      message
    });
  }
  
  // === معالجات WebRTC Signaling ===
  
  // الانضمام لغرفة WebRTC
  handleWebRTCJoinRoom(socket, data) {
    const { roomId, userId } = data;
    
    socket.join(`webrtc:${roomId}`);
    
    // إخبار المشاركين الآخرين بالانضمام
    socket.to(`webrtc:${roomId}`).emit('webrtc:user_joined', {
      roomId,
      userId: socket.userId,
      socketId: socket.id
    });
    
    logger.info(`User ${socket.userId} joined WebRTC room ${roomId}`);
  }
  
  // مغادرة غرفة WebRTC
  handleWebRTCLeaveRoom(socket, data) {
    const { roomId } = data;
    
    socket.leave(`webrtc:${roomId}`);
    
    // إخبار المشاركين الآخرين بالمغادرة
    socket.to(`webrtc:${roomId}`).emit('webrtc:user_left', {
      roomId,
      userId: socket.userId,
      socketId: socket.id
    });
    
    logger.info(`User ${socket.userId} left WebRTC room ${roomId}`);
  }
  
  // معالجة SDP Offer
  handleWebRTCOffer(socket, data) {
    const { roomId, targetSocketId, offer } = data;
    
    // إرسال الـ offer للمستخدم المستهدف
    this.io.to(targetSocketId).emit('webrtc:offer', {
      roomId,
      fromSocketId: socket.id,
      fromUserId: socket.userId,
      offer
    });
    
    logger.info(`WebRTC offer sent from ${socket.userId} to ${targetSocketId}`);
  }
  
  // معالجة SDP Answer
  handleWebRTCAnswer(socket, data) {
    const { roomId, targetSocketId, answer } = data;
    
    // إرسال الـ answer للمستخدم المستهدف
    this.io.to(targetSocketId).emit('webrtc:answer', {
      roomId,
      fromSocketId: socket.id,
      fromUserId: socket.userId,
      answer
    });
    
    logger.info(`WebRTC answer sent from ${socket.userId} to ${targetSocketId}`);
  }
  
  // معالجة ICE Candidate
  handleWebRTCIceCandidate(socket, data) {
    const { roomId, targetSocketId, candidate } = data;
    
    // إرسال الـ ICE candidate للمستخدم المستهدف
    this.io.to(targetSocketId).emit('webrtc:ice_candidate', {
      roomId,
      fromSocketId: socket.id,
      fromUserId: socket.userId,
      candidate
    });
  }
  
  // بدء مشاركة الشاشة
  handleScreenShareStart(socket, data) {
    const { roomId } = data;
    
    // إخبار جميع المشاركين ببدء مشاركة الشاشة
    socket.to(`webrtc:${roomId}`).emit('webrtc:screen_share_started', {
      roomId,
      userId: socket.userId,
      socketId: socket.id
    });
    
    logger.info(`User ${socket.userId} started screen sharing in room ${roomId}`);
  }
  
  // إيقاف مشاركة الشاشة
  handleScreenShareStop(socket, data) {
    const { roomId } = data;
    
    // إخبار جميع المشاركين بإيقاف مشاركة الشاشة
    socket.to(`webrtc:${roomId}`).emit('webrtc:screen_share_stopped', {
      roomId,
      userId: socket.userId,
      socketId: socket.id
    });
    
    logger.info(`User ${socket.userId} stopped screen sharing in room ${roomId}`);
  }
  
  // بدء التسجيل
  handleRecordingStart(socket, data) {
    const { roomId } = data;
    
    // إخبار جميع المشاركين ببدء التسجيل
    this.io.to(`webrtc:${roomId}`).emit('webrtc:recording_started', {
      roomId,
      userId: socket.userId
    });
    
    logger.info(`Recording started in room ${roomId} by ${socket.userId}`);
  }
  
  // إيقاف التسجيل
  handleRecordingStop(socket, data) {
    const { roomId } = data;
    
    // إخبار جميع المشاركين بإيقاف التسجيل
    this.io.to(`webrtc:${roomId}`).emit('webrtc:recording_stopped', {
      roomId,
      userId: socket.userId
    });
    
    logger.info(`Recording stopped in room ${roomId} by ${socket.userId}`);
  }
  
  // معالجة جودة الاتصال
  handleConnectionQuality(socket, data) {
    const { roomId, quality, stats } = data;
    
    // إرسال معلومات الجودة للمشاركين الآخرين
    socket.to(`webrtc:${roomId}`).emit('webrtc:connection_quality_update', {
      roomId,
      userId: socket.userId,
      quality,
      stats
    });
  }
  
  // === نهاية معالجات WebRTC ===
  
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
