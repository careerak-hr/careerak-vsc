# Accessibility Components

A comprehensive collection of React components and hooks for implementing WCAG 2.1 Level AA accessibility features, with a focus on ARIA live regions for dynamic content announcements.

## 📦 Components

### AriaLiveRegion
Base component for creating ARIA live regions that announce dynamic content changes to screen readers.

**Usage:**
```jsx
<AriaLiveRegion 
  message="Form submitted successfully" 
  politeness="polite"
/>
```

### FormErrorAnnouncer
Automatically announces form validation errors to screen readers.

**Usage:**
```jsx
<FormErrorAnnouncer 
  errors={{ email: 'Invalid email', password: 'Too short' }}
  language="ar"
/>
```

### LoadingAnnouncer
Announces loading states and completion to screen readers.

**Usage:**
```jsx
<LoadingAnnouncer 
  isLoading={true}
  loadingMessage="Loading jobs..."
  completeMessage="Jobs loaded"
  language="ar"
/>
```

### NotificationAnnouncer
Announces notifications and toast messages to screen readers.

**Usage:**
```jsx
<NotificationAnnouncer 
  notification={{ type: 'success', message: 'Saved successfully' }}
  language="ar"
/>
```

## 🎣 Hooks

### useAriaLive
Custom hook for managing ARIA live region announcements.

**Usage:**
```jsx
const { announce, announceSuccess, announceError } = useAriaLive();

// Announce success
announceSuccess('Data saved successfully');

// Announce error
announceError('Failed to save data');
```

## 📚 Documentation

For complete documentation, examples, and best practices, see:
- [ARIA Live Regions Guide](../../../docs/ARIA_LIVE_REGIONS_GUIDE.md)
- [Example Component](../../examples/AriaLiveExample.jsx)

## 🧪 Testing

Run tests:
```bash
npm test -- AriaLiveRegion.test.jsx
```

## 🎯 WCAG Compliance

These components help achieve:
- ✅ WCAG 2.1 Level AA compliance
- ✅ 4.1.3 Status Messages
- ✅ 3.3.1 Error Identification
- ✅ 3.3.3 Error Suggestion

## 🌐 Language Support

All components support multiple languages:
- Arabic (ar)
- English (en)
- French (fr)

## 📖 Quick Start

1. Import the components:
```jsx
import {
  AriaLiveRegion,
  useAriaLive,
  FormErrorAnnouncer,
  LoadingAnnouncer,
  NotificationAnnouncer
} from './components/Accessibility';
```

2. Use in your components:
```jsx
function MyComponent() {
  const { message, politeness, announceSuccess } = useAriaLive();

  const handleSave = () => {
    announceSuccess('Saved successfully');
  };

  return (
    <>
      <AriaLiveRegion message={message} politeness={politeness} />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

## 🤝 Contributing

When adding new accessibility features:
1. Follow WCAG 2.1 Level AA guidelines
2. Test with screen readers (NVDA, JAWS, VoiceOver)
3. Add unit tests
4. Update documentation
5. Add examples

## 📝 License

Part of the Careerak platform.
