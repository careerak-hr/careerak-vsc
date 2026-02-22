# OverlaySpinner - Quick Reference

## Import
```jsx
import { OverlaySpinner } from '@/components/Loading';
```

## Basic Usage
```jsx
const [isLoading, setIsLoading] = useState(false);

<OverlaySpinner show={isLoading} message="Processing..." />
```

## Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `show` | boolean | `false` | true, false |
| `message` | string | `''` | Any text |
| `backdropOpacity` | number | `0.5` | 0-1 |
| `spinnerSize` | string | `'large'` | 'small', 'medium', 'large' |
| `spinnerColor` | string | `'primary'` | 'primary', 'accent', 'white' |
| `announceToScreenReader` | boolean | `true` | true, false |

## Common Patterns

### File Upload
```jsx
const [isUploading, setIsUploading] = useState(false);

const handleUpload = async (file) => {
  setIsUploading(true);
  try {
    await uploadFile(file);
  } finally {
    setIsUploading(false);
  }
};

<OverlaySpinner 
  show={isUploading} 
  message="Uploading file..." 
  spinnerColor="accent"
/>
```

### Data Processing
```jsx
const [isProcessing, setIsProcessing] = useState(false);

<OverlaySpinner 
  show={isProcessing} 
  message="Processing data..." 
/>
```

### Delete Operation
```jsx
const [isDeleting, setIsDeleting] = useState(false);

<OverlaySpinner 
  show={isDeleting} 
  message="Deleting..." 
  spinnerSize="medium"
/>
```

## Do's ✅
- Use for operations > 1 second
- Provide clear messages
- Always hide in `finally` block
- Use appropriate spinner size

## Don'ts ❌
- Don't use for quick operations (< 500ms)
- Don't forget error handling
- Don't use multiple overlays
- Don't use for non-blocking operations

## Features
- ✅ Full-screen overlay
- ✅ Centered spinner
- ✅ Smooth animations (200ms)
- ✅ Dark mode support
- ✅ Screen reader accessible
- ✅ Respects reduced motion

## See Also
- Full docs: `docs/OVERLAY_SPINNER_IMPLEMENTATION.md`
- Examples: `frontend/src/examples/OverlaySpinnerUsage.example.jsx`
- Demo: `frontend/src/components/Loading/LoadingDemo.jsx`
