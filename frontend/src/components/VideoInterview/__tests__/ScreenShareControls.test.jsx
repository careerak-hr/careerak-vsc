import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScreenShareControls from '../ScreenShareControls';

// Mock ScreenShareService
jest.mock('../../../services/screenShareService', () => {
  return jest.fn().mockImplementation(() => ({
    startScreenShare: jest.fn().mockResolvedValue(new MediaStream()),
    stopScreenShare: jest.fn(),
    isSharing: jest.fn().mockReturnValue(false),
    getShareType: jest.fn().mockReturnValue('screen'),
    getQuality: jest.fn().mockReturnValue({ width: 1920, height: 1080, frameRate: 30 })
  }));
});

describe('ScreenShareControls', () => {
  beforeEach(() => {
    // Mock navigator.mediaDevices
    global.navigator.mediaDevices = {
      getDisplayMedia: jest.fn().mockResolvedValue(new MediaStream())
    };
  });

  test('يعرض زر مشاركة الشاشة عندما لا توجد مشاركة نشطة', () => {
    render(<ScreenShareControls />);
    
    const shareButton = screen.getByText('مشاركة الشاشة');
    expect(shareButton).toBeInTheDocument();
  });

  test('يعرض زر إيقاف المشاركة عندما تكون المشاركة نشطة', async () => {
    const { rerender } = render(<ScreenShareControls />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      const stopButton = screen.getByText('إيقاف المشاركة');
      expect(stopButton).toBeInTheDocument();
    });
  });

  test('زر إيقاف المشاركة واضح ومرئي', async () => {
    render(<ScreenShareControls />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      const stopButton = screen.getByText('إيقاف المشاركة');
      
      // التحقق من وجود الزر
      expect(stopButton).toBeInTheDocument();
      
      // التحقق من وجود الأيقونة
      const icon = stopButton.querySelector('i.fa-stop-circle');
      expect(icon).toBeInTheDocument();
      
      // التحقق من أن الزر له class مميز
      expect(stopButton.closest('.btn-stop-share')).toBeInTheDocument();
    });
  });

  test('يعرض modal تأكيد عند النقر على زر الإيقاف', async () => {
    render(<ScreenShareControls />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      const stopButton = screen.getByText('إيقاف المشاركة');
      fireEvent.click(stopButton);
    });

    // التحقق من ظهور modal التأكيد
    await waitFor(() => {
      expect(screen.getByText('إيقاف مشاركة الشاشة؟')).toBeInTheDocument();
    });
  });

  test('يمكن إلغاء إيقاف المشاركة من modal التأكيد', async () => {
    render(<ScreenShareControls />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      const stopButton = screen.getByText('إيقاف المشاركة');
      fireEvent.click(stopButton);
    });

    // النقر على زر الإلغاء في modal
    await waitFor(() => {
      const cancelButton = screen.getByText('إلغاء');
      fireEvent.click(cancelButton);
    });

    // التحقق من أن المشاركة لا تزال نشطة
    await waitFor(() => {
      expect(screen.getByText('إيقاف المشاركة')).toBeInTheDocument();
    });
  });

  test('يوقف المشاركة عند تأكيد الإيقاف من modal', async () => {
    const onShareStop = jest.fn();
    render(<ScreenShareControls onShareStop={onShareStop} />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      const stopButton = screen.getByText('إيقاف المشاركة');
      fireEvent.click(stopButton);
    });

    // تأكيد الإيقاف من modal
    await waitFor(() => {
      const confirmButtons = screen.getAllByText('إيقاف المشاركة');
      const confirmButton = confirmButtons.find(btn => 
        btn.closest('.btn-confirm-stop')
      );
      fireEvent.click(confirmButton);
    });

    // التحقق من استدعاء callback
    await waitFor(() => {
      expect(onShareStop).toHaveBeenCalled();
    });
  });

  test('زر الإيقاف يبقى واضحاً على الشاشات الصغيرة', async () => {
    // محاكاة شاشة صغيرة
    global.innerWidth = 480;
    global.dispatchEvent(new Event('resize'));

    render(<ScreenShareControls />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      const stopButton = screen.getByText('إيقاف المشاركة');
      
      // التحقق من أن النص لا يزال ظاهراً
      expect(stopButton).toBeVisible();
      expect(stopButton.textContent).toContain('إيقاف المشاركة');
    });
  });

  test('يعرض مؤشر المشاركة النشطة بوضوح', async () => {
    render(<ScreenShareControls />);
    
    // بدء المشاركة
    const shareButton = screen.getByText('مشاركة الشاشة');
    fireEvent.click(shareButton);

    await waitFor(() => {
      // التحقق من وجود مؤشر "يشارك الآن"
      const indicator = screen.getByText(/يشارك/);
      expect(indicator).toBeInTheDocument();
      
      // التحقق من وجود أيقونة النبض
      const pulseIcon = document.querySelector('.sharing-pulse');
      expect(pulseIcon).toBeInTheDocument();
    });
  });
});
