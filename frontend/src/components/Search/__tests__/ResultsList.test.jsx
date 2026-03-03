import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsList from '../ResultsList';
import { AppContext } from '../../../context/AppContext';
import { AnimationContext } from '../../../context/AnimationContext';

// Mock contexts
const mockAppContext = {
  language: 'en',
  startBgMusic: vi.fn()
};

const mockAnimationContext = {
  shouldAnimate: true
};

const renderWithContext = (component) => {
  return render(
    <AppContext.Provider value={mockAppContext}>
      <AnimationContext.Provider value={mockAnimationContext}>
        {component}
      </AnimationContext.Provider>
    </AppContext.Provider>
  );
};

describe('ResultsList Component', () => {
  const mockResults = [
    {
      job: {
        _id: '1',
        title: 'Senior Frontend Developer',
        company: 'Tech Corp',
        location: 'Riyadh',
        salary: { min: 15000, max: 25000, currency: 'SAR' },
        description: 'Great job opportunity'
      },
      matchScore: {
        percentage: 92,
        overall: 0.92
      },
      reasons: [
        {
          type: 'skills',
          message: 'You have 8 out of 10 required skills',
          strength: 'high'
        }
      ]
    },
    {
      job: {
        _id: '2',
        title: 'Backend Engineer',
        company: 'StartupXYZ',
        location: 'Dubai',
        salary: { min: 12000, max: 20000, currency: 'AED' },
        description: 'Another great opportunity'
      },
      matchScore: {
        percentage: 65,
        overall: 0.65
      },
      reasons: []
    }
  ];

  it('renders without crashing', () => {
    renderWithContext(<ResultsList results={[]} />);
  });

  it('displays empty state when no results', () => {
    renderWithContext(<ResultsList results={[]} />);
    expect(screen.getByText(/No Results Found/i)).toBeInTheDocument();
  });

  it('renders all job results', () => {
    renderWithContext(<ResultsList results={mockResults} />);
    expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
  });

  it('displays match score badges', () => {
    renderWithContext(<ResultsList results={mockResults} showMatchScore={true} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('hides match score when showMatchScore is false', () => {
    renderWithContext(<ResultsList results={mockResults} showMatchScore={false} />);
    expect(screen.queryByText('92%')).not.toBeInTheDocument();
  });

  it('displays job details correctly', () => {
    renderWithContext(<ResultsList results={mockResults} />);
    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
    expect(screen.getByText(/Riyadh/i)).toBeInTheDocument();
    expect(screen.getByText(/SAR 15,000 - 25,000/i)).toBeInTheDocument();
  });

  it('displays match reasons when available', () => {
    renderWithContext(<ResultsList results={mockResults} />);
    expect(screen.getByText(/You have 8 out of 10 required skills/i)).toBeInTheDocument();
  });

  it('calls onJobClick when job card is clicked', () => {
    const handleClick = vi.fn();
    renderWithContext(<ResultsList results={mockResults} onJobClick={handleClick} />);
    
    const jobCard = screen.getByText('Senior Frontend Developer').closest('article');
    fireEvent.click(jobCard);
    
    expect(handleClick).toHaveBeenCalledWith(mockResults[0].job);
  });

  it('applies correct badge class based on match percentage', () => {
    const { container } = renderWithContext(<ResultsList results={mockResults} />);
    
    // 92% should be excellent (green)
    const excellentBadge = container.querySelector('.match-badge-excellent');
    expect(excellentBadge).toBeInTheDocument();
    
    // 65% should be good (blue)
    const goodBadge = container.querySelector('.match-badge-good');
    expect(goodBadge).toBeInTheDocument();
  });

  it('renders in grid view mode', () => {
    const { container } = renderWithContext(
      <ResultsList results={mockResults} viewMode="grid" />
    );
    expect(container.querySelector('.results-grid')).toBeInTheDocument();
  });

  it('renders in list view mode', () => {
    const { container } = renderWithContext(
      <ResultsList results={mockResults} viewMode="list" />
    );
    expect(container.querySelector('.results-list')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const handleClick = vi.fn();
    renderWithContext(<ResultsList results={mockResults} onJobClick={handleClick} />);
    
    const jobCard = screen.getByText('Senior Frontend Developer').closest('article');
    fireEvent.keyPress(jobCard, { key: 'Enter', code: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledWith(mockResults[0].job);
  });

  it('displays Apply Now and View Details buttons', () => {
    renderWithContext(<ResultsList results={mockResults} />);
    const applyButtons = screen.getAllByText(/Apply Now/i);
    const viewButtons = screen.getAllByText(/View Details/i);
    
    expect(applyButtons).toHaveLength(mockResults.length);
    expect(viewButtons).toHaveLength(mockResults.length);
  });

  it('formats salary correctly', () => {
    renderWithContext(<ResultsList results={mockResults} />);
    expect(screen.getByText(/SAR 15,000 - 25,000/i)).toBeInTheDocument();
    expect(screen.getByText(/AED 12,000 - 20,000/i)).toBeInTheDocument();
  });

  it('displays Negotiable when salary is not provided', () => {
    const resultsWithoutSalary = [
      {
        job: {
          _id: '1',
          title: 'Test Job',
          company: 'Test Corp',
          location: 'Test City',
          description: 'Test description'
        },
        matchScore: { percentage: 50, overall: 0.5 }
      }
    ];
    
    renderWithContext(<ResultsList results={resultsWithoutSalary} />);
    expect(screen.getByText(/Negotiable/i)).toBeInTheDocument();
  });

  it('supports Arabic language', () => {
    const arabicContext = { ...mockAppContext, language: 'ar' };
    
    render(
      <AppContext.Provider value={arabicContext}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <ResultsList results={mockResults} />
        </AnimationContext.Provider>
      </AppContext.Provider>
    );
    
    expect(screen.getByText(/مطابقة/i)).toBeInTheDocument();
  });

  it('supports French language', () => {
    const frenchContext = { ...mockAppContext, language: 'fr' };
    
    render(
      <AppContext.Provider value={frenchContext}>
        <AnimationContext.Provider value={mockAnimationContext}>
          <ResultsList results={mockResults} />
        </AnimationContext.Provider>
      </AppContext.Provider>
    );
    
    expect(screen.getByText(/Correspondance/i)).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDescription = 'A'.repeat(200);
    const resultsWithLongDesc = [
      {
        job: {
          _id: '1',
          title: 'Test Job',
          company: 'Test Corp',
          location: 'Test City',
          description: longDescription
        },
        matchScore: { percentage: 50, overall: 0.5 }
      }
    ];
    
    renderWithContext(<ResultsList results={resultsWithLongDesc} />);
    const description = screen.getByText(/A{150}\.\.\./, { exact: false });
    expect(description).toBeInTheDocument();
  });

  it('limits displayed reasons to 3', () => {
    const manyReasons = [
      { type: 'skills', message: 'Reason 1', strength: 'high' },
      { type: 'experience', message: 'Reason 2', strength: 'high' },
      { type: 'education', message: 'Reason 3', strength: 'medium' },
      { type: 'location', message: 'Reason 4', strength: 'low' },
      { type: 'salary', message: 'Reason 5', strength: 'low' }
    ];
    
    const resultsWithManyReasons = [
      {
        job: mockResults[0].job,
        matchScore: mockResults[0].matchScore,
        reasons: manyReasons
      }
    ];
    
    const { container } = renderWithContext(<ResultsList results={resultsWithManyReasons} />);
    const reasonItems = container.querySelectorAll('.reason-item');
    expect(reasonItems).toHaveLength(3);
  });
});
