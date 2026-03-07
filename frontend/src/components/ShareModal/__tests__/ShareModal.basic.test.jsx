import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareModal from '../ShareModal';

describe('ShareModal - Basic Tests', () => {
  const mockJob = {
    _id: '507f1f77bcf86cd799439011',
    title: 'مطور Full Stack',
    company: {
      name: 'شركة التقنية المتقدمة'
    }
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Mock window.open
    global.open = vi.fn();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve())
      }
    });
  });

  it('should render when isOpen is true', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    expect(screen.getByText('مشاركة الوظيفة')).toBeInTheDocument();
    expect(screen.getByText(mockJob.title)).toBeInTheDocument();
    expect(screen.getByText(mockJob.company.name)).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ShareModal
        isOpen={false}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    expect(screen.queryByText('مشاركة الوظيفة')).not.toBeInTheDocument();
  });

  it('should render all 5 share options', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    expect(screen.getByText('نسخ الرابط')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('should call onClose when clicking overlay', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const overlay = document.querySelector('.share-modal-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking close button', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const closeButton = screen.getByLabelText('إغلاق');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should copy link to clipboard', async () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const copyButton = screen.getByText('نسخ الرابط');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(`/jobs/${mockJob._id}`)
      );
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('تم النسخ!')).toBeInTheDocument();
    });
  });

  it('should open WhatsApp share', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const whatsappButton = screen.getByText('WhatsApp');
    fireEvent.click(whatsappButton);

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/'),
      '_blank',
      'width=600,height=400'
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should open LinkedIn share', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const linkedinButton = screen.getByText('LinkedIn');
    fireEvent.click(linkedinButton);

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('https://www.linkedin.com/sharing/share-offsite/'),
      '_blank',
      'width=600,height=400'
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should open Twitter share', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const twitterButton = screen.getByText('Twitter');
    fireEvent.click(twitterButton);

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('https://twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=400'
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should open Facebook share', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const facebookButton = screen.getByText('Facebook');
    fireEvent.click(facebookButton);

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('https://www.facebook.com/sharer/sharer.php'),
      '_blank',
      'width=600,height=400'
    );
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show native share button when supported', () => {
    // Mock navigator.share
    Object.assign(navigator, {
      share: vi.fn(() => Promise.resolve())
    });

    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    expect(screen.getByText('المزيد من الخيارات')).toBeInTheDocument();
  });

  it('should not show native share button when not supported', () => {
    // Remove navigator.share
    delete navigator.share;

    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    expect(screen.queryByText('المزيد من الخيارات')).not.toBeInTheDocument();
  });

  it('should handle missing job gracefully', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={null}
      />
    );

    expect(screen.queryByText('مشاركة الوظيفة')).not.toBeInTheDocument();
  });

  it('should build correct job URL', () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const copyButton = screen.getByText('نسخ الرابط');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${window.location.origin}/jobs/${mockJob._id}`
    );
  });

  it('should build correct share text', async () => {
    render(
      <ShareModal
        isOpen={true}
        onClose={mockOnClose}
        job={mockJob}
      />
    );

    const whatsappButton = screen.getByText('WhatsApp');
    fireEvent.click(whatsappButton);

    const expectedText = `${mockJob.title} في ${mockJob.company.name}`;
    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(expectedText)),
      '_blank',
      'width=600,height=400'
    );
  });
});
