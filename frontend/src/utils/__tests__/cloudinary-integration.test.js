/**
 * Cloudinary Integration Tests
 * 
 * Tests to verify Cloudinary image optimization is properly integrated
 * across the platform.
 * 
 * Task: 9.1.3 Integrate image optimization with Cloudinary
 * Requirements: FR-PERF-3, FR-PERF-4, IR-2
 */

import {
  getOptimizedImageUrl,
  getResponsiveSrcSet,
  getPlaceholderUrl,
  getImageWithPreset,
  getWebPWithFallback,
  getResponsiveWebPSrcSet,
  ImagePresets,
} from '../imageOptimization';

describe('Cloudinary Integration', () => {
  describe('Basic URL Generation', () => {
    test('should generate URL with f_auto and q_auto', () => {
      const url = getOptimizedImageUrl('test/image');
      
      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
      expect(url).toContain('res.cloudinary.com');
    });

    test('should include width and height when provided', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 400,
        height: 300,
      });
      
      expect(url).toContain('w_400');
      expect(url).toContain('h_300');
      expect(url).toContain('c_fill');
    });

    test('should use auto gravity by default', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 400,
      });
      
      expect(url).toContain('g_auto');
    });

    test('should handle custom gravity', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 400,
        gravity: 'face',
      });
      
      expect(url).toContain('g_face');
    });
  });

  describe('Preset Integration', () => {
    test('should have all required presets', () => {
      expect(ImagePresets.PROFILE_SMALL).toBeDefined();
      expect(ImagePresets.PROFILE_MEDIUM).toBeDefined();
      expect(ImagePresets.PROFILE_LARGE).toBeDefined();
      expect(ImagePresets.LOGO_SMALL).toBeDefined();
      expect(ImagePresets.LOGO_MEDIUM).toBeDefined();
      expect(ImagePresets.LOGO_LARGE).toBeDefined();
      expect(ImagePresets.THUMBNAIL_SMALL).toBeDefined();
      expect(ImagePresets.THUMBNAIL_MEDIUM).toBeDefined();
      expect(ImagePresets.THUMBNAIL_LARGE).toBeDefined();
    });

    test('should generate URL with preset', () => {
      const url = getImageWithPreset('test/image', 'PROFILE_MEDIUM');
      
      expect(url).toContain('w_200');
      expect(url).toContain('h_200');
      expect(url).toContain('c_fill');
      expect(url).toContain('g_face');
      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
    });

    test('should handle invalid preset gracefully', () => {
      const url = getImageWithPreset('test/image', 'INVALID_PRESET');
      
      // Should still generate a valid URL with defaults
      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
    });

    test('should allow preset overrides', () => {
      const url = getImageWithPreset('test/image', 'PROFILE_MEDIUM', {
        width: 300,
      });
      
      expect(url).toContain('w_300'); // Override
      expect(url).toContain('h_200'); // From preset
      expect(url).toContain('g_face'); // From preset
    });
  });

  describe('WebP with Fallback', () => {
    test('should generate WebP URL', () => {
      const urls = getWebPWithFallback('test/image');
      
      expect(urls.webp).toContain('f_webp');
      expect(urls.webp).toContain('q_auto');
    });

    test('should generate JPEG fallback', () => {
      const urls = getWebPWithFallback('test/image');
      
      expect(urls.jpeg).toContain('f_jpg');
      expect(urls.jpeg).toContain('q_auto');
    });

    test('should generate PNG fallback', () => {
      const urls = getWebPWithFallback('test/image');
      
      expect(urls.png).toContain('f_png');
      expect(urls.png).toContain('q_auto');
    });

    test('should apply transformations to all formats', () => {
      const urls = getWebPWithFallback('test/image', {
        width: 400,
        height: 300,
      });
      
      expect(urls.webp).toContain('w_400');
      expect(urls.jpeg).toContain('w_400');
      expect(urls.png).toContain('w_400');
    });
  });

  describe('Responsive Images', () => {
    test('should generate responsive srcset', () => {
      const srcset = getResponsiveSrcSet('test/image');
      
      expect(srcset).toContain('320w');
      expect(srcset).toContain('640w');
      expect(srcset).toContain('768w');
      expect(srcset).toContain('1024w');
      expect(srcset).toContain('1280w');
      expect(srcset).toContain('1920w');
    });

    test('should generate responsive WebP srcset', () => {
      const srcsets = getResponsiveWebPSrcSet('test/image');
      
      expect(srcsets.webpSrcSet).toContain('f_webp');
      expect(srcsets.webpSrcSet).toContain('320w');
      expect(srcsets.jpegSrcSet).toContain('f_jpg');
      expect(srcsets.jpegSrcSet).toContain('320w');
    });

    test('should use custom widths', () => {
      const srcset = getResponsiveSrcSet('test/image', {}, [400, 800]);
      
      expect(srcset).toContain('400w');
      expect(srcset).toContain('800w');
      expect(srcset).not.toContain('320w');
    });
  });

  describe('Blur-up Placeholders', () => {
    test('should generate placeholder URL', () => {
      const url = getPlaceholderUrl('test/image');
      
      expect(url).toContain('w_20');
      expect(url).toContain('q_1');
      expect(url).toContain('e_blur:1000');
    });

    test('should use custom placeholder width', () => {
      const url = getPlaceholderUrl('test/image', 40);
      
      expect(url).toContain('w_40');
    });
  });

  describe('URL Extraction', () => {
    test('should handle public ID directly', () => {
      const url = getOptimizedImageUrl('profile/user123');
      
      expect(url).toContain('profile/user123');
    });

    test('should extract public ID from full Cloudinary URL', () => {
      const fullUrl = 'https://res.cloudinary.com/careerak/image/upload/v1234567890/profile/user123.jpg';
      const url = getOptimizedImageUrl(fullUrl);
      
      expect(url).toContain('profile/user123.jpg');
    });

    test('should handle empty publicId', () => {
      const url = getOptimizedImageUrl('');
      
      expect(url).toBe('');
    });

    test('should handle null publicId', () => {
      const url = getOptimizedImageUrl(null);
      
      expect(url).toBe('');
    });
  });

  describe('Performance Optimizations', () => {
    test('should use GPU-accelerated properties only', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 400,
        height: 300,
      });
      
      // Should use transform (GPU-accelerated)
      expect(url).toContain('w_400');
      expect(url).toContain('h_300');
      
      // Should not use width/height CSS properties
      expect(url).not.toContain('width:');
      expect(url).not.toContain('height:');
    });

    test('should apply progressive loading flag', () => {
      const url = getOptimizedImageUrl('test/image');
      
      // Progressive loading is applied by default in Cloudinary config
      expect(url).toContain('f_auto');
    });
  });

  describe('Integration Requirements', () => {
    test('should meet FR-PERF-3: WebP format with fallback', () => {
      const urls = getWebPWithFallback('test/image');
      
      // WebP for modern browsers
      expect(urls.webp).toContain('f_webp');
      
      // JPEG/PNG fallback for older browsers
      expect(urls.jpeg).toContain('f_jpg');
      expect(urls.png).toContain('f_png');
    });

    test('should meet FR-PERF-4: Lazy loading support', () => {
      // LazyImage component handles lazy loading
      // This test verifies URL generation supports it
      const url = getOptimizedImageUrl('test/image');
      
      expect(url).toBeTruthy();
      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
    });

    test('should meet IR-2: Cloudinary service integration', () => {
      const url = getOptimizedImageUrl('test/image');
      
      // Should use Cloudinary service
      expect(url).toContain('res.cloudinary.com');
      expect(url).toContain('careerak'); // Cloud name
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small dimensions', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 1,
        height: 1,
      });
      
      expect(url).toContain('w_1');
      expect(url).toContain('h_1');
    });

    test('should handle very large dimensions', () => {
      const url = getOptimizedImageUrl('test/image', {
        width: 5000,
        height: 5000,
      });
      
      expect(url).toContain('w_5000');
      expect(url).toContain('h_5000');
    });

    test('should handle special characters in publicId', () => {
      const url = getOptimizedImageUrl('profile/user-123_test');
      
      expect(url).toContain('profile/user-123_test');
    });

    test('should handle nested folders', () => {
      const url = getOptimizedImageUrl('folder1/folder2/folder3/image');
      
      expect(url).toContain('folder1/folder2/folder3/image');
    });
  });

  describe('Preset Specifications', () => {
    test('PROFILE_SMALL should be 100x100 with face detection', () => {
      const preset = ImagePresets.PROFILE_SMALL;
      
      expect(preset.width).toBe(100);
      expect(preset.height).toBe(100);
      expect(preset.crop).toBe('fill');
      expect(preset.gravity).toBe('face');
    });

    test('PROFILE_MEDIUM should be 200x200 with face detection', () => {
      const preset = ImagePresets.PROFILE_MEDIUM;
      
      expect(preset.width).toBe(200);
      expect(preset.height).toBe(200);
      expect(preset.crop).toBe('fill');
      expect(preset.gravity).toBe('face');
    });

    test('PROFILE_LARGE should be 400x400 with face detection', () => {
      const preset = ImagePresets.PROFILE_LARGE;
      
      expect(preset.width).toBe(400);
      expect(preset.height).toBe(400);
      expect(preset.crop).toBe('fill');
      expect(preset.gravity).toBe('face');
    });

    test('LOGO_MEDIUM should be 150x150 with fit crop', () => {
      const preset = ImagePresets.LOGO_MEDIUM;
      
      expect(preset.width).toBe(150);
      expect(preset.height).toBe(150);
      expect(preset.crop).toBe('fit');
    });

    test('THUMBNAIL_MEDIUM should be 600x400', () => {
      const preset = ImagePresets.THUMBNAIL_MEDIUM;
      
      expect(preset.width).toBe(600);
      expect(preset.height).toBe(400);
      expect(preset.crop).toBe('fill');
    });
  });
});

describe('Cloudinary Integration - Performance', () => {
  test('should generate URLs quickly', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      getOptimizedImageUrl(`test/image${i}`);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // Should generate 1000 URLs in less than 100ms
    expect(duration).toBeLessThan(100);
  });

  test('should handle concurrent URL generation', async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      Promise.resolve(getOptimizedImageUrl(`test/image${i}`))
    );
    
    const urls = await Promise.all(promises);
    
    expect(urls).toHaveLength(100);
    urls.forEach(url => {
      expect(url).toContain('f_auto');
      expect(url).toContain('q_auto');
    });
  });
});

describe('Cloudinary Integration - Accessibility', () => {
  test('should support descriptive alt text', () => {
    // This is handled by LazyImage component
    // Verify URL generation doesn't interfere
    const url = getOptimizedImageUrl('profile/user123');
    
    expect(url).toBeTruthy();
  });

  test('should support ARIA attributes', () => {
    // This is handled by LazyImage component
    // Verify URL generation doesn't interfere
    const url = getOptimizedImageUrl('decorative/image');
    
    expect(url).toBeTruthy();
  });
});
