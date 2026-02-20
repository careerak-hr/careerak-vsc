# Loading Animations

Animated loading components using Framer Motion for the Careerak platform.

## Overview

This directory contains a comprehensive set of loading animation components that:
- Use Framer Motion for smooth animations
- Respect `prefers-reduced-motion` setting
- Support dark mode
- Follow Careerak design standards
- Meet accessibility requirements (ARIA labels, roles)

## Requirements

- **FR-ANIM-5**: When content is loading, the system shall display animated skeleton loaders or spinners
- **FR-LOAD-1 to FR-LOAD-8**: Unified loading states across the platform
- **NFR-USE-3**: Display loading states within 100ms of user action
- **NFR-USE-4**: Respect user's prefers-reduced-motion setting

## Components

### 1. Spinner

Rotating spinner for general loading indication.

```jsx
import { Spinner } from '@/components/Loading';

<Spinner size="medium" color="primary" />
```

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `color`: 'primary' | 'accent' | 'white' | 'gray' (default: 'primary')
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label (default: 'Loading...')

**Use cases:**
- General loading states
- Inline loading indicators
- Page section loading

---

### 2. ButtonSpinner

Compact spinner for use inside buttons.

```jsx
import { ButtonSpinner } from '@/components/Loading';

<button disabled={loading}>
  {loading ? <ButtonSpinner color="white" /> : 'Submit'}
</button>
```

**Props:**
- `color`: 'white' | 'primary' | 'accent' (default: 'white')
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label (default: 'Processing...')

**Use cases:**
- Button loading states
- Form submissions
- Action buttons

---

### 3. OverlaySpinner

Full-screen overlay with centered spinner for blocking operations.

```jsx
import { OverlaySpinner } from '@/components/Loading';

<OverlaySpinner 
  show={isLoading} 
  message="Uploading file..." 
  spinnerSize="large"
/>
```

**Props:**
- `show`: boolean - Show/hide overlay (default: false)
- `message`: string - Optional message below spinner
- `backdropOpacity`: number - Backdrop opacity 0-1 (default: 0.5)
- `spinnerSize`: 'small' | 'medium' | 'large' (default: 'large')
- `spinnerColor`: 'primary' | 'accent' | 'white' | 'gray' (default: 'primary')

**Use cases:**
- File uploads
- Data processing
- Blocking operations

---

### 4. ProgressBar

Animated progress bar for operations with known progress.

```jsx
import { ProgressBar } from '@/components/Loading';

<ProgressBar 
  progress={75} 
  position="top" 
  color="accent" 
  showPercentage 
/>
```

**Props:**
- `progress`: number - Progress value 0-100 (default: 0)
- `position`: 'relative' | 'top' | 'bottom' (default: 'relative')
- `height`: string - Tailwind height class (default: 'h-1')
- `color`: 'primary' | 'accent' | 'success' | 'warning' | 'error' (default: 'accent')
- `showPercentage`: boolean - Show percentage text (default: false)
- `className`: Additional CSS classes

**Use cases:**
- File uploads with progress
- Multi-step forms
- Page loading progress

---

### 5. SkeletonBox

Basic skeleton box with pulse or shimmer animation.

```jsx
import { SkeletonBox } from '@/components/Loading';

<SkeletonBox 
  width="w-full" 
  height="h-20" 
  rounded="rounded-lg" 
  animationType="pulse" 
/>
```

**Props:**
- `width`: string - Tailwind width class (default: 'w-full')
- `height`: string - Tailwind height class (default: 'h-4')
- `rounded`: string - Tailwind border-radius class (default: 'rounded')
- `animationType`: 'pulse' | 'shimmer' | 'none' (default: 'pulse')
- `className`: Additional CSS classes

**Use cases:**
- Custom skeleton layouts
- Image placeholders
- Content blocks

---

### 6. SkeletonText

Multi-line text skeleton loader.

```jsx
import { SkeletonText } from '@/components/Loading';

<SkeletonText lines={3} lineHeight="h-4" gap="gap-2" />
```

**Props:**
- `lines`: number - Number of lines (default: 1)
- `lineHeight`: string - Tailwind height class (default: 'h-4')
- `gap`: string - Tailwind gap class (default: 'gap-2')
- `lastLineWidth`: string - Width of last line (default: '75%')
- `animationType`: 'pulse' | 'shimmer' | 'none' (default: 'pulse')
- `className`: Additional CSS classes

**Use cases:**
- Text content loading
- Paragraph placeholders
- Description loading

---

### 7. SkeletonCard

Pre-built skeleton loader for card layouts.

```jsx
import { SkeletonCard } from '@/components/Loading';

<SkeletonCard variant="job" />
```

**Props:**
- `variant`: 'default' | 'job' | 'course' | 'profile' (default: 'default')
- `showImage`: boolean - Show image skeleton (default: true)
- `imageHeight`: string - Tailwind height class (default: 'h-48')
- `textLines`: number - Number of text lines (default: 3)
- `className`: Additional CSS classes

**Variants:**
- `default`: Image + 3 text lines + 2 buttons
- `job`: No image + 4 text lines + 2 buttons
- `course`: Image (h-40) + 3 text lines + 2 buttons
- `profile`: Image (h-32) + 2 text lines + 2 buttons

**Use cases:**
- Job listing loading
- Course listing loading
- Profile card loading

---

### 8. DotsLoader

Three bouncing dots for loading indication.

```jsx
import { DotsLoader } from '@/components/Loading';

<DotsLoader size="medium" color="primary" />
```

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `color`: 'primary' | 'accent' | 'white' | 'gray' (default: 'primary')
- `gap`: string - Tailwind gap class (default: 'gap-1')
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label (default: 'Loading...')

