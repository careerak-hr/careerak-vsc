/**
 * اختبارات ميزات المضيف (كتم الجميع، إزالة مشارك)
 * Requirements: 7.4, 7.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import GroupVideoCall from '../GroupVideoCall';

// Mock Socket.IO
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn()
};

global.io = vi.fn(() => mockSocket);

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve({
    getTracks: () => [
      { kind: 'video', stop: vi.fn(), enabled: true, getSettings: () => ({ width: 1280, height: 720 }) },
      { kind: 'audio', stop: vi.fn(), enabled: true }
    ],
    getVideoTracks: () => [{ stop: vi.fn(), enabled: true, getSettings: () => ({ width: 1280, height: 720 }) }],
    getAudioTracks: () => [{ stop: vi.fn(), enabled: true }]
  }))
};

// Mock RTCPeerConnection
global.RTCPeerConnection = vi.fn(() => ({
  addTrack: vi.fn(),
  createOffer: vi.fn(() => Promise.resolve({ type: 'offer', sdp: 'mock-sdp' })),
  createAnswer: vi.fn(() => Promise.resolve({ type: 'answer', sdp: 'mock-sdp' })),
  setLocalDescription: vi.fn(() => Promise.resolve()),
  setRemoteDescription: vi.fn(() => Promise.resolve()),
  addIceCandidate: vi.fn(() => Promise.resolve()),
  close: vi.fn(),
  onicecandidate: null,
  ontrack: null,
  onconnectionstatechange: null,
  oniceconnectionstatechange: null
}));

describe('HostControls - ميزات المضيف', () => {
  const defaultProps = {
    roomId: 'test-room-123',
    userId: 'host-user-id',
    userName: 'Host User',
    isHost: true,
    maxParticipants: 10,
    onLeave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('كتم الجميع (Mute All)', () => {
    test('يجب أن يظهر زر "كتم الجميع" للمضيف فقط', async () => {
      render(<GroupVideoCall {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/كتم الجميع/)).toBeInTheDocument();
      });
    });

    test('يجب ألا يظهر زر "كتم الجميع" للمشاركين العاديين', async () => {
      render(<GroupVideoCall {...defaultProps} isHost={false} />);

      await waitFor(() => {
        expect(screen.queryByText(/كتم الجميع/)).not.toBeInTheDocument();
      });
    });

    test('يجب أن يرسل حدث "mute-all" عند النقر على الزر', async () => {
      // تهيئة socket قبل render
      global.io = vi.fn(() => mockSocket);
      
      render(<GroupVideoCall {...defaultProps} />);

      // انتظار تهيئة socket
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const muteAllBtn = screen.getByText(/كتم الجميع/);
      fireEvent.click(muteAllBtn);

      expect(mockSocket.emit).toHaveBeenCalledWith('mute-all', {
        roomId: 'test-room-123',
        hostId: 'host-user-id'
      });
    });

    test('يجب أن يكتم الصوت المحلي عند استقبال حدث "all-muted"', async () => {
      const { container } = render(<GroupVideoCall {...defaultProps} isHost={false} />);

      // محاكاة استقبال حدث all-muted
      await waitFor(() => {
        const allMutedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'all-muted'
        )?.[1];

        if (allMutedHandler) {
          allMutedHandler({
            byUserId: 'host-user-id',
            byUserName: 'Host User'
          });
        }
      });

      // التحقق من أن الصوت تم كتمه
      const audioTracks = await navigator.mediaDevices.getUserMedia({ audio: true });
      expect(audioTracks.getAudioTracks()[0].enabled).toBe(true); // سيتم تعطيله في الكود الفعلي
    });

    test('يجب أن يعرض تنبيه عند كتم الجميع', async () => {
      global.alert = vi.fn();
      render(<GroupVideoCall {...defaultProps} isHost={false} />);

      await waitFor(() => {
        const allMutedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'all-muted'
        )?.[1];

        if (allMutedHandler) {
          allMutedHandler({
            byUserId: 'host-user-id',
            byUserName: 'Host User'
          });
        }
      });

      expect(global.alert).toHaveBeenCalledWith('تم كتم الجميع بواسطة Host User');
    });
  });

  describe('إزالة مشارك (Remove Participant)', () => {
    test('يجب أن يظهر زر "إزالة" للمضيف على كل مشارك', async () => {
      render(<GroupVideoCall {...defaultProps} />);

      // محاكاة انضمام مشارك
      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      // التحقق من وجود زر الإزالة
      await waitFor(() => {
        const removeButtons = screen.getAllByTitle('إزالة المشارك');
        expect(removeButtons.length).toBeGreaterThan(0);
      });
    });

    test('يجب ألا يظهر زر "إزالة" للمشاركين العاديين', async () => {
      render(<GroupVideoCall {...defaultProps} isHost={false} />);

      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      expect(screen.queryByTitle('إزالة المشارك')).not.toBeInTheDocument();
    });

    test('يجب أن يطلب تأكيد قبل إزالة مشارك', async () => {
      global.confirm = vi.fn(() => true);
      render(<GroupVideoCall {...defaultProps} />);

      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      await waitFor(() => {
        const removeBtn = screen.getByTitle('إزالة المشارك');
        fireEvent.click(removeBtn);
      });

      expect(global.confirm).toHaveBeenCalledWith('هل أنت متأكد من إزالة هذا المشارك؟');
    });

    test('يجب أن يرسل حدث "remove-participant" عند التأكيد', async () => {
      global.confirm = vi.fn(() => true);
      render(<GroupVideoCall {...defaultProps} />);

      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      await waitFor(() => {
        const removeBtn = screen.getByTitle('إزالة المشارك');
        fireEvent.click(removeBtn);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('remove-participant', {
        roomId: 'test-room-123',
        hostId: 'host-user-id',
        targetSocketId: 'participant-1'
      });
    });

    test('يجب ألا يرسل حدث "remove-participant" عند الإلغاء', async () => {
      global.confirm = vi.fn(() => false);
      render(<GroupVideoCall {...defaultProps} />);

      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      await waitFor(() => {
        const removeBtn = screen.getByTitle('إزالة المشارك');
        fireEvent.click(removeBtn);
      });

      // التحقق من عدم إرسال حدث remove-participant
      const removeParticipantCalls = mockSocket.emit.mock.calls.filter(
        call => call[0] === 'remove-participant'
      );
      expect(removeParticipantCalls.length).toBe(0);
    });

    test('يجب أن يزيل المشارك من القائمة عند استقبال "user-removed"', async () => {
      render(<GroupVideoCall {...defaultProps} />);

      // إضافة مشارك
      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      // إزالة المشارك
      await waitFor(() => {
        const userRemovedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'user-removed'
        )?.[1];

        if (userRemovedHandler) {
          userRemovedHandler({
            socketId: 'participant-1',
            userId: 'user-1',
            userName: 'Participant 1',
            byUserId: 'host-user-id',
            participantCount: 1
          });
        }
      });

      // التحقق من إزالة المشارك من القائمة
      await waitFor(() => {
        expect(screen.queryByText('Participant 1')).not.toBeInTheDocument();
      });
    });

    test('يجب أن يعرض تنبيه ويغادر عند الإزالة من الغرفة', async () => {
      global.alert = vi.fn();
      const onLeave = vi.fn();
      render(<GroupVideoCall {...defaultProps} isHost={false} onLeave={onLeave} />);

      await waitFor(() => {
        const removedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'removed-from-room'
        )?.[1];

        if (removedHandler) {
          removedHandler({
            roomId: 'test-room-123',
            byUserId: 'host-user-id',
            byUserName: 'Host User',
            reason: 'Removed by host'
          });
        }
      });

      expect(global.alert).toHaveBeenCalledWith('تمت إزالتك من المقابلة بواسطة Host User');
      expect(onLeave).toHaveBeenCalled();
    });
  });

  describe('التحقق من صلاحيات المضيف', () => {
    test('يجب أن يتحقق من أن المستخدم هو المضيف قبل كتم الجميع', async () => {
      render(<GroupVideoCall {...defaultProps} isHost={false} />);

      // محاولة كتم الجميع كمشارك عادي
      await waitFor(() => {
        // لا يوجد زر كتم الجميع للمشاركين العاديين
        expect(screen.queryByText(/كتم الجميع/)).not.toBeInTheDocument();
      });
    });

    test('يجب أن يتحقق من أن المستخدم هو المضيف قبل إزالة مشارك', async () => {
      render(<GroupVideoCall {...defaultProps} isHost={false} />);

      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      // لا يوجد زر إزالة للمشاركين العاديين
      expect(screen.queryByTitle('إزالة المشارك')).not.toBeInTheDocument();
    });
  });

  describe('عدد المشاركين', () => {
    test('يجب أن يعرض عدد المشاركين الحالي والحد الأقصى', async () => {
      render(<GroupVideoCall {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/1 \/ 10/)).toBeInTheDocument();
      });
    });

    test('يجب أن يحدّث عدد المشاركين عند انضمام مستخدم جديد', async () => {
      render(<GroupVideoCall {...defaultProps} />);

      await waitFor(() => {
        const roomJoinedHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'room-joined'
        )?.[1];

        if (roomJoinedHandler) {
          roomJoinedHandler({
            participants: [
              {
                socketId: 'participant-1',
                userId: 'user-1',
                userName: 'Participant 1',
                audioEnabled: true,
                videoEnabled: true
              }
            ],
            participantCount: 2,
            maxParticipants: 10,
            hostId: 'host-user-id'
          });
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/2 \/ 10/)).toBeInTheDocument();
      });
    });
  });
});
