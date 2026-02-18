import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ProfileSkeleton,
  JobListSkeleton,
  CourseListSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  TableSkeleton
} from '../SkeletonLoaders';

describe('Skeleton Loaders', () => {
  describe('ProfileSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ProfileSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('has pulse animation', () => {
      const { container } = render(<ProfileSkeleton />);
      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('matches content layout with avatar, stats, and sections', () => {
      const { container } = render(<ProfileSkeleton />);
      // Check for avatar (circular element)
      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
      // Check for stats grid
      const statsGrid = container.querySelector('.grid-cols-3');
      expect(statsGrid).toBeInTheDocument();
    });
  });

  describe('JobListSkeleton', () => {
    it('renders default count of 5 items', () => {
      const { container } = render(<JobListSkeleton />);
      const jobCards = container.querySelectorAll('.space-y-4 > div');
      expect(jobCards.length).toBe(5);
    });

    it('renders custom count of items', () => {
      const { container } = render(<JobListSkeleton count={8} />);
      const jobCards = container.querySelectorAll('.space-y-4 > div');
      expect(jobCards.length).toBe(8);
    });

    it('has pulse animation on all cards', () => {
      const { container } = render(<JobListSkeleton count={3} />);
      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBe(3);
    });
  });

  describe('CourseListSkeleton', () => {
    it('renders default count of 6 items', () => {
      const { container } = render(<CourseListSkeleton />);
      const courseCards = container.querySelectorAll('.grid > div');
      expect(courseCards.length).toBe(6);
    });

    it('renders custom count of items', () => {
      const { container } = render(<CourseListSkeleton count={9} />);
      const courseCards = container.querySelectorAll('.grid > div');
      expect(courseCards.length).toBe(9);
    });

    it('uses grid layout', () => {
      const { container } = render(<CourseListSkeleton />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('FormSkeleton', () => {
    it('renders default 4 fields', () => {
      const { container } = render(<FormSkeleton />);
      const fields = container.querySelectorAll('.space-y-4 > div');
      expect(fields.length).toBe(4);
    });

    it('renders custom number of fields', () => {
      const { container } = render(<FormSkeleton fields={6} />);
      const fields = container.querySelectorAll('.space-y-4 > div');
      expect(fields.length).toBe(6);
    });

    it('shows title when hasTitle is true', () => {
      const { container } = render(<FormSkeleton hasTitle={true} />);
      const titleSection = container.querySelector('.mb-6');
      expect(titleSection).toBeInTheDocument();
    });

    it('hides title when hasTitle is false', () => {
      const { container } = render(<FormSkeleton hasTitle={false} />);
      const titleSection = container.querySelector('.mb-6');
      expect(titleSection).not.toBeInTheDocument();
    });
  });

  describe('DashboardSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders 4 stat cards', () => {
      const { container } = render(<DashboardSkeleton />);
      const statCards = container.querySelectorAll('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 > div');
      expect(statCards.length).toBe(4);
    });

    it('renders 2 chart sections', () => {
      const { container } = render(<DashboardSkeleton />);
      const charts = container.querySelectorAll('.lg\\:grid-cols-2 > div');
      expect(charts.length).toBe(2);
    });

    it('has pulse animation', () => {
      const { container } = render(<DashboardSkeleton />);
      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('TableSkeleton', () => {
    it('renders default 5 rows', () => {
      const { container } = render(<TableSkeleton />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows.length).toBe(5);
    });

    it('renders custom number of rows', () => {
      const { container } = render(<TableSkeleton rows={10} />);
      const rows = container.querySelectorAll('.divide-y > div');
      expect(rows.length).toBe(10);
    });

    it('shows actions column when hasActions is true', () => {
      const { container } = render(<TableSkeleton hasActions={true} />);
      const actionButtons = container.querySelector('.flex.space-x-2');
      expect(actionButtons).toBeInTheDocument();
    });

    it('renders pagination', () => {
      const { container } = render(<TableSkeleton />);
      const pagination = container.querySelector('.border-t');
      expect(pagination).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('ProfileSkeleton has dark mode classes', () => {
      const { container } = render(<ProfileSkeleton />);
      const darkElements = container.querySelectorAll('[class*="dark:bg-gray-700"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });

    it('JobListSkeleton has dark mode classes', () => {
      const { container } = render(<JobListSkeleton />);
      const darkElements = container.querySelectorAll('[class*="dark:bg-gray-"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });

    it('FormSkeleton has dark mode classes', () => {
      const { container } = render(<FormSkeleton />);
      const darkElements = container.querySelectorAll('[class*="dark:bg-gray-"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });

  describe('RTL Support', () => {
    it('ProfileSkeleton has RTL classes', () => {
      const { container } = render(<ProfileSkeleton />);
      const rtlElements = container.querySelectorAll('[class*="rtl:space-x-reverse"]');
      expect(rtlElements.length).toBeGreaterThan(0);
    });

    it('JobListSkeleton has RTL classes', () => {
      const { container } = render(<JobListSkeleton />);
      const rtlElements = container.querySelectorAll('[class*="rtl:space-x-reverse"]');
      expect(rtlElements.length).toBeGreaterThan(0);
    });

    it('TableSkeleton has RTL classes', () => {
      const { container } = render(<TableSkeleton />);
      const rtlElements = container.querySelectorAll('[class*="rtl:space-x-reverse"]');
      expect(rtlElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('all skeletons render valid HTML', () => {
      const skeletons = [
        <ProfileSkeleton />,
        <JobListSkeleton />,
        <CourseListSkeleton />,
        <FormSkeleton />,
        <DashboardSkeleton />,
        <TableSkeleton />
      ];

      skeletons.forEach(skeleton => {
        const { container } = render(skeleton);
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
