/**
 * Tests for ShareModal - Internal Sharing via Chat
 * Validates: Requirement 5 (Internal Sharing via Chat), Requirement 16 (Share Notifications)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppContext } from '../../../context/AppContext';
import ShareModal from '../ShareModal';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaWhatsapp: () => <span />,
  FaLinkedin: () => <span />,
  FaTwitter: () => <span />,
  FaFacebook: () => <span />,
  FaLink: () => <span />,
  FaTimes: () => <span />,
  FaShare: () => <span />,
  FaTelegram: () => <span />,
  FaEnvelope: () => <span />,
  FaCommentDots: () => <span />,
  FaSearch: () => <span />,
  FaUser: () => <span />,
  FaBuilding: () => <span />,
  FaPaperPlane: () => <span />,
}));

// Mock shareUtils
vi.mock('../../../utils/shareUtils', () => ({
  createShareData: vi.fn((content, contentType) => ({
    title: content.title || 'Test Content',
    url: `https://careerak.com/${contentType}/${content._id}`,
    text: content.title,
  })),
  shareViaFacebook: vi.fn(),
  shareViaTwitter: vi.fn(),
  shareViaLinkedIn: vi.fn(),
  shareViaWhatsApp: vi.fn(),
  shareViaTelegram: vi.fn(),
  shareViaEmail: vi.fn(),
  copyShareLink: vi.fn().mockResolvedValue({ success: true }),
  shouldUseNativeShare: vi.fn().mockReturnValue(false),
}));

const mockContextValue = {
  language: 'en',
  token: 'test-token-123',
};

const renderWithContext = (ui, ctx = mockContextValue) =>
  render(<AppContext.Provider value={ctx}>{ui}</AppContext.Provider>);

const mockJob = {
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'TechCorp' },
};

const mockConversations = [
  {
    _id: 'conv1',
    otherParticipant: { user: { firstName: 'Alice', lastName: 'Smith' } },
    lastMessage: { content: 'Hi' },
  },
];

describe('ShareModal - Internal Sharing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    delete navigator.share;
  });

  it('renders "Share via Chat" button', () => {
    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
    );
    expect(screen.getByText('Share via Chat')).toBeInTheDocument();
  });

  it('shows ContactSelector when "Share via Chat" is clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ conversations: mockConversations }),
    });

    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
    );

    fireEvent.click(screen.getByText('Share via Chat'));

    await waitFor(() => {
      expect(screen.getByText('Share via Chat')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search contacts...')).toBeInTheDocument();
    });
  });

  it('hides main share options when ContactSelector is shown', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ conversations: [] }),
    });

    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
    );

    fireEvent.click(screen.getByText('Share via Chat'));

    await waitFor(() => {
      expect(screen.queryByText('Copy Link')).not.toBeInTheDocument();
      expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
    });
  });

  it('calls onClose after successful internal share', async () => {
    const onClose = vi.fn();
    const onSent = vi.fn();

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: {} }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderWithContext(
      <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
    );

    fireEvent.click(screen.getByText('Share via Chat'));

    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument(), { timeout: 5000 });

    fireEvent.click(screen.getByText('Alice Smith').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(screen.getByText('Sent!')).toBeInTheDocument(), { timeout: 5000 });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 3000 });
  }, 20000);

  it('does not render when isOpen is false', () => {
    renderWithContext(
      <ShareModal isOpen={false} onClose={vi.fn()} content={mockJob} contentType="job" />
    );
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('does not render when content is null', () => {
    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={null} contentType="job" />
    );
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('sends message with correct share URL format', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: {} }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
    );

    fireEvent.click(screen.getByText('Share via Chat'));
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument(), { timeout: 5000 });

    fireEvent.click(screen.getByText('Alice Smith').closest('button'));
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      const calls = global.fetch.mock.calls;
      const msgCall = calls.find(
        ([url, opts]) => url.includes('/api/chat/messages') && opts?.method === 'POST'
      );
      expect(msgCall).toBeTruthy();
      const body = JSON.parse(msgCall[1].body);
      expect(body.sharedContent.url).toContain('job-postings/job123');
    }, { timeout: 5000 });
  }, 20000);
});
