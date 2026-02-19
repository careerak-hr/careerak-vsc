import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimationProvider, useAnimation } from '../AnimationContext';

// Test component that uses the animation context
const TestComponent = () => {
  const { 
    defaultTransition, 
    shouldAnimate, 
    animationVariants,
    getTransition,
    getVariants
  } = useAnimation();

  return (
    <div>
      <div data-testid="duration">{defaultTransition.duration}</div>
      <div data-testid="ease">{defaultTransition.ease}</div>
      <div data-testid="shouldAnimate">{shouldAnimate.toString()}</div>
      <div data-testid="hasVariants">{Object.keys(animationVariants).length > 0 ? 'true' : 'false'}</div>
      <div data-testid="hasGetTransition">{typeof getTransition === 'function' ? 'true' : 'false'}</div>
      <div data-testid="hasGetVariants">{typeof getVariants === 'function' ? 'true' : 'false'}</div>
    </div>
  );
};

describe('AnimationContext', () => {
  it('should provide default transition settings', () => {
    render(
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    );

    expect(screen.getByTestId('duration').textContent).toBe('0.3');
    expect(screen.getByTestId('ease').textContent).toBe('easeInOut');
  });

  it('should enable animations by default', () => {
    render(
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    );

    expect(screen.getByTestId('shouldAnimate').textContent).toBe('true');
  });

  it('should provide animation variants', () => {
    render(
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    );

    expect(screen.getByTestId('hasVariants').textContent).toBe('true');
  });

  it('should provide helper functions', () => {
    render(
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    );

    expect(screen.getByTestId('hasGetTransition').textContent).toBe('true');
    expect(screen.getByTestId('hasGetVariants').textContent).toBe('true');
  });

  it('should throw error when useAnimation is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAnimation must be used within an AnimationProvider');

    console.error = originalError;
  });
});
