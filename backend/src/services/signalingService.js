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

      // رفع اليد
      socket.on('raise-hand', (data) => this.handleRaiseHand(socket, data));

      // خفض اليد
      socket.on('lower-hand', (data) => this.handleLowerHand(socket, data));

      // تبديل الصوت
      socket.on('toggle-audio', (data) => this.handleToggleAudio(socket, data));

      // تبديل الفيديو
      socket.on('toggle-video', (data) => this.handleToggleVideo(socket, data));

      // بدء مشاركة الشاشة
      socket.on('start-screen-share', (data) => this.handleStartScreenShare(socket, data));

      // إيقاف مشاركة الشاشة
      socket.on('stop-screen-share', (data) => this.handleStopScreenShare(socket, data));

      // كتم الجميع (للمضيف فقط)
      socket.on('mute-all', (data) => this.handleMuteAll(socket, data));

      // إزالة مشارك (للمضيف فقط)
      socket.on('remove-participant', (data) => this.handleRemoveParticipant(socket, data));

      // قطع الاتصال
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  /**
   * معالجة الانضمام لغرفة
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, userId, userName, maxParticipants, isHost}
   */
  async handleJoinRoom(socket, data) {
    const { roomId, userId, userName, maxParticipants = 10, isHost = false } = data;

    // إنشاء الغرفة إذا لم تكن موجودة
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        participants: new Map(),
        maxParticipants: maxParticipants,
        hostId: isHost ? userId : null, // تعيين المضيف عند إنشاء الغرفة
        createdAt: new Date()
      });
    }

    const room = this.rooms.get(roomId);

    // تعيين المضيف إذا لم يكن محدداً بعد
    if (!room.hostId && isHost) {
      room.hostId = userId;
    }

    // التحقق من الحد الأقصى للمشاركين (Property 8)
    if (room.participants.size >= room.maxParticipants) {
      socket.emit('room-full', {
        roomId,
        maxParticipants: room.maxParticipants,
        currentCount: room.participants.size
      });
      console.log(`Room ${roomId} is full. User ${userId} rejected.`);
      return;
    }

    // إضافة المشارك للغرفة
    room.participants.set(socket.id, {
      userId,
      userName,
      joinedAt: new Date(),
      handRaised: false,
      handRaisedAt: null,
      audioEnabled: true,
      videoEnabled: true,
      screenSharing: false,
      isHost: isHost || userId === room.hostId
    });

    // الانضمام للغرفة في Socket.IO
    socket.join(roomId);

    // إخبار المشاركين الآخرين
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName,
      participantCount: room.participants.size
    });

    // إرسال قائمة المشاركين الحاليين للمستخدم الجديد
    const participants = Array.from(room.participants.entries()).map(([socketId, data]) => ({
      socketId,
      ...data
    }));

    socket.emit('room-joined', {
      roomId,
      participants: participants.filter(p => p.socketId !== socket.id),
      participantCount: room.participants.size,
      maxParticipants: room.maxParticipants,
      hostId: room.hostId
    });

    console.log(`User ${userId} joined room ${roomId} (${room.participants.size}/${room.maxParticipants})`);
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
   * معالجة رفع اليد
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId}
   */
  handleRaiseHand(socket, data) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      // تحديث حالة رفع اليد
      participant.handRaised = true;
      participant.handRaisedAt = new Date();

      // إخبار جميع المشاركين
      this.io.to(roomId).emit('hand-raised', {
        socketId: socket.id,
        userId: participant.userId,
        userName: participant.userName,
        raisedAt: participant.handRaisedAt
      });

      console.log(`User ${participant.userId} raised hand in room ${roomId}`);
    }
  }

  /**
   * معالجة خفض اليد
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId}
   */
  handleLowerHand(socket, data) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      // تحديث حالة رفع اليد
      participant.handRaised = false;
      participant.handRaisedAt = null;

      // إخبار جميع المشاركين
      this.io.to(roomId).emit('hand-lowered', {
        socketId: socket.id,
        userId: participant.userId,
        userName: participant.userName
      });

      console.log(`User ${participant.userId} lowered hand in room ${roomId}`);
    }
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
          userId: participant.userId,
          participantCount: room.participants.size
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
   * معالجة تبديل الصوت
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, enabled}
   */
  handleToggleAudio(socket, data) {
    const { roomId, enabled } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      participant.audioEnabled = enabled;

      // إخبار جميع المشاركين
      this.io.to(roomId).emit('audio-toggled', {
        socketId: socket.id,
        userId: participant.userId,
        enabled
      });
    }
  }

  /**
   * معالجة تبديل الفيديو
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, enabled}
   */
  handleToggleVideo(socket, data) {
    const { roomId, enabled } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      participant.videoEnabled = enabled;

      // إخبار جميع المشاركين
      this.io.to(roomId).emit('video-toggled', {
        socketId: socket.id,
        userId: participant.userId,
        enabled
      });
    }
  }

  /**
   * معالجة بدء مشاركة الشاشة
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId}
   */
  handleStartScreenShare(socket, data) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      // التحقق من عدم وجود مشارك آخر يشارك الشاشة (Property 5)
      const someoneSharing = Array.from(room.participants.values()).some(
        p => p.screenSharing && p.userId !== participant.userId
      );

      if (someoneSharing) {
        socket.emit('screen-share-rejected', {
          reason: 'Someone else is already sharing their screen'
        });
        return;
      }

      participant.screenSharing = true;

      // إخبار جميع المشاركين
      this.io.to(roomId).emit('screen-share-started', {
        socketId: socket.id,
        userId: participant.userId,
        userName: participant.userName
      });

      console.log(`User ${participant.userId} started screen sharing in room ${roomId}`);
    }
  }

  /**
   * معالجة إيقاف مشاركة الشاشة
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId}
   */
  handleStopScreenShare(socket, data) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room.participants.get(socket.id);

    if (participant) {
      participant.screenSharing = false;

      // إخبار جميع المشاركين
      this.io.to(roomId).emit('screen-share-stopped', {
        socketId: socket.id,
        userId: participant.userId,
        userName: participant.userName
      });

      console.log(`User ${participant.userId} stopped screen sharing in room ${roomId}`);
    }
  }

  /**
   * معالجة كتم الجميع (للمضيف فقط)
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId}
   */
  handleMuteAll(socket, data) {
    const { roomId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const requester = room.participants.get(socket.id);

    // التحقق من أن المستخدم موجود في الغرفة
    if (!requester) {
      socket.emit('action-rejected', {
        reason: 'You are not in this room'
      });
      return;
    }

    // التحقق من أن المستخدم هو المضيف الحقيقي للغرفة
    if (requester.userId !== room.hostId) {
      socket.emit('action-rejected', {
        reason: 'Only the host can mute all participants'
      });
      return;
    }

    // كتم جميع المشاركين (ما عدا المضيف)
    room.participants.forEach((participant, socketId) => {
      if (socketId !== socket.id) {
        participant.audioEnabled = false;
      }
    });

    // إخبار جميع المشاركين
    this.io.to(roomId).emit('all-muted', {
      byUserId: requester.userId,
      byUserName: requester.userName
    });

    console.log(`Host ${requester.userId} muted all participants in room ${roomId}`);
  }

  /**
   * معالجة إزالة مشارك (للمضيف فقط)
   * @param {Socket} socket - socket instance
   * @param {Object} data - {roomId, targetSocketId}
   */
  handleRemoveParticipant(socket, data) {
    const { roomId, targetSocketId } = data;

    if (!this.rooms.has(roomId)) {
      return;
    }

    const room = this.rooms.get(roomId);
    const requester = room.participants.get(socket.id);

    // التحقق من أن المستخدم موجود في الغرفة
    if (!requester) {
      socket.emit('action-rejected', {
        reason: 'You are not in this room'
      });
      return;
    }

    // التحقق من أن المستخدم هو المضيف الحقيقي للغرفة
    if (requester.userId !== room.hostId) {
      socket.emit('action-rejected', {
        reason: 'Only the host can remove participants'
      });
      return;
    }

    // التحقق من وجود المشارك المستهدف
    const targetParticipant = room.participants.get(targetSocketId);
    if (!targetParticipant) {
      return;
    }

    // إزالة المشارك
    room.participants.delete(targetSocketId);

    // إخبار المشارك المستهدف
    this.io.to(targetSocketId).emit('removed-from-room', {
      roomId,
      byUserId: requester.userId,
      byUserName: requester.userName,
      reason: 'Removed by host'
    });

    // إخبار باقي المشاركين
    socket.to(roomId).emit('user-removed', {
      socketId: targetSocketId,
      userId: targetParticipant.userId,
      userName: targetParticipant.userName,
      byUserId: requester.userId,
      participantCount: room.participants.size
    });

    console.log(`Host ${requester.userId} removed user ${targetParticipant.userId} from room ${roomId}`);
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
