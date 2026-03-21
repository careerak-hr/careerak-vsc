/**
 * Tests for ContactSelector component
 * Validates: Requirement 5 (Internal Sharing via Chat)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContext } from '../../context/AppContext';
import ContactSelector from './ContactSelector';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaSearch: () => <span data-testid="icon-search" />,
  FaTimes: () => <span data-testid="icon-times" />,
  FaUser: () => <span data-testid="icon-user" />,
  FaBuilding: () => <span data-testid="icon-building" />,
  FaPaperPlane: () => <span data-testid="icon-send" />,
}));

const mockContextValue = {
  language: 'en',
  token: 'test-token-123',
};

const renderWithContext = (ui, ctx = mockContextValue) =>
  render(<AppContext.Provider value={ctx}>{ui}</AppContext.Provider>);

const mockContent = { _id: 'job123', title: 'Software Engineer' };
const mockConversations = [
  {
    _id: 'conv1',
    otherParticipant: { user: { firstName: 'Alice', lastName: 'Smith', profilePicture: null } },
    lastMessage: { content: 'Hello there' },
  },
  {
    _id: 'conv2',
    otherParticipant: { user: { firstName: 'Bob', lastName: 'Jones', profilePicture: null } },
    lastMessage: { content: 'How are you?' },
  },
  {
    _id: 'conv3',
    otherParticipant: { user: { companyName: 'TechCorp', logo: null } },
    lastMessage: null,
  },
];

describe('ContactSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Rendering contacts', () => {
    it('shows loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders contact list after fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
        expect(screen.getByText('TechCorp')).toBeInTheDocument();
      });
    });

    it('shows empty state when no conversations', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ conversations: [] }),
      });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No recent conversations')).toBeInTheDocument();
      });
    });

    it('shows empty state when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('No recent conversations')).toBeInTheDocument();
      });
    });

    it('shows empty state when no token', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />,
        { language: 'en', token: null }
      );

      await waitFor(() => {
        expect(screen.getByText('No recent conversations')).toBeInTheDocument();
      });
    });
  });

  describe('Search functionality', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });
    });

    it('filters contacts by search query', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const searchInput = screen.getByPlaceholderText('Search contacts...');
      fireEvent.change(searchInput, { target: { value: 'alice' } });

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    });

    it('shows all contacts when search is cleared', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const searchInput = screen.getByPlaceholderText('Search contacts...');
      fireEvent.change(searchInput, { target: { value: 'alice' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('shows no contacts message when search has no matches', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const searchInput = screen.getByPlaceholderText('Search contacts...');
      fireEvent.change(searchInput, { target: { value: 'zzznomatch' } });

      expect(screen.getByText('No recent conversations')).toBeInTheDocument();
    });
  });

  describe('Contact selection', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });
    });

    it('selects a contact on click', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const aliceButton = screen.getByText('Alice Smith').closest('button');
      fireEvent.click(aliceButton);

      expect(aliceButton).toHaveClass('contact-item-selected');
    });

    it('deselects a contact when clicked again', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const aliceButton = screen.getByText('Alice Smith').closest('button');
      fireEvent.click(aliceButton);
      fireEvent.click(aliceButton);

      expect(aliceButton).not.toHaveClass('contact-item-selected');
    });

    it('send button is disabled when no contact selected', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('send button is enabled when a contact is selected', async () => {
      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      const aliceButton = screen.getByText('Alice Smith').closest('button');
      fireEvent.click(aliceButton);

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Sending shared content', () => {
    beforeEach(() => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ conversations: mockConversations }),
        });
    });

    it('sends shared_content message type when contact is selected and send clicked', async () => {
      const onSent = vi.fn();
      const onClose = vi.fn();

      // Second fetch: send message
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: {} }) });
      // Third fetch: record share (fire-and-forget)
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={onClose}
          onSent={onSent}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Alice Smith').closest('button'));
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const messageFetchCall = calls.find(
          ([url, opts]) => url.includes('/api/chat/messages') && opts?.method === 'POST'
        );
        expect(messageFetchCall).toBeTruthy();
        const body = JSON.parse(messageFetchCall[1].body);
        expect(body.type).toBe('shared_content');
        expect(body.conversationId).toBe('conv1');
      });
    });

    it('includes sharedContent object in the message payload', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: {} }) });
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Alice Smith').closest('button'));
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const messageFetchCall = calls.find(
          ([url, opts]) => url.includes('/api/chat/messages') && opts?.method === 'POST'
        );
        const body = JSON.parse(messageFetchCall[1].body);
        expect(body.sharedContent).toBeDefined();
        expect(body.sharedContent.contentType).toBe('job');
        expect(body.sharedContent.contentId).toBe('job123');
        expect(body.sharedContent.title).toBe('Software Engineer');
      });
    });

    it('records share event after sending', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: {} }) });
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Alice Smith').closest('button'));
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        const calls = global.fetch.mock.calls;
        const shareFetchCall = calls.find(
          ([url, opts]) => url.includes('/api/shares') && opts?.method === 'POST'
        );
        expect(shareFetchCall).toBeTruthy();
        const body = JSON.parse(shareFetchCall[1].body);
        expect(body.shareMethod).toBe('internal_chat');
      });
    });

    it('shows sent state and calls onSent/onClose after success', async () => {
      const onSent = vi.fn();
      const onClose = vi.fn();

      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: {} }) });
      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={onClose}
          onSent={onSent}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Alice Smith').closest('button'));
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText('Sent!')).toBeInTheDocument();
      });

      // Wait for the 1200ms timeout to fire
      await waitFor(() => {
        expect(onSent).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    }, 15000);

    it('shows error message when send fails', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={vi.fn()}
          onSent={vi.fn()}
        />
      );

      await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Alice Smith').closest('button'));
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to send, try again')).toBeInTheDocument();
      }, { timeout: 5000 });
    }, 15000);
  });

  describe('Close button', () => {
    it('calls onClose when close button is clicked', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ conversations: [] }),
      });
      const onClose = vi.fn();

      renderWithContext(
        <ContactSelector
          content={mockContent}
          contentType="job"
          onClose={onClose}
          onSent={vi.fn()}
        />
      );

      await waitFor(
        () => expect(screen.getByText('No recent conversations')).toBeInTheDocument(),
        { timeout: 5000 }
      );

      const closeBtn = screen.getByLabelText('إغلاق');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    }, 15000);
  });
});
