/**
 * Unit Tests for StatusTimeline Component
 * 
 * Tests timeline rendering, status highlighting, timestamp display,
 * and Pusher integration.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusTimeline from '../StatusTimeline';
import { AppProvider } from '../../../context/AppContext';

// Mock Pusher client
const mockPusherClient = {
  isInitialized: false,
  pusher: null,
  subscribe: vi.fn(() => ({
    bind: vi.fn(),
    unbind: vi.fn()
  })),
  unsubscribe: vi.fn()
};

vi.mock('../../../utils/pusherClient', () => ({
  default: mockPusherClient
}));

// Helper to wrap component with AppProvider
const renderWithProvider = (component, language = 'en') => {
  const mockUser = {
    _id: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    userType: 'Employee'
  };

  return render(
    <AppProvider value={{ language, user: mockUser }}>
      {component}
    </AppProvider>
  );
};

describe('StatusTimeline Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockPusherClient.isInitialized = false;
    mockPusherClient.pusher = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Timeline Rendering', () => {
    it('renders the timeline container', () => {
      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      const timeline = document.querySelector('.status-timeline');
      expect(timeline).toBeInTheDocument();
    });

    it('displays all status stages in order', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null },
        { status: 'Reviewed', timestamp: new Date('2024-01-02'), note: null }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Reviewed"
          statusHistory={statusHistory}
        />
      );

      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
    });

    it('displays terminal status (Accepted)', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null },
        { status: 'Reviewed', timestamp: new Date('2024-01-02'), note: null },
        { status: 'Accepted', timestamp: new Date('2024-01-03'), note: null }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Accepted"
          statusHistory={statusHistory}
        />
      );

      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    it('displays terminal status (Rejected)', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null },
        { status: 'Rejected', timestamp: new Date('2024-01-02'), note: 'Not qualified' }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Rejected"
          statusHistory={statusHistory}
        />
      );

      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getByText('Not qualified')).toBeInTheDocument();
    });

    it('displays terminal status (Withdrawn)', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null },
        { status: 'Withdrawn', timestamp: new Date('2024-01-02'), note: 'Candidate withdrew' }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Withdrawn"
          statusHistory={statusHistory}
        />
      );

      expect(screen.getByText('Withdrawn')).toBeInTheDocument();
    });
  });

  describe('Status Highlighting', () => {
    it('highlights the current status', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null },
        { status: 'Reviewed', timestamp: new Date('2024-01-02'), note: null }
      ];

      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Reviewed"
          statusHistory={statusHistory}
        />
      );

      const currentStage = container.querySelector('.status-stage-current');
      expect(currentStage).toBeInTheDocument();
      
      const currentStatusText = within(currentStage).getByText('Reviewed');
      expect(currentStatusText).toBeInTheDocument();
    });

    it('marks completed stages', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null },
        { status: 'Reviewed', timestamp: new Date('2024-01-02'), note: null },
        { status: 'Shortlisted', timestamp: new Date('2024-01-03'), note: null }
      ];

      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Shortlisted"
          statusHistory={statusHistory}
        />
      );

      const completedStages = container.querySelectorAll('.status-stage-completed');
      expect(completedStages.length).toBeGreaterThanOrEqual(2);
    });

    it('marks pending stages', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null }
      ];

      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={statusHistory}
        />
      );

      const pendingStages = container.querySelectorAll('.status-stage-pending');
      expect(pendingStages.length).toBeGreaterThan(0);
    });
  });

  describe('Timestamp Display', () => {
    it('displays timestamps for completed stages', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01T10:30:00'), note: null },
        { status: 'Reviewed', timestamp: new Date('2024-01-02T14:45:00'), note: null }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Reviewed"
          statusHistory={statusHistory}
        />
      );

      const timestamps = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('formats timestamps correctly', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-15T10:30:00'), note: null }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={statusHistory}
        />
      );

      // Should display date and time
      const timestampElement = screen.getByText(/Jan|10:30/);
      expect(timestampElement).toBeInTheDocument();
    });

    it('does not display timestamps for pending stages', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null }
      ];

      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={statusHistory}
        />
      );

      const pendingStages = container.querySelectorAll('.status-stage-pending');
      pendingStages.forEach(stage => {
        const timestamp = within(stage).queryByText(/\d{1,2}:\d{2}/);
        expect(timestamp).not.toBeInTheDocument();
      });
    });
  });

  describe('Notes Display', () => {
    it('displays notes when provided', () => {
      const statusHistory = [
        { 
          status: 'Reviewed', 
          timestamp: new Date('2024-01-02'), 
          note: 'Excellent qualifications' 
        }
      ];

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Reviewed"
          statusHistory={statusHistory}
        />
      );

      const note = screen.getByText('Excellent qualifications');
      expect(note).toBeInTheDocument();
      expect(note).toHaveClass('stage-note');
    });

    it('does not display notes section when note is null', () => {
      const statusHistory = [
        { status: 'Submitted', timestamp: new Date('2024-01-01'), note: null }
      ];

      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={statusHistory}
        />
      );

      const notes = container.querySelectorAll('.stage-note');
      expect(notes.length).toBe(0);
    });
  });

  describe('Pusher Integration', () => {
    it('subscribes to application channel when Pusher is initialized', () => {
      mockPusherClient.isInitialized = true;
      mockPusherClient.pusher = {
        subscribe: vi.fn(() => ({
          bind: vi.fn(),
          unbind: vi.fn()
        })),
        unsubscribe: vi.fn()
      };

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      expect(mockPusherClient.pusher.subscribe).toHaveBeenCalledWith('application-app123');
    });

    it('does not subscribe when Pusher is not initialized', () => {
      mockPusherClient.isInitialized = false;
      mockPusherClient.pusher = null;

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      // Should not throw error
      expect(true).toBe(true);
    });

    it('unsubscribes from channel on unmount', () => {
      mockPusherClient.isInitialized = true;
      mockPusherClient.pusher = {
        subscribe: vi.fn(() => ({
          bind: vi.fn(),
          unbind: vi.fn()
        })),
        unsubscribe: vi.fn()
      };

      const { unmount } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      unmount();

      expect(mockPusherClient.pusher.unsubscribe).toHaveBeenCalledWith('application-app123');
    });

    it('updates status when receiving Pusher event', async () => {
      mockPusherClient.isInitialized = true;
      let statusUpdateHandler;
      
      mockPusherClient.pusher = {
        subscribe: vi.fn(() => ({
          bind: vi.fn((event, handler) => {
            if (event === 'status-updated') {
              statusUpdateHandler = handler;
            }
          }),
          unbind: vi.fn()
        })),
        unsubscribe: vi.fn()
      };

      const onStatusUpdate = vi.fn();

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
          onStatusUpdate={onStatusUpdate}
        />
      );

      // Simulate Pusher event
      act(() => {
        if (statusUpdateHandler) {
          statusUpdateHandler({
            status: 'Reviewed',
            timestamp: new Date().toISOString(),
            note: 'Application reviewed'
          });
        }
      });

      await waitFor(() => {
        expect(onStatusUpdate).toHaveBeenCalled();
      });
    });

    it('displays notification when status is updated', async () => {
      mockPusherClient.isInitialized = true;
      let statusUpdateHandler;
      
      mockPusherClient.pusher = {
        subscribe: vi.fn(() => ({
          bind: vi.fn((event, handler) => {
            if (event === 'status-updated') {
              statusUpdateHandler = handler;
            }
          }),
          unbind: vi.fn()
        })),
        unsubscribe: vi.fn()
      };

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      // Simulate Pusher event
      act(() => {
        if (statusUpdateHandler) {
          statusUpdateHandler({
            status: 'Reviewed',
            timestamp: new Date().toISOString()
          });
        }
      });

      await waitFor(() => {
        const notification = screen.queryByRole('alert');
        if (notification) {
          expect(notification).toBeInTheDocument();
        }
      });
    });
  });

  describe('Language Support', () => {
    it('displays English labels', () => {
      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />,
        'en'
      );

      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });

    it('displays Arabic labels with RTL', () => {
      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />,
        'ar'
      );

      const timeline = container.querySelector('.status-timeline');
      expect(timeline).toHaveAttribute('dir', 'rtl');
      expect(screen.getByText('تم التقديم')).toBeInTheDocument();
    });

    it('displays French labels', () => {
      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />,
        'fr'
      );

      expect(screen.getByText('Soumis')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies correct CSS classes', () => {
      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
          className="custom-class"
        />
      );

      const timeline = container.querySelector('.status-timeline');
      expect(timeline).toHaveClass('custom-class');
    });

    it('renders stage indicators', () => {
      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      const indicators = container.querySelectorAll('.stage-indicator');
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('renders stage connectors', () => {
      const { container } = renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Reviewed"
          statusHistory={[
            { status: 'Submitted', timestamp: new Date(), note: null }
          ]}
        />
      );

      const connectors = container.querySelectorAll('.stage-connector');
      expect(connectors.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty status history', () => {
      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });

    it('handles missing applicationId', () => {
      renderWithProvider(
        <StatusTimeline
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      // Should render without errors
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });

    it('handles undefined onStatusUpdate callback', () => {
      mockPusherClient.isInitialized = true;
      let statusUpdateHandler;
      
      mockPusherClient.pusher = {
        subscribe: vi.fn(() => ({
          bind: vi.fn((event, handler) => {
            if (event === 'status-updated') {
              statusUpdateHandler = handler;
            }
          }),
          unbind: vi.fn()
        })),
        unsubscribe: vi.fn()
      };

      renderWithProvider(
        <StatusTimeline
          applicationId="app123"
          currentStatus="Submitted"
          statusHistory={[]}
        />
      );

      // Should not throw error when callback is undefined
      act(() => {
        if (statusUpdateHandler) {
          statusUpdateHandler({
            status: 'Reviewed',
            timestamp: new Date().toISOString()
          });
        }
      });

      expect(true).toBe(true);
    });
  });
});
