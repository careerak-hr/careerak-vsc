# Animation Variants Library - Complete Guide

## 📚 Overview

The Animation Variants Library provides a comprehensive collection of pre-built Framer Motion animation variants for the Careerak platform. All animations respect the user's `prefers-reduced-motion` setting and follow performance best practices.

**Location**: `frontend/src/utils/animationVariants.js`

---

## 🎯 Key Features

- ✅ **10+ Animation Categories** - Page transitions, modals, lists, buttons, and more
- ✅ **Reduced Motion Support** - Automatically respects accessibility preferences
- ✅ **GPU Accelerated** - Uses transform and opacity for smooth performance
- ✅ **Consistent Timing** - Standardized durations (200ms, 300ms, 400ms)
- ✅ **Easy to Use** - Import and apply with minimal code
- ✅ **Customizable** - Helper functions for custom animations

---

## 📦 Installation & Import

### Import Specific Variants
```javascript
import { pageVariants, modalVariants, buttonVariants } from '@/utils/animationVariants';
```

### Import from Context
```javascript
import { useAnimation } from '@/context/AnimationContext';

const { variants, shouldAnimate } = useAnimation();
// Access: variants.pageVariants, variants.modalVariants, etc.
```

### Import Everything
```javascript
import animationVariants from '@/utils/animationVariants';
```

---

## 🎨 Animation Categories

### 1. Page Transitions (`pageVariants`)

**Available Variants:**
- `fadeIn` - Simple fade in/out
- `slideInLeft` - Slide from left
- `slideInRight` - Slide from right
- `slideInTop` - Slide from top
- `slideInBottom` - Slide from bottom
- `scaleUp` - Scale up with fade
- `fadeSlide` - Combined fade and