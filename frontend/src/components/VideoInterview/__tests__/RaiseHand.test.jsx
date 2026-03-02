import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RaiseHand from '../RaiseHand';

// Mock useApp hook
const mockUseApp = vi.fn();
vi.mock('../../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

// Mock socket
const createMockSocket = () => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
});

// Wrapper مع AppContext
const renderWithContext = (component, language = 'ar') => {
  // Mock useApp to return the specified language
  mockUseApp.mockReturnValue({
    language,
    setLanguage: vi.fn(),
    audioEnabled: true,
    musicEnabled: true,
    notificationsEnabled: false,
    isAuthLoading: false,
    isSettingsLoading: false,
    isAppLoading: false,
  });

  return render(component);
};

describe('RaiseHand Component', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = createMockSocket();
  });

  describe('Rendering', () => {
    it('يعرض زر رفع اليد', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      expect(button).toBeInTheDocument();
    });

    it('يعرض أيقونة اليد', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const handIcon = screen.getByRole('img', { name: /hand/i });
      expect(handIcon).toBeInTheDocument();
      expect(handIcon).toHaveTextContent('✋');
    });

    it('لا يعرض قائمة الأيدي المرفوعة للمشاركين', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      expect(screen.queryByText(/الأيدي المرفوعة/i)).not.toBeInTheDocument();
    });
  });

  describe('Raise Hand Functionality', () => {
    it('يرسل حدث raise-hand عند النقر على الزر', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      fireEvent.click(button);

      expect(mockSocket.emit).toHaveBeenCalledWith('raise-hand', { roomId: 'test-room' });
    });

    it('يغير النص إلى "خفض اليد" بعد رفع اليد', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      fireEvent.click(button);

      expect(screen.getByRole('button', { name: /خفض اليد/i })).toBeInTheDocument();
    });

    it('يرسل حدث lower-hand عند خفض اليد', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      
      // رفع اليد
      fireEvent.click(button);
      
      // خفض اليد
      const lowerButton = screen.getByRole('button', { name: /خفض اليد/i });
      fireEvent.click(lowerButton);

      expect(mockSocket.emit).toHaveBeenCalledWith('lower-hand', { roomId: 'test-room' });
    });

    it('يضيف class "hand-raised" عند رفع اليد', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      fireEvent.click(button);

      expect(button).toHaveClass('hand-raised');
    });
  });

  describe('Socket Events', () => {
    it('يستمع لحدث hand-raised', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="user1"
          currentUserName="Host"
        />
      );

      expect(mockSocket.on).toHaveBeenCalledWith('hand-raised', expect.any(Function));
    });

    it('يستمع لحدث hand-lowered', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="user1"
          currentUserName="Host"
        />
      );

      expect(mockSocket.on).toHaveBeenCalledWith('hand-lowered', expect.any(Function));
    });

    it('يستمع لحدث user-left', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="user1"
          currentUserName="Host"
        />
      );

      expect(mockSocket.on).toHaveBeenCalledWith('user-left', expect.any(Function));
    });

    it('يزيل المستمعين عند unmount', () => {
      const { unmount } = renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="user1"
          currentUserName="Host"
        />
      );

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('hand-raised');
      expect(mockSocket.off).toHaveBeenCalledWith('hand-lowered');
      expect(mockSocket.off).toHaveBeenCalledWith('user-left');
    });
  });

  describe('Host View', () => {
    it('يعرض قائمة الأيدي المرفوعة للمضيف', async () => {
      const { rerender } = renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      // محاكاة حدث hand-raised
      const handRaisedCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'hand-raised'
      )[1];

      handRaisedCallback({
        socketId: 'socket2',
        userId: 'user2',
        userName: 'User 2',
        raisedAt: new Date().toISOString(),
      });

      rerender(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/الأيدي المرفوعة/i)).toBeInTheDocument();
        expect(screen.getByText('User 2')).toBeInTheDocument();
      });
    });

    it('يعرض عدد الأيدي المرفوعة', async () => {
      const { rerender } = renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      // محاكاة حدثين hand-raised
      const handRaisedCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'hand-raised'
      )[1];

      handRaisedCallback({
        socketId: 'socket2',
        userId: 'user2',
        userName: 'User 2',
        raisedAt: new Date().toISOString(),
      });

      handRaisedCallback({
        socketId: 'socket3',
        userId: 'user3',
        userName: 'User 3',
        raisedAt: new Date().toISOString(),
      });

      rerender(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      await waitFor(() => {
        const countBadge = screen.getByText('2');
        expect(countBadge).toBeInTheDocument();
      });
    });
  });

  describe('Multilingual Support', () => {
    it('يعرض النصوص بالإنجليزية', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />,
        'en'
      );

      expect(screen.getByRole('button', { name: /raise hand/i })).toBeInTheDocument();
    });

    it('يعرض النصوص بالفرنسية', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />,
        'fr'
      );

      expect(screen.getByRole('button', { name: /lever la main/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('لا يرسل أحداث إذا لم يكن socket موجوداً', () => {
      renderWithContext(
        <RaiseHand
          socket={null}
          roomId="test-room"
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      fireEvent.click(button);

      // لا يجب أن يتم استدعاء emit
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('لا يرسل أحداث إذا لم يكن roomId موجوداً', () => {
      renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId={null}
          isHost={false}
          currentUserId="user1"
          currentUserName="Test User"
        />
      );

      const button = screen.getByRole('button', { name: /رفع اليد/i });
      fireEvent.click(button);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('يزيل المستخدم من القائمة عند مغادرته', async () => {
      const { rerender } = renderWithContext(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      // محاكاة hand-raised
      const handRaisedCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'hand-raised'
      )[1];

      handRaisedCallback({
        socketId: 'socket2',
        userId: 'user2',
        userName: 'User 2',
        raisedAt: new Date().toISOString(),
      });

      rerender(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('User 2')).toBeInTheDocument();
      });

      // محاكاة user-left
      const userLeftCallback = mockSocket.on.mock.calls.find(
        call => call[0] === 'user-left'
      )[1];

      userLeftCallback({ userId: 'user2' });

      rerender(
        <RaiseHand
          socket={mockSocket}
          roomId="test-room"
          isHost={true}
          currentUserId="host1"
          currentUserName="Host"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('User 2')).not.toBeInTheDocument();
      });
    });
  });
});
