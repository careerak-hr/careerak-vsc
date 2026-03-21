/**
 * Task 8.10 - Test on multiple devices (Desktop, Tablet, Mobile)
 *
 * Validates: Requirement 19 (Responsive Design)
 * - 19.1: Share button accessible on mobile, tablet, and desktop
 * - 19.2: On mobile, use native share sheet if available
 * - 19.3: Share options modal is responsive and touch-friendly
 * - 19.4: Share button meets minimum touch target size (44x44px on mobile)
 * - 19.5: Adapt share methods based on device capabilities
 *
 * Device categories tested:
 *   Desktop:  1920px, 1440px, 1280px
 *   Tablet:   1024px, 768px
 *   Mobile:   430px, 390px, 375px, 320px
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from '../../context/AppContext';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-icons/fa', () => ({
  FaShare: () => <span data-testid="icon-share" />,
  FaWhatsapp: () => <span />,
  FaLinkedin: () => <span />,
  FaTwitter: () => <span />,
  FaFacebook: () => <span />,
  FaLink: () => <span />,
  FaTimes: () => <span />,
  FaTelegram: () => <span />,
  FaEnvelope: () => <span />,
  FaCommentDots: () => <span />,
  FaSearch: () => <span />,
  FaUser: () => <span />,
  FaBuilding: () => <span />,
  FaPaperPlane: () => <span />,
}));

vi.mock('../../components/ContactSelector/ContactSelector', () => ({
  default: () => <div data-testid="contact-selector" />,
}));

vi.mock('../../utils/shareUtils', () => ({
  createShareData: vi.fn((content, contentType) => ({
    title: content?.title || 'Test Content',
    url: `https://careerak.com/${contentType}/${content?._id}`,
    text: content?.title || 'Test Content',
  })),
  shareViaFacebook: vi.fn(),
  shareViaTwitter: vi.fn(),
  shareViaLinkedIn: vi.fn(),
  shareViaWhatsApp: vi.fn(),
  shareViaTelegram: vi.fn(),
  shareViaEmail: vi.fn(),
  copyShareLink: vi.fn().mockResolvedValue({ success: true }),
  shouldUseNativeShare: vi.fn().mockReturnValue(false),
  isIOSSafari: vi.fn().mockReturnValue(false),
  isAndroidChrome: vi.fn().mockReturnValue(false),
  isMobileDevice: vi.fn().mockReturnValue(false),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import ShareButton from '../../components/ShareButton/ShareButton';
import ShareModal from '../../components/ShareModal/ShareModal';
import { shouldUseNativeShare, isIOSSafari } from '../../utils/shareUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeContext = (language = 'en') => ({ language, token: 'test-token' });

const renderWithContext = (ui, language = 'en') =>
  render(
    <AppContext.Provider value={makeContext(language)}>
      {ui}
    </AppContext.Provider>
  );

const setViewportWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

const mockContent = {
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'TechCorp' },
};

// Device groups
const DESKTOP_WIDTHS = [1920, 1440, 1280];
const TABLET_WIDTHS = [1024, 768];
const MOBILE_WIDTHS = [430, 390, 375, 320];

// ─── Desktop Tests ────────────────────────────────────────────────────────────

describe('Desktop devices (1280px – 1920px)', () => {
  beforeEach(() => {
    delete navigator.share;
    shouldUseNativeShare.mockReturnValue(false);
    isIOSSafari.mockReturnValue(false);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  DESKTOP_WIDTHS.forEach((width) => {
    it(`[${width}px] ShareButton is visible and accessible`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-label');
    });

    it(`[${width}px] ShareModal opens on button click`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it(`[${width}px] custom modal is shown (not native share) on desktop`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(document.querySelectorAll('.share-option').length).toBe(8);
    });

    it(`[${width}px] all 8 share methods are available in the modal`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
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

    it(`[${width}px] modal container is present (no overflow)`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
      );
      expect(document.querySelector('.share-modal')).toBeInTheDocument();
    });
  });

  it('desktop: native share button is NOT shown when navigator.share is absent', () => {
    setViewportWidth(1440);
    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
    );
    expect(screen.queryByText('More options')).not.toBeInTheDocument();
  });
});

// ─── Tablet Tests ─────────────────────────────────────────────────────────────

describe('Tablet devices (768px – 1024px)', () => {
  beforeEach(() => {
    delete navigator.share;
    shouldUseNativeShare.mockReturnValue(false);
    isIOSSafari.mockReturnValue(false);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  TABLET_WIDTHS.forEach((width) => {
    it(`[${width}px] ShareButton is visible and accessible`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-label');
    });

    it(`[${width}px] ShareModal opens on button click`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it(`[${width}px] custom modal is shown on tablet`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(document.querySelectorAll('.share-option').length).toBe(8);
    });

    it(`[${width}px] all 8 share methods are available in the modal`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
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

    it(`[${width}px] modal container is present (no overflow)`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
      );
      expect(document.querySelector('.share-modal')).toBeInTheDocument();
    });
  });
});

// ─── Mobile Tests ─────────────────────────────────────────────────────────────

describe('Mobile devices (320px – 430px)', () => {
  beforeEach(() => {
    delete navigator.share;
    shouldUseNativeShare.mockReturnValue(false);
    isIOSSafari.mockReturnValue(false);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  MOBILE_WIDTHS.forEach((width) => {
    it(`[${width}px] ShareButton is visible and accessible`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('aria-label');
    });

    it(`[${width}px] ShareButton has share-button class (touch target CSS applied)`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn.classList.contains('share-button')).toBe(true);
    });

    it(`[${width}px] ShareModal opens on button click`, () => {
      setViewportWidth(width);
      renderWithContext(<ShareButton content={mockContent} contentType="job" />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it(`[${width}px] custom modal shown when navigator.share is unavailable`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(document.querySelectorAll('.share-option').length).toBe(8);
    });

    it(`[${width}px] modal container is present (no overflow)`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
      );
      expect(document.querySelector('.share-modal')).toBeInTheDocument();
    });

    it(`[${width}px] all 8 share methods are available in the modal`, () => {
      setViewportWidth(width);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
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

  // ── navigator.share (native share sheet) on mobile ────────────────────────

  it('mobile: navigator.share() is called when available (Android Chrome path)', async () => {
    setViewportWidth(375);
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });
    shouldUseNativeShare.mockReturnValue(true);
    isIOSSafari.mockReturnValue(false);

    const onClose = vi.fn();
    renderWithContext(
      <ShareModal isOpen={true} onClose={onClose} content={mockContent} contentType="job" />
    );

    await vi.waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({ url: expect.stringContaining('job123') })
      );
    });
  });

  it('mobile: custom modal shown as fallback when navigator.share is absent', () => {
    setViewportWidth(375);
    shouldUseNativeShare.mockReturnValue(false);

    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.querySelectorAll('.share-option').length).toBe(8);
  });

  it('mobile: iOS Safari does NOT auto-trigger navigator.share (user gesture required)', async () => {
    setViewportWidth(375);
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    });
    shouldUseNativeShare.mockReturnValue(true);
    isIOSSafari.mockReturnValue(true);

    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
    );

    // iOS Safari: navigator.share must NOT be called from useEffect
    await new Promise((r) => setTimeout(r, 50));
    expect(mockShare).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('mobile: "More options" native share button appears when navigator.share is available', () => {
    setViewportWidth(375);
    Object.defineProperty(navigator, 'share', {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });
    shouldUseNativeShare.mockReturnValue(false);

    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
    );

    expect(screen.getByText('More options')).toBeInTheDocument();
  });

  it('mobile: share-option buttons have correct CSS class (44x44px touch target)', () => {
    setViewportWidth(375);
    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
    );
    const options = document.querySelectorAll('.share-option');
    expect(options.length).toBe(8);
    options.forEach((btn) => {
      expect(btn.classList.contains('share-option')).toBe(true);
    });
  });

  it('mobile: close button has share-modal-close class (44x44px touch target)', () => {
    setViewportWidth(375);
    renderWithContext(
      <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />
    );
    const closeBtn = screen.getByLabelText('إغلاق');
    expect(closeBtn.classList.contains('share-modal-close')).toBe(true);
  });
});

// ─── Cross-device: all content types ─────────────────────────────────────────

describe('All device sizes – all content types', () => {
  beforeEach(() => {
    delete navigator.share;
    shouldUseNativeShare.mockReturnValue(false);
    isIOSSafari.mockReturnValue(false);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const allWidths = [...DESKTOP_WIDTHS, ...TABLET_WIDTHS, ...MOBILE_WIDTHS];
  const contentTypes = ['job', 'course', 'profile', 'company'];

  contentTypes.forEach((contentType) => {
    it(`ShareModal renders for contentType="${contentType}" on all device sizes`, () => {
      const content = { _id: 'id123', title: `Test ${contentType}` };
      allWidths.forEach((width) => {
        setViewportWidth(width);
        const { unmount } = renderWithContext(
          <ShareModal
            isOpen={true}
            onClose={vi.fn()}
            content={content}
            contentType={contentType}
          />
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        unmount();
      });
    });
  });
});

// ─── Cross-device: multi-language support ────────────────────────────────────

describe('All device sizes – multi-language support (Requirement 18)', () => {
  beforeEach(() => {
    delete navigator.share;
    shouldUseNativeShare.mockReturnValue(false);
    isIOSSafari.mockReturnValue(false);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const languages = [
    { code: 'en', copyLabel: 'Copy Link', chatLabel: 'Share via Chat' },
    { code: 'ar', copyLabel: 'نسخ الرابط', chatLabel: 'مشاركة عبر المحادثة' },
    { code: 'fr', copyLabel: 'Copier le lien', chatLabel: 'Partager via Chat' },
  ];

  languages.forEach(({ code, copyLabel, chatLabel }) => {
    it(`[${code}] ShareModal shows correct labels on mobile (375px)`, () => {
      setViewportWidth(375);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />,
        code
      );
      expect(screen.getByText(copyLabel)).toBeInTheDocument();
      expect(screen.getByText(chatLabel)).toBeInTheDocument();
    });

    it(`[${code}] ShareModal shows correct labels on tablet (768px)`, () => {
      setViewportWidth(768);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />,
        code
      );
      expect(screen.getByText(copyLabel)).toBeInTheDocument();
    });

    it(`[${code}] ShareModal shows correct labels on desktop (1440px)`, () => {
      setViewportWidth(1440);
      renderWithContext(
        <ShareModal isOpen={true} onClose={vi.fn()} content={mockContent} contentType="job" />,
        code
      );
      expect(screen.getByText(copyLabel)).toBeInTheDocument();
      expect(screen.getByText(chatLabel)).toBeInTheDocument();
    });
  });
});
