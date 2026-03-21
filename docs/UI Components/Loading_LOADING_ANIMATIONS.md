# Loading Animations

Animated loading components using Framer Motion for the Careerak platform.

## Overview

This directory contains loading animation components that:
- Use Framer Motion for smooth animations
- Respect `prefers-reduced-motion` setting
- Support dark mode
- Follow Careerak design standards
- Meet accessibility requirements

## Requirements

- **FR-ANIM-5**: Display animated skeleton loaders or spinners when content is loading
- **FR-LOAD-1 to FR-LOAD-8**: Unified loading states
- **NFR-USE-3**: Display loading states within 100ms
- **NFR-USE-4**: Respect prefers-reduced-motion

## Components

### Spinner
Rotating spinner for general loading.

### ButtonSpinner
Compact spinner for buttons.

### OverlaySpinner
Full-screen overlay with spinner.

### ProgressBar
Animated progress bar.

### SkeletonBox
Basic skeleton with pulse/shimmer.

### SkeletonText
Multi-line text skeleton.

### SkeletonCard
Pre-built card skeleton.

### DotsLoader
Three bouncing dots.

### PulseLoader
Pulsing circle.

## Usage

```jsx
import { Spinner, SkeletonCard } from '@/components/Loading';

<Spinner size="medium" color="primary" />
<SkeletonCard variant="job" />
```

## Demo

View all animations in `LoadingDemo.jsx`
