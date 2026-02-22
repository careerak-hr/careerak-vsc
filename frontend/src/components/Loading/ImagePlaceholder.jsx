/**
 * ImagePlaceholder Component
 * 
 * A reusable placeholder component for images while they are loading.
 * Displays a loading animation and prevents layout shifts.
 * 
 * Features:
 * - Pulse animation
 * - Maintains aspect ratio
 * - Dark mode support
 * - Prevents layout shifts (CLS = 0)
 * - Customizable size and styling
 * - Accessibility support
 * 
 * Requirements: FR-LOAD-6
 * Design: Section 9.3 Suspense Fallbacks
 * 
 * @example
 * <ImagePlaceholder width={400} height={300} />
 * <ImagePlaceholder aspectRatio="16/9" />
 * <ImagePlaceholder preset="PROFILE_LARGE" />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ImagePresets } from '../../utils/imageOptimization';

const ImagePlaceholder = ({
  width = null,
  height = null,
  aspectRatio = null,
  preset = null,
  className = '',
  style = {},
  showIcon = true,
  rounded = false,
  ...otherProps
}) => {
  // Determine dimensions from preset if provided
  let finalWidth = width;
  let finalHeight = height;
  let finalAspectRatio = aspectRatio;

  if (preset && ImagePresets[preset]) {
    const presetConfig = ImagePresets[preset];
    finalWidth = finalWidth || presetConfig.width;
    finalHeight = finalHeight || presetConfig.height;
    
    // Calculate aspect ratio from preset dimensions
    if (!finalAspectRatio && presetConfig.width && presetConfig.height) {
      finalAspectRatio = `${presetConfig.width}/${presetConfig.height}`;
    }
  }

  // Build inline styles
  const placeholderStyle = {
    width: finalWidth ? `${finalWidth}px` : '100%',
    height: finalHeight ? `${finalHeight}px` : 'auto',
    aspectRatio: finalAspectRatio || undefined,
    minHeight: !finalHeight && !finalAspectRatio ? '200px' : undefined,
    backgroundColor: 'var(--placeholder-bg, #e5e7eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: rounded ? '50%' : undefined,
    ...style,
  };

  return (
    <div
      className={`image-placeholder ${className}`}
      style={placeholderStyle}
      role="img"
      aria-label="Loading image"
      {...otherProps}
    >
      {/* Pulse animation overlay */}
      <div
        className="image-placeholder-pulse"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
          animation: 'shimmer 2s infinite',
        }}
      />

      {/* Icon */}
      {showIcon && (
        <span
          style={{
            color: 'var(--placeholder-icon, #9ca3af)',
            fontSize: '2rem',
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          🖼️
        </span>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .image-placeholder {
            --placeholder-bg: #374151;
            --placeholder-icon: #6b7280;
          }
        }

        /* Explicit dark mode class support */
        .dark .image-placeholder {
          --placeholder-bg: #374151;
          --placeholder-icon: #6b7280;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .image-placeholder-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

ImagePlaceholder.propTypes = {
  /** Width in pixels */
  width: PropTypes.number,
  /** Height in pixels */
  height: PropTypes.number,
  /** CSS aspect-ratio value (e.g., "16/9", "1/1") */
  aspectRatio: PropTypes.string,
  /** Preset name from ImagePresets */
  preset: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Additional inline styles */
  style: PropTypes.object,
  /** Show placeholder icon */
  showIcon: PropTypes.bool,
  /** Make placeholder circular */
  rounded: PropTypes.bool,
};

export default ImagePlaceholder;
