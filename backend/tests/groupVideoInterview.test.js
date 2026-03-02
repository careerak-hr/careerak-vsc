/**
 * اختبارات المقابلات الجماعية
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * Property 8: Participant Limit
 */

const SignalingService = require('../src/services/signalingService');
const VideoInterview = require('../src/models/VideoInterview');

describe('Group Video Interview Tests', () => {
  let signalingService;
  let mockIo;
  let mockSockets;

  beforeEach(() => {
    // إنشاء mock Socket.IO
    mockSockets = [];
    mockIo = {
      on: jest.fn((event, handler) => {
        if (event === 'connection') {
          // محاكاة اتصال socket
          mockSockets.forEach(socket => handler(socket));
        }
      }),
      to: jest.fn(() => ({
        emit: jest.fn()
      }))
    };

    signalingService = new SignalingService(mockIo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test 1: دعم حتى 10 مشاركين
   * Property 8: Participant Limit
   */
  test('should support up to 10 participants', () => {
    const roomId = 'test-room-1';
    const maxParticipants = 10;

    // محاكاة 10 مشاركين
    for (let i = 1; i <= 10; i++) {
      const mockSocket = createMockSocket(`socket-${i}`);
      
      signalingService.handleJoinRoom(mockSocket, {
        roomId,
        userId: `user-${i}`,
        userName: `User ${i}`,
        maxParticipants
      });
    }

    const roomInfo = signalingService.getRoomInfo(roomId);
    expect(roomInfo).not.toBeNull();
    expect(roomInfo.participantCount).toBe(10);
    expect(roomInfo.participants).toHaveLength(10);
  });

  /**
   * Test 2: رفض المشارك الـ 11
   * Property 8: Participant Limit
   */
  test('should reject 11th participant', () => {
    const roomId = 'test-room-2';
    const maxParticipants = 10;

    // محاكاة 10 مشاركين
    for (let i = 1; i <= 10; i++) {
      const mockSocket = createMockSocket(`socket-${i}`);
      signalingService.handleJoinRoom(mockSocket, {
        roomId,
        userId: `user-${i}`,
        userName: `User ${i}`,
        maxParticipants
      });
    }

    // محاولة إضافة المشارك الـ 11
    const eleventhSocket = createMockSocket('socket-11');
    signalingService.handleJoinRoom(eleventhSocket, {
      roomId,
      userId: 'user-11',
      userName: 'User 11',
      maxParticipants
    });

    // التحقق من أن المشارك الـ 11 تم رفضه
    expect(eleventhSocket.emit).toHaveBeenCalledWith('room-full', expect.objectContaining({
      roomId,
      maxParticipants: 10,
      currentCount: 10
    }));

    const roomInfo = signalingService.getRoomInfo(roomId);
    expect(roomInfo.participantCount).toBe(10); // لا يزال 10
  });

  /**
   * Test 3: عرض شبكي (Grid View)
   */
  test('should organize participants in grid view', () => {
    const roomId = 'test-room-3';
    const participants = [];

    // إضافة 6 مشاركين
    for (let i = 1; i <= 6; i++) {
      const mockSocket = createMockSocket(`socket-${i}`);
      signalingService.handleJoinRoom(mockSocket, {
        roomId,
        userId: `user-${i}`,
        userName: `User ${i}`,
        maxParticipants: 10
      });
      participants.push({ socketId: `socket-${i}`, userId: `user-${i}` });
    }

    const roomInfo = signalingService.getRoomInfo(roomId);
    expect(roomInfo.participantCount).toBe(6);

    // حساب عدد الأعمدة للعرض الشبكي
    const getGridColumns = (count) => {
      if (count <= 2) return 2;
      if (count <= 4) return 2;
      if (count <= 6) return 3;
      if (count <= 9) return 3;
      return 4;
    };

    expect(getGridColumns(6)).toBe(3);
  });

  /**
   * Test 4: كتم الجميع (للمضيف فقط)
   * Requirement 7.4
   */
  test('should allow host to mute all participants', () => {
    const roomId = 'test-room-4';
    const hostId = 'host-user';
    const hostSocket = createMockSocket('host-socket');

    // إضافة المضيف
    signalingService.handleJoinRoom(hostSocket, {
      roomId,
      userId: hostId,
      userName: 'Host',
      maxParticipants: 10,
      isHost: true
    });

    // إضافة 3 مشاركين
    for (let i = 1; i <= 3; i++) {
      const mockSocket = createMockSocket(`socket-${i}`);
      signalingService.handleJoinRoom(mockSocket, {
        roomId,
        userId: `user-${i}`,
        userName: `User ${i}`,
        maxParticipants: 10
      });
    }

    // المضيف يكتم الجميع
    signalingService.handleMuteAll(hostSocket, { roomId });

    // التحقق من إرسال حدث all-muted
    expect(mockIo.to).toHaveBeenCalledWith(roomId);
  });

  /**
   * Test 5: رفض كتم الجميع من غير المضيف
   * Requirement 7.4
   */
  test('should reject mute all from non-host', () => {
    const roomId = 'test-room-5';
    const hostId = 'host-user';
    const hostSocket = createMockSocket('host-socket');
    const participantSocket = createMockSocket('participant-socket');

    // إضافة المضيف
    signalingService.handleJoinRoom(hostSocket, {
      roomId,
      userId: hostId,
      userName: 'Host',
      maxParticipants: 10,
      isHost: true
    });

    // إضافة مشارك
    signalingService.handleJoinRoom(participantSocket, {
      roomId,
      userId: 'participant-user',
      userName: 'Participant',
      maxParticipants: 10
    });

    // مسح استدعاءات emit السابقة
    participantSocket.emit.mockClear();

    // المشارك يحاول كتم الجميع
    signalingService.handleMuteAll(participantSocket, { roomId });

    // التحقق من رفض الطلب
    expect(participantSocket.emit).toHaveBeenCalledWith('action-rejected', expect.objectContaining({
      reason: 'Only the host can mute all participants'
    }));
  });

  /**
   * Test 6: إزالة مشارك (للمضيف فقط)
   * Requirement 7.5
   */
  test('should allow host to remove participant', () => {
    const roomId = 'test-room-6';
    const hostId = 'host-user';
    const hostSocket = createMockSocket('host-socket');
    const participantSocket = createMockSocket('participant-socket');

    // إضافة المضيف
    signalingService.handleJoinRoom(hostSocket, {
      roomId,
      userId: hostId,
      userName: 'Host',
      maxParticipants: 10,
      isHost: true
    });

    // إضافة مشارك
    signalingService.handleJoinRoom(participantSocket, {
      roomId,
      userId: 'participant-user',
      userName: 'Participant',
      maxParticipants: 10
    });

    const roomInfoBefore = signalingService.getRoomInfo(roomId);
    expect(roomInfoBefore.participantCount).toBe(2);

    // المضيف يزيل المشارك
    signalingService.handleRemoveParticipant(hostSocket, {
      roomId,
      targetSocketId: 'participant-socket'
    });

    const roomInfoAfter = signalingService.getRoomInfo(roomId);
    expect(roomInfoAfter.participantCount).toBe(1);

    // التحقق من إرسال حدث removed-from-room للمشارك
    expect(mockIo.to).toHaveBeenCalledWith('participant-socket');
  });

  /**
   * Test 7: رفض إزالة مشارك من غير المضيف
   * Requirement 7.5
   */
  test('should reject remove participant from non-host', () => {
    const roomId = 'test-room-7';
    const hostId = 'host-user';
    const hostSocket = createMockSocket('host-socket');
    const participant1Socket = createMockSocket('participant1-socket');
    const participant2Socket = createMockSocket('participant2-socket');

    // إضافة المضيف
    signalingService.handleJoinRoom(hostSocket, {
      roomId,
      userId: hostId,
      userName: 'Host',
      maxParticipants: 10,
      isHost: true
    });

    // إضافة مشاركين
    signalingService.handleJoinRoom(participant1Socket, {
      roomId,
      userId: 'participant1-user',
      userName: 'Participant 1',
      maxParticipants: 10
    });

    signalingService.handleJoinRoom(participant2Socket, {
      roomId,
      userId: 'participant2-user',
      userName: 'Participant 2',
      maxParticipants: 10
    });

    // مسح استدعاءات emit السابقة
    participant1Socket.emit.mockClear();

    // المشارك 1 يحاول إزالة المشارك 2
    signalingService.handleRemoveParticipant(participant1Socket, {
      roomId,
      targetSocketId: 'participant2-socket'
    });

    // التحقق من رفض الطلب
    expect(participant1Socket.emit).toHaveBeenCalledWith('action-rejected', expect.objectContaining({
      reason: 'Only the host can remove participants'
    }));

    const roomInfo = signalingService.getRoomInfo(roomId);
    expect(roomInfo.participantCount).toBe(3); // لا يزال 3
  });

  /**
   * Test 8: تتبع حالة الصوت والفيديو
   */
  test('should track audio and video state for each participant', () => {
    const roomId = 'test-room-8';
    const mockSocket = createMockSocket('socket-1');

    signalingService.handleJoinRoom(mockSocket, {
      roomId,
      userId: 'user-1',
      userName: 'User 1',
      maxParticipants: 10
    });

    // تبديل الصوت
    signalingService.handleToggleAudio(mockSocket, { roomId, enabled: false });

    // تبديل الفيديو
    signalingService.handleToggleVideo(mockSocket, { roomId, enabled: false });

    const roomInfo = signalingService.getRoomInfo(roomId);
    const participant = roomInfo.participants[0];

    expect(participant.audioEnabled).toBe(false);
    expect(participant.videoEnabled).toBe(false);
  });

  /**
   * Test 9: تتبع مشاركة الشاشة
   * Property 5: Screen Share Exclusivity
   */
  test('should track screen sharing state', () => {
    const roomId = 'test-room-9';
    const socket1 = createMockSocket('socket-1');
    const socket2 = createMockSocket('socket-2');

    // إضافة مشاركين
    signalingService.handleJoinRoom(socket1, {
      roomId,
      userId: 'user-1',
      userName: 'User 1',
      maxParticipants: 10
    });

    signalingService.handleJoinRoom(socket2, {
      roomId,
      userId: 'user-2',
      userName: 'User 2',
      maxParticipants: 10
    });

    // المشارك 1 يبدأ مشاركة الشاشة
    signalingService.handleStartScreenShare(socket1, { roomId });

    let roomInfo = signalingService.getRoomInfo(roomId);
    let participant1 = roomInfo.participants.find(p => p.socketId === 'socket-1');
    expect(participant1.screenSharing).toBe(true);

    // المشارك 2 يحاول مشاركة الشاشة (يجب أن يُرفض)
    signalingService.handleStartScreenShare(socket2, { roomId });

    expect(socket2.emit).toHaveBeenCalledWith('screen-share-rejected', expect.objectContaining({
      reason: 'Someone else is already sharing their screen'
    }));

    roomInfo = signalingService.getRoomInfo(roomId);
    let participant2 = roomInfo.participants.find(p => p.socketId === 'socket-2');
    expect(participant2.screenSharing).toBe(false);
  });

  /**
   * Test 10: إحصائيات الغرفة
   */
  test('should provide room statistics', () => {
    const roomId = 'test-room-10';

    // إضافة 5 مشاركين
    for (let i = 1; i <= 5; i++) {
      const mockSocket = createMockSocket(`socket-${i}`);
      signalingService.handleJoinRoom(mockSocket, {
        roomId,
        userId: `user-${i}`,
        userName: `User ${i}`,
        maxParticipants: 10
      });
    }

    const roomInfo = signalingService.getRoomInfo(roomId);

    expect(roomInfo).toMatchObject({
      roomId,
      participantCount: 5,
      participants: expect.arrayContaining([
        expect.objectContaining({
          userId: expect.any(String),
          userName: expect.any(String),
          joinedAt: expect.any(Date),
          audioEnabled: true,
          videoEnabled: true,
          screenSharing: false
        })
      ]),
      createdAt: expect.any(Date)
    });
  });
});

/**
 * دالة مساعدة لإنشاء mock socket
 */
function createMockSocket(id) {
  return {
    id,
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => ({
      emit: jest.fn()
    })),
    on: jest.fn()
  };
}
