/**
 * Tests for SharedContentPreview component
 * Validates: Requirement 5.3 (Chat displays rich preview), 5.4 (click navigates to content)
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppContext } from '../../context/AppContext';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaBriefcase: () => <span data-testid="icon-job" />,
  FaGraduationCap: () => <span data-testid="icon-course" />,
  FaUser: () => <span data-testid="icon-user" />,
  FaBuilding: () => <span data-testid="icon-company" />,
  FaExternalLinkAlt: () => <span data-testid="icon-external" />,
}));

import SharedContentPreview from './SharedContentPreview';

const mockContextValue = { language: 'en' };

const renderWithContext = (ui, ctx = mockContextValue) =>
  render(<AppContext.Provider value={ctx}>{ui}</AppContext.Provider>);

describe('SharedContentPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.open = vi.fn();
  });

  describe('Rendering', () => {
    it('renders nothing when sharedContent is null', () => {
      const { container } = renderWithContext(
        <SharedContentPreview sharedContent={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders job shared content correctly', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'job',
            contentId: 'job123',
            title: 'Software Engineer',
            description: 'Great opportunity',
          }}
        />
      );

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Great opportunity')).toBeInTheDocument();
      expect(screen.getByText('Job')).toBeInTheDocument();
    });

    it('renders course shared content correctly', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'course',
            contentId: 'course456',
            title: 'React Fundamentals',
          }}
        />
      );

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Course')).toBeInTheDocument();
    });

    it('renders profile shared content correctly', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'profile',
            contentId: 'user789',
            title: 'John Doe',
          }}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders company shared content correctly', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'company',
            contentId: 'comp001',
            title: 'TechCorp',
          }}
        />
      );

      expect(screen.getByText('TechCorp')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('renders image thumbnail when imageUrl is provided', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'job',
            contentId: 'job123',
            title: 'Software Engineer',
            imageUrl: 'https://example.com/image.jpg',
          }}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('alt', 'Software Engineer');
    });

    it('shows url as title when title is missing', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'job',
            contentId: 'job123',
            url: 'https://careerak.com/job-postings/job123',
          }}
        />
      );

      expect(screen.getByText('https://careerak.com/job-postings/job123')).toBeInTheDocument();
    });

    it('renders in RTL direction for Arabic language', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'job',
            contentId: 'job123',
            title: 'وظيفة مطور',
          }}
        />,
        { language: 'ar' }
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Click navigation', () => {
    it('navigates to job details when clicked', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'job',
            contentId: 'job123',
            title: 'Software Engineer',
          }}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockNavigate).toHaveBeenCalledWith('/job-postings/job123');
    });

    it('navigates to course details when clicked', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'course',
            contentId: 'course456',
            title: 'React Fundamentals',
          }}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockNavigate).toHaveBeenCalledWith('/courses/course456');
    });

    it('navigates to profile when clicked', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'profile',
            contentId: 'user789',
            title: 'John Doe',
          }}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockNavigate).toHaveBeenCalledWith('/profile/user789');
    });

    it('navigates to company when clicked', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'company',
            contentId: 'comp001',
            title: 'TechCorp',
          }}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockNavigate).toHaveBeenCalledWith('/companies/comp001');
    });

    it('opens external URL in new tab when url starts with http and no contentId path', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'unknown_type',
            url: 'https://external.com/page',
            title: 'External Page',
          }}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(global.open).toHaveBeenCalledWith(
        'https://external.com/page',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('navigates internally when url is a relative path', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'unknown_type',
            url: '/some/internal/path',
            title: 'Internal Page',
          }}
        />
      );

      fireEvent.click(screen.getByRole('button'));
      expect(mockNavigate).toHaveBeenCalledWith('/some/internal/path');
    });

    it('has correct aria-label for accessibility', () => {
      renderWithContext(
        <SharedContentPreview
          sharedContent={{
            contentType: 'job',
            contentId: 'job123',
            title: 'Software Engineer',
          }}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'View: Software Engineer');
    });
  });
});
