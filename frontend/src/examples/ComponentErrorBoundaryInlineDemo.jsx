import React, { useState } from 'react';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import { useApp } from '../context/AppContext';

/**
 * ComponentErrorBoundaryInlineDemo
 * 
 * Demonstrates that ComponentErrorBoundary displays inline errors
 * without breaking the entire page layout.
 * 
 * Requirements:
 * - FR-ERR-7: Component-level errors show inline boundary
 * 
 * This demo shows:
 * 1. Multiple components on the same page
 * 2. One component fails with an error
 * 3. The error displays inline (only that component shows error UI)
 * 4. Other components continue to work normally
 * 5. The page layout remains intact
 */

// Component that can be toggled to throw an error
const ToggleableErrorComponent = ({ id, shouldFail }) => {
  if (shouldFail) {
    throw new Error(`Component ${id} failed!`);
  }
  
  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#e8f5e9',
      border: '2px solid #4caf50',
      borderRadius: '0.5rem',
      marginBottom: '1rem'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#2e7d32' }}>
        Component {id} - Working ✓
      </h3>
      <p style={{ margin: 0, color: '#555' }}>
        This component is rendering successfully.
      </p>
    </div>
  );
};

const ComponentErrorBoundaryInlineDemo = () => {
  const { language } = useApp();
  const [failingComponents, setFailingComponents] = useState({
    component1: false,
    component2: false,
    component3: false,
  });

  const toggleComponent = (componentId) => {
    setFailingComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '2rem auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        marginBottom: '1rem',
        color: '#304B60'
      }}>
        Component Error Boundary - Inline Demo
      </h1>
      
      <p style={{ 
        fontSize: '1rem', 
        marginBottom: '2rem',
        color: '#666',
        lineHeight: '1.6'
      }}>
        This demo shows that when a component fails, only that component displays 
        an error UI inline. The rest of the page continues to work normally.
        <br />
        <strong>Try it:</strong> Click the buttons below to make components fail.
      </p>

      {/* Control Panel */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => toggleComponent('component1')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: failingComponents.component1 ? '#4caf50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}
        >
          {failingComponents.component1 ? 'Fix Component 1' : 'Break Component 1'}
        </button>
        
        <button
          onClick={() => toggleComponent('component2')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: failingComponents.component2 ? '#4caf50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}
        >
          {failingComponents.component2 ? 'Fix Component 2' : 'Break Component 2'}
        </button>
        
        <button
          onClick={() => toggleComponent('component3')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: failingComponents.component3 ? '#4caf50' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}
        >
          {failingComponents.component3 ? 'Fix Component 3' : 'Break Component 3'}
        </button>
      </div>

      {/* Page Header - Always visible */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#e3f2fd',
        border: '2px solid #2196f3',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1565c0' }}>
          Page Header - Always Visible
        </h2>
        <p style={{ margin: 0, color: '#555' }}>
          This header remains visible even when components below fail.
        </p>
      </div>

      {/* Component 1 with Error Boundary */}
      <ComponentErrorBoundary componentName="Component-1">
        <ToggleableErrorComponent 
          id="1" 
          shouldFail={failingComponents.component1} 
        />
      </ComponentErrorBoundary>

      {/* Component 2 with Error Boundary */}
      <ComponentErrorBoundary componentName="Component-2">
        <ToggleableErrorComponent 
          id="2" 
          shouldFail={failingComponents.component2} 
        />
      </ComponentErrorBoundary>

      {/* Component 3 with Error Boundary */}
      <ComponentErrorBoundary componentName="Component-3">
        <ToggleableErrorComponent 
          id="3" 
          shouldFail={failingComponents.component3} 
        />
      </ComponentErrorBoundary>

      {/* Page Footer - Always visible */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#fff3e0',
        border: '2px solid #ff9800',
        borderRadius: '0.5rem',
        marginTop: '2rem'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#e65100' }}>
          Page Footer - Always Visible
        </h2>
        <p style={{ margin: 0, color: '#555' }}>
          This footer remains visible even when components above fail.
        </p>
      </div>

      {/* Explanation */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        borderLeft: '4px solid #304B60',
        borderRadius: '0.25rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#304B60' }}>
          How It Works
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', lineHeight: '1.8' }}>
          <li>
            <strong>Inline Error Display:</strong> When a component fails, only that 
            component's area shows the error UI.
          </li>
          <li>
            <strong>Page Remains Functional:</strong> Other components and page elements 
            continue to work normally.
          </li>
          <li>
            <strong>Retry Capability:</strong> Each failed component has its own retry 
            button to attempt recovery.
          </li>
          <li>
            <strong>No Full Page Break:</strong> Unlike RouteErrorBoundary (which shows 
            a full-page error), ComponentErrorBoundary keeps the page layout intact.
          </li>
          <li>
            <strong>Graceful Degradation:</strong> The page degrades gracefully - only 
            the failing parts show errors.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentErrorBoundaryInlineDemo;
