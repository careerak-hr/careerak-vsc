/**
 * اختبارات ميزات المضيف في SignalingService
 * Requirements: 7.4, 7.5
 */

const SignalingService = require('../src/services/signalingService');

describe('SignalingService - ميزات المضيف', () => {
  let signalingService;
  let mockIo;
  let mockSocket;
  let mockTargetSocket;

  beforeEach(() => {
    // Mock Socket.IO
    mockSocket = {
      id: 'host-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn(() => mockSocket),
      on: jest.fn()
    };

    mockTargetSocket = {
      id: 'participant-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn(() => mockTargetSocket)
    };

    mockIo = {
      on: jest.fn((event, handler) => {
        if (event === 'connection') {
          handler(mockSocket);
        }
      }),
      to: jest.fn(() => mockIo),
      emit: jest.fn()
    };

    signalingService = new SignalingService(mockIo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMuteAll - كتم الجميع', () => {
    beforeEach(() => {
      // إنشاء غرفة مع مضيف ومشاركين
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      // إضافة مشارك
      signalingService.rooms.get('test-room').participants.set('participant-1', {
        userId: 'user-1',
        userName: 'Participant 1',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });

      signalingService.rooms.get('test-room').participants.set('participant-2', {
        userId: 'user-2',
        userName: 'Participant 2',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });
    });

    test('يجب أن يكتم جميع المشاركين (ما عدا المضيف)', () => {
      signalingService.handleMuteAll(mockSocket, { roomId: 'test-room' });

      const room = signalingService.rooms.get('test-room');
      const participants = Array.from(room.participants.values());

      // التحقق من أن جميع المشاركين (ما عدا المضيف) تم كتمهم
      participants.forEach(participant => {
        if (!participant.isHost) {
          expect(participant.audioEnabled).toBe(false);
        } else {
          expect(participant.audioEnabled).toBe(true);
        }
      });
    });

    test('يجب أن يرسل حدث "all-muted" لجميع المشاركين', () => {
      signalingService.handleMuteAll(mockSocket, { roomId: 'test-room' });

      expect(mockIo.to).toHaveBeenCalledWith('test-room');
      expect(mockIo.emit).toHaveBeenCalledWith('all-muted', {
        byUserId: 'host-user-id',
        byUserName: 'Host User'
      });
    });

    test('يجب أن يرفض الطلب إذا لم يكن المستخدم هو المضيف', () => {
      const nonHostSocket = {
        ...mockSocket,
        id: 'participant-1'
      };

      signalingService.handleMuteAll(nonHostSocket, { roomId: 'test-room' });

      expect(nonHostSocket.emit).toHaveBeenCalledWith('action-rejected', {
        reason: 'Only the host can mute all participants'
      });
    });

    test('يجب أن يرفض الطلب إذا لم يكن المستخدم في الغرفة', () => {
      const unknownSocket = {
        ...mockSocket,
        id: 'unknown-socket-id'
      };

      signalingService.handleMuteAll(unknownSocket, { roomId: 'test-room' });

      expect(unknownSocket.emit).toHaveBeenCalledWith('action-rejected', {
        reason: 'You are not in this room'
      });
    });

    test('يجب أن يتعامل مع غرفة غير موجودة', () => {
      // إنشاء socket جديد لهذا الاختبار
      const freshSocket = {
        id: 'fresh-socket-id',
        emit: jest.fn(),
        to: jest.fn(() => ({ emit: jest.fn() })),
        broadcast: {
          to: jest.fn(() => ({ emit: jest.fn() }))
        }
      };

      signalingService.handleMuteAll(freshSocket, { roomId: 'non-existent-room' });

      // لا يجب أن يحدث أي خطأ
      expect(freshSocket.emit).not.toHaveBeenCalled();
    });

    test('يجب أن يحافظ على حالة الصوت للمضيف', () => {
      signalingService.handleMuteAll(mockSocket, { roomId: 'test-room' });

      const room = signalingService.rooms.get('test-room');
      const host = room.participants.get('host-socket-id');

      expect(host.audioEnabled).toBe(true);
    });
  });

  describe('handleRemoveParticipant - إزالة مشارك', () => {
    beforeEach(() => {
      // إنشاء غرفة مع مضيف ومشاركين
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      signalingService.rooms.get('test-room').participants.set('participant-1', {
        userId: 'user-1',
        userName: 'Participant 1',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });
    });

    test('يجب أن يزيل المشارك من الغرفة', () => {
      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      const room = signalingService.rooms.get('test-room');
      expect(room.participants.has('participant-1')).toBe(false);
    });

    test('يجب أن يرسل حدث "removed-from-room" للمشارك المستهدف', () => {
      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      expect(mockIo.to).toHaveBeenCalledWith('participant-1');
      expect(mockIo.emit).toHaveBeenCalledWith('removed-from-room', {
        roomId: 'test-room',
        byUserId: 'host-user-id',
        byUserName: 'Host User',
        reason: 'Removed by host'
      });
    });

    test('يجب أن يرسل حدث "user-removed" لباقي المشاركين', () => {
      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      expect(mockSocket.to).toHaveBeenCalledWith('test-room');
      expect(mockSocket.to().emit).toHaveBeenCalledWith('user-removed', expect.objectContaining({
        socketId: 'participant-1',
        userId: 'user-1',
        userName: 'Participant 1',
        byUserId: 'host-user-id'
      }));
    });

    test('يجب أن يرفض الطلب إذا لم يكن المستخدم هو المضيف', () => {
      const nonHostSocket = {
        ...mockSocket,
        id: 'participant-1'
      };

      signalingService.handleRemoveParticipant(nonHostSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-2'
      });

      expect(nonHostSocket.emit).toHaveBeenCalledWith('action-rejected', {
        reason: 'Only the host can remove participants'
      });
    });

    test('يجب أن يرفض الطلب إذا لم يكن المستخدم في الغرفة', () => {
      const unknownSocket = {
        ...mockSocket,
        id: 'unknown-socket-id',
        emit: jest.fn()
      };

      signalingService.handleRemoveParticipant(unknownSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      expect(unknownSocket.emit).toHaveBeenCalledWith('action-rejected', {
        reason: 'You are not in this room'
      });
    });

    test('يجب أن يتعامل مع غرفة غير موجودة', () => {
      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'non-existent-room',
        targetSocketId: 'participant-1'
      });

      // لا يجب أن يحدث أي خطأ
      expect(mockIo.to).not.toHaveBeenCalled();
    });

    test('يجب أن يتعامل مع مشارك غير موجود', () => {
      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'non-existent-participant'
      });

      // لا يجب أن يحدث أي خطأ
      expect(mockIo.to).not.toHaveBeenCalled();
    });

    test('يجب أن يحدّث عدد المشاركين بعد الإزالة', () => {
      const initialCount = signalingService.rooms.get('test-room').participants.size;

      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      const finalCount = signalingService.rooms.get('test-room').participants.size;
      expect(finalCount).toBe(initialCount - 1);
    });
  });

  describe('التحقق من صلاحيات المضيف', () => {
    test('يجب أن يتحقق من hostId عند إنشاء الغرفة', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'new-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      const room = signalingService.rooms.get('new-room');
      expect(room.hostId).toBe('host-user-id');
    });

    test('يجب أن يحافظ على hostId عند انضمام مشاركين جدد', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      const participantSocket = {
        ...mockSocket,
        id: 'participant-socket-id',
        join: jest.fn(),
        emit: jest.fn(),
        to: jest.fn(() => participantSocket)
      };

      signalingService.handleJoinRoom(participantSocket, {
        roomId: 'test-room',
        userId: 'participant-user-id',
        userName: 'Participant User',
        maxParticipants: 10,
        isHost: false
      });

      const room = signalingService.rooms.get('test-room');
      expect(room.hostId).toBe('host-user-id');
    });

    test('يجب أن يتحقق من userId مقابل hostId عند كتم الجميع', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      const participantSocket = {
        ...mockSocket,
        id: 'participant-socket-id',
        emit: jest.fn()
      };

      signalingService.rooms.get('test-room').participants.set('participant-socket-id', {
        userId: 'participant-user-id',
        userName: 'Participant User',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });

      signalingService.handleMuteAll(participantSocket, { roomId: 'test-room' });

      expect(participantSocket.emit).toHaveBeenCalledWith('action-rejected', {
        reason: 'Only the host can mute all participants'
      });
    });

    test('يجب أن يتحقق من userId مقابل hostId عند إزالة مشارك', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      const participantSocket = {
        ...mockSocket,
        id: 'participant-socket-id',
        emit: jest.fn()
      };

      signalingService.rooms.get('test-room').participants.set('participant-socket-id', {
        userId: 'participant-user-id',
        userName: 'Participant User',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });

      signalingService.handleRemoveParticipant(participantSocket, {
        roomId: 'test-room',
        targetSocketId: 'another-participant'
      });

      expect(participantSocket.emit).toHaveBeenCalledWith('action-rejected', {
        reason: 'Only the host can remove participants'
      });
    });
  });

  describe('سيناريوهات متقدمة', () => {
    test('يجب أن يكتم جميع المشاركين حتى لو كان بعضهم مكتوماً بالفعل', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      signalingService.rooms.get('test-room').participants.set('participant-1', {
        userId: 'user-1',
        userName: 'Participant 1',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: false, // مكتوم بالفعل
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });

      signalingService.rooms.get('test-room').participants.set('participant-2', {
        userId: 'user-2',
        userName: 'Participant 2',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });

      signalingService.handleMuteAll(mockSocket, { roomId: 'test-room' });

      const room = signalingService.rooms.get('test-room');
      const participant1 = room.participants.get('participant-1');
      const participant2 = room.participants.get('participant-2');

      expect(participant1.audioEnabled).toBe(false);
      expect(participant2.audioEnabled).toBe(false);
    });

    test('يجب أن يزيل المشارك حتى لو كان يشارك الشاشة', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      signalingService.rooms.get('test-room').participants.set('participant-1', {
        userId: 'user-1',
        userName: 'Participant 1',
        joinedAt: new Date(),
        handRaised: false,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: true, // يشارك الشاشة
        isHost: false
      });

      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      const room = signalingService.rooms.get('test-room');
      expect(room.participants.has('participant-1')).toBe(false);
    });

    test('يجب أن يزيل المشارك حتى لو كان قد رفع يده', () => {
      signalingService.handleJoinRoom(mockSocket, {
        roomId: 'test-room',
        userId: 'host-user-id',
        userName: 'Host User',
        maxParticipants: 10,
        isHost: true
      });

      signalingService.rooms.get('test-room').participants.set('participant-1', {
        userId: 'user-1',
        userName: 'Participant 1',
        joinedAt: new Date(),
        handRaised: true, // رفع يده
        handRaisedAt: new Date(),
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false,
        isHost: false
      });

      signalingService.handleRemoveParticipant(mockSocket, {
        roomId: 'test-room',
        targetSocketId: 'participant-1'
      });

      const room = signalingService.rooms.get('test-room');
      expect(room.participants.has('participant-1')).toBe(false);
    });
  });
});
