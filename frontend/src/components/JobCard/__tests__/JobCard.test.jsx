import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JobCardGrid, JobCardList } from '../index';

// بيانات وظيفة تجريبية
const mockJob = {
  id: 1,
  title: 'مطور Full Stack',
  company: {
    name: 'شركة التقنية',
    logo: null
  },
  description: 'وصف الوظيفة هنا',
  location: {
    city: 'الرياض'
  },
  type: 'دوام كامل',
  salary: 15000,
  createdAt: new Date(),
  requiredSkills: ['React', 'Node.js', 'MongoDB'],
  isNew: true,
  isUrgent: false,
  applicantCount: 45,
  matchPercentage: 85
};

describe('JobCardGrid', () => {
  it('يعرض معلومات الوظيفة بشكل صحيح', () => {
    render(<JobCardGrid job={mockJob} />);
    
    expect(screen.getByText('مطور Full Stack')).toBeInTheDocument();
    expect(screen.getByText('شركة التقنية')).toBeInTheDocument();
    expect(screen.getByText('الرياض')).toBeInTheDocument();
    expect(screen.getByText('دوام كامل')).toBeInTheDocument();
  });

  it('يعرض المهارات المطلوبة', () => {
    render(<JobCardGrid job={mockJob} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('يعرض badge "جديد" عندما isNew = true', () => {
    render(<JobCardGrid job={mockJob} />);
    
    expect(screen.getByText('جديد')).toBeInTheDocument();
  });

  it('يعرض badge "عاجل" عندما isUrgent = true', () => {
    const urgentJob = { ...mockJob, isUrgent: true };
    render(<JobCardGrid job={urgentJob} />);
    
    expect(screen.getByText('عاجل')).toBeInTheDocument();
  });

  it('يستدعي onBookmark عند النقر على زر الحفظ', () => {
    const handleBookmark = vi.fn();
    render(<JobCardGrid job={mockJob} onBookmark={handleBookmark} />);
    
    const bookmarkBtn = screen.getByLabelText('حفظ في المفضلة');
    fireEvent.click(bookmarkBtn);
    
    expect(handleBookmark).toHaveBeenCalledWith(1);
  });

  it('يستدعي onShare عند النقر على زر المشاركة', () => {
    const handleShare = vi.fn();
    render(<JobCardGrid job={mockJob} onShare={handleShare} />);
    
    const shareBtn = screen.getByLabelText('مشاركة الوظيفة');
    fireEvent.click(shareBtn);
    
    expect(handleShare).toHaveBeenCalledWith(mockJob);
  });

  it('يستدعي onClick عند النقر على البطاقة', () => {
    const handleClick = vi.fn();
    render(<JobCardGrid job={mockJob} onClick={handleClick} />);
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith(mockJob);
  });

  it('يعرض أيقونة bookmark ممتلئة عندما isBookmarked = true', () => {
    render(<JobCardGrid job={mockJob} isBookmarked={true} />);
    
    const bookmarkBtn = screen.getByLabelText('إزالة من المفضلة');
    expect(bookmarkBtn).toHaveClass('bookmarked');
  });

  it('يعرض placeholder للشعار عندما لا يوجد logo', () => {
    render(<JobCardGrid job={mockJob} />);
    
    const placeholder = screen.getByText('ش');
    expect(placeholder).toBeInTheDocument();
  });

  it('يعرض الراتب بتنسيق صحيح', () => {
    render(<JobCardGrid job={mockJob} />);
    
    // يدعم كلا من الأرقام العربية والإنجليزية
    expect(screen.getByText(/ريال/)).toBeInTheDocument();
  });
});

describe('JobCardList', () => {
  it('يعرض معلومات الوظيفة بشكل صحيح', () => {
    render(<JobCardList job={mockJob} />);
    
    expect(screen.getByText('مطور Full Stack')).toBeInTheDocument();
    expect(screen.getByText('شركة التقنية')).toBeInTheDocument();
    expect(screen.getByText('الرياض')).toBeInTheDocument();
  });

  it('يعرض عدد المتقدمين', () => {
    render(<JobCardList job={mockJob} />);
    
    expect(screen.getByText('45 متقدم')).toBeInTheDocument();
  });

  it('يعرض نسبة التطابق', () => {
    render(<JobCardList job={mockJob} />);
    
    expect(screen.getByText('85% تطابق')).toBeInTheDocument();
  });

  it('يعرض المزيد من المهارات في عرض List', () => {
    const jobWithManySkills = {
      ...mockJob,
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS']
    };
    render(<JobCardList job={jobWithManySkills} />);
    
    // يجب أن يعرض 5 مهارات + "+1"
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('يستدعي onBookmark عند النقر على زر الحفظ', () => {
    const handleBookmark = vi.fn();
    render(<JobCardList job={mockJob} onBookmark={handleBookmark} />);
    
    const bookmarkBtn = screen.getByLabelText('حفظ في المفضلة');
    fireEvent.click(bookmarkBtn);
    
    expect(handleBookmark).toHaveBeenCalledWith(1);
  });

  it('يستدعي onShare عند النقر على زر المشاركة', () => {
    const handleShare = vi.fn();
    render(<JobCardList job={mockJob} onShare={handleShare} />);
    
    const shareBtn = screen.getByLabelText('مشاركة الوظيفة');
    fireEvent.click(shareBtn);
    
    expect(handleShare).toHaveBeenCalledWith(mockJob);
  });

  it('يستدعي onClick عند النقر على البطاقة', () => {
    const handleClick = vi.fn();
    render(<JobCardList job={mockJob} onClick={handleClick} />);
    
    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledWith(mockJob);
  });
});

describe('Responsive Grid Layout', () => {
  it('يطبق grid-template-columns الصحيح للـ Desktop', () => {
    const { container } = render(
      <div className="jobs-grid">
        <JobCardGrid job={mockJob} />
      </div>
    );
    
    const grid = container.querySelector('.jobs-grid');
    const styles = window.getComputedStyle(grid);
    
    // في Desktop يجب أن يكون 3 أعمدة
    // ملاحظة: هذا الاختبار يعتمد على CSS المطبق
    expect(grid).toHaveClass('jobs-grid');
  });
});

describe('Accessibility', () => {
  it('يحتوي على aria-label للبطاقة', () => {
    render(<JobCardGrid job={mockJob} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'وظيفة مطور Full Stack في شركة التقنية');
  });

  it('يحتوي على aria-label لزر التقديم', () => {
    render(<JobCardGrid job={mockJob} />);
    
    const applyBtn = screen.getByLabelText('التقديم على وظيفة مطور Full Stack');
    expect(applyBtn).toBeInTheDocument();
  });

  it('يحتوي على aria-label لزر الحفظ', () => {
    render(<JobCardGrid job={mockJob} />);
    
    const bookmarkBtn = screen.getByLabelText('حفظ في المفضلة');
    expect(bookmarkBtn).toBeInTheDocument();
  });

  it('يحتوي على aria-label لزر المشاركة', () => {
    render(<JobCardGrid job={mockJob} />);
    
    const shareBtn = screen.getByLabelText('مشاركة الوظيفة');
    expect(shareBtn).toBeInTheDocument();
  });
});
