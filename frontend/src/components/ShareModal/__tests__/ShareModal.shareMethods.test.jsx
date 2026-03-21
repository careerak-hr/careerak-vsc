/**
 * Unit tests for ShareModal - External Share Methods & Copy Link
 * Validates: Requirement 6 (Facebook), 7 (Twitter), 8 (LinkedIn),
 *            9 (WhatsApp), 10 (Telegram), 11 (Email), 12 (Copy Link)
 * Validates: Requirement 13 (Share link generation with UTM params)
 * Validates: Requirement 17 (Privacy - private content)
 * Validates: Requirement 19.2 (Mobile native share sheet)
 * Validates: Requirement 21 (Error handling)
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

// Mock shareUtils with spies
const mockShareViaFacebook = vi.fn();
const mockShareViaTwitter = vi.fn();
const mockShareViaLinkedIn = vi.fn();
const mockShareViaWhatsApp = vi.fn();
const mockShareViaTelegram = vi.fn();
const mockShareViaEmail = vi.fn();
const mockCopyShareLink = vi.fn();
const mockShouldUseNativeShare = vi.fn().mockReturnValue(false);
const mockIsIOSSafari = vi.fn().mockReturnValue(false);
const mockIsAndroidChrome = vi.fn().mockReturnValue(false);
const mockCreateShareData = vi.fn((content, contentType) => ({
  title: content?.title || 'Test Content',
  url: `https://careerak.com/${contentType}/${content?._id}`,
  text: content?.title || 'Test Content',
}));

vi.mock('../../../utils/shareUtils', () => ({
  createShareData: (...args) => mockCreateShareData(...args),
  shareViaFacebook: (...args) => mockShareViaFacebook(...args),
  shareViaTwitter: (...args) => mockShareViaTwitter(...args),
  shareViaLinkedIn: (...args) => mockShareViaLinkedIn(...args),
  shareViaWhatsApp: (...args) => mockShareViaWhatsApp(...args),
  shareViaTelegram: (...args) => mockShareViaTelegram(...args),
  shareViaEmail: (...args) => mockShareViaEmail(...args),
  copyShareLink: (...args) => mockCopyShareLink(...args),
  shouldUseNativeShare: () => mockShouldUseNativeShare(),
  isIOSSafari: () => mockIsIOSSafari(),
  isAndroidChrome: () => mockIsAndroidChrome(),
}));

const makeContext = (language = 'en') => ({ language, token: 'test-token' });

const renderWithContext = (ui, language = 'en') =>
  render(
    <AppContext.Provider value={makeContext(language)}>
      {ui}
    </AppContext.Provider>
  );

const mockJob = { _id: 'job123', title: 'Software Engineer', company: { name: 'TechCorp' } };
const mockCourse = { _id: 'course456', title: 'React Fundamentals' };
const mockProfile = { _id: 'user789', firstName: 'John', lastName: 'Doe' };
const mockCompany = { _id: 'comp001', name: 'TechCorp' };

describe('ShareModal - External Share Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete navigator.share;
    global.fetch = vi.fn();
    mockCopyShareLink.mockResolvedValue({ success: true, url: 'https://careerak.com/job-postings/job123' });
  });

  // ─── Requirement 6: Facebook ──────────────────────────────────────────────

  describe('Facebook share (Req 6)', () => {
    it('calls shareViaFacebook when Facebook button is clicked', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Facebook'));
      expect(mockShareViaFacebook).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('calls onClose after Facebook share', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Facebook'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('passes correct contentType to shareViaFacebook for courses', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockCourse} contentType="course" />
      );
      fireEvent.click(screen.getByText('Facebook'));
      expect(mockShareViaFacebook).toHaveBeenCalledWith(mockCourse, 'course');
    });
  });

  // ─── Requirement 7: Twitter ───────────────────────────────────────────────

  describe('Twitter share (Req 7)', () => {
    it('calls shareViaTwitter when Twitter button is clicked', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Twitter'));
      expect(mockShareViaTwitter).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('calls onClose after Twitter share', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Twitter'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Requirement 8: LinkedIn ──────────────────────────────────────────────

  describe('LinkedIn share (Req 8)', () => {
    it('calls shareViaLinkedIn when LinkedIn button is clicked', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('LinkedIn'));
      expect(mockShareViaLinkedIn).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('calls onClose after LinkedIn share', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('LinkedIn'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('passes correct contentType for company profiles', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockCompany} contentType="company" />
      );
      fireEvent.click(screen.getByText('LinkedIn'));
      expect(mockShareViaLinkedIn).toHaveBeenCalledWith(mockCompany, 'company');
    });
  });

  // ─── Requirement 9: WhatsApp ──────────────────────────────────────────────

  describe('WhatsApp share (Req 9)', () => {
    it('calls shareViaWhatsApp when WhatsApp button is clicked', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('WhatsApp'));
      expect(mockShareViaWhatsApp).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('calls onClose after WhatsApp share', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('WhatsApp'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Requirement 10: Telegram ─────────────────────────────────────────────

  describe('Telegram share (Req 10)', () => {
    it('calls shareViaTelegram when Telegram button is clicked', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Telegram'));
      expect(mockShareViaTelegram).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('calls onClose after Telegram share', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Telegram'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Requirement 11: Email ────────────────────────────────────────────────

  describe('Email share (Req 11)', () => {
    it('calls shareViaEmail when Email button is clicked', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Email'));
      expect(mockShareViaEmail).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('calls onClose after Email share', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Email'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Requirement 12: Copy Link ────────────────────────────────────────────

  describe('Copy Link (Req 12)', () => {
    it('calls copyShareLink when Copy Link button is clicked', async () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));
      await waitFor(() => expect(mockCopyShareLink).toHaveBeenCalledWith(mockJob, 'job'));
    });

    it('shows "Copied!" confirmation after successful copy (Req 12.2)', async () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));
      await waitFor(() => expect(screen.getByText('Copied!')).toBeInTheDocument());
    });

    it('disables copy button while copied state is active', async () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));
      await waitFor(() => {
        const btn = screen.getByText('Copied!').closest('button');
        expect(btn).toBeDisabled();
      });
    });

    it('shows fallback input when clipboard access fails (Req 12.5)', async () => {
      mockCopyShareLink.mockResolvedValueOnce({
        success: false,
        url: 'https://careerak.com/job-postings/job123',
      });

      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));

      await waitFor(() => {
        const fallbackInput = document.querySelector('.share-modal-copy-fallback-input');
        expect(fallbackInput).toBeInTheDocument();
        expect(fallbackInput.value).toBe('https://careerak.com/job-postings/job123');
      });
    });

    it('shows manual copy instructions when clipboard fails (Req 21)', async () => {
      mockCopyShareLink.mockResolvedValueOnce({
        success: false,
        url: 'https://careerak.com/job-postings/job123',
      });

      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));

      await waitFor(() => {
        expect(screen.getByText(/auto-copy failed/i)).toBeInTheDocument();
      });
    });

    it('shows success message after copy', async () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));
      await waitFor(() => {
        expect(screen.getByText(/link copied successfully/i)).toBeInTheDocument();
      });
    });
  });

  // ─── Requirement 13: Share link generation ───────────────────────────────

  describe('Share link generation (Req 13)', () => {
    it('generates share data using createShareData', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      expect(mockCreateShareData).toHaveBeenCalledWith(mockJob, 'job');
    });

    it('generates share data for course content type', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockCourse} contentType="course" />
      );
      expect(mockCreateShareData).toHaveBeenCalledWith(mockCourse, 'course');
    });

    it('generates share data for profile content type', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockProfile} contentType="profile" />
      );
      expect(mockCreateShareData).toHaveBeenCalledWith(mockProfile, 'profile');
    });

    it('generates share data for company content type', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockCompany} contentType="company" />
      );
      expect(mockCreateShareData).toHaveBeenCalledWith(mockCompany, 'company');
    });

    it('displays content title from share data in modal', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  // ─── Requirement 19.2: Mobile native share sheet ─────────────────────────

  describe('Native share sheet (Req 19.2)', () => {
    it('shows native share button when navigator.share is available', () => {
      navigator.share = vi.fn().mockResolvedValue(undefined);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      expect(screen.getByText('More options')).toBeInTheDocument();
    });

    it('hides native share button when navigator.share is not available', () => {
      delete navigator.share;
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      expect(screen.queryByText('More options')).not.toBeInTheDocument();
    });

    it('calls navigator.share when native share button is clicked', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      navigator.share = mockShare;

      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );

      fireEvent.click(screen.getByText('More options'));

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String),
            url: expect.any(String),
          })
        );
      });
    });

    it('calls onClose after successful native share', async () => {
      const onClose = vi.fn();
      navigator.share = vi.fn().mockResolvedValue(undefined);

      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );

      fireEvent.click(screen.getByText('More options'));

      await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('does not call onClose when native share is aborted', async () => {
      const onClose = vi.fn();
      navigator.share = vi.fn().mockRejectedValue(
        Object.assign(new Error('AbortError'), { name: 'AbortError' })
      );

      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );

      fireEvent.click(screen.getByText('More options'));

      await new Promise((r) => setTimeout(r, 50));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not auto-trigger native share on iOS Safari (useEffect restriction)', () => {
      mockIsIOSSafari.mockReturnValue(true);
      mockShouldUseNativeShare.mockReturnValue(true);
      navigator.share = vi.fn().mockResolvedValue(undefined);

      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );

      // On iOS Safari, navigator.share should NOT be called from useEffect
      expect(navigator.share).not.toHaveBeenCalled();
    });
  });

  // ─── Requirement 17: Privacy enforcement ─────────────────────────────────

  describe('Privacy enforcement (Req 17)', () => {
    it('does not render when content is null (private/deleted content)', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={null} contentType="job" />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      renderWithContext(
        <ShareModal isOpen={false} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ─── Requirement 21: Error handling ──────────────────────────────────────

  describe('Error handling (Req 21)', () => {
    it('shows fallback URL input when clipboard write fails', async () => {
      mockCopyShareLink.mockResolvedValueOnce({
        success: false,
        url: 'https://careerak.com/job-postings/job123',
      });

      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));

      await waitFor(() => {
        expect(document.querySelector('.share-modal-copy-fallback')).toBeInTheDocument();
      });
    });

    it('fallback input is readonly for easy selection', async () => {
      mockCopyShareLink.mockResolvedValueOnce({
        success: false,
        url: 'https://careerak.com/job-postings/job123',
      });

      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByText('Copy Link'));

      await waitFor(() => {
        const input = document.querySelector('.share-modal-copy-fallback-input');
        expect(input).toHaveAttribute('readonly');
      });
    });

    it('clears fallback URL when copy link is clicked again', async () => {
      // First click fails
      mockCopyShareLink.mockResolvedValueOnce({
        success: false,
        url: 'https://careerak.com/job-postings/job123',
      });
      // Second click succeeds
      mockCopyShareLink.mockResolvedValueOnce({
        success: true,
        url: 'https://careerak.com/job-postings/job123',
      });

      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );

      fireEvent.click(screen.getByText('Copy Link'));
      await waitFor(() =>
        expect(document.querySelector('.share-modal-copy-fallback')).toBeInTheDocument()
      );

      // Click again - should clear fallback
      fireEvent.click(screen.getByText('Copy Link'));
      await waitFor(() =>
        expect(document.querySelector('.share-modal-copy-fallback')).not.toBeInTheDocument()
      );
    });
  });

  // ─── Overlay and close behavior ──────────────────────────────────────────

  describe('Modal close behavior', () => {
    it('calls onClose when overlay is clicked', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(document.querySelector('.share-modal-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      renderWithContext(
        <ShareModal isOpen={true} onClose={onClose} content={mockJob} contentType="job" />
      );
      fireEvent.click(screen.getByLabelText('إغلاق'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── All 8 share options are rendered ────────────────────────────────────

  describe('All share options rendered', () => {
    it('renders all 8 share options', () => {
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockJob} contentType="job" />
      );
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Telegram')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Share via Chat')).toBeInTheDocument();
    });
  });
});
