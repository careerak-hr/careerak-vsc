import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AnimationProvider } from '../context/AnimationContext';

/**
 * Custom render function that wraps components with all necessary providers
 * Used for integration and component tests to avoid "Provider not found" errors.
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    route = '/',
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AnimationProvider>
              <AppProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </AppProvider>
            </AnimationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from '@testing-library/react';
export { renderWithProviders as render };
