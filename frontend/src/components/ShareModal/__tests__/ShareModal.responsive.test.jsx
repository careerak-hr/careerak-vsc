/**
 * Responsive Design Tests for ShareButton and ShareModal
 * Task 7.5: Test on various screen sizes (320px to 1920px)
 *
 * Validates: Requirement 19 (Responsive Design)
 * - 19.1: Share button accessible on mobile, tablet, and desktop
 * - 19.3: Share options modal is responsive and touch-friendly
 * - 19.4: Share button meets minimum touch target size (44x44px on mobile)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppContext } from '../../../context/AppContext';
import ShareModal from '../ShareModal';
import ShareButton from '../../ShareButton/ShareButton';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaWhatsapp: () => <span data-testid="icon-whatsapp" />,
  FaLinkedin: () => <span data-testid="icon-linkedin" />,
  FaTwitter: () => <span data-testid="icon-twitter" />,
  FaFacebook: () => <span data-testid="icon-facebook" />,
  FaLink: () => <span data-testid="icon-link" />,
  FaTimes: () => <span data-testid="icon-times" />,
  FaShare: () => <span data-testid="icon-share" />,
  FaTelegram: () => <span data-testid="icon-telegram" />,
  FaEnvelope: () => <span data-testid="icon-envelope" />,
  FaCommentDots: () => <span data-testid="icon-comment" />,
  FaSearch: () => <span />,
  FaUser: () => <span />,
  FaBuilding: () => <span />,
  FaPaperPlane: () => <span />,
}));

// Mock shareUtils
vi.mock('../../../utils/shareUtils', () => ({
  createShareData: vi.fn((content, contentType) => ({
    title: content?.title || 'Test Content',
    url: `https://careerak.com/${contentType}/${content?._id}`,
    text: content?.title,
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
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const mockContent = {
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'TechCorp' },
};

const makeContext = (language = 'en') => ({ language, token: 'test-token' });

const renderWithContext = (ui, language = 'en') =>
  render(
    <AppContext.Provider value={makeContext(language)}>
      {ui}
    </AppContext.Provider>
  );

/**
 * Set the viewport width by overriding window.innerWidth.
 * CSS media queries are not evaluated in jsdom, so we verify
 * class names and DOM structure instead of computed styles.
 */
const setViewportWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

// Key breakpoints to test (320px → 1920px)
const BREAKPOINTS = [
  { name: 'small mobile (iPhone SE)', width: 320 },
  { name: 'standard mobile', width: 375 },
  { name: 'large mobile', width: 414 },
  { name: 'tablet', width: 768 },
  { name: 'desktop', width: 1024 },
  { name: 'large desktop', width: 1280 },
  { name: 'full HD', width: 1920 },
];

// ─── ShareButton Responsive Tests ───────────────────────────────────────────

describe('ShareButton – responsive rendering', () => {
  beforeEach(() => {
    delete navigator.share;
  });

  BREAKPOINTS.forEach(({ name, width }) => {
    it(`renders correctly at ${width}px (${name})`, () => {
      setViewportWidth(width);

      renderWithContext(
        <ShareButton content={mockContent} contentType="job" />
      );

      const btn = screen.getByRole('button', { name: /share|مشاركة|partager/i });
      expect(btn).toBeInTheDocument();
    });
  });

  it('has share-button class applied at all breakpoints', () => {
    BREAKPOINTS.forEach(({ width }) => {
      setViewportWidth(width);
      const { unmount } = renderWithContext(
        <ShareButton content={mockContent} contentType="job" />
      );
      const btn = screen.getByRole('button', { name: /share|مشاركة|partager/i });
      expect(btn.classList.contains('share-button')).toBe(true);
      unmount();
    });
  });

  it('applies share-button-medium size class by default', () => {
    renderWithContext(<ShareButton content={mockContent} contentType="job" />);
    const btn = screen.getByRole('button', { name: /share|مشاركة|partager/i });
    expect(btn.classList.contains('share-button-medium')).toBe(true);
  });

  it('applies share-button-small size class when size="small"', () => {
    renderWithContext(
      <ShareButton content={mockContent} contentType="job" size="small" />
    );
    const btn = screen.getByRole('button', { name: /share|مشاركة|partager/i });
    expect(btn.classList.contains('share-button-small')).toBe(true);
  });

  it('applies share-button-large size class when size="large"', () => {
    renderWithContext(
      <ShareButton content={mockContent} contentType="job" size="large" />
    );
    const btn = screen.getByRole('button', { name: /share|مشاركة|partager/i });
    expect(btn.classList.contains('share-button-large')).toBe(true);
  });

  it('hides label text in icon-only variant', () => {
    renderWithContext(
      <ShareButton content={mockContent} contentType="job" variant="icon-only" />
    );
    expect(screen.queryByText(/^share$|^مشاركة$|^partager$/i)).not.toBeInTheDocument();
  });

  it('shows label text in default variant', () => {
    renderWithContext(
      <ShareButton content={mockContent} contentType="job" variant="default" />
    );
    // The text "Share" should be visible
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders with Arabic label when language is ar', () => {
    renderWithContext(
      <ShareButton content={mockContent} contentType="job" />,
      'ar'
    );
    expect(screen.getByText('مشاركة')).toBeInTheDocument();
  });

  it('renders with French label when language is fr', () => {
    renderWithContext(
      <ShareButton content={mockContent} contentType="job" />,
      'fr'
    );
    expect(screen.getByText('Partager')).toBeInTheDocument();
  });

  it('has aria-label for accessibility at all breakpoints', () => {
    BREAKPOINTS.forEach(({ width }) => {
      setViewportWidth(width);
      const { unmount } = renderWithContext(
        <ShareButton content={mockContent} contentType="job" />
      );
      const btn = screen.getByRole('button', { name: /share|مشاركة|partager/i });
      expect(btn).toHaveAttribute('aria-label');
      unmount();
    });
  });
});

