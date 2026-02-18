import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AriaLiveRegion from '../AriaLiveRegion';

describe('AriaLiveRegion', () => {
  test('renders with polite politeness by default', () => {
    render(<AriaLiveRegion message="Test message" />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveTextContent('Test message');
  });

  test('renders with assertive politeness when specified', () => {
    render(<AriaLiveRegion message="Urgent message" politeness="assertive" />);
    
    const liveRegion = screen.getByRole('alert');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
    expect(liveRegion).toHaveTextContent('Urgent message');
  });

  test('does not render when message is empty', () => {
    const { container } = render(<AriaLiveRegion message="" />);
    expect(container.firstChild).toBeNull();
  });

  test('updates message when prop changes', () => {
    const { rerender } = render(<AriaLiveRegion message="First message" />);
    
    let liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('First message');
    
    rerender(<AriaLiveRegion message="Second message" />);
    
    liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Second message');
  });

  test('applies custom className', () => {
    render(<AriaLiveRegion message="Test" className="custom-class" />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveClass('custom-class');
  });

  test('sets aria-atomic attribute', () => {
    render(<AriaLiveRegion message="Test" atomic={true} />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });

  test('sets aria-relevant attribute', () => {
    render(<AriaLiveRegion message="Test" relevant="additions removals" />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-relevant', 'additions removals');
  });

  test('uses custom role when provided', () => {
    render(<AriaLiveRegion message="Test" role="log" />);
    
    const liveRegion = screen.getByRole('log');
    expect(liveRegion).toBeInTheDocument();
  });

  test('is visually hidden but accessible to screen readers', () => {
    render(<AriaLiveRegion message="Test" />);
    
    const liveRegion = screen.getByRole('status');
    const styles = window.getComputedStyle(liveRegion);
    
    // Check that it's positioned off-screen
    expect(liveRegion).toHaveStyle({ position: 'absolute' });
    expect(liveRegion).toHaveStyle({ left: '-10000px' });
  });
});
