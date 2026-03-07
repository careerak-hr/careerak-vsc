import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SalaryIndicator from '../SalaryIndicator';

describe('SalaryIndicator Component', () => {
  // بيانات اختبار
  const mockEstimateBelowAverage = {
    provided: 4000,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'below',
    percentageDiff: 33
  };

  const mockEstimateAverage = {
    provided: 6000,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'average',
    percentageDiff: 0
  };

  const mockEstimateAboveAverage = {
    provided: 7500,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'above',
    percentageDiff: 25
  };

  describe('Rendering', () => {
    test('يعرض المكون بشكل صحيح مع بيانات صحيحة', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} />);
      
      expect(screen.getByText('تقدير الراتب')).toBeInTheDocument();
      expect(screen.getByText('الراتب المعروض:')).toBeInTheDocument();
      expect(screen.getByText('متوسط السوق:')).toBeInTheDocument();
      expect(screen.getByText('النطاق:')).toBeInTheDocument();
    });

    test('لا يعرض شيء عندما estimate = null', () => {
      const { container } = render(<SalaryIndicator estimate={null} />);
      expect(container.firstChild).toBeNull();
    });

    test('لا يعرض شيء عندما estimate.market غير موجود', () => {
      const { container } = render(<SalaryIndicator estimate={{ provided: 5000 }} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('عرض نطاق الراتب', () => {
    test('يعرض نطاق الراتب (الأدنى - الأعلى) بشكل صحيح', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} />);
      
      // يجب أن يعرض النطاق بالتنسيق الصحيح (بالأرقام العربية)
      expect(screen.getByText(/٤٬٥٠٠/)).toBeInTheDocument();
      expect(screen.getByText(/٧٬٥٠٠/)).toBeInTheDocument();
    });

    test('يعرض الأرقام بفواصل عربية', () => {
      const estimateWithLargeNumbers = {
        ...mockEstimateAverage,
        provided: 15000,
        market: {
          average: 18000,
          min: 12000,
          max: 25000,
          count: 100
        }
      };

      render(<SalaryIndicator estimate={estimateWithLargeNumbers} />);
      
      // يجب أن تكون الأرقام منسقة بفواصل عربية
      expect(screen.getByText(/١٥٬٠٠٠/)).toBeInTheDocument();
      expect(screen.getByText(/١٨٬٠٠٠/)).toBeInTheDocument();
      expect(screen.getByText(/١٢٬٠٠٠/)).toBeInTheDocument();
    });

    test('يعرض العملة المخصصة', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} currency="دولار" />);
      
      const currencyElements = screen.getAllByText(/دولار/);
      expect(currencyElements.length).toBeGreaterThan(0);
    });
  });

  describe('المقارنة والألوان', () => {
    test('يعرض "أقل من المتوسط" مع اللون الأحمر', () => {
      const { container } = render(<SalaryIndicator estimate={mockEstimateBelowAverage} />);
      
      expect(screen.getByText(/أقل من المتوسط/)).toBeInTheDocument();
      expect(screen.getByText('🔴')).toBeInTheDocument();
      expect(container.querySelector('.bg-red-50')).toBeInTheDocument();
    });

    test('يعرض "متوسط السوق" مع اللون الأصفر', () => {
      const { container } = render(<SalaryIndicator estimate={mockEstimateAverage} />);
      
      expect(screen.getByText('متوسط السوق')).toBeInTheDocument();
      expect(screen.getByText('🟡')).toBeInTheDocument();
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });

    test('يعرض "أعلى من المتوسط" مع اللون الأخضر', () => {
      const { container } = render(<SalaryIndicator estimate={mockEstimateAboveAverage} />);
      
      expect(screen.getByText(/أعلى من المتوسط/)).toBeInTheDocument();
      expect(screen.getByText('🟢')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-50')).toBeInTheDocument();
    });

    test('يعرض نسبة الفرق عندما تكون موجودة', () => {
      render(<SalaryIndicator estimate={mockEstimateBelowAverage} />);
      expect(screen.getByText(/33%/)).toBeInTheDocument();
    });

    test('لا يعرض نسبة الفرق عندما تكون 0', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} />);
      expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });
  });

  describe('عدد الوظائف', () => {
    test('يعرض عدد الوظائف المستخدمة في الحساب', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} />);
      expect(screen.getByText(/45 وظيفة مشابهة/)).toBeInTheDocument();
    });

    test('لا يعرض عدد الوظائف عندما لا يكون موجوداً', () => {
      const estimateWithoutCount = {
        ...mockEstimateAverage,
        market: {
          ...mockEstimateAverage.market,
          count: undefined
        }
      };

      render(<SalaryIndicator estimate={estimateWithoutCount} />);
      expect(screen.queryByText(/وظيفة مشابهة/)).not.toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    test('يعرض tooltip توضيحي', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} />);
      
      expect(screen.getByText(/يتم حساب تقدير الراتب/)).toBeInTheDocument();
      expect(screen.getByText(/النطاق يمثل الحد الأدنى والأعلى/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('الأيقونة لها aria-label', () => {
      render(<SalaryIndicator estimate={mockEstimateAverage} />);
      
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('aria-label', 'متوسط السوق');
    });
  });

  describe('Edge Cases', () => {
    test('يتعامل مع الأرقام الصفرية بشكل صحيح', () => {
      const estimateWithZero = {
        ...mockEstimateAverage,
        provided: 0,
        market: {
          average: 0,
          min: 0,
          max: 0,
          count: 1
        }
      };

      render(<SalaryIndicator estimate={estimateWithZero} />);
      // الصفر بالعربية هو ٠ - يظهر عدة مرات
      const zeroElements = screen.getAllByText(/٠/);
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    test('يتعامل مع الأرقام الكبيرة جداً', () => {
      const estimateWithLargeNumbers = {
        ...mockEstimateAverage,
        provided: 1000000,
        market: {
          average: 1200000,
          min: 800000,
          max: 1500000,
          count: 50
        }
      };

      render(<SalaryIndicator estimate={estimateWithLargeNumbers} />);
      // الأرقام الكبيرة بالعربية
      expect(screen.getByText(/١٬٠٠٠٬٠٠٠/)).toBeInTheDocument();
    });

    test('يتعامل مع comparison غير معروف', () => {
      const estimateWithUnknownComparison = {
        ...mockEstimateAverage,
        comparison: 'unknown'
      };

      const { container } = render(<SalaryIndicator estimate={estimateWithUnknownComparison} />);
      // يجب أن يستخدم القيم الافتراضية (average)
      expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();
    });
  });
});
