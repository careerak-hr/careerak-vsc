import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RouteSuspenseFallback from '../RouteSuspenseFallback';
import * as ThemeContext from '../../../context/ThemeContext';

// Mock useTheme hook
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: vi.fn()
}));

describe('RouteSuspenseFallback', () => {
  beforeEach(() => {
    // Reset mock before each test
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    render(<RouteSuspenseFallback />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    render(<RouteSuspenseFallback />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-label', 'Loading page');
  });

  it('displays screen reader announcement', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    render(<RouteSuspenseFallback />);
    
    expect(screen.getByText('Loading page content, please wait...')).toBeInTheDocument();
  });

  it('renders light mode styles by default', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    render(<RouteSuspenseFallback />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('bg-[#E3DAD1]');
  });

  it('renders dark mode styles when isDark is true', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: true });
    
    render(<RouteSuspenseFallback />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('bg-[#1a1a1a]');
  });

  it('renders skeleton elements with pulse animation', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    const { container } = render(<RouteSuspenseFallback />);
    
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('renders navbar skeleton', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    const { container } = render(<RouteSuspenseFallback />);
    
    // Check for navbar height class
    const navbar = container.querySelector('.h-16');
    expect(navbar).toBeInTheDocument();
  });

  it('renders content cards skeleton', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    const { container } = render(<RouteSuspenseFallback />);
    
    // Should render 6 cards - look for cards with specific structure
    const cards = container.querySelectorAll('main .grid > div');
    expect(cards.length).toBe(6);
  });

  it('renders footer skeleton', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    const { container } = render(<RouteSuspenseFallback />);
    
    // Check for footer
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('applies smooth transition classes', () => {
    ThemeContext.useTheme.mockReturnValue({ isDark: false });
    
    render(<RouteSuspenseFallback />);
    
    const container = screen.getByRole('status');
    expect(container).toHaveClass('transition-colors');
    expect(container).toHaveClass('duration-200');
  });
});
