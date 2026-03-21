/**
 * Tests for Internal Sharing Workflow
 * Validates: Requirement 5 (Internal Sharing via Chat), Requirement 16 (Share Notifications)
 *
 * Tests cover:
 *  - chatService.sendMessage with type 'shared_content'
 *  - Notification sent to recipient when content is shared
 *  - shareService.recordShare with shareMethod 'internal_chat'
 *  - shareService.generateShareLink for internal_chat (no UTM params)
 */

jest.mock('../src/models/Conversation');
jest.mock('../src/models/Message');
jest.mock('../src/models/Notification');
jest.mock('../src/models/NotificationPreference');
jest.mock('../src/models/Share');
jest.mock('../src/models/ShareAnalytics');
jest.mock('../src/models/UserSettings');
jest.mock('../src/services/pusherService');
jest.mock('../src/models/User', () => ({
  User: {
    findById: jest.fn(),
  },
}));

const chatService = require('../src/services/chatService');
const shareService = require('../src/services/shareService');
const notificationService = require('../src/services/notificationService');

const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');
const Notification = require('../src/models/Notification');
const NotificationPreference = require('../src/models/NotificationPreference');
const Share = require('../src/models/Share');
const ShareAnalytics = require('../src/models/ShareAnalytics');
const pusherService = require('../src/services/pusherService');
const { User } = require('../src/models/User');

const CONTENT_ID = '64a1b2c3d4e5f6a7b8c9d0e1';
const SENDER_ID = '64a1b2c3d4e5f6a7b8c9d0e2';
const RECIPIENT_ID = '64a1b2c3d4e5f6a7b8c9d0e3';
const CONV_ID = '64a1b2c3d4e5f6a7b8c9d0e4';

// ─── shareService - generateShareLink for internal_chat ──────────────────────

describe('shareService.generateShareLink - internal_chat', () => {
  test('returns no UTM params for internal_chat', () => {
    const result = shareService.generateShareLink('job', CONTENT_ID, 'internal_chat');
    expect(result.utmParams).toBeNull();
    expect(result.url).toBe(`https://careerak.com/job-postings/${CONTENT_ID}`);
    expect(result.url).not.toContain('utm_');
  });

  test('returns correct URL for course internal_chat', () => {
    const result = shareService.generateShareLink('course', CONTENT_ID, 'internal_chat');
    expect(result.url).toBe(`https://careerak.com/courses/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
  });

  test('returns correct URL for profile internal_chat', () => {
    const result = shareService.generateShareLink('profile', CONTENT_ID, 'internal_chat');
    expect(result.url).toBe(`https://careerak.com/profile/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
  });

  test('returns correct URL for company internal_chat', () => {
    const result = shareService.generateShareLink('company', CONTENT_ID, 'internal_chat');
    expect(result.url).toBe(`https://careerak.com/companies/${CONTENT_ID}`);
    expect(result.utmParams).toBeNull();
  });
});

// ─── shareService - recordShare with internal_chat ───────────────────────────

describe('shareService.recordShare - internal_chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('records share with internal_chat method', async () => {
    const mockSaved = { _id: 'share1', contentType: 'job', shareMethod: 'internal_chat' };
    const mockShareInstance = { save: jest.fn().mockResolvedValue(mockSaved) };
    Share.mockImplementation(() => mockShareInstance);
    ShareAnalytics.incrementShare = jest.fn().mockResolvedValue({});

    const result = await shareService.recordShare({
      contentType: 'job',
      contentId: CONTENT_ID,
      userId: SENDER_ID,
      shareMethod: 'internal_chat',
    });

    expect(mockShareInstance.save).toHaveBeenCalledTimes(1);
    expect(ShareAnalytics.incrementShare).toHaveBeenCalledWith('job', CONTENT_ID, 'internal_chat');
    expect(result).toEqual(mockSaved);
  });

  test('throws error for invalid shareMethod', async () => {
    await expect(
      shareService.recordShare({
        contentType: 'job',
        contentId: CONTENT_ID,
        shareMethod: 'invalid_method',
      })
    ).rejects.toThrow('Invalid shareMethod: invalid_method');
  });
});

