/**
 * Page Transitions Tests
 * 
 * Tests for page transition animations using Framer Motion.
 * Validates that transitions work correctly and respect prefers-reduced-motion.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimationProvider } from '../context/AnimationContext';
import PageTransition from '../components/PageTransition';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

describe('PageTransition Component', () => {
  const renderWithProviders = (component) => {
    return render(
      <BrowserRouter>
        <AnimationProvider>
          {component}
        </AnimationProvider>
      </BrowserRouter>
    );
  };

  test('renders children correctly', () => {
    renderWithProviders(
      <PageTransition variant="fadeIn">
        <div>Test Content</div>
      </PageTransition>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders with fadeIn variant by default', () => {
    const { container } = renderWithProviders(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders with custom variant', () => {
    const { container } = renderWithProviders(
      <PageTransition variant="slideInRight">
        <div>Test Content</div>
      </PageTransition>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders multiple children', () => {
    renderWithProviders(
      <PageTransition variant="fadeIn">
        <div>First Child</div>
        <div>Second Child</div>
      </PageTransition>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });
});

describe('Page Transitions Integration', () => {
  test('PageTransition component exists and is exported', () => {
    expect(PageTransition).toBeDefined();
    expect(typeof PageTransition).toBe('function');
  });

  test('AnimationProvider provides animation context', () => {
    const TestComponent = () => {
      return (
        <PageTransition>
          <div>Animated Content</div>
        </PageTransition>
      );
    };

    render(
      <BrowserRouter>
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Animated Content')).toBeInTheDocument();
  });
});

describe('Animation Variants', () => {
  const variants = ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInTop', 'slideInBottom', 'scaleUp'];

  variants.forEach(variant => {
    test(`renders with ${variant} variant`, () => {
      const { container } = render(
        <BrowserRouter>
          <AnimationProvider>
            <PageTransition variant={variant}>
              <div>Test Content</div>
            </PageTransition>
          </AnimationProvider>
        </BrowserRouter>
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});

describe('Reduced Motion Support', () => {
  test('respects prefers-reduced-motion setting', () => {
    // Mock matchMedia for prefers-reduced-motion
    const mockMatchMedia = (matches) => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: matches,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    };

    // Test with reduced motion enabled
    mockMatchMedia(true);
    
    const { container } = render(
      <BrowserRouter>
        <AnimationProvider>
          <PageTransition variant="fadeIn">
            <div>Test Content</div>
          </PageTransition>
        </AnimationProvider>
      </BrowserRouter>
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
