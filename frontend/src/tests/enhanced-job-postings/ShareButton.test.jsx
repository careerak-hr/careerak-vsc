/**
 * Share Button Tests
 * Tests for share button functionality and modal
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ShareButton from '../../components/JobPostings/ShareButton';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
});

// Mock window.open
global.open = vi.fn();

describe('ShareButton Component', () => {
  const mockJob = {
    _id: 'job123',
    title: 'Senior Developer',
    company: { name: 'Tech Company' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render share button', () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    expect(button).toBeInTheDocument();
  });

  test('should open modal on click', () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/مشاركة الوظيفة/i)).toBeInTheDocument();
  });

  test('should show all share options', () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    expect(screen.getByText(/نسخ الرابط/i)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn/i)).toBeInTheDocument();
    expect(screen.getByText(/Twitter/i)).toBeInTheDocument();
    expect(screen.getByText(/Facebook/i)).toBeInTheDocument();
  });

  test('should copy link to clipboard', async () => {
    navigator.clipboard.writeText.mockResolvedValueOnce();

    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const copyButton = screen.getByText(/نسخ الرابط/i);
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(`/jobs/${mockJob._id}`)
      );
    });
  });

  test('should show success message after copying', async () => {
    navigator.clipboard.writeText.mockResolvedValueOnce();

    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const copyButton = screen.getByText(/نسخ الرابط/i);
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/تم نسخ الرابط/i)).toBeInTheDocument();
    });
  });

  test('should open WhatsApp share', async () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const whatsappButton = screen.getByText(/WhatsApp/i);
    fireEvent.click(whatsappButton);
    
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank'
      );
    });
  });

  test('should open LinkedIn share', async () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const linkedinButton = screen.getByText(/LinkedIn/i);
    fireEvent.click(linkedinButton);
    
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com'),
        '_blank'
      );
    });
  });

  test('should open Twitter share', async () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const twitterButton = screen.getByText(/Twitter/i);
    fireEvent.click(twitterButton);
    
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        '_blank'
      );
    });
  });

  test('should open Facebook share', async () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const facebookButton = screen.getByText(/Facebook/i);
    fireEvent.click(facebookButton);
    
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com'),
        '_blank'
      );
    });
  });

  test('should track share on backend', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const whatsappButton = screen.getByText(/WhatsApp/i);
    fireEvent.click(whatsappButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/jobs/${mockJob._id}/share`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ platform: 'whatsapp' })
        })
      );
    });
  });

  test('should close modal on backdrop click', () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(screen.queryByText(/مشاركة الوظيفة/i)).not.toBeInTheDocument();
  });

  test('should close modal on close button click', () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    const closeButton = screen.getByLabelText(/إغلاق/i);
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/مشاركة الوظيفة/i)).not.toBeInTheDocument();
  });
});

describe('Web Share API Support', () => {
  test('should use native share when available', async () => {
    const mockShare = vi.fn().mockResolvedValueOnce();
    Object.assign(navigator, {
      share: mockShare
    });

    render(<ShareButton job={mockJob} useNativeShare />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: expect.any(String),
        text: expect.any(String),
        url: expect.any(String)
      });
    });
  });

  test('should fallback to modal when native share unavailable', () => {
    Object.assign(navigator, {
      share: undefined
    });

    render(<ShareButton job={mockJob} useNativeShare />);
    
    const button = screen.getByRole('button', { name: /مشاركة/i });
    fireEvent.click(button);
    
    // Should show modal instead
    expect(screen.getByText(/مشاركة الوظيفة/i)).toBeInTheDocument();
  });
});
