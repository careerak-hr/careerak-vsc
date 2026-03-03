/**
 * UpcomingInterviewsList Tests
 * اختبارات قائمة المقابلات القادمة
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../../../context/AppContext';
import UpcomingInterviewsList from '../UpcomingInterviewsList';

// Mock fetch
global.fetch = jest.fn();

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock data
const mockInterviews = [
  {
    _id: 'interview1',
    roomId: 'room123',
    hostId: {
      _id: 'host1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      profilePicture: 'https://example.com/avatar1.jpg'
    },
    participants: [
      {
        userId: {
          _id: 'participant1',
          name: 'سارة أحمد',
          profilePicture: 'https://example.com/avatar2.jpg'
        },
        role: 'participant',
        joinedAt: null,
        leftAt: null
      }
    ],
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    appointmentId: {
      _id: 'appointment1',
      title: 'مقابلة توظيف',
      description: 'مقابلة تقنية'
    },
    settings: {
      recordingEnabled: true,
      waitingRoomEnabled: true,
      maxParticipants: 2
    }
  }
];

const mockResponse = {
  success: true,
  interviews: mockInterviews,
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    pages: 1
  }
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <UpcomingInterviewsList />
      </AppProvider>
    </BrowserRouter>
  );
};

describe('UpcomingInterviewsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Loading State', () => {
    test('يجب أن يعرض حالة التحميل في البداية', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderComponent();
      
      expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    test('يجب أن يعرض قائمة المقابلات بنجاح', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('المقابلات القادمة')).toBeInTheDocument();
      });

      expect(screen.getByText('مقابلة توظيف')).toBeInTheDocument();
      expect(screen.getByText('أحمد محمد')).toBeInTheDocument();
      expect(screen.getByText('سارة أحمد')).toBeInTheDocument();
    });

    test('يجب أن يرسل الطلب مع token صحيح', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      renderComponent();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/video-interviews/upcoming'),
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer test-token'
            }
          })
        );
      });
    });

    test('يجب أن يعرض معلومات المشاركين بشكل صحيح', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('المشاركون:')).toBeInTheDocument();
      });

      const hostBadge = screen.getByText('مضيف');
      expect(hostBadge).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('يجب أن يعرض رسالة عند عدم وجود مقابلات', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          interviews: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          }
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('لا توجد مقابلات قادمة')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    test('يجب أن يعرض رسالة خطأ عند فشل الطلب', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
    });

    test('يجب أن يعيد المحاولة عند النقر على زر إعادة المحاولة', async () => {
      fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('إعادة المحاولة');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('المقابلات القادمة')).toBeInTheDocument();
      });
    });
  });

  describe('Time Calculations', () => {
    test('يجب أن يحسب الوقت المتبقي بشكل صحيح', async () => {
      const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now
      const interviewWithFutureDate = {
        ...mockInterviews[0],
        scheduledAt: futureDate.toISOString()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          interviews: [interviewWithFutureDate]
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/3.*ساعة/i)).toBeInTheDocument();
      });
    });

    test('يجب أن يعرض "الآن" للمقابلات التي بدأت', async () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const interviewWithPastDate = {
        ...mockInterviews[0],
        scheduledAt: pastDate.toISOString()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          interviews: [interviewWithPastDate]
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('الآن')).toBeInTheDocument();
      });
    });
  });

  describe('Join Button', () => {
    test('يجب أن يعرض زر "انضم الآن" قبل 5 دقائق من الموعد', async () => {
      const soonDate = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now
      const interviewSoon = {
        ...mockInterviews[0],
        scheduledAt: soonDate.toISOString()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          interviews: [interviewSoon]
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('انضم الآن')).toBeInTheDocument();
      });
    });

    test('يجب أن يعرض زر معطل للمقابلات البعيدة', async () => {
      const farDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const interviewFar = {
        ...mockInterviews[0],
        scheduledAt: farDate.toISOString()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          interviews: [interviewFar]
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('لم يحن الوقت بعد')).toBeInTheDocument();
      });

      const disabledButton = screen.getByText('لم يحن الوقت بعد');
      expect(disabledButton).toBeDisabled();
    });

    test('يجب أن ينتقل لصفحة المقابلة عند النقر على "انضم الآن"', async () => {
      const soonDate = new Date(Date.now() + 3 * 60 * 1000);
      const interviewSoon = {
        ...mockInterviews[0],
        scheduledAt: soonDate.toISOString()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          interviews: [interviewSoon]
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('انضم الآن')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('انضم الآن');
      fireEvent.click(joinButton);

      expect(mockNavigate).toHaveBeenCalledWith('/video-interview/interview1');
    });
  });

  describe('View Details Button', () => {
    test('يجب أن ينتقل لصفحة التفاصيل عند النقر على "عرض التفاصيل"', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('عرض التفاصيل')).toBeInTheDocument();
      });

      const detailsButton = screen.getByText('عرض التفاصيل');
      fireEvent.click(detailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/interview-details/interview1');
    });
  });

  describe('Pagination', () => {
    test('يجب أن يعرض pagination عند وجود عدة صفحات', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            pages: 3
          }
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/صفحة 1 من 3/i)).toBeInTheDocument();
      });

      expect(screen.getByText('السابق')).toBeInTheDocument();
      expect(screen.getByText('التالي')).toBeInTheDocument();
    });

    test('يجب أن يطلب الصفحة التالية عند النقر على "التالي"', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockResponse,
            pagination: {
              page: 1,
              limit: 10,
              total: 25,
              pages: 3
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ...mockResponse,
            pagination: {
              page: 2,
              limit: 10,
              total: 25,
              pages: 3
            }
          })
        });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('التالي')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('التالي');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });

    test('يجب أن يعطل زر "السابق" في الصفحة الأولى', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            pages: 3
          }
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('السابق')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('السابق');
      expect(prevButton).toBeDisabled();
    });

    test('يجب أن يعطل زر "التالي" في الصفحة الأخيرة', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockResponse,
          pagination: {
            page: 3,
            limit: 10,
            total: 25,
            pages: 3
          }
        })
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('التالي')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('التالي');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Date Formatting', () => {
    test('يجب أن يعرض التاريخ بتنسيق صحيح', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      renderComponent();

      await waitFor(() => {
        const dateElements = screen.getAllByText(/\d{4}/); // Year
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    test('يجب أن يعرض الوقت بتنسيق صحيح', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      renderComponent();

      await waitFor(() => {
        const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/); // Time format
        expect(timeElements.length).toBeGreaterThan(0);
      });
    });
  });
});
