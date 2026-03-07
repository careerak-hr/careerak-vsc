import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ShareButton from '../ShareButton';
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
  isNativeShareSupported: vi.fn(() => false)
}));

describe('ShareButton', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يعرض الزر بشكل صحيح', () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    expect(button).toBeInTheDocument();
  });

  it('يفتح Modal عند النقر', async () => {
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('يستخدم Web Share API عند الدعم', async () => {
    shareUtils.isNativeShareSupported.mockReturnValue(true);
    shareUtils.shareJob.mockResolvedValue(true);
    
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });
    
    const onShare = vi.fn();
    render(<ShareButton job={mockJob} onShare={onShare} />);
    
    const button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(shareUtils.shareJob).toHaveBeenCalledWith(mockJob, 'native');
      expect(onShare).toHaveBeenCalledWith('native');
    });
  });

  it('يعرض نص الزر عند variant="both"', () => {
    render(<ShareButton job={mockJob} variant="both" />);
    
    expect(screen.getByText('مشاركة')).toBeInTheDocument();
  });

  it('يطبق الحجم الصحيح', () => {
    const { rerender } = render(<ShareButton job={mockJob} size="small" />);
    let button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    expect(button).toHaveClass('share-button-small');
    
    rerender(<ShareButton job={mockJob} size="large" />);
    button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    expect(button).toHaveClass('share-button-large');
  });

  it('يمنع النقر عند التحميل', async () => {
    shareUtils.isNativeShareSupported.mockReturnValue(true);
    shareUtils.shareJob.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });
    
    render(<ShareButton job={mockJob} />);
    
    const button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });

  it('يوقف انتشار الحدث', () => {
    const onClick = vi.fn();
    render(
      <div onClick={onClick}>
        <ShareButton job={mockJob} />
      </div>
    );
    
    const button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    fireEvent.click(button);
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('يطبق CSS classes إضافية', () => {
    render(<ShareButton job={mockJob} className="custom-class" />);
    
    const button = screen.getByRole('button', { name: /مشاركة الوظيفة/i });
    expect(button).toHaveClass('custom-class');
  });
});
