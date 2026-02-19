/**
 * LazyImage Component
 * 
 * A React component that implements lazy loading using Intersection Observer API.
 * Images are only loaded when they enter the viewport, improving initial page load
 * performance and reducing bandwidth usage.
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - WebP format with JPEG/PNG fallback
 * - Blur-up placeholder
 * - Loading spinner
 * - Error handling
 * - Responsive images support
 * - Accessibility support
 * 
 * Requirements: FR-PERF-4
 * Design: Section 3.3 Image Optimization
 * 
 * @example
 * <LazyImage
 *   publicId="profile/user123"
 *   alt="User profile"
 *   width={400}
 *   height={400}
 *   preset="PROFILE_LARGE"
 * />
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import {
  getWebPWithFallback,
  getResponsiveWebPSrcSet,
  getPlaceholderUrl,
  generateSizesAttribute,
  ImagePresets,
} from '../../utils/imageOptimization';
import './LazyImage.css';

const LazyImage = ({
  publicId,
  alt = '',
  width = null,
  height = null,
  preset = null,
  className = '',
  style = {},
  responsive = false,
  responsiveWidths = [320, 640, 768, 1024, 1280, 1920],
  sizes = null,
  placeholder = true,
  fallbackFormat = 'jpeg',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad = null,
  onError = null,
  showSpinner = true,
  ...otherProps
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Determine transformation options
  const options = preset && ImagePresets[preset]
    ? { ...ImagePresets[preset] }
    : { width, height };

  // Generate URLs
  const urls = getWebPWithFallback(publicId, options);
  const placeholderUrl = placeholder ? getPlaceholderUrl(publicId) : null;

  // Generate responsive srcsets if needed
  const srcsets = responsive
    ? getResponsiveWebPSrcSet(publicId, options, responsiveWidths)
    : null;

  // Generate sizes attribute for responsive images
  const sizesAttr = responsive && !sizes
    ? generateSizesAttribute({
        mobile: { maxWidth: 640, imageWidth: '100vw' },
        tablet: { maxWidth: 1024, imageWidth: '50vw' },
        desktop: { imageWidth: '33vw' },
      })
    : sizes;

  // Start loading when visible
  useEffect(() => {
    if (isVisible && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isVisible, shouldLoad]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Reset state when publicId changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setShouldLoad(false);
  }, [publicId]);

  // If no publicId, show placeholder
  if (!publicId) {
    return (
      <div
        ref={ref}
        className={`lazy-image-placeholder ${className}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        role="img"
        aria-label={alt || 'Image placeholder'}
      >
        <span style={{ color: '#9ca3af', fontSize: '2rem' }}>📷</span>
      </div>
    );
  }

  // If error occurred, show error placeholder
  if (hasError) {
    return (
      <div
        ref={ref}
        className={`lazy-image-error ${className}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <span style={{ color: '#dc2626', fontSize: '2rem' }}>⚠️</span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`lazy-image-container ${shouldLoad && !isLoaded ? 'loading' : ''} ${className}`}
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Blur-up placeholder - shown before image loads */}
      {placeholder && placeholderUrl && !isLoaded && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          className="lazy-image-placeholder-blur"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}

      {/* Loading spinner */}
      {showSpinner && shouldLoad && !isLoaded && !hasError && (
        <div
          className="lazy-image-spinner"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <div className="spinner" aria-label="Loading image"></div>
        </div>
      )}

      {/* Actual image - only loaded when visible */}
      {shouldLoad && (
        <picture className="lazy-image-picture">
          {/* WebP source for modern browsers */}
          {responsive ? (
            <source
              srcSet={srcsets.webpSrcSet}
              sizes={sizesAttr}
              type="image/webp"
            />
          ) : (
            <source srcSet={urls.webp} type="image/webp" />
          )}

          {/* JPEG/PNG fallback for older browsers */}
          {responsive ? (
            <source
              srcSet={srcsets.jpegSrcSet}
              sizes={sizesAttr}
              type={fallbackFormat === 'png' ? 'image/png' : 'image/jpeg'}
            />
          ) : (
            <source
              srcSet={fallbackFormat === 'png' ? urls.png : urls.jpeg}
              type={fallbackFormat === 'png' ? 'image/png' : 'image/jpeg'}
            />
          )}

          {/* Fallback img element */}
          <img
            src={fallbackFormat === 'png' ? urls.png : urls.jpeg}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`lazy-image ${isLoaded ? 'lazy-image-loaded' : ''}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
            {...otherProps}
          />
        </picture>
      )}

      {/* Placeholder when not yet visible */}
      {!shouldLoad && (
        <div
          className="lazy-image-not-loaded"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {placeholder && placeholderUrl ? (
            <img
              src={placeholderUrl}
              alt=""
              aria-hidden="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
          ) : (
            <span style={{ color: '#d1d5db', fontSize: '2rem' }}>🖼️</span>
          )}
        </div>
      )}
    </div>
  );
};

LazyImage.propTypes = {
  publicId: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  preset: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  responsive: PropTypes.bool,
  responsiveWidths: PropTypes.arrayOf(PropTypes.number),
  sizes: PropTypes.string,
  placeholder: PropTypes.bool,
  fallbackFormat: PropTypes.oneOf(['jpeg', 'png']),
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  showSpinner: PropTypes.bool,
};

export default LazyImage;
