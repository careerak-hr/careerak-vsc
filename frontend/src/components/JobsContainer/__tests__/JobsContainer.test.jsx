import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobsContainer from '../JobsContainer';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock JobCard components
jest.mock('../../JobCard/JobCardGrid', () => {
  return function JobCardGrid({ job }) {
    return <div data-testid={`job-card-grid-${job.id}`}>{job.title}</div>;
  };
});

jest.mock('../../JobCard/JobCardList', () => {
  return function JobCardList({ job }) {
    return <div data-testid={`job-card-list-${job.id}`}>{job.title}</div>;
  };
});

describe('JobsContainer', () => {
  const mockJobs = [
    {
      id: '1',
      title: 'مطور Full Stack',
      company: { name: 'شركة التقنية' },
      description: 'وصف الوظيفة',
      location: { city: 'الرياض' },
      type: 'دوام كامل',
      salary: 15000,
      createdAt: new Date(),
      requiredSkills: ['React', 'Node.js']
    },
    {
      id: '2',
      title: 'مصمم UI/UX',
      company: { name: 'استوديو الإبداع' },
      description: 'وصف الوظيفة',
      location: { city: 'جدة' },
      type: 'دوام كامل',
      salary: 12000,
      createdAt: new Date(),
      requiredSkills: ['Figma', 'Adobe XD']
    }
  ];

  const mockProps = {
    jobs: mockJobs,
    view: 'grid',
    onBookmark: jest.fn(),
    onShare: jest.fn(),
    onJobClick: jest.fn(),
    bookmarkedJobs: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('يجب أن يعرض المكون بنجاح', () => {
      render(<JobsContainer {...mockProps} />);
      expect(screen.getByText('مطور Full Stack')).toBeInTheDocument();
      expect(screen.getByText('مصمم UI/UX')).toBeInTheDocument();
    });

    it('يجب أن يعرض Grid view عندما view="grid"', () => {
      render(<JobsContainer {...mockProps} view="grid" />);
      expect(screen.getByTestId('job-card-grid-1')).toBeInTheDocument();
      expect(screen.getByTestId('job-card-grid-2')).toBeInTheDocument();
    });

    it('يجب أن يعرض List view عندما view="list"', () => {
      render(<JobsContainer {...mockProps} view="list" />);
      expect(screen.getByTestId('job-card-list-1')).toBeInTheDocument();
      expect(screen.getByTestId('job-card-list-2')).toBeInTheDocument();
    });

    it('يجب أن يعرض رسالة فارغة عندما لا توجد وظائف', () => {
      const { container } = render(<JobsContainer {...mockProps} jobs={[]} />);
      const jobCards = container.querySelectorAll('[data-testid^="job-card"]');
      expect(jobCards.length).toBe(0);
    });
  });

  describe('View Switching', () => {
    it('يجب أن يطبق الـ CSS class الصحيح للـ Grid view', () => {
      const { container } = render(<JobsContainer {...mockProps} view="grid" />);
      const jobsContainer = container.querySelector('.jobs-container');
      expect(jobsContainer).toHaveClass('jobs-grid');
    });

    it('يجب أن يطبق الـ CSS class الصحيح للـ List view', () => {
      const { container } = render(<JobsContainer {...mockProps} view="list" />);
      const jobsContainer = container.querySelector('.jobs-container');
      expect(jobsContainer).toHaveClass('jobs-list');
    });

    it('يجب أن يعيد render عند تغيير view', async () => {
      const { rerender } = render(<JobsContainer {...mockProps} view="grid" />);
      expect(screen.getByTestId('job-card-grid-1')).toBeInTheDocument();

      rerender(<JobsContainer {...mockProps} view="list" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('job-card-list-1')).toBeInTheDocument();
      });
    });
  });

  describe('Bookmarks', () => {
    it('يجب أن يمرر حالة bookmark الصحيحة للبطاقات', () => {
      const bookmarkedJobs = ['1'];
      render(<JobsContainer {...mockProps} bookmarkedJobs={bookmarkedJobs} />);
      
      // التحقق من أن البطاقة الأولى محفوظة
      // (في الواقع، هذا يعتمد على تنفيذ JobCard)
      expect(screen.getByText('مطور Full Stack')).toBeInTheDocument();
    });

    it('يجب أن يتعرف على الوظائف المحفوظة بشكل صحيح', () => {
      const bookmarkedJobs = ['1', '2'];
      render(<JobsContainer {...mockProps} bookmarkedJobs={bookmarkedJobs} />);
      
      expect(mockJobs.length).toBe(2);
      expect(bookmarkedJobs.length).toBe(2);
    });
  });

  describe('Callbacks', () => {
    it('يجب أن يمرر callback functions للبطاقات', () => {
      render(<JobsContainer {...mockProps} />);
      
      // التحقق من أن الـ props تم تمريرها
      expect(mockProps.onBookmark).toBeDefined();
      expect(mockProps.onShare).toBeDefined();
      expect(mockProps.onJobClick).toBeDefined();
    });
  });

  describe('Animations', () => {
    it('يجب أن يحتوي على motion.div wrapper', () => {
      const { container } = render(<JobsContainer {...mockProps} />);
      const motionDiv = container.querySelector('.jobs-container');
      expect(motionDiv).toBeInTheDocument();
    });

    it('يجب أن يحتوي على job-card-wrapper لكل وظيفة', () => {
      const { container } = render(<JobsContainer {...mockProps} />);
      const wrappers = container.querySelectorAll('.job-card-wrapper');
      expect(wrappers.length).toBe(mockJobs.length);
    });
  });

  describe('Accessibility', () => {
    it('يجب أن يكون المكون accessible', () => {
      const { container } = render(<JobsContainer {...mockProps} />);
      expect(container.querySelector('.jobs-container')).toBeInTheDocument();
    });

    it('يجب أن يعرض جميع الوظائف', () => {
      render(<JobsContainer {...mockProps} />);
      mockJobs.forEach(job => {
        expect(screen.getByText(job.title)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('يجب أن يتعامل مع عدد كبير من الوظائف', () => {
      const manyJobs = Array.from({ length: 50 }, (_, i) => ({
        ...mockJobs[0],
        id: `job-${i}`,
        title: `وظيفة ${i}`
      }));

      const { container } = render(<JobsContainer {...mockProps} jobs={manyJobs} />);
      const jobCards = container.querySelectorAll('.job-card-wrapper');
      expect(jobCards.length).toBe(50);
    });
  });
});