**Use cases:**
- Inline loading indicators
- Chat message loading
- Subtle loading states

---

### 9. PulseLoader

Pulsing circle for loading indication.

```jsx
import { PulseLoader } from '@/components/Loading';

<PulseLoader size="large" color="accent" />
```

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `color`: 'primary' | 'accent' | 'white' | 'gray' (default: 'primary')
- `className`: Additional CSS classes
- `ariaLabel`: Accessibility label (default: 'Loading...')

**Use cases:**
- Alternative to spinner
- Subtle loading indication
- Icon loading states

---

## Usage Examples

### Button with Loading State

```jsx
import { ButtonSpinner } from '@/components/Loading';

const SubmitButton = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitForm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSubmit} 
      disabled={loading}
      className="px-6 py-3 bg-[#D48161] text-white rounded-lg"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <ButtonSpinner color="white" />
          <span>Submitting...</span>
        </div>
      ) : (
        'Submit'
      )}
    </button>
  );
};
```

### Page with Skeleton Loading

```jsx
import { SkeletonCard } from '@/components/Loading';

const JobListPage = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs().then(data => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonCard key={i} variant="job" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};
```

### File Upload with Progress

```jsx
import { ProgressBar, OverlaySpinner } from '@/components/Loading';

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      
      {uploading && (
        <ProgressBar 
          progress={progress} 
          color="accent" 
          showPercentage 
          className="mt-4"
        />
      )}
    </div>
  );
};
```

### Custom Skeleton Layout

```jsx
import { SkeletonBox, SkeletonText } from '@/components/Loading';

const CustomSkeleton = () => (
  <div className="bg-white dark:bg-[#2d2d2d] rounded-lg p-6">
    {/* Avatar */}
    <SkeletonBox 
      width="w-16" 
      height="h-16" 
      rounded="rounded-full" 
      animationType="pulse" 
    />
    
    {/* Name and title */}
    <div className="mt-4">
      <SkeletonBox width="w-32" height="h-6" rounded="rounded" />
      <SkeletonText lines={2} lineHeight="h-4" gap="gap-2" className="mt-2" />
    </div>
    
    {/* Stats */}
    <div className="flex gap-4 mt-6">
      <SkeletonBox width="w-20" height="h-12" rounded="rounded-lg" />
      <SkeletonBox width="w-20" height="h-12" rounded="rounded-lg" />
      <SkeletonBox width="w-20" height="h-12" rounded="rounded-lg" />
    </div>
  </div>
);
```

---

## Accessibility

All loading components include:
- `role="status"` for screen reader announcements
- `aria-label` for descriptive labels
- Proper ARIA attributes for progress indicators

Example:
```jsx
<Spinner ariaLabel="Loading job listings..." />
<ProgressBar progress={50} aria-label="Upload progress: 50%" />
```

---

## Dark Mode

All components support dark mode automatically using Tailwind's `dark:` classes:
- Light mode: Uses `#304B60` (primary), `#D48161` (accent)
- Dark mode: Uses `#e0e0e0` (text), `#2d2d2d` (surface)

---

## Reduced Motion

All animations respect the `prefers-reduced-motion` setting via `AnimationContext`:
- When enabled: Animations are disabled (duration: 0)
- When disabled: Full animations play

This is handled automatically by the `useAnimation()` hook.

---

## Performance

All loading animations use GPU-accelerated properties:
- `transform` (rotate, scale)
- `opacity`

Avoid animating:
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`

---

## Testing

To test loading animations:

1. **Visual Testing**: Use `LoadingDemo.jsx` component
2. **Reduced Motion**: Enable in OS settings and verify animations are disabled
3. **Dark Mode**: Toggle dark mode and verify colors
4. **Accessibilitynt customization
- [ ] Progress bar with segments
- [ ] Circular progress indicator
- [ ] Loading state transitions (fade in/out)
- [ ] Custom animation timing curves
- [ ] Loading state coordination (prevent layout shifts)

---

## Support

For issues or questions:
- Check the demo: `LoadingDemo.jsx`
- Review requirements: `.kiro/specs/general-platform-enhancements/requirements.md`
- Review design: `.kiro/specs/general-platform-enhancements/design.md`
on shimmer with gradiee to the new ones:

### Old → New

```jsx
// Old
<div className="animate-spin">...</div>

// New
<Spinner size="medium" color="primary" />
```

```jsx
// Old
<div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>

// New
<SkeletonBox width="w-full" height="h-4" rounded="rounded" />
```

```jsx
// Old
<div className="loading-dots">
  <span></span><span></span><span></span>
</div>

// New
<DotsLoader size="medium" color="primary" />
```

---

## Future Enhancements

Planned improvements:
- [ ] Skelet-md, shadow-lg, shadow-2xl
- **Transitions**: 200-300ms duration

---

## Migration Guide

If you're using old loading components, migrat**: Test with screen readers (NVDA, VoiceOver)

---

## Demo

To view all loading animations:

```jsx
import LoadingDemo from '@/components/Loading/LoadingDemo';

// In your route or page
<LoadingDemo />
```

---

## Design Standards

All components follow Careerak design standards:
- **Colors**: Primary (#304B60), Accent (#D48161), Secondary (#E3DAD1)
- **Fonts**: Amiri (Arabic), Cormorant Garamond (English), EB Garamond (French)
- **Border Radius**: rounded-lg, rounded-2xl, rounded-3xl
- **Shadows**: shadow