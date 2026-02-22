/**
 * NotFoundPage Simple Verification Test
 * 
 * Verifies that the custom 404 error page exists and is properly configured
 * 
 * Requirements: FR-ERR-10
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NotFoundPage from '../pages/NotFoundPage';
import { AppProvider } from '../context/AppContext';
import { AnimationProvider } from '../context/AnimationContext';

// Helper to render with minimal providers
const renderNotFoundPage = () => {
  return render(
    <HelmetProvider>
      <AppProvider>
        <AnimationProvider>
          <MemoryRouter>
            <NotFoundPage />
          </MemoryRouter>
        </AnimationProvider>
      </AppProvider>
    </HelmetProvider>
  );
};

describe('NotFoundPage - Simple Verification', () => {
  it('should render the 404 page', () => {
    renderNotFoundPage();
    
    // Verify 404 number is displayed
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should have main role for accessibility', () => {
    renderNotFoundPage();
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display navigation buttons', () => {
    renderNotFoundPage();
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should have proper heading structure', () => {
    renderNotFoundPage();
    
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('404');
  });

  it('should have aria-labels on buttons', () => {
    renderNotFoundPage();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('should hide decorative icon from screen readers', () => {
    renderNotFoundPage();
    
    const icon = screen.getByText('🔍');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have proper CSS classes', () => {
    renderNotFoundPage();
    
    const container = screen.getByRole('main');
    expect(container).toHaveClass('not-found-container');
  });

  it('should display error message', () => {
    renderNotFoundPage();
    
    // Check for paragraph with error message
    const paragraphs = document.querySelectorAll('.not-found-message');
    expect(paragraphs.length).toBeGreaterThan(0);
  });
});
