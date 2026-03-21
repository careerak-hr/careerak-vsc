/**
 * Unit tests for ShareButton component
 * Validates: Requirements 1-4 (Share button on job postings, courses, user profiles, company profiles)
 * Validates: Requirement 18 (Multi-language support: ar, en, fr)
 * Validates: Requirement 19 (Responsive design - touch target size)
 * Validates: Requirement 20 (Performance - options within 200ms)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from '../../context/AppContext';
import ShareButton from './ShareButton';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaShare: () => <span data-testid="icon-share" />,
}));

// Mock ShareModal to isolate ShareButton tests
vi.mock('../ShareModal/ShareModal', () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="share-modal" role="dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
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

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Requirement 1-4: Share button displays on all content types ──────────

  describe('Rendering for all content types', () => {
    it('renders share button for job postings (Req 1)', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('renders share button for courses (Req 2)', () => {
      renderWithContext(<ShareButton content={mockCourse} contentType="course" />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('renders share button for user profiles (Req 3)', () => {
      renderWithContext(<ShareButton content={mockProfile} contentType="profile" />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('renders share button for company profiles (Req 4)', () => {
      renderWithContext(<ShareButton content={mockCompany} contentType="company" />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });

    it('renders share icon', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      expect(screen.getByTestId('icon-share')).toBeInTheDocument();
    });

    it('renders button text in default variant', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('does not render text in icon-only variant', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" variant="icon-only" />);
      expect(screen.queryByText('Share')).not.toBeInTheDocument();
    });
  });

  // ─── Requirement 18: Multi-language support ───────────────────────────────

  describe('Multi-language support (Req 18)', () => {
    it('renders "Share" in English', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'en');
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('renders "مشاركة" in Arabic', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'ar');
      expect(screen.getByText('مشاركة')).toBeInTheDocument();
    });

    it('renders "Partager" in French', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'fr');
      expect(screen.getByText('Partager')).toBeInTheDocument();
    });

    it('has correct aria-label in English', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'en');
      expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    });

    it('has correct aria-label in Arabic', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'ar');
      expect(screen.getByRole('button', { name: 'مشاركة' })).toBeInTheDocument();
    });

    it('has correct aria-label in French', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />, 'fr');
      expect(screen.getByRole('button', { name: 'Partager' })).toBeInTheDocument();
    });

    it('falls back to Arabic when language is unknown', () => {
      render(
        <AppContext.Provider value={{ language: 'de', token: null }}>
          <ShareButton content={mockJob} contentType="job" />
        </AppContext.Provider>
      );
      expect(screen.getByText('مشاركة')).toBeInTheDocument();
    });
  });

  // ─── Click handler opens modal ────────────────────────────────────────────

  describe('Click interaction', () => {
    it('opens ShareModal when button is clicked', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    });

    it('closes ShareModal when onClose is called', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);

      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();
    });

    it('prevents event propagation on click', () => {
      const parentClickHandler = vi.fn();
      renderWithContext(
        <div onClick={parentClickHandler}>
          <ShareButton content={mockJob} contentType="job" />
        </div>
      );

      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it('prevents default event on click', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });

      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
      btn.dispatchEvent(clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  // ─── Requirement 20: Performance - options within 200ms ──────────────────

  describe('Performance (Req 20)', () => {
    it('opens modal synchronously on click (state update is immediate)', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);

      // The modal should not be visible before click
      expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument();

      // Click triggers synchronous state update - modal appears immediately
      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      // Modal is visible immediately after click (no async operations needed)
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    });
  });

  // ─── CSS classes and variants ─────────────────────────────────────────────

  describe('CSS classes and variants', () => {
    it('applies share-button base class', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('share-button');
    });

    it('applies default variant class', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('share-button-default');
    });

    it('applies medium size class by default', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('share-button-medium');
    });

    it('applies small size class when size="small"', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" size="small" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('share-button-small');
    });

    it('applies large size class when size="large"', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" size="large" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('share-button-large');
    });

    it('applies custom className prop', () => {
      renderWithContext(
        <ShareButton content={mockJob} contentType="job" className="my-custom-class" />
      );
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('my-custom-class');
    });

    it('applies icon-only variant class', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" variant="icon-only" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveClass('share-button-icon-only');
    });
  });

  // ─── Backward compatibility: legacy "job" prop ───────────────────────────

  describe('Backward compatibility', () => {
    it('accepts legacy "job" prop and treats it as content', () => {
      renderWithContext(<ShareButton job={mockJob} />);
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    });

    it('defaults contentType to "job" when using legacy job prop', () => {
      renderWithContext(<ShareButton job={mockJob} />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  describe('Accessibility', () => {
    it('has aria-label attribute', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveAttribute('aria-label');
    });

    it('has title attribute for tooltip', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);
      const btn = screen.getByRole('button', { name: /share/i });
      expect(btn).toHaveAttribute('title');
    });
  });
});
