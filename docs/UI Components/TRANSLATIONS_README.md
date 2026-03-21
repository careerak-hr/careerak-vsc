# Video Interview Translations

## 📁 Structure

```
translations/
└── videoInterviewTranslations.js  # Centralized translations file
```

## 🌍 Supported Languages

- **Arabic (ar)** - Primary language
- **English (en)** - Full support

## 📦 Sections

1. **common** - Common UI elements
2. **videoCall** - Video call interface
3. **deviceTest** - Device testing
4. **waitingRoom** - Waiting room
5. **recording** - Recording controls
6. **screenShare** - Screen sharing
7. **chat** - Chat interface
8. **connectionQuality** - Connection quality indicators
9. **raiseHand** - Raise hand feature
10. **groupCall** - Group video calls
11. **interviewManagement** - Interview management
12. **interviewNotes** - Interview notes
13. **timer** - Timer display
14. **errors** - Error messages

## 🔧 Usage

### Import Hook
```javascript
import { useVideoInterviewSection } from '../hooks/useVideoInterviewTranslations';
```

### Use in Component
```javascript
function MyComponent() {
  const t = useVideoInterviewSection('videoCall');
  
  return <button>{t.muteAudio}</button>;
}
```

## ➕ Adding New Translations

1. Open `videoInterviewTranslations.js`
2. Add key to both `ar` and `en` objects
3. Use the new key in your component

Example:
```javascript
// In videoInterviewTranslations.js
ar: {
  videoCall: {
    // ... existing keys
    newFeature: 'ميزة جديدة'
  }
},
en: {
  videoCall: {
    // ... existing keys
    newFeature: 'New Feature'
  }
}

// In your component
const t = useVideoInterviewSection('videoCall');
<button>{t.newFeature}</button>
```

## 📚 Documentation

- [Full Documentation](../../docs/Video%20Interviews/VIDEO_INTERVIEW_TRANSLATIONS.md)
- [Quick Start Guide](../../docs/Video%20Interviews/VIDEO_INTERVIEW_TRANSLATIONS_QUICK_START.md)
- [Example Component](../examples/VideoInterviewTranslationsExample.jsx)

