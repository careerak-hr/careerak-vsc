/**
 * OptimizedImage Component
 * 
 * A React component that implements WebP format with JPEG/PNG fallback
 * using the HTML <picture> element for optimal browser compatibility.
 * 
 * Features:
 * - WebP format for modern browsers (30-50% smaller file size)
 * - Automatic fallback to JPEG/PNG for older browsers
 * - Responsive images with srcset
 * - Lazy loading support
 * - Blur-up placeholder
 * - Accessibility support
 * 
 * Requirements: FR-PERF-3, FR-PERF-4
 * Design: Section 3.3 Image Optimization
 * 
 * @example
 * <OptimizedImage
 *   publicId="profile/user123"
 *   alt="User profile"
 *   width={400}
 *   height={400}
 *   preset="PROFILE_LARGE"
 * />
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  getWebPWithFallback,
  getResponsiveWebPSrcSet,
  getPlaceholderUrl,
  generateSizesAttribute,
  ImagePresets,
} from '../../utils/imageOptimization';
import './OptimizedImage.css';

const OptimizedImage = ({
  publicId,
  alt = '',
  width = null,
  height = null,
  preset = null,
  className = '',
  style = {},
  loading = 'lazy',
  responsive = false,
  responsiveWidths = [320, 640, 768, 1024, 1280, 1920],
  sizes = null,
  placeholder = true,
  fallbackFormat = 'jpeg',
  onLoad = null,
  onError = null,
  ...otherProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
  }, [publicId]);

  // If no publicId, show placeholder or nothing
  if (!publicId) {
    return (
      <div
        className={`optimized-image-placeholder ${className}`}
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
        className={`optimized-image-error ${className}`}
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
    <picture className={`optimized-image-wrapper ${className}`}>
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
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          ...style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        {...otherProps}
      />

      {/* Blur-up placeholder */}
      {placeholder && placeholderUrl && !isLoaded && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(20px)',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}
    </picture>
  );
};

OptimizedImage.propTypes = {
  publicId: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  preset: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  responsive: PropTypes.bool,
  responsiveWidths: PropTypes.arrayOf(PropTypes.number),
  sizes: PropTypes.string,
  placeholder: PropTypes.bool,
  fallbackFormat: PropTypes.oneOf(['jpeg', 'png']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default OptimizedImage;
