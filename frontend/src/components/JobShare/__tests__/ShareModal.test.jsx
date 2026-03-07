import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ShareModal from '../ShareModal';
import * as shareUtils from '../../../utils/shareUtils';

// Mock AppContext
vi.mock('../../../context/AppContext', () => ({
  useApp: () => ({
    language: 'ar'
  })
}));

// Mock shareUtils
vi.mock('../../../utils/shareUtils', () => ({
  shareJob: vi.fn(),
  getJobUrl: vi.fn((id) => `https://careerak.com/jobs/${id}`),
  isNativeShareSupported: vi.fn(() => false)
}));

describe('ShareModal', () => {
  const mockJob = {
    id: '123',
    title: 'مطور Full Stack',
    company: {
      name: 'شركة التقنية',
      logo: 'https://example.com/logo.png'
    },
    location: {
      city: 'الرياض'
    }
  };

  const mockOnShare = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يعرض Modal بشكل صحيح', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('مشاركة الوظيفة')).toBeInTheDocument();
    expect(screen.getByText(mockJob.title)).toBeInTheDocument();
    expect(screen.getByText(mockJob.company.name)).toBeInTheDocument();
  });

  it('يعرض جميع خيارات المشاركة', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('نسخ الرابط')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('يعرض رابط الوظيفة', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const urlInput = screen.getByDisplayValue('https://careerak.com/jobs/123');
    expect(urlInput).toBeInTheDocument();
  });

  it('يغلق عند النقر على زر الإغلاق', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /إغلاق/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('يغلق عند النقر على الخلفية', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('يغلق عند الضغط على Escape', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('ينسخ الرابط عند النقر على "نسخ الرابط"', async () => {
    shareUtils.shareJob.mockResolvedValue(true);
    
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const copyButton = screen.getByText('نسخ الرابط');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(shareUtils.shareJob).toHaveBeenCalledWith(mockJob, 'copy');
      expect(mockOnShare).toHaveBeenCalledWith('copy');
    });
  });

  it('يعرض رسالة نجاح بعد النسخ', async () => {
    shareUtils.shareJob.mockResolvedValue(true);
    
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const copyButton = screen.getByText('نسخ الرابط');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText('تم نسخ الرابط!')).toBeInTheDocument();
    });
  });

  it('يشارك على WhatsApp', async () => {
    shareUtils.shareJob.mockResolvedValue(true);
    
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const whatsappButton = screen.getByText('WhatsApp');
    fireEvent.click(whatsappButton);
    
    await waitFor(() => {
      expect(shareUtils.shareJob).toHaveBeenCalledWith(mockJob, 'whatsapp');
      expect(mockOnShare).toHaveBeenCalledWith('whatsapp');
    });
  });

  it('يشارك على LinkedIn', async () => {
    shareUtils.shareJob.mockResolvedValue(true);
    
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const linkedinButton = screen.getByText('LinkedIn');
    fireEvent.click(linkedinButton);
    
    await waitFor(() => {
      expect(shareUtils.shareJob).toHaveBeenCalledWith(mockJob, 'linkedin');
      expect(mockOnShare).toHaveBeenCalledWith('linkedin');
    });
  });

  it('يمنع scroll في الخلفية', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('يستعيد scroll عند الإغلاق', () => {
    const { unmount } = render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    unmount();
    
    expect(document.body.style.overflow).toBe('');
  });

  it('يعرض خيار المشاركة الأصلي على الموبايل', () => {
    shareUtils.isNativeShareSupported.mockReturnValue(true);
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });
    
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('مشاركة')).toBeInTheDocument();
  });

  it('يختار النص عند النقر على حقل الرابط', () => {
    render(
      <ShareModal 
        job={mockJob}
        onShare={mockOnShare}
        onClose={mockOnClose}
      />
    );
    
    const urlInput = screen.getByDisplayValue('https://careerak.com/jobs/123');
    const selectSpy = vi.spyOn(urlInput, 'select');
    
    fireEvent.click(urlInput);
    
    expect(selectSpy).toHaveBeenCalled();
  });
});
