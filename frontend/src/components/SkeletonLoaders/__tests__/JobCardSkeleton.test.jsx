import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JobCardGridSkeleton from '../JobCardGridSkeleton';
import JobCardListSkeleton from '../JobCardListSkeleton';
import { AnimationProvider } from '../../../context/AnimationContext';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

const renderWithAnimation = (component) => {
  return render(
    <AnimationProvider>
      {component}
    </AnimationProvider>
  );
};

describe('JobCardGridSkeleton', () => {
  it('renders single skeleton by default', () => {
    renderWithAnimation(<JobCardGridSkeleton />);
    
    const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeletons).toHaveLength(1);
  });

  it('renders multiple skeletons when count is specified', () => {
    renderWithAnimation(<JobCardGridSkeleton count={6} />);
    
    const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeletons).toHaveLength(6);
  });

  it('has correct aria-label', () => {
    renderWithAnimation(<JobCardGridSkeleton />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveAttribute('aria-label', 'جاري تحميل بطاقة الوظيفة');
  });

  it('has aria-busy attribute', () => {
    renderWithAnimation(<JobCardGridSkeleton />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('applies custom className', () => {
    renderWithAnimation(<JobCardGridSkeleton className="custom-class" />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('has job-card-grid class', () => {
    renderWithAnimation(<JobCardGridSkeleton />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveClass('job-card-grid');
  });

  it('contains all required skeleton elements', () => {
    renderWithAnimation(<JobCardGridSkeleton />);
    
    // Check for various loading labels
    expect(screen.getByLabelText('جاري تحميل شعار الشركة')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل عنوان الوظيفة')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل اسم الشركة')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل الوصف')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل الموقع')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل نوع العمل')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل الراتب')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل التاريخ')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل المهارات')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل زر التقديم')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل زر الحفظ')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل زر المشاركة')).toBeInTheDocument();
  });
});

describe('JobCardListSkeleton', () => {
  it('renders single skeleton by default', () => {
    renderWithAnimation(<JobCardListSkeleton />);
    
    const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeletons).toHaveLength(1);
  });

  it('renders multiple skeletons when count is specified', () => {
    renderWithAnimation(<JobCardListSkeleton count={6} />);
    
    const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeletons).toHaveLength(6);
  });

  it('has correct aria-label', () => {
    renderWithAnimation(<JobCardListSkeleton />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveAttribute('aria-label', 'جاري تحميل بطاقة الوظيفة');
  });

  it('has aria-busy attribute', () => {
    renderWithAnimation(<JobCardListSkeleton />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('applies custom className', () => {
    renderWithAnimation(<JobCardListSkeleton className="custom-class" />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('has job-card-list class', () => {
    renderWithAnimation(<JobCardListSkeleton />);
    
    const skeleton = screen.getByLabelText('جاري تحميل بطاقة الوظيفة');
    expect(skeleton).toHaveClass('job-card-list');
  });

  it('contains all required skeleton elements including extra details', () => {
    renderWithAnimation(<JobCardListSkeleton />);
    
    // Check for various loading labels
    expect(screen.getByLabelText('جاري تحميل شعار الشركة')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل عنوان الوظيفة')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل اسم الشركة')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل الوصف')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل الموقع')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل نوع العمل')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل الراتب')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل التاريخ')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل عدد المتقدمين')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل نسبة التطابق')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل المهارات')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل زر التقديم')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل زر الحفظ')).toBeInTheDocument();
    expect(screen.getByLabelText('جاري تحميل زر المشاركة')).toBeInTheDocument();
  });
});

describe('Skeleton Count Consistency (Property 10)', () => {
  it('Grid: renders exactly the specified count', () => {
    const counts = [1, 3, 6, 9];
    
    counts.forEach(count => {
      const { unmount } = renderWithAnimation(<JobCardGridSkeleton count={count} />);
      const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
      expect(skeletons).toHaveLength(count);
      unmount();
    });
  });

  it('List: renders exactly the specified count', () => {
    const counts = [1, 3, 6, 9];
    
    counts.forEach(count => {
      const { unmount } = renderWithAnimation(<JobCardListSkeleton count={count} />);
      const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
      expect(skeletons).toHaveLength(count);
      unmount();
    });
  });

  it('Grid: recommended count is 6-9', () => {
    // Test that 6-9 skeletons render correctly
    [6, 7, 8, 9].forEach(count => {
      const { unmount } = renderWithAnimation(<JobCardGridSkeleton count={count} />);
      const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
      expect(skeletons.length).toBeGreaterThanOrEqual(6);
      expect(skeletons.length).toBeLessThanOrEqual(9);
      unmount();
    });
  });

  it('List: recommended count is 6-9', () => {
    // Test that 6-9 skeletons render correctly
    [6, 7, 8, 9].forEach(count => {
      const { unmount } = renderWithAnimation(<JobCardListSkeleton count={count} />);
      const skeletons = screen.getAllByLabelText('جاري تحميل بطاقة الوظيفة');
      expect(skeletons.length).toBeGreaterThanOrEqual(6);
      expect(skeletons.length).toBeLessThanOrEqual(9);
      unmount();
    });
  });
});
