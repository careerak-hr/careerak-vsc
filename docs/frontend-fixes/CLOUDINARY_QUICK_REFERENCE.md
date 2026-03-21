# Cloudinary Integration - Quick Reference
## Apply Page Enhancements

---

## File Upload Validation Rules

### ✅ Accepted File Types
```javascript
const VALID_TYPES = [
  'application/pdf',                    // PDF
  'application/msword',                 // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'image/jpeg',                         // JPG/JPEG
  'image/png'                           // PNG
];
```

### 📏 Size Limits
- **Maximum**: 5 MB (5,242,880 bytes)
- **Minimum**: No minimum (but should be > 0)

### 📁 File Categories
```javascript
const CATEGORIES = [
  'resume',        // Resume/CV
  'cover_letter',  // Cover letter
  'certificate',   // Certificates
  'portfolio',     // Portfolio items
  'other'          // Other documents
];
```

### 🔢 File Limits
- **Maximum files per application**: 10

---

## File Object Structure

```javascript
{
  id: 'file-1',                    // Unique identifier
  name: 'resume.pdf',              // Original filename
  size: 1024000,                   // Size in bytes
  type: 'application/pdf',         // MIME type
  url: 'https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf',
  cloudinaryId: 'careerak/applications/resume',  // For deletion
  category: 'resume',              // File category
  uploadedAt: new Date()           // Upload timestamp
}
```

---

## Cloudinary Configuration

### Default Transformations
```javascript
{
  fetch_format: 'auto',  // Automatic format (WebP, JPEG, PNG)
  quality: 'auto',       // Automatic quality optimization
  flags: 'progressive'   // Progressive loading
}
```

### Image Presets
```javascript
IMAGE_PRESETS = {
  PROFILE_PICTURE: {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face'
  },
  COMPANY_LOGO: {
    width: 300,
    height: 300,
    crop: 'fit'
  },
  JOB_THUMBNAIL: {
    width: 600,
    height: 400,
    crop: 'fill'
  },
  COURSE_THUMBNAIL: {
    width: 600,
    height: 400,
    crop: 'fill'
  }
}
```

---

## Backend Usage

### Upload File
```javascript
const { uploadImage } = require('../config/cloudinary');

const result = await uploadImage(fileBuffer, {
  folder: 'careerak/applications',
  tags: ['application', 'resume'],
  public_id: 'custom-id' // Optional
});

// Result:
// {
//   secure_url: 'https://res.cloudinary.com/...',
//   public_id: 'careerak/applications/file',
//   bytes: 1024000,
//   format: 'pdf'
// }
```

### Get Optimized URL
```javascript
const { getOptimizedUrl } = require('../config/cloudinary');

const url = getOptimizedUrl('careerak/applications/file', {
  width: 400,
  height: 400,
  crop: 'fill'
});
```

### Delete File
```javascript
const cloudinary = require('../config/cloudinary');

await cloudinary.uploader.destroy('careerak/applications/file');
```

---

## Frontend Usage

### File Validation
```javascript
const validateFile = (file) => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB' };
  }
  
  return { valid: true };
};
```

### Upload File
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'careerak/applications');
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Remove File
```javascript
const removeFile = async (cloudinaryId) => {
  await fetch(`/api/files/${cloudinaryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};
```

---

## Draft Integration

### Save Files with Draft
```javascript
const draft = {
  jobPosting: jobPostingId,
  applicant: userId,
  step: 4,
  formData: { /* ... */ },
  files: [
    {
      id: 'file-1',
      name: 'resume.pdf',
      size: 1024000,
      type: 'application/pdf',
      url: 'https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf',
      cloudinaryId: 'careerak/applications/resume',
      category: 'resume',
      uploadedAt: new Date()
    }
  ]
};

await ApplicationDraft.create(draft);
```

### Load Files from Draft
```javascript
const draft = await ApplicationDraft.findOne({
  jobPosting: jobPostingId,
  applicant: userId
});

const files = draft.files; // Array of file objects
```

### Remove File from Draft
```javascript
draft.files = draft.files.filter(f => f.id !== fileIdToRemove);
await draft.save();
```

---

## Error Messages

### File Type Errors
```javascript
const ERROR_MESSAGES = {
  INVALID_TYPE: 'File type not allowed. Please upload PDF, DOC, DOCX, JPG, or PNG files.',
  INVALID_SIZE: 'File size exceeds 5MB. Please upload a smaller file.',
  MAX_FILES: 'Maximum 10 files allowed per application.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  DELETE_FAILED: 'File deletion failed. Please try again.'
};
```

---

## URL Format

### Structure
```
https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{extension}
```

### Examples
```
PDF:  https://res.cloudinary.com/careerak/raw/upload/v123/resume.pdf
JPG:  https://res.cloudinary.com/careerak/image/upload/v123/photo.jpg
PNG:  https://res.cloudinary.com/careerak/image/upload/v123/cert.png
DOCX: https://res.cloudinary.com/careerak/raw/upload/v123/cover.docx
```

---

## Testing

### Run Tests
```bash
cd backend
npm test -- apply-page-cloudinary.test.js
```

### Test Coverage
- ✅ 39 tests
- ✅ Configuration validation
- ✅ File type validation
- ✅ File size validation
- ✅ URL formatting
- ✅ File operations
- ✅ Error handling

---

## Common Issues

### Issue: File upload fails
**Solution**: Check Cloudinary credentials in `.env`
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Issue: File size validation fails
**Solution**: Ensure size is in bytes (not KB or MB)
```javascript
const maxSize = 5 * 1024 * 1024; // 5MB in bytes
```

### Issue: File type validation fails
**Solution**: Use exact MIME type strings
```javascript
// ✅ Correct
'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

// ❌ Wrong
'docx'
```

### Issue: File not removed from Cloudinary
**Solution**: Ensure cloudinaryId is stored and passed correctly
```javascript
await cloudinary.uploader.destroy(file.cloudinaryId);
```

---

## Best Practices

1. **Always validate files on both client and server**
   - Client: Immediate feedback
   - Server: Security enforcement

2. **Store cloudinaryId for deletion**
   - Required to delete files from Cloudinary
   - Store in database with file metadata

3. **Use appropriate resource types**
   - `raw` for documents (PDF, DOC, DOCX)
   - `image` for images (JPG, PNG)

4. **Handle errors gracefully**
   - Display user-friendly error messages
   - Log detailed errors for debugging

5. **Implement progress tracking**
   - Show upload progress to users
   - Allow cancellation of uploads

6. **Clean up orphaned files**
   - Delete from Cloudinary when draft is deleted
   - Delete when application is withdrawn

---

## Environment Variables

```env
# Required
CLOUDINARY_CLOUD_NAME=careerak
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Optional
CLOUDINARY_UPLOAD_PRESET=careerak_applications
```

---

## Related Files

- **Configuration**: `backend/src/config/cloudinary.js`
- **Tests**: `backend/tests/apply-page-cloudinary.test.js`
- **Model**: `backend/src/models/ApplicationDraft.js`
- **Report**: `.kiro/specs/apply-page-enhancements/CLOUDINARY_INTEGRATION_TEST_REPORT.md`

---

**Last Updated**: 2026-03-04  
**Status**: ✅ Tested and Validated