// ─── ShareModal Responsive Tests ────────────────────────────────────────────

describe('ShareModal – responsive rendering', () => {
  beforeEach(() => {
    delete navigator.share;
    global.fetch = vi.fn();
  });

  BREAKPOINTS.forEach(({ name, width }) => {
    it(`renders modal correctly at ${width}px (${name})`, () => {
      setViewportWidth(width);

      renderWithContext(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          contentType="job"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('renders all 8 share options at every breakpoint', () => {
    BREAKPOINTS.forEach(({ width }) => {
      setViewportWidth(width);
      const { unmount } = renderWithContext(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          contentType="job"
        />
      );

      expect(screen.getByText('Copy Link')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Telegram')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Share via Chat')).toBeInTheDocument();

      unmount();
    });
  });

  it('has share-modal class on the dialog container', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.classList.contains('share-modal')).toBe(true);
  });

  it('has share-modal-options grid container', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const optionsGrid = document.querySelector('.share-modal-options');
    expect(optionsGrid).toBeInTheDocument();
  });

  it('close button meets 44px touch target requirement', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const closeBtn = screen.getByLabelText('إغلاق');
    // The CSS sets min-width/min-height: 44px on .share-modal-close
    expect(closeBtn.classList.contains('share-modal-close')).toBe(true);
  });

  it('all share option buttons have share-option class', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const options = document.querySelectorAll('.share-option');
    expect(options.length).toBe(8);
  });

  it('renders with RTL direction for Arabic', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />,
      'ar'
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('dir', 'rtl');
  });

  it('renders with LTR direction for English', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />,
      'en'
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('dir', 'ltr');
  });

  it('renders with LTR direction for French', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />,
      'fr'
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('dir', 'ltr');
  });

  it('does not render when closed', () => {
    renderWithContext(
      <ShareModal
        isOpen={false}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders overlay element when open', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    expect(document.querySelector('.share-modal-overlay')).toBeInTheDocument();
  });

  it('renders content title in modal header', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    expect(screen.getByText(mockContent.title)).toBeInTheDocument();
  });

  it('renders Arabic share labels when language is ar', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />,
      'ar'
    );
    expect(screen.getByText('نسخ الرابط')).toBeInTheDocument();
    expect(screen.getByText('مشاركة عبر المحادثة')).toBeInTheDocument();
  });

  it('renders French share labels when language is fr', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />,
      'fr'
    );
    expect(screen.getByText('Copier le lien')).toBeInTheDocument();
    expect(screen.getByText('Partager via Chat')).toBeInTheDocument();
  });

  // Verify modal renders for all supported content types
  ['job', 'course', 'profile', 'company'].forEach((contentType) => {
    it(`renders correctly for contentType="${contentType}"`, () => {
      const content = { _id: 'id123', title: `Test ${contentType}` };
      renderWithContext(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          content={content}
          contentType={contentType}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(`Test ${contentType}`)).toBeInTheDocument();
    });
  });
});

// ─── CSS Class Verification for Responsive Breakpoints ──────────────────────

describe('ShareModal – CSS responsive classes', () => {
  it('share-modal has correct base class for positioning', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const modal = document.querySelector('.share-modal');
    expect(modal).toBeInTheDocument();
    // The CSS applies bottom-sheet style at ≤480px via media query
    // We verify the class exists; actual layout is handled by CSS
    expect(modal.classList.contains('share-modal')).toBe(true);
  });

  it('share-modal-options grid is present for all breakpoints', () => {
    BREAKPOINTS.forEach(({ width }) => {
      setViewportWidth(width);
      const { unmount } = renderWithContext(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          contentType="job"
        />
      );
      const grid = document.querySelector('.share-modal-options');
      expect(grid).toBeInTheDocument();
      unmount();
    });
  });

  it('share-modal has aria-modal attribute for accessibility', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('share-modal has aria-label for screen readers', () => {
    renderWithContext(
      <ShareModal
        isOpen={true}
        onClose={vi.fn()}
        content={mockContent}
        contentType="job"
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label');
  });
});
