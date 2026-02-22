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
  fallbackImage = null,
  showRetry = true,
  errorMessage = null,
  logErrors = true,
  ...otherProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);

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
    const error = {
      message: e.target?.error?.message || 'Failed to load image',
      src: e.target?.src,
      timestamp: new Date().toISOString(),
      retryCount,
    };
    
    setErrorDetails(error);
    setHasError(true);
    
    // Log error if enabled
    if (logErrors) {
      console.error('[OptimizedImage] Image load error:', {
        publicId,
        alt,
        ...error,
      });
    }
    
    if (onError) onError(e, error);
  };

  // Retry loading the image
  const handleRetry = () => {
    setHasError(false);
    setErrorDetails(null);
    setIsLoaded(false);
    setRetryCount(prev => prev + 1);
  };

  // Reset state when publicId changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setRetryCount(0);
    setErrorDetails(null);
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

  // If error occurred, show error placeholder with retry option
  if (hasError) {
    // If fallback image is provided, try to load it
    if (fallbackImage && retryCount === 0) {
      return (
        <img
          src={fallbackImage}
          alt={alt}
          className={`optimized-image-fallback ${className}`}
          style={{
            width: width || '100%',
            height: height || 'auto',
            objectFit: 'cover',
            ...style,
          }}
          onError={() => {
            // If fallback also fails, show error UI
            setRetryCount(1);
          }}
        />
      );
    }

    return (
      <div
        className={`optimized-image-error ${className}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#fee2e2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          gap: '0.5rem',
          ...style,
        }}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <span style={{ color: '#dc2626', fontSize: '2rem' }}>⚠️</span>
        {errorMessage && (
          <span style={{ color: '#dc2626', fontSize: '0.875rem', textAlign: 'center' }}>
            {errorMessage}
          </span>
        )}
        {showRetry && (
          <button
            onClick={handleRetry}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            aria-label="Retry loading image"
          >
            🔄 Retry
          </button>
        )}
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
  fallbackImage: PropTypes.string,
  showRetry: PropTypes.bool,
  errorMessage: PropTypes.string,
  logErrors: PropTypes.bool,
};

export default OptimizedImage;
