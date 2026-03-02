import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InterviewTimer from '../InterviewTimer';

describe('InterviewTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('عرض المؤقت', () => {
    it('يعرض "لم تبدأ بعد" عندما لا يوجد startTime', () => {
      render(<InterviewTimer startTime={null} language="ar" />);
      
      expect(screen.getByText('لم تبدأ بعد')).toBeInTheDocument();
      expect(screen.getByText('مدة المقابلة:')).toBeInTheDocument();
    });

    it('يعرض الوقت بصيغة HH:MM:SS', () => {
      const startTime = Date.now() - 3661000; // قبل ساعة و دقيقة و ثانية
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      expect(screen.getByText('01:01:01')).toBeInTheDocument();
    });

    it('يعرض 00:00:00 عند البداية', () => {
      const startTime = Date.now();
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });
  });

  describe('تحديث الوقت', () => {
    it('يحسب الوقت المنقضي بشكل صحيح', () => {
      const startTime = Date.now() - 5000; // قبل 5 ثواني
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      // يجب أن يعرض 00:00:05 أو قريب منه
      expect(screen.getByText(/00:00:0[45]/)).toBeInTheDocument();
    });

    it('يحسب الوقت بشكل صحيح عند تجاوز الدقيقة', () => {
      const startTime = Date.now() - 63000; // قبل 63 ثانية (1:03)
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      // يجب أن يعرض 00:01:03 أو قريب منه
      expect(screen.getByText(/00:01:0[23]/)).toBeInTheDocument();
    });

    it('يحسب الوقت بشكل صحيح عند تجاوز الساعة', () => {
      const startTime = Date.now() - 3603000; // قبل 1:00:03
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      // يجب أن يعرض 01:00:03 أو قريب منه
      expect(screen.getByText(/01:00:0[23]/)).toBeInTheDocument();
    });
  });

  describe('الحالات', () => {
    it('يعرض أيقونة الإيقاف المؤقت عندما isActive=false', () => {
      const startTime = Date.now();
      
      render(<InterviewTimer startTime={startTime} isActive={false} language="ar" />);
      
      expect(screen.getByText('⏸️')).toBeInTheDocument();
    });

    it('لا يعرض أيقونة الإيقاف المؤقت عندما isActive=true', () => {
      const startTime = Date.now();
      
      render(<InterviewTimer startTime={startTime} isActive={true} language="ar" />);
      
      expect(screen.queryByText('⏸️')).not.toBeInTheDocument();
    });

    it('يطبق class "active" عندما isActive=true', () => {
      const startTime = Date.now();
      
      const { container } = render(
        <InterviewTimer startTime={startTime} isActive={true} language="ar" />
      );
      
      expect(container.querySelector('.interview-timer.active')).toBeInTheDocument();
    });

    it('يطبق class "paused" عندما isActive=false', () => {
      const startTime = Date.now();
      
      const { container } = render(
        <InterviewTimer startTime={startTime} isActive={false} language="ar" />
      );
      
      expect(container.querySelector('.interview-timer.paused')).toBeInTheDocument();
    });
  });

  describe('المواقع', () => {
    it('يطبق موقع top-left', () => {
      const startTime = Date.now();
      
      const { container } = render(
        <InterviewTimer startTime={startTime} position="top-left" language="ar" />
      );
      
      expect(container.querySelector('.interview-timer.top-left')).toBeInTheDocument();
    });

    it('يطبق موقع top-right', () => {
      const startTime = Date.now();
      
      const { container } = render(
        <InterviewTimer startTime={startTime} position="top-right" language="ar" />
      );
      
      expect(container.querySelector('.interview-timer.top-right')).toBeInTheDocument();
    });

    it('يطبق موقع bottom-left', () => {
      const startTime = Date.now();
      
      const { container } = render(
        <InterviewTimer startTime={startTime} position="bottom-left" language="ar" />
      );
      
      expect(container.querySelector('.interview-timer.bottom-left')).toBeInTheDocument();
    });

    it('يطبق موقع bottom-right', () => {
      const startTime = Date.now();
      
      const { container } = render(
        <InterviewTimer startTime={startTime} position="bottom-right" language="ar" />
      );
      
      expect(container.querySelector('.interview-timer.bottom-right')).toBeInTheDocument();
    });
  });

  describe('دعم اللغات', () => {
    it('يعرض النصوص بالعربية', () => {
      render(<InterviewTimer startTime={null} language="ar" />);
      
      expect(screen.getByText('مدة المقابلة:')).toBeInTheDocument();
      expect(screen.getByText('لم تبدأ بعد')).toBeInTheDocument();
    });

    it('يعرض النصوص بالإنجليزية', () => {
      render(<InterviewTimer startTime={null} language="en" />);
      
      expect(screen.getByText('Interview Duration:')).toBeInTheDocument();
      expect(screen.getByText('Not started yet')).toBeInTheDocument();
    });

    it('يعرض النصوص بالفرنسية', () => {
      render(<InterviewTimer startTime={null} language="fr" />);
      
      expect(screen.getByText('Durée de l\'entretien:')).toBeInTheDocument();
      expect(screen.getByText('Pas encore commencé')).toBeInTheDocument();
    });

    it('يستخدم العربية كلغة افتراضية للغة غير مدعومة', () => {
      render(<InterviewTimer startTime={null} language="es" />);
      
      expect(screen.getByText('مدة المقابلة:')).toBeInTheDocument();
    });
  });

  describe('إخفاء التسمية', () => {
    it('يخفي التسمية عندما showLabel=false', () => {
      const startTime = Date.now();
      
      render(
        <InterviewTimer 
          startTime={startTime} 
          showLabel={false} 
          language="ar" 
        />
      );
      
      expect(screen.queryByText('مدة المقابلة:')).not.toBeInTheDocument();
      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('يعرض التسمية عندما showLabel=true', () => {
      const startTime = Date.now();
      
      render(
        <InterviewTimer 
          startTime={startTime} 
          showLabel={true} 
          language="ar" 
        />
      );
      
      expect(screen.getByText('مدة المقابلة:')).toBeInTheDocument();
    });
  });

  describe('تنسيق الوقت', () => {
    it('يضيف أصفار في البداية للأرقام الأحادية', () => {
      const startTime = Date.now() - 5000; // 5 ثواني
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      expect(screen.getByText('00:00:05')).toBeInTheDocument();
    });

    it('يعرض الساعات بشكل صحيح', () => {
      const startTime = Date.now() - 7265000; // 2:01:05
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      expect(screen.getByText('02:01:05')).toBeInTheDocument();
    });

    it('يتعامل مع الأوقات الطويلة (10+ ساعات)', () => {
      const startTime = Date.now() - 36005000; // 10:00:05
      
      render(<InterviewTimer startTime={startTime} language="ar" />);
      
      expect(screen.getByText('10:00:05')).toBeInTheDocument();
    });
  });

  describe('تنظيف الموارد', () => {
    it('يوقف interval عند unmount', () => {
      const startTime = Date.now();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { unmount } = render(
        <InterviewTimer startTime={startTime} language="ar" />
      );
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('يوقف interval عند تغيير isActive إلى false', () => {
      const startTime = Date.now();
      
      const { rerender } = render(
        <InterviewTimer startTime={startTime} isActive={true} language="ar" />
      );
      
      rerender(
        <InterviewTimer startTime={startTime} isActive={false} language="ar" />
      );
      
      // التحقق من أن الوقت لا يتحدث بعد الإيقاف
      const currentTime = screen.getByText(/\d{2}:\d{2}:\d{2}/).textContent;
      
      vi.advanceTimersByTime(5000);
      
      expect(screen.getByText(currentTime)).toBeInTheDocument();
    });
  });
});
