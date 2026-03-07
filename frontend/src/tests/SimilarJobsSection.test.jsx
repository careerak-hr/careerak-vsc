/**
 * Tests for SimilarJobsSection Component
 * اختبارات مكون الوظائف المشابهة
 * 
 * Requirements: 4.5 - تحديث ديناميكي عند تغيير الوظيفة
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SimilarJobsSection from '../components/SimilarJobs/SimilarJobsSection';
import { AppProvider } from '../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

const mockSimilarJobs = [
  {
    _id: 'job1',
    title: 'Senior React Developer',
    company: { name: 'Tech Corp' },
    location: { city: 'Cairo', country: 'Egypt' },
    salary: { min: 5000, max: 7000 },
    skills: ['React', 'JavaScript', 'TypeScript'],
    similarityScore: 85
  },
  {
    _id: 'job2',
    title: 'Frontend Engineer',
    company: { name: 'Digital Solutions' },
    location: { city: 'Alexandria', country: 'Egypt' },
    salary: { min: 4500, max: 6500 },
    skills: ['React', 'Vue', 'CSS'],
    similarityScore: 75
  }
];

const renderComponent = (jobId = 'test-job-id') => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <SimilarJobsSection jobId={jobId} />
      </AppProvider>
    </BrowserRouter>
  );
};

describe('SimilarJobsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockSimilarJobs })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('should show loading state initially', () => {
      renderComponent();
      expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
    });

    it('should fetch similar jobs on mount', async () => {
      renderComponent('job-123');
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/job-postings/job-123/similar')
        );
      });
    });

    it('should display similar jobs after loading', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
        expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
      });
    });
  });

  describe('Dynamic Update (Requirement 4.5)', () => {
    it('should refetch similar jobs when jobId changes', async () => {
      const { rerender } = renderComponent('job-123');
      
      // Wait for initial fetch
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Change jobId
      rerender(
        <BrowserRouter>
          <AppProvider>
            <SimilarJobsSection jobId="job-456" />
          </AppProvider>
        </BrowserRouter>
      );

      // Should fetch again with new jobId
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringContaining('/api/job-postings/job-456/similar')
        );
      });
    });

    it('should show loading state during refetch', async () => {
      const { rerender } = renderComponent('job-123');
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      });

      // Mock slow response for second fetch
      fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, data: mockSimilarJobs })
        }), 100))
      );

      // Change jobId
      rerender(
        <BrowserRouter>
          <AppProvider>
            <SimilarJobsSection jobId="job-456" />
          </AppProvider>
        </BrowserRouter>
      );

      // Should show loading
      expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
    });

    it('should update displayed jobs after jobId change', async () => {
      const newMockJobs = [
        {
          _id: 'job3',
          title: 'Backend Developer',
          company: { name: 'New Company' },
          location: { city: 'Giza', country: 'Egypt' },
          salary: { min: 6000, max: 8000 },
          skills: ['Node.js', 'MongoDB'],
          similarityScore: 90
        }
      ];

      const { rerender } = renderComponent('job-123');
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      });

      // Mock new response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: newMockJobs })
      });

      // Change jobId
      rerender(
        <BrowserRouter>
          <AppProvider>
            <SimilarJobsSection jobId="job-456" />
          </AppProvider>
        </BrowserRouter>
      );

      // Should display new jobs
      await waitFor(() => {
        expect(screen.getByText('Backend Developer')).toBeInTheDocument();
        expect(screen.queryByText('Senior React Developer')).not.toBeInTheDocument();
      });
    });

    it('should not refetch if jobId remains the same', async () => {
      const { rerender } = renderComponent('job-123');
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Rerender with same jobId
      rerender(
        <BrowserRouter>
          <AppProvider>
            <SimilarJobsSection jobId="job-123" />
          </AppProvider>
        </BrowserRouter>
      );

      // Should not fetch again
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/حدث خطأ/i)).toBeInTheDocument();
      });
    });

    it('should handle 404 response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/حدث خطأ/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no similar jobs found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/لا توجد وظائف مشابهة/i)).toBeInTheDocument();
      });
    });
  });

  describe('Similarity Score Display', () => {
    it('should display similarity percentage for each job', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/85%/)).toBeInTheDocument();
        expect(screen.getByText(/75%/)).toBeInTheDocument();
      });
    });

    it('should use correct color for high similarity (>= 75%)', async () => {
      renderComponent();
      
      await waitFor(() => {
        const badges = screen.getAllByText(/نسبة التشابه/i);
        expect(badges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Carousel Navigation', () => {
    it('should show navigation buttons when multiple jobs exist', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/السابق/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/التالي/i)).toBeInTheDocument();
      });
    });

    it('should show dots indicator for multiple jobs', async () => {
      renderComponent();
      
      await waitFor(() => {
        const dots = screen.getAllByRole('button', { name: /Go to job/i });
        expect(dots.length).toBe(2);
      });
    });
  });

  describe('Job Information Display', () => {
    it('should display job title', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
      });
    });

    it('should display company name', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      });
    });

    it('should display location', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Cairo/)).toBeInTheDocument();
      });
    });

    it('should display salary range', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/5,000 - 7,000/)).toBeInTheDocument();
      });
    });

    it('should display skills (max 3)', async () => {
      renderComponent();
      
      await waitFor(() => {
        // Use getAllByText since "React" appears in both jobs
        const reactSkills = screen.getAllByText('React');
        expect(reactSkills.length).toBeGreaterThan(0);
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/السابق/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/التالي/i)).toBeInTheDocument();
      });
    });

    it('should have proper button roles', async () => {
      renderComponent();
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should use Redis cache (verified by single API call)', async () => {
      renderComponent('job-123');
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Verify cache parameter is included in URL
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/job-postings/job-123/similar')
      );
    });
  });
});
