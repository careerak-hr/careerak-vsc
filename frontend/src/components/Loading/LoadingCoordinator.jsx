import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { coordinateLoadingStates } from '../../utils/layoutShiftPrevention';
import AriaLiveRegion from '../Accessibility/AriaLiveRegion';

/**
 * Loading Coordinator Component
 * 
 * Coordinates multiple loading states across different sections to prevent layout shifts.
 * 
 * Requirements:
 * - FR-LOAD-8: Coordinate loading states to prevent layout shifts
 * - NFR-PERF-5: Achieve CLS < 0.1
 * - NFR-USE-3: Display loading states within 100ms
 * 
 * Features:
 * - Centralized loading state management
 * - Prevents layout shifts by reserving space
 * - Tracks loading progress across sections
 * - Screen reader announcements
 * - Automatic cleanup
 * 
 * Usage:
 * <LoadingCoordinator>
 *   <LoadingSection id="header" minHeight="100px">
 *     {(loading) => loading ? <Skeleton /> : <Header />}
 *   </LoadingSection>
 *   <LoadingSection id="content" minHeight="400px">
 *     {(loading) => loading ? <Skeleton /> : <Content />}
 *   </LoadingSection>
 * </LoadingCoordinator>
 */

// Context for loading coordination
const LoadingCoordinatorContext = createContext(null);

/**
 * Hook to access loading coordinator
 */
export const useLoadingCoordinator = () => {
  const context = useContext(LoadingCoordinatorContext);
  if (!context) {
    throw new Error('useLoadingCoordinator must be used within LoadingCoordinator');
  }
  return context;
};

/**
 * Loading Coordinator Provider
 */
export const LoadingCoordinator = ({ 
  children, 
  onAllLoaded,
  announceProgress = true,
  className = ''
}) => {
  const [sections, setSections] = useState([]);
  const [coordinated, setCoordinated] = useState({
    totalMinHeight: '0px',
    loadingCount: 0,
    allLoaded: true,
    sections: [],
  });

  // Register a new section
  const registerSection = useCallback((id, minHeight) => {
    setSections(prev => {
      // Check if section already exists
      if (prev.find(s => s.id === id)) {
        return prev;
      }
      return [...prev, { id, minHeight, loading: true }];
    });
  }, []);

  // Unregister a section
  const unregisterSection = useCallback((id) => {
    setSections(prev => prev.filter(s => s.id !== id));
  }, []);

  // Update section loading state
  const updateSection = useCallback((id, loading) => {
    setSections(prev => 
      prev.map(section => 
        section.id === id 
          ? { ...section, loading }
          : section
      )
    );
  }, []);

  // Get section loading state
  const getSectionLoading = useCallback((id) => {
    const section = sections.find(s => s.id === id);
    return section ? section.loading : false;
  }, [sections]);

  // Coordinate loading states whenever sections change
  useEffect(() => {
    if (sections.length > 0) {
      const result = coordinateLoadingStates(sections);
      setCoordinated(result);

      // Call onAllLoaded callback when all sections are loaded
      if (result.allLoaded && onAllLoaded) {
        onAllLoaded();
      }
    }
  }, [sections, onAllLoaded]);

  const value = {
    sections: coordinated.sections,
    totalMinHeight: coordinated.totalMinHeight,
    loadingCount: coordinated.loadingCount,
    allLoaded: coordinated.allLoaded,
    registerSection,
    unregisterSection,
    updateSection,
    getSectionLoading,
  };

  // Calculate loading percentage
  const loadingPercentage = sections.length > 0
    ? Math.round(((sections.length - coordinated.loadingCount) / sections.length) * 100)
    : 100;

  return (
    <LoadingCoordinatorContext.Provider value={value}>
      {/* Announce loading progress to screen readers */}
      {announceProgress && coordinated.loadingCount > 0 && (
        <AriaLiveRegion 
          message={`Loading: ${loadingPercentage}% complete. ${coordinated.loadingCount} sections remaining.`}
          politeness="polite"
          role="status"
        />
      )}
      
      <div className={className} data-loading-coordinator>
        {children}
      </div>
    </LoadingCoordinatorContext.Provider>
  );
};

/**
 * Loading Section Component
 * 
 * Individual section within a LoadingCoordinator
 */
export const LoadingSection = ({ 
  id, 
  minHeight, 
  children,
  className = '',
  onLoadingChange,
}) => {
  const { 
    registerSection, 
    unregisterSection, 
    updateSection, 
    getSectionLoading 
  } = useLoadingCoordinator();

  const [localLoading, setLocalLoading] = useState(true);

  // Register section on mount
  useEffect(() => {
    registerSection(id, minHeight);
    return () => unregisterSection(id);
  }, [id, minHeight, registerSection, unregisterSection]);

  // Update coordinator when local loading changes
  useEffect(() => {
    updateSection(id, localLoading);
    if (onLoadingChange) {
      onLoadingChange(localLoading);
    }
  }, [id, localLoading, updateSection, onLoadingChange]);

  // Get loading state from coordinator
  const loading = getSectionLoading(id);

  // Style with reserved space
  const sectionStyle = {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    transition: 'min-height 200ms ease-in-out',
  };

  return (
    <div 
      className={className} 
      style={sectionStyle}
      data-loading-section={id}
      data-loading={loading}
    >
      {typeof children === 'function' 
        ? children(loading, setLocalLoading) 
        : children
      }
    </div>
  );
};

/**
 * Simple hook for coordinating loading states without context
 * Useful for simple cases where you don't need the full coordinator
 */
export const useSimpleCoordination = (initialSections) => {
  const [sections, setSections] = useState(initialSections);

  const updateSection = useCallback((sectionId, loading) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, loading }
          : section
      )
    );
  }, []);

  const coordinated = coordinateLoadingStates(sections);

  return {
    sections: coordinated.sections,
    updateSection,
    allLoaded: coordinated.allLoaded,
    loadingCount: coordinated.loadingCount,
    totalMinHeight: coordinated.totalMinHeight,
    loadingPercentage: sections.length > 0
      ? Math.round(((sections.length - coordinated.loadingCount) / sections.length) * 100)
      : 100,
  };
};

export default LoadingCoordinator;
