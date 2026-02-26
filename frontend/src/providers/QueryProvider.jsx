/**
 * Query Provider Component
 * 
 * Wraps the application with React Query's QueryClientProvider.
 * Includes React Query DevTools in development mode.
 * Implements Requirements 11.2
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../config/reactQuery';

/**
 * QueryProvider component
 * Provides React Query context to the entire application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} QueryClientProvider with children
 */
const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only visible in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;
