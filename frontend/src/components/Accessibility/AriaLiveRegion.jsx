import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * AriaLiveRegion Component
 * 
 * A reusable component for creating ARIA live regions that announce dynamic content changes
 * to screen readers. Supports both polite and assertive announcements.
 * 
 * @component
 * @example
 * // Polite announcement (default)
 * <AriaLiveRegion message="Form submitted successfully" />
 * 
 * // Assertive announcement for critical messages
 * <AriaLiveRegion message="Error: Invalid input" politeness="assertive" />
 */
const AriaLiveRegion = ({ 
  message, 
  politeness = 'polite', 
  clearOnUnmount = true,
  atomic = true,
  relevant = 'additions text',
  className = '',
  role = null
}) => {
  const regionRef = useRef(null);
  const previousMessage = useRef('');

  useEffect(() => {
    // Only announce if message has changed
    if (message && message !== previousMessage.current) {
      previousMessage.current = message;
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AriaLive ${politeness}]:`, message);
      }
    }
  }, [message, politeness]);

  useEffect(() => {
    // Clear message on unmount if specified
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = '';
      }
    };
  }, [clearOnUnmount]);

  // Don't render if no message
  if (!message) {
    return null;
  }

  return (
    <div
      ref={regionRef}
      role={role || (politeness === 'assertive' ? 'alert' : 'status')}
      aria-live={politeness}
      aria-atomic={atomic ? 'true' : 'false'}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {message}
    </div>
  );
};

AriaLiveRegion.propTypes = {
  /** The message to announce to screen readers */
  message: PropTypes.string,
  
  /** Politeness level: 'polite' for non-critical, 'assertive' for critical/urgent */
  politeness: PropTypes.oneOf(['polite', 'assertive', 'off']),
  
  /** Whether to clear the message when component unmounts */
  clearOnUnmount: PropTypes.bool,
  
  /** Whether the entire region should be announced when any part changes */
  atomic: PropTypes.bool,
  
  /** What types of changes should be announced */
  relevant: PropTypes.string,
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Override the default ARIA role */
  role: PropTypes.string
};

export default AriaLiveRegion;
