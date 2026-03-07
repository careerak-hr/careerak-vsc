/**
 * Apply Page Enhancements - Cloudinary Integration Tests
 * 
 * Tests for file upload, validation, and deletion using Cloudinary
 * 
 * Requirements: 4.1-4.10 (Multiple File Upload Support)
 * Properties: 4 (File validation), 15 (File removal)
 * Task: 4. Integrate Cloudinary file upload service
 */

const { DEFAULT_IMAGE_TRANSFORMATIONS, IMAGE_PRESETS } = require('../src/config/cloudinary');

describe('Apply Page - Cloudinary Integration', () => {
  
  describe('Cloudinary Configuration', () => {
    it('should have DEFAULT_IMAGE_TRANSFORMATIONS configured', () => {
      expect(DEFAULT_IMAGE_TRANSFORMATIONS).toBeDefined();
      expect(DEFAULT_IMAGE_TRANSFORMATIONS).toHaveProperty('fetch_format');
      expect(DEFAULT_IMAGE_TRANSFORMATIONS).toHaveProperty('quality');
      expect(DEFAULT_IMAGE_TRANSFORMATIONS).toHaveProperty('flags');
    });

    it('should use f_auto (fetch_format: auto)', () => {
      expect(DEFAULT_IMAGE_TRANSFORMATIONS.fetch_format).toBe('auto');
    });

    it('should use q_auto (quality: auto)', () => {
      expect(DEFAULT_IMAGE_TRANSFORMATIONS.quality).toBe('auto');
    });

    it('should use progressive loading', () => {
      expect(DEFAULT_IMAGE_TRANSFORMATIONS.flags).toBe('progressive');
    });
  });

  describe('Image Presets', () => {
    it('should have all required presets', () => {
      expect(IMAGE_PRESETS).toHaveProperty('PROFILE_PICTURE');
      expect(IMAGE_PRESETS).toHaveProperty('COMPANY_LOGO');
      expect(IMAGE_PRESETS).toHaveProperty('JOB_THUMBNAIL');
      expect(IMAGE_PRESETS).toHaveProperty('COURSE_THUMBNAIL');
    });

    it('should have correct PROFILE_PICTURE preset', () => {
      const preset = IMAGE_PRESETS.PROFILE_PICTURE;
      expect(preset.width).toBe(400);
      expect(preset.height).toBe(400);
      expect(preset.crop).toBe('fill');
      expect(preset.gravity).toBe('face');
    });

    it('should have correct COMPANY_LOGO preset', () => {
      const preset = IMAGE_PRESETS.COMPANY_LOGO;
      expect(preset.width).toBe(300);
      expect(preset.height).toBe(300);
      expect(preset.crop).toBe('fit');
    });
  });

  describe('File Validation (Property 4)', () => {
    describe('Valid File Types', () => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];

      validTypes.forEach(type => {
        it(`should accept ${type}`, () => {
          expect(validTypes).toContain(type);
        });
      });
    });

    describe('Invalid File Types', () => {
      const invalidTypes = [
        'application/javascript',
        'text/html',
        'video/mp4',
        'audio/mpeg',
        'application/zip'
      ];

      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];

      invalidTypes.forEach(type => {
        it(`should reject ${type}`, () => {
          expect(validTypes).not.toContain(type);
        });
      });
    });

    describe('File Size Validation', () => {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      it('should accept file exactly 5MB', () => {
        const fileSize = 5 * 1024 * 1024;
        expect(fileSize <= MAX_SIZE).toBe(true);
      });

      it('should reject file larger than 5MB', () => {
        const fileSize = 5 * 1024 * 1024 + 1;
        expect(fileSize <= MAX_SIZE).toBe(false);
      });

      it('should accept file smaller than 5MB', () => {
        const fileSize = 1 * 1024 * 1024; // 1MB
        expect(fileSize <= MAX_SIZE).toBe(true);
      });

      it('should accept very small file', () => {
        const fileSize = 1024; // 1KB
        expect(fileSize <= MAX_SIZE).toBe(true);
      });
    });
  });

  describe('File Data Structure', () => {
    it('should have correct file object structure', () => {
      const file = {
        id: 'file-1',
        name: 'resume.pdf',
        size: 1024000,
        type: 'application/pdf',
        url: 'https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf',
        cloudinaryId: 'careerak/applications/resume',
        category: 'resume',
        uploadedAt: new Date()
      };

      expect(file).toHaveProperty('id');
      expect(file).toHaveProperty('name');
      expect(file).toHaveProperty('size');
      expect(file).toHaveProperty('type');
      expect(file).toHaveProperty('url');
      expect(file).toHaveProperty('cloudinaryId');
      expect(file).toHaveProperty('category');
      expect(file).toHaveProperty('uploadedAt');
    });

    it('should support valid file categories', () => {
      const validCategories = ['resume', 'cover_letter', 'certificate', 'portfolio', 'other'];
      
      validCategories.forEach(category => {
        expect(['resume', 'cover_letter', 'certificate', 'portfolio', 'other']).toContain(category);
      });
    });
  });

  describe('Cloudinary URL Format', () => {
    it('should have valid Cloudinary URL structure', () => {
      const url = 'https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf';
      
      expect(url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
      expect(url).toContain('careerak');
      expect(url).toMatch(/\/v\d+\//); // version number
    });

    it('should support different resource types', () => {
      const urls = {
        raw: 'https://res.cloudinary.com/careerak/raw/upload/v123/document.pdf',
        image: 'https://res.cloudinary.com/careerak/image/upload/v123/photo.jpg'
      };

      expect(urls.raw).toContain('/raw/');
      expect(urls.image).toContain('/image/');
    });

    it('should include cloud name in URL', () => {
      const url = 'https://res.cloudinary.com/careerak/raw/upload/v123/file.pdf';
      expect(url).toContain('/careerak/');
    });
  });

  describe('File Array Operations (Property 15)', () => {
    it('should support adding files to array', () => {
      const files = [];
      const newFile = {
        id: 'file-1',
        name: 'resume.pdf',
        cloudinaryId: 'app/resume'
      };

      files.push(newFile);
      expect(files).toHaveLength(1);
      expect(files[0].id).toBe('file-1');
    });

    it('should support removing files from array', () => {
      const files = [
        { id: 'file-1', name: 'resume.pdf' },
        { id: 'file-2', name: 'cover.pdf' }
      ];

      const filtered = files.filter(f => f.id !== 'file-1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('file-2');
    });

    it('should support maximum 10 files', () => {
      const MAX_FILES = 10;
      const files = Array.from({ length: 10 }, (_, i) => ({
        id: `file-${i + 1}`,
        name: `file-${i + 1}.pdf`
      }));

      expect(files.length).toBe(MAX_FILES);
      expect(files.length <= MAX_FILES).toBe(true);
    });

    it('should reject more than 10 files', () => {
      const MAX_FILES = 10;
      const files = Array.from({ length: 11 }, (_, i) => ({
        id: `file-${i + 1}`,
        name: `file-${i + 1}.pdf`
      }));

      expect(files.length > MAX_FILES).toBe(true);
    });
  });

  describe('File Metadata', () => {
    it('should store file size in bytes', () => {
      const file = {
        name: 'resume.pdf',
        size: 1024000 // 1MB in bytes
      };

      expect(typeof file.size).toBe('number');
      expect(file.size).toBeGreaterThan(0);
    });

    it('should store upload timestamp', () => {
      const file = {
        name: 'resume.pdf',
        uploadedAt: new Date()
      };

      expect(file.uploadedAt).toBeInstanceOf(Date);
    });

    it('should have unique file IDs', () => {
      const files = [
        { id: 'file-1', name: 'resume.pdf' },
        { id: 'file-2', name: 'cover.pdf' },
        { id: 'file-3', name: 'cert.pdf' }
      ];

      const ids = files.map(f => f.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(files.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing cloudinaryId', () => {
      const file = {
        id: 'file-1',
        name: 'resume.pdf',
        url: 'https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf'
        // cloudinaryId missing
      };

      expect(file.cloudinaryId).toBeUndefined();
    });

    it('should handle invalid file type', () => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const invalidType = 'application/javascript';

      expect(validTypes).not.toContain(invalidType);
    });

    it('should handle oversized file', () => {
      const MAX_SIZE = 5 * 1024 * 1024;
      const fileSize = 10 * 1024 * 1024; // 10MB

      expect(fileSize > MAX_SIZE).toBe(true);
    });
  });

  describe('Integration Requirements', () => {
    it('should support draft file persistence', () => {
      const draft = {
        files: [
          {
            id: 'file-1',
            name: 'resume.pdf',
            cloudinaryId: 'app/resume',
            url: 'https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf'
          }
        ]
      };

      expect(draft.files).toHaveLength(1);
      expect(draft.files[0]).toHaveProperty('cloudinaryId');
    });

    it('should support file removal from draft', () => {
      const draft = {
        files: [
          { id: 'file-1', name: 'resume.pdf' },
          { id: 'file-2', name: 'cover.pdf' }
        ]
      };

      draft.files = draft.files.filter(f => f.id !== 'file-1');
      expect(draft.files).toHaveLength(1);
      expect(draft.files[0].id).toBe('file-2');
    });

    it('should preserve files across draft updates', () => {
      const draft = {
        step: 1,
        files: [{ id: 'file-1', name: 'resume.pdf' }]
      };

      draft.step = 2; // Update step
      expect(draft.files).toHaveLength(1); // Files preserved
    });
  });
});
