/**
 * Performance Tests for Content Sharing Feature
 * Validates: Requirement 20 (Performance and Optimization)
 *
 * Requirement 20.1: WHEN a user clicks the share button,
 *   THE Content_Sharing_System SHALL display options within 200 milliseconds
 * Requirement 20.2: THE Share_Link generation SHALL complete within 100 milliseconds
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
}));

vi.mock('../../components/ContactSelector/ContactSelector', () => ({
  default: () => <div data-testid="contact-selector" />,
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import ShareButton from '../../components/ShareButton/ShareButton';
import {
  createShareData,
  getContentUrl,
  addUtmParams,
  getContentTitle,
  getContentSubtitle,
} from '../../utils/shareUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeContext = (language = 'en') => ({ language, token: 'test-token' });

const renderWithContext = (ui, language = 'en') =>
  render(
    <AppContext.Provider value={makeContext(language)}>
      {ui}
    </AppContext.Provider>
  );

// Sample content fixtures
const mockJob = {
  _id: 'job123',
  title: 'Software Engineer',
  company: { name: 'TechCorp' },
  location: 'Riyadh',
};

const mockCourse = {
  _id: 'course456',
  title: 'React Fundamentals',
  instructor: 'Jane Doe',
};

const mockProfile = {
  _id: 'user789',
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Developer',
};

const mockCompany = {
  _id: 'comp001',
  name: 'TechCorp',
  industry: 'Technology',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Share Performance Tests (Requirement 20)', () => {

  // ── Requirement 20.1: Share button response time < 200ms ──────────────────

  describe('Req 20.1 – Share button displays options within 200ms', () => {

    it('renders share modal within 200ms after clicking share button (job)', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);

      const button = screen.getByRole('button', { name: /share/i });

      const start = performance.now();
      fireEvent.click(button);
      const elapsed = performance.now() - start;

      // Modal must be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Must be within 200ms threshold (Req 20.1)
      expect(elapsed).toBeLessThan(200);
    });

    it('renders share modal within 200ms after clicking share button (course)', () => {
      renderWithContext(<ShareButton content={mockCourse} contentType="course" />);

      const button = screen.getByRole('button', { name: /share/i });

      const start = performance.now();
      fireEvent.click(button);
      const elapsed = performance.now() - start;

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(elapsed).toBeLessThan(200);
    });

    it('renders share modal within 200ms after clicking share button (profile)', () => {
      renderWithContext(<ShareButton content={mockProfile} contentType="profile" />);

      const button = screen.getByRole('button', { name: /share/i });

      const start = performance.now();
      fireEvent.click(button);
      const elapsed = performance.now() - start;

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(elapsed).toBeLessThan(200);
    });

    it('renders share modal within 200ms after clicking share button (company)', () => {
      renderWithContext(<ShareButton content={mockCompany} contentType="company" />);

      const button = screen.getByRole('button', { name: /share/i });

      const start = performance.now();
      fireEvent.click(button);
      const elapsed = performance.now() - start;

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(elapsed).toBeLessThan(200);
    });

    it('modal open is synchronous – no async delay between click and display', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /share/i }));

      // Synchronous state update means modal is immediately available
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('repeated open/close cycles stay within 200ms each', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);

      for (let i = 0; i < 5; i++) {
        const button = screen.getByRole('button', { name: /share/i });

        const start = performance.now();
        fireEvent.click(button);
        const elapsed = performance.now() - start;

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(elapsed).toBeLessThan(200);

        // Close the modal via overlay click
        const overlay = document.querySelector('.share-modal-overlay');
        if (overlay) fireEvent.click(overlay);
      }
    });
  });

  // ── Requirement 20.2: Share link generation < 100ms ───────────────────────

  describe('Req 20.2 – Share link generation completes within 100ms', () => {

    it('getContentUrl generates link within 100ms for job', () => {
      const start = performance.now();
      const url = getContentUrl('job', 'job123');
      const elapsed = performance.now() - start;

      expect(url).toContain('job123');
      expect(elapsed).toBeLessThan(100);
    });

    it('getContentUrl generates link within 100ms for course', () => {
      const start = performance.now();
      const url = getContentUrl('course', 'course456');
      const elapsed = performance.now() - start;

      expect(url).toContain('course456');
      expect(elapsed).toBeLessThan(100);
    });

    it('getContentUrl generates link within 100ms for profile', () => {
      const start = performance.now();
      const url = getContentUrl('profile', 'user789');
      const elapsed = performance.now() - start;

      expect(url).toContain('user789');
      expect(elapsed).toBeLessThan(100);
    });

    it('getContentUrl generates link within 100ms for company', () => {
      const start = performance.now();
      const url = getContentUrl('company', 'comp001');
      const elapsed = performance.now() - start;

      expect(url).toContain('comp001');
      expect(elapsed).toBeLessThan(100);
    });

    it('createShareData (full link generation) completes within 100ms for job', () => {
      const start = performance.now();
      const data = createShareData(mockJob, 'job');
      const elapsed = performance.now() - start;

      expect(data.url).toContain('job123');
      expect(data.title).toBeTruthy();
      expect(elapsed).toBeLessThan(100);
    });

    it('createShareData completes within 100ms for course', () => {
      const start = performance.now();
      const data = createShareData(mockCourse, 'course');
      const elapsed = performance.now() - start;

      expect(data.url).toContain('course456');
      expect(elapsed).toBeLessThan(100);
    });

    it('createShareData completes within 100ms for profile', () => {
      const start = performance.now();
      const data = createShareData(mockProfile, 'profile');
      const elapsed = performance.now() - start;

      expect(data.url).toContain('user789');
      expect(elapsed).toBeLessThan(100);
    });

    it('createShareData completes within 100ms for company', () => {
      const start = performance.now();
      const data = createShareData(mockCompany, 'company');
      const elapsed = performance.now() - start;

      expect(data.url).toContain('comp001');
      expect(elapsed).toBeLessThan(100);
    });

    it('addUtmParams appends UTM parameters within 100ms', () => {
      const url = 'https://careerak.com/job-postings/job123';

      const start = performance.now();
      const result = addUtmParams(url, 'facebook');
      const elapsed = performance.now() - start;

      expect(result).toContain('utm_source=facebook');
      expect(result).toContain('utm_medium=social');
      expect(elapsed).toBeLessThan(100);
    });

    it('batch generation of 100 share links stays within 100ms total', () => {
      const ids = Array.from({ length: 100 }, (_, i) => `job${i}`);

      const start = performance.now();
      const urls = ids.map((id) => getContentUrl('job', id));
      const elapsed = performance.now() - start;

      expect(urls).toHaveLength(100);
      expect(urls[0]).toContain('job0');
      // 100 links in under 100ms total
      expect(elapsed).toBeLessThan(100);
    });

    it('getContentTitle extracts title within 100ms', () => {
      const start = performance.now();
      const title = getContentTitle(mockJob, 'job');
      const elapsed = performance.now() - start;

      expect(title).toBe('Software Engineer');
      expect(elapsed).toBeLessThan(100);
    });

    it('getContentSubtitle extracts subtitle within 100ms', () => {
      const start = performance.now();
      const subtitle = getContentSubtitle(mockJob, 'job');
      const elapsed = performance.now() - start;

      expect(subtitle).toBe('TechCorp');
      expect(elapsed).toBeLessThan(100);
    });
  });

  // ── Combined: end-to-end share flow timing ────────────────────────────────

  describe('End-to-end share flow timing', () => {

    it('full flow (click → modal visible + link ready) completes within 200ms', () => {
      renderWithContext(<ShareButton content={mockJob} contentType="job" />);

      const button = screen.getByRole('button', { name: /share/i });

      const start = performance.now();

      // Step 1: user clicks share button
      fireEvent.click(button);

      // Step 2: modal is visible (options displayed)
      const modal = screen.getByRole('dialog');

      // Step 3: share link is generated (synchronously inside ShareModal)
      const shareData = createShareData(mockJob, 'job');

      const elapsed = performance.now() - start;

      expect(modal).toBeInTheDocument();
      expect(shareData.url).toContain('job123');
      // Full flow must be within 200ms (Req 20.1)
      expect(elapsed).toBeLessThan(200);
    });
  });
});
