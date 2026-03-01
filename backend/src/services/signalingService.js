/**
 * Signaling Service
 * إدارة إشارات WebRTC باستخدام Socket.IO
 */

class SignalingService {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // تخزين الغرف النشطة
    this.setupSocketHandlers();
  }

  /**
   * إعداد معالجات Socket.IO
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // الانضمام لغرفة
      socket.on('join-room', (data) => this.handleJoinRoom(socket, data));

      // مغادرة غرفة
      socket.on('leave-room', (data) => this.handleLeaveRoom(socket, data));

      // إرسال SDP offer
      socket.on('offer', (data) => this.handleOffer(socket, data));

      // إرسال SDP answer
      socket.on('answer', (data) => this.handleAnswer(socket, data));

      // إرسال ICE candidate
      socket.on('ice-candidate', (data) => this.handleICECandidate(socket, data));

      // قطع الاتصال
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * معالجة الانضمام لغرفة
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, userId, userName}
   */
  handleJoinRoom(socket, data) {
    const { roomId, userId, userName } = data;

    // إنشاء الغرفة إذا لم تكن موجودة
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        participants: new Map(),
        createdAt: new Date()
      });
    }

    const room = this.rooms.get(roomId);

    // إضافة المشارك للغرفة
    room.participants.set(socket.id, {
      userId,
      userName,
      joinedAt: new Date()
    });

    // الانضمام للغرفة في Socket.IO
    socket.join(roomId);

    // إخبار المشاركين الآخرين
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName
    });

    // إرسال قائمة المشاركين الحاليين للمستخدم الجديد
    const participants = Array.from(room.participants.entries()).map(([socketId, data]) => ({
      socketId,
      ...data
    }));

    socket.emit('room-joined', {
      roomId,
      participants: participants.filter(p => p.socketId !== socket.id)
    });

    console.log(`User ${userId} joined room ${roomId}`);
  }

  /**
   * معالجة مغادرة غرفة
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId}
   */
  handleLeaveRoom(socket, data) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      // إزالة المشارك من الغرفة
      room.participants.delete(socket.id);

      // مغادرة الغرفة في Socket.IO
      socket.leave(roomId);

      // إخبار المشاركين الآخرين
      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        userId: participant.userId
      });

      // حذف الغرفة إذا أصبحت فارغة
      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
      }

      console.log(`User ${participant.userId} left room ${roomId}`);
    }
  }

  /**
   * معالجة SDP offer
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, targetSocketId, offer}
   */
  handleOffer(socket, data) {
    const { roomId, targetSocketId, offer } = data;

    // إرسال offer للمستخدم المستهدف
    this.io.to(targetSocketId).emit('offer', {
      fromSocketId: socket.id,
      offer
    });

    console.log(`Offer sent from ${socket.id} to ${targetSocketId} in room ${roomId}`);
  }

  /**
   * معالجة SDP answer
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, targetSocketId, answer}
   */
  handleAnswer(socket, data) {
    const { roomId, targetSocketId, answer } = data;

    // إرسال answer للمستخدم المستهدف
    this.io.to(targetSocketId).emit('answer', {
      fromSocketId: socket.id,
      answer
    });

    console.log(`Answer sent from ${socket.id} to ${targetSocketId} in room ${roomId}`);
  }

  /**
   * معالجة ICE candidate
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, targetSocketId, candidate}
   */
  handleICECandidate(socket, data) {
    const { roomId, targetSocketId, candidate } = data;

    // إرسال ICE candidate للمستخدم المستهدف
    this.io.to(targetSocketId).emit('ice-candidate', {
      fromSocketId: socket.id,
      candidate
    });
  }

  /**
   * معالجة قطع الاتصال
   * @param {Socket} socket - socket instance
   */
  handleDisconnect(socket) {
    // البحث عن الغرف التي كان المستخدم فيها
    this.rooms.forEach((room, roomId) => {
      if (room.participants.has(socket.id)) {
        const participant = room.participants.get(socket.id);

        // إزالة المشارك
        room.participants.delete(socket.id);

        // إخبار المشاركين الآخرين
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          userId: participant.userId
        });

        // حذف الغرفة إذا أصبحت فارغة
        if (room.participants.size === 0) {
          this.rooms.delete(roomId);
        }

        console.log(`User ${participant.userId} disconnected from room ${roomId}`);
      }
    });

    console.log('User disconnected:', socket.id);
  }

  /**
   * الحصول على معلومات غرفة
   * @param {string} roomId - معرف الغرفة
   * @returns {Object|null}
   */
  getRoomInfo(roomId) {
    if (!this.rooms.has(roomId)) {
      return null;
    }

    const room = this.rooms.get(roomId);
    return {
      roomId,
      participantCount: room.participants.size,
      participants: Array.from(room.participants.entries()).map(([socketId, data]) => ({
        socketId,
        ...data
      })),
      createdAt: room.createdAt
    };
  }

  /**
   * بث رسالة لجميع المشاركين في غرفة
   * @param {string} roomId - معرف الغرفة
   * @param {string} event - اسم الحدث
   * @param {Object} data - البيانات
   */
  broadcastToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * إرسال رسالة لمستخدم محدد
   * @param {string} socketId - معرف socket
   * @param {string} event - اسم الحدث
   * @param {Object} data - البيانات
   */
  sendToUser(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }
}

module.exports = SignalingService;
