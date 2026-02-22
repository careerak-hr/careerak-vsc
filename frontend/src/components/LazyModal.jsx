import React, { Suspense, lazy } from 'react';
import ComponentSuspenseFallback from './Loading/ComponentSuspenseFallback';

/**
 * LazyModal - Utility component for lazy-loading modal components with Suspense
 * 
 * This component demonstrates best practices for wrapping lazy-loaded components
 * with Suspense boundaries, specifically for modal components that are only
 * rendered conditionally.
 * 
 * Benefits:
 * - Reduces initial bundle size by code-splitting modals
 * - Improves performance by loading modals only when needed
 * - Provides consistent loading states across all modals
 * - Prevents layout shifts with proper fallback sizing
 * 
 * @param {Object} props
 * @param {React.ComponentType} props.component - The lazy-loaded modal component
 * @param {Object} props.componentProps - Props to pass to the modal component
 * @param {string} props.fallbackVariant - Variant for the loading fallback (default: 'minimal')
 * @param {string} props.fallbackHeight - Height for the loading fallback (default: '400px')
 * 
 * @example
 * // Define lazy modal
 * const LazyAgeCheckModal = lazy(() => import('./modals/AgeCheckModal'));
 * 
 * // Use with LazyModal wrapper
 * {showAgeCheck && (
 *   <LazyModal
 *     component={LazyAgeCheckModal}
 *     componentProps={{
 *       isOpen: showAgeCheck,
 *       onConfirm: handleAgeConfirm,
 *       onCancel: handleAgeCancel
 *     }}
 *     fallbackVariant="minimal"
 *     fallbackHeight="300px"
 *   />
 * )}
 */
const LazyModal = ({ 
  component: Component, 
  componentProps, 
  fallbackVariant = 'minimal',
  fallbackHeight = '400px'
}) => {
  return (
    <Suspense 
      fallback={
        <ComponentSuspenseFallback 
          variant={fallbackVariant}
          height={fallbackHeight}
        />
      }
    >
      <Component {...componentProps} />
    </Suspense>
  );
};

export default LazyModal;