// ─── chatService.sendMessage - shared_content type ───────────────────────────

describe('chatService.sendMessage - shared_content', () => {
  let mockConversation;
  let mockMessage;
  let mockSender;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConversation = {
      _id: CONV_ID,
      participants: [
        { user: { toString: () => SENDER_ID }, role: 'individual', unreadCount: 0 },
        { user: { toString: () => RECIPIENT_ID }, role: 'individual', unreadCount: 0 },
      ],
      lastMessage: null,
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    mockMessage = {
      _id: 'msg1',
      conversation: CONV_ID,
      sender: SENDER_ID,
      type: 'shared_content',
      content: 'https://careerak.com/job-postings/job123',
      sharedContent: {
        contentType: 'job',
        contentId: 'job123',
        title: 'Software Engineer',
        url: 'https://careerak.com/job-postings/job123',
      },
      createdAt: new Date(),
    };

    mockSender = {
      _id: SENDER_ID,
      firstName: 'Alice',
      lastName: 'Smith',
      companyName: null,
    };

    Conversation.findById = jest.fn().mockResolvedValue(mockConversation);
    Message.create = jest.fn().mockResolvedValue(mockMessage);

    // Mock User.findById for sender lookup
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockSender),
    });

    // Mock notification service
    Notification.create = jest.fn().mockResolvedValue({ _id: 'notif1' });
    NotificationPreference.findOne = jest.fn().mockResolvedValue({
      preferences: {
        system: { enabled: true, push: false },
      },
      quietHours: { enabled: false },
      pushSubscriptions: [],
      save: jest.fn(),
    });

    // Mock pusher
    pusherService.sendNewMessage = jest.fn().mockResolvedValue(true);
    pusherService.isEnabled = jest.fn().mockReturnValue(false);
    pusherService.sendNotificationToUser = jest.fn().mockResolvedValue(true);
  });

  test('creates message with type shared_content', async () => {
    const result = await chatService.sendMessage({
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      type: 'shared_content',
      content: 'https://careerak.com/job-postings/job123',
      sharedContent: {
        contentType: 'job',
        contentId: 'job123',
        title: 'Software Engineer',
        url: 'https://careerak.com/job-postings/job123',
      },
    });

    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'shared_content',
        sharedContent: expect.objectContaining({
          contentType: 'job',
          contentId: 'job123',
          title: 'Software Engineer',
        }),
      })
    );
    expect(result.type).toBe('shared_content');
  });

  test('stores sharedContent data in the message', async () => {
    await chatService.sendMessage({
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      type: 'shared_content',
      sharedContent: {
        contentType: 'course',
        contentId: 'course456',
        title: 'React Fundamentals',
        url: 'https://careerak.com/courses/course456',
      },
    });

    const createCall = Message.create.mock.calls[0][0];
    expect(createCall.sharedContent.contentType).toBe('course');
    expect(createCall.sharedContent.contentId).toBe('course456');
    expect(createCall.sharedContent.title).toBe('React Fundamentals');
  });

  test('sends notification to recipient when content is shared', async () => {
    await chatService.sendMessage({
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      type: 'shared_content',
      sharedContent: {
        contentType: 'job',
        contentId: 'job123',
        title: 'Software Engineer',
        url: 'https://careerak.com/job-postings/job123',
      },
    });

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: expect.anything(),
        type: 'system',
        title: expect.stringContaining('رسالة'),
        message: expect.stringContaining('Alice Smith'),
      })
    );
  });

  test('throws error when conversation not found', async () => {
    Conversation.findById = jest.fn().mockResolvedValue(null);

    await expect(
      chatService.sendMessage({
        conversationId: 'nonexistent',
        senderId: SENDER_ID,
        type: 'shared_content',
        sharedContent: { contentType: 'job', contentId: 'job123', url: 'https://careerak.com/job-postings/job123' },
      })
    ).rejects.toThrow('Conversation not found');
  });

  test('throws error when sender is not a participant', async () => {
    const outsiderId = '64a1b2c3d4e5f6a7b8c9d0ff';
    await expect(
      chatService.sendMessage({
        conversationId: CONV_ID,
        senderId: outsiderId,
        type: 'shared_content',
        sharedContent: { contentType: 'job', contentId: 'job123', url: 'https://careerak.com/job-postings/job123' },
      })
    ).rejects.toThrow('User is not a participant in this conversation');
  });

  test('updates conversation lastMessage after sending shared content', async () => {
    await chatService.sendMessage({
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      type: 'shared_content',
      sharedContent: {
        contentType: 'job',
        contentId: 'job123',
        title: 'Software Engineer',
        url: 'https://careerak.com/job-postings/job123',
      },
    });

    expect(mockConversation.save).toHaveBeenCalled();
    expect(mockConversation.lastMessage).toBeDefined();
    expect(mockConversation.lastMessage.type).toBe('shared_content');
  });

  test('increments unread count for recipient', async () => {
    await chatService.sendMessage({
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      type: 'shared_content',
      sharedContent: {
        contentType: 'job',
        contentId: 'job123',
        url: 'https://careerak.com/job-postings/job123',
      },
    });

    const recipientParticipant = mockConversation.participants.find(
      (p) => p.user.toString() === RECIPIENT_ID
    );
    expect(recipientParticipant.unreadCount).toBe(1);
  });

  test('sends real-time message via pusher', async () => {
    await chatService.sendMessage({
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      type: 'shared_content',
      sharedContent: {
        contentType: 'job',
        contentId: 'job123',
        url: 'https://careerak.com/job-postings/job123',
      },
    });

    expect(pusherService.sendNewMessage).toHaveBeenCalledWith(CONV_ID, mockMessage);
  });
});

