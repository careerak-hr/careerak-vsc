# Export Functionality

## Overview

The export functionality allows admins to export platform data in multiple formats (Excel, CSV, PDF) with filtering and date range options. This implementation follows the admin dashboard enhancements specification (Requirements 3.1-3.9).

## Components

### ExportModal

A modal component for configuring and executing data exports.

**Features:**
- Select data type (users, jobs, applications, courses, activity log)
- Select format (Excel, CSV, PDF)
- Select date range
- Apply filters before export
- Show export progress
- Multi-language support (Arabic, English, French)
- RTL support for Arabic
- Responsive design

**Props:**
- `isOpen` (boolean): Whether the modal is open
- `onClose` (function): Callback when modal is closed
- `dataType` (string): Type of data to export ('users', 'jobs', 'applications', 'courses', 'activity_log')
- `onExport` (function): Callback when export is triggered, receives config object

**Usage:**
```jsx
import { ExportModal } from '../components/admin';
import { exportAndDownload, showSuccessNotification, showErrorNotification } from '../services/exportService';

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useApp();

  const handleExport = async (config) => {
    try {
      await exportAndDownload('users', config);
      showSuccessNotification(null, language);
    } catch (error) {
      showErrorNotification(error.message, language);
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Export Users
      </button>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType="users"
        onExport={handleExport}
      />
    </>
  );
};
```

## Services

### exportService

Client-side service for handling export API calls and file downloads.

**Functions:**

#### exportData(dataType, config)
Exports data with specified configuration.

**Parameters:**
- `dataType` (string): Type of data to export
- `config` (object): Export configuration
  - `format` (string): Export format ('excel', 'csv', 'pdf')
  - `dateRange` (object): Date range filter
    - `start` (string): Start date (ISO string)
    - `end` (string): End date (ISO string)
  - `filters` (object): Additional filters

**Returns:** Promise<Object> with `downloadUrl` and `expiresAt`

**Example:**
```javascript
const result = await exportData('users', {
  format: 'excel',
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  },
  filters: {
    userType: 'jobSeeker'
  }
});
```

#### downloadFile(url, filename)
Downloads file from URL.

**Parameters:**
- `url` (string): File URL
- `filename` (string): Suggested filename

**Returns:** Promise<void>

**Example:**
```javascript
await downloadFile(result.downloadUrl, 'users_export_2024.xlsx');
```

#### exportAndDownload(dataType, config, onProgress)
Exports and downloads data in one operation.

**Parameters:**
- `dataType` (string): Type of data to export
- `config` (object): Export configuration
- `onProgress` (function): Progress callback (optional)

**Returns:** Promise<void>

**Example:**
```javascript
await exportAndDownload('users', config, (progress) => {
  console.log(`Stage: ${progress.stage}, Progress: ${progress.progress}%`);
});
```

#### showSuccessNotification(message, language)
Shows success toast notification.

**Parameters:**
- `message` (string): Success message (optional)
- `language` (string): Language code ('ar', 'en', 'fr')

**Example:**
```javascript
showSuccessNotification('Export completed!', 'en');
```

#### showErrorNotification(message, language)
Shows error toast notification.

**Parameters:**
- `message` (string): Error message (optional)
- `language` (string): Language code ('ar', 'en', 'fr')

**Example:**
```javascript
showErrorNotification('Export failed', 'en');
```

## Data Types

### users
Exports user data with the following filters:
- `userType`: 'jobSeeker', 'company', 'freelancer'

### jobs
Exports job postings with the following filters:
- `status`: 'active', 'inactive'

### applications
Exports job applications with the following filters:
- `status`: 'pending', 'approved', 'rejected'

### courses
Exports courses with the following filters:
- `status`: 'active', 'inactive'

### activity_log
Exports activity log entries (no additional filters).

## Export Formats

### Excel (.xlsx)
- Includes column headers
- Creates separate sheets for different categories
- Formatted cells with proper data types
- Supports large datasets

### CSV (.csv)
- Includes column headers
- Comma-separated values
- UTF-8 encoding
- Compatible with all spreadsheet applications

### PDF (.pdf)
- Includes platform logo
- Includes export timestamp
- Formatted tables
- Professional layout

## Backend API

The export functionality uses the following backend endpoints:

```
POST /api/admin/export/users
POST /api/admin/export/jobs
POST /api/admin/export/applications
POST /api/admin/export/courses
POST /api/admin/export/activity-log
GET /api/admin/export/download/:filename
```

All endpoints require authentication (Bearer token) and admin role.

## Error Handling

The export service handles the following errors:

1. **Authentication Errors (401)**: User not authenticated
2. **Authorization Errors (403)**: User not authorized (not admin)
3. **Validation Errors (400)**: Invalid data type or format
4. **Server Errors (500)**: Internal server error
5. **Network Errors**: Connection issues

Errors are displayed using toast notifications with appropriate messages in the user's language.

## Progress Tracking

The `exportAndDownload` function supports progress tracking through a callback:

```javascript
await exportAndDownload('users', config, (progress) => {
  // progress.stage: 'exporting', 'downloading', 'complete', 'error'
  // progress.progress: 0-100
  // progress.error: error message (if stage is 'error')
});
```

## Styling

The ExportModal uses the approved color palette:
- Primary (Navy): #304B60
- Secondary (Beige): #E3DAD1
- Accent (Copper): #D48161

Fonts:
- Arabic: Amiri, Cairo
- English: Cormorant Garamond
- French: EB Garamond

## Responsive Design

The ExportModal is fully responsive:
- Desktop: Full modal with side-by-side layout
- Tablet: Adjusted spacing and font sizes
- Mobile: Stacked layout, full-width buttons

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- High contrast colors
- Clear error messages

## Testing

See `ExportModal.example.jsx` for usage examples and test scenarios.

## Requirements Validation

This implementation validates the following requirements:

- **3.1-3.4**: Export buttons for users, jobs, applications, courses
- **3.5**: Filter support before export
- **3.6**: Column headers and proper formatting
- **3.7**: PDF with logo and timestamp
- **3.8**: Excel with separate sheets
- **3.9**: Activity log export with all fields

## Future Enhancements

Potential improvements for future versions:

1. Scheduled exports (daily, weekly, monthly)
2. Email delivery of exports
3. Custom field selection
4. Export templates
5. Batch exports
6. Export history and management
7. Advanced filtering options
8. Export preview before download

## Support

For issues or questions, refer to:
- Design document: `.kiro/specs/admin-dashboard-enhancements/design.md`
- Requirements: `.kiro/specs/admin-dashboard-enhancements/requirements.md`
- Backend service: `backend/src/services/exportService.js`