// ─── notificationService - share notification ────────────────────────────────

describe('notificationService - share notification', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
    NotificationPreference.create = jest.fn().mockResolvedValue({
      preferences: {
        system: { enabled: true, push: false },
      },
      quietHours: { enabled: false },
      pushSubscriptions: [],
      save: jest.fn(),
    });

    Notification.create = jest.fn().mockResolvedValue({
      _id: 'notif1',
      recipient: RECIPIENT_ID,
      type: 'system',
      title: 'رسالة جديدة 💬',
      message: 'رسالة جديدة من Alice Smith',
    });
  });

  test('creates notification with recipient, type, title, and message', async () => {
    const result = await notificationService.createNotification({
      recipient: RECIPIENT_ID,
      type: 'system',
      title: 'رسالة جديدة 💬',
      message: 'رسالة جديدة من Alice Smith',
      relatedData: { conversation: CONV_ID },
      priority: 'high',
    });

    expect(Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: RECIPIENT_ID,
        type: 'system',
        title: 'رسالة جديدة 💬',
        message: 'رسالة جديدة من Alice Smith',
        relatedData: { conversation: CONV_ID },
        priority: 'high',
      })
    );
    expect(result).toBeDefined();
  });

  test('returns null when notification type is disabled in preferences', async () => {
    NotificationPreference.findOne = jest.fn().mockResolvedValue({
      preferences: {
        system: { enabled: false, push: false },
      },
      quietHours: { enabled: false },
      pushSubscriptions: [],
    });

    const result = await notificationService.createNotification({
      recipient: RECIPIENT_ID,
      type: 'system',
      title: 'Test',
      message: 'Test message',
    });

    expect(result).toBeNull();
    expect(Notification.create).not.toHaveBeenCalled();
  });

  test('creates default preferences when none exist', async () => {
    NotificationPreference.findOne = jest.fn().mockResolvedValue(null);

    await notificationService.createNotification({
      recipient: RECIPIENT_ID,
      type: 'system',
      title: 'Test',
      message: 'Test message',
    });

    expect(NotificationPreference.create).toHaveBeenCalledWith({ user: RECIPIENT_ID });
  });
});
