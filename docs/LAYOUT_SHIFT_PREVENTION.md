# Layout Shift Prevention Guide

## Overview

This guide explains how to prevent Cumulative Layout Shift (CLS) during loading states in the Careerak platform.

**Requirements:**
- FR-LOAD-8: Coordinate loading states to prevent layout shifts
- NFR-PERF-5: Achieve CLS < 0.1

**Target:** CLS < 0.1 (Good), < 0.25 (Needs Improvement)

---

## What is CLS?

Cumulative Layout Shift (CLS) measures visual stability. It quantifies how much unexpected layout shift occurs during the page lifecycle.

**Common Causes:**
- Images without dimensions
- Ads, embeds, iframes without reserved space
- Dynamically injected content
- Web fonts causing FOIT/FOUT
- Actions waiting for network response

---

## Quick Start

### 1. Reserved Space

Reserve space before content loads:

```jsx
import { useReservedSpace } from '../hooks/useLayoutShiftPrevention';

const MyComponent = () => {
  const { containerStyle, loading, setLoading } = useReservedSpace('300px');

  return (
    <div style={containerStyle}>
      {loading ? <Skeleton /> : <Content />}
    </div>
  );
};
```

### 2. Skeleton Dimensions

Match skeleton to content dimensions:

```jsx
import { useSkeletonDimensions } from '../hooks/useLayoutShiftPrevention';
import SkeletonLoader from '../components/SkeletonLoaders/SkeletonLoader';

const MyCard = () => {
  const [loading, setLoading] = useState(true);
  const dimensions = useSkeletonDimensions('card');

  return loading ? (
    <SkeletonLoader {...dimensions} />
  ) : (
    <Card />
  );
};
```

### 3. Image Aspect Ratio

Reserve space for images:

```jsx
import { useImageContainer } from '../hooks/useLayoutShiftPrevention';

const MyImage = () => {
  const { containerStyle, imageStyle, loading, setLoading } = useImageContainer(800, 600);

  return (
    <div style={containerStyle}>
      {loading && <Skeleton />}
      <img 
        src="..." 
        style={imageStyle} 
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};
```

---

## Utilities

### layoutShiftPrevention.js

Core utilities for preventing layout shifts.

#### calculateAspectRatio(width, height)

Calculate aspect ratio percentage:

```javascript
import { calculateAspectRatio } from '../utils/layoutShiftPrevention';

const ratio = calculateAspectRatio(16, 9); // "56.25%"
```

#### getAspectRatioStyles(width, height)

Get container styles with aspect ratio:

```javascript
import { getAspectRatioStyles } from '../utils/layoutShiftPrevention';

const containerStyle = getAspectRatioStyles(16, 9);
// { position: 'relative', width: '100%', paddingBottom: '56.25%', overflow: 'hidden' }
```

#### getSkeletonDimensions(contentType, options)

Get skeleton dimensions matching content:

```javascript
import { getSkeletonDimensions } from '../utils/layoutShiftPrevention';

const cardDimensions = getSkeletonDimensions('card');
// { width: '100%', height: 'auto', minHeight: '200px' }

const imageDimensions = getSkeletonDimensions('image', { minHeight: '300px' });
// { width: '100%', height: 'auto', minHeight: '300px' }
```

**Content Types:**
- `card` - Card components (minHeight: 200px)
- `list-item` - List items (minHeight: 80px)
- `image` - Images (minHeight: 200px)
- `text` - Text lines (height: 16px)
- `button` - Buttons (height: 40px)
- `avatar` - Avatar images (size: 48px)

#### reserveSpace(minHeight)

Reserve space with min-height:

```javascript
import { reserveSpace } from '../utils/layoutShiftPrevention';

const containerStyle = reserveSpace('300px');
// { minHeight: '300px', transition: 'min-height 200ms ease-in-out' }
```

#### getImageContainerStyles(width, height, options)

Get image container and image styles:

```javascript
import { getImageContainerStyles } from '../utils/layoutShiftPrevention';

const { containerStyle, imageStyle } = getImageContainerStyles(800, 600, {
  objectFit: 'cover',
  backgroundColor: '#f3f4f6',
});
```

#### coordinateLoadingStates(sections)

Coordinate multiple loading states:

```javascript
import { coordinateLoadingStates } from '../utils/layoutShiftPrevention';

const sections = [
  { id: 'header', minHeight: '100px', loading: true },
  { id: 'content', minHeight: '400px', loading: true },
  { id: 'footer', minHeight: '80px', loading: false },
];

const coordinated = coordinateLoadingStates(sections);
// {
//   totalMinHeight: '580px',
//   loadingCount: 2,
//   allLoaded: false,
//   sections: [...]
// }
```

#### getLoadingTransitionStyles(isLoading)

Get transition styles using GPU-accelerated properties:

```javascript
import { getLoadingTransitionStyles } from '../utils/layoutShiftPrevention';

const transitionStyle = getLoadingTransitionStyles(true);
// {
//   opacity: 0.6,
//   transform: 'scale(0.98)',
//   transition: 'opacity 200ms ease-in-out, transform 200ms ease-in-out',
//   willChange: 'opacity, transform'
// }
```

#### measureCLS(callback)

Measure CLS using PerformanceObserver:

```javascript
import { measureCLS } from '../utils/layoutShiftPrevention';

const observer = measureCLS((cls) => {
  console.log('CLS:', cls);
  if (cls > 0.1) {
    console.warn('CLS exceeds threshold!');
  }
});

// Cleanup
observer.disconnect();
```

---

## Hooks

### useLayoutShiftPrevention.js

React hooks for easier use of layout shift prevention utilities.

#### useReservedSpace(minHeight)

```jsx
const { containerStyle, loading, setLoading } = useReservedSpace('300px');
```

#### useSkeletonDimensions(contentType, options)

```jsx
const dimensions = useSkeletonDimensions('card');
```

#### useImageContainer(width, height, options)

```jsx
const { containerStyle, imageStyle, loading, setLoading } = useImageContainer(800, 600);
```

#### useCoordinatedLoading(initialSections)

```jsx
const { sections, updateSection, allLoaded, loadingCount } = useCoordinatedLoading([
  { id: 'header', minHeight: '100px', loading: true },
  { id: 'content', minHeight: '400px', loading: true },
]);

// Update section
updateSection('header', false);
```

#### useLoadingTransition(initialLoading)

```jsx
const { transitionStyle, loading, setLoading } = useLoadingTransition(true);
```

#### useCLSMeasurement()

```jsx
const { cls, isGood, needsImprovement, isPoor } = useCLSMeasurement();

// cls: Current CLS value
// isGood: cls < 0.1
// needsImprovement: 0.1 <= cls < 0.25
// isPoor: cls >= 0.25
```

#### useStableList(itemCount, itemHeight)

```jsx
const { containerStyle, loading, setLoading } = useStableList(10, 80);
```

#### useShiftlessFetch(fetchFn, minHeight)

```jsx
const { data, loading, error, containerStyle } = useShiftlessFetch(
  () => fetchUserData(),
  '400px'
);
```

---

## Best Practices

### 1. Always Set Dimensions on Images

❌ **Bad:**
```jsx
<img src="image.jpg" alt="..." />
```

✅ **Good:**
```jsx
<img src="image.jpg" alt="..." width="800" height="600" />
```

✅ **Better:**
```jsx
const { containerStyle, imageStyle } = useImageContainer(800, 600);

<div style={containerStyle}>
  <img src="image.jpg" alt="..." style={imageStyle} />
</div>
```

### 2. Reserve Space for Dynamic Content

❌ **Bad:**
```jsx
<div>
  {loading ? <Spinner /> : <Content />}
</div>
```

✅ **Good:**
```jsx
const { containerStyle } = useReservedSpace('300px');

<div style={containerStyle}>
  {loading ? <Skeleton /> : <Content />}
</div>
```

### 3. Match Skeleton to Content

❌ **Bad:**
```jsx
{loading ? (
  <div className="h-20 bg-gray-200 animate-pulse" />
) : (
  <Card /> // Card is actually 250px tall
)}
```

✅ **Good:**
```jsx
const dimensions = useSkeletonDimensions('card');

{loading ? (
  <SkeletonLoader {...dimensions} />
) : (
  <Card />
)}
```

### 4. Use GPU-Accelerated Properties

❌ **Bad:**
```css
.loading {
  width: 0;
  height: 0;
  top: -100px;
}

.loaded {
  width: 100%;
  height: auto;
  top: 0;
}
```

✅ **Good:**
```css
.loading {
  opacity: 0;
  transform: scale(0.98);
}

.loaded {
  opacity: 1;
  transform: scale(1);
}
```

### 5. Coordinate Multiple Loading States

❌ **Bad:**
```jsx
<div>
  {headerLoading && <HeaderSkeleton />}
  {contentLoading && <ContentSkeleton />}
  {footerLoading && <FooterSkeleton />}
</div>
```

✅ **Good:**
```jsx
const { sections, updateSection } = useCoordinatedLoading([
  { id: 'header', minHeight: '100px', loading: true },
  { id: 'content', minHeight: '400px', loading: true },
  { id: 'footer', minHeight: '80px', loading: true },
]);

{sections.map(section => (
  <div key={section.id} style={section.style}>
    {section.loading ? <Skeleton /> : <Content />}
  </div>
))}
```

### 6. Avoid Inserting Content Above Existing Content

❌ **Bad:**
```jsx
// Prepending new items causes shift
container.insertBefore(newItem, container.firstChild);
```

✅ **Good:**
```jsx
import { useShiftlessInsertion } from '../hooks/useLayoutShiftPrevention';

const { containerRef, insertContent } = useShiftlessInsertion();

// Automatically adjusts scroll to prevent shift
insertContent(newItem, { position: 'prepend', animate: true });
```

### 7. Set Font Display Strategy

```css
@font-face {
  font-family: 'Amiri';
  src: url('...') format('woff2');
  font-display: swap; /* Use fallback immediately */
}
```

---

## Common Patterns

### Pattern 1: Card Grid

```jsx
import { useStableList } from '../hooks/useLayoutShiftPrevention';
import SkeletonLoader from '../components/SkeletonLoaders/SkeletonLoader';

const CardGrid = ({ items, loading }) => {
  const { containerStyle } = useStableList(items.length, 250);

  return (
    <div style={containerStyle} className="grid grid-cols-3 gap-4">
      {loading ? (
        Array(6).fill(0).map((_, i) => (
          <SkeletonLoader key={i} width="100%" height="250px" />
        ))
      ) : (
        items.map(item => <Card key={item.id} item={item} />)
      )}
    </div>
  );
};
```

### Pattern 2: Image Gallery

```jsx
import { useImageContainer } from '../hooks/useLayoutShiftPrevention';

const ImageGallery = ({ images }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(image => (
        <ImageWithAspectRatio key={image.id} image={image} />
      ))}
    </div>
  );
};

const ImageWithAspectRatio = ({ image }) => {
  const { containerStyle, imageStyle, loading, setLoading } = useImageContainer(
    image.width,
    image.height
  );

  return (
    <div style={containerStyle}>
      {loading && <SkeletonLoader width="100%" height="100%" />}
      <img
        src={image.url}
        alt={image.alt}
        style={imageStyle}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};
```

### Pattern 3: Multi-Section Page

```jsx
import { useCoordinatedLoading } from '../hooks/useLayoutShiftPrevention';

const MultiSectionPage = () => {
  const { sections, updateSection } = useCoordinatedLoading([
    { id: 'hero', minHeight: '400px', loading: true },
    { id: 'features', minHeight: '600px', loading: true },
    { id: 'testimonials', minHeight: '300px', loading: true },
  ]);

  useEffect(() => {
    // Load sections sequentially
    fetchHero().then(() => updateSection('hero', false));
    fetchFeatures().then(() => updateSection('features', false));
    fetchTestimonials().then(() => updateSection('testimonials', false));
  }, [updateSection]);

  return (
    <div>
      {sections.map(section => (
        <section key={section.id} style={section.style}>
          {section.loading ? (
            <SectionSkeleton type={section.id} />
          ) : (
            <SectionContent type={section.id} />
          )}
        </section>
      ))}
    </div>
  );
};
```

---

## Measuring CLS

### Using the Hook

```jsx
import { useCLSMeasurement } from '../hooks/useLayoutShiftPrevention';

const CLSMonitor = () => {
  const { cls, isGood, needsImprovement, isPoor } = useCLSMeasurement();

  return (
    <div>
      <p>CLS: {cls.toFixed(4)}</p>
      <p>Status: {isGood ? 'Good' : needsImprovement ? 'Needs Improvement' : 'Poor'}</p>
    </div>
  );
};
```

### Using Chrome DevTools

1. Open Chrome DevTools
2. Go to Performance tab
3. Record page load
4. Look for "Experience" section
5. Check "Cumulative Layout Shift" metric

### Using Lighthouse

```bash
npm install -g lighthouse
lighthouse https://your-site.com --view
```

Look for "Cumulative Layout Shift" in the Performance section.

---

## Troubleshooting

### High CLS (> 0.1)

**Symptoms:**
- Content jumps during loading
- Images cause page to shift
- Ads/embeds push content down

**Solutions:**
1. Set explicit dimensions on images
2. Reserve space with min-height
3. Use skeleton loaders matching content
4. Avoid inserting content above viewport
5. Use font-display: swap

### Layout Shifts from Images

**Problem:**
```jsx
<img src="image.jpg" alt="..." />
```

**Solution:**
```jsx
const { containerStyle, imageStyle } = useImageContainer(800, 600);

<div style={containerStyle}>
  <img src="image.jpg" alt="..." style={imageStyle} />
</div>
```

### Layout Shifts from Dynamic Content

**Problem:**
```jsx
<div>
  {loading ? <Spinner /> : <Content />}
</div>
```

**Solution:**
```jsx
const { containerStyle } = useReservedSpace('300px');

<div style={containerStyle}>
  {loading ? <Skeleton /> : <Content />}
</div>
```

### Layout Shifts from Fonts

**Problem:**
- FOIT (Flash of Invisible Text)
- FOUT (Flash of Unstyled Text)

**Solution:**
```css
@font-face {
  font-family: 'Amiri';
  src: url('...') format('woff2');
  font-display: swap;
}
```

---

## Testing

### Manual Testing

1. Open page in Chrome
2. Enable "Slow 3G" network throttling
3. Reload page
4. Watch for content jumps
5. Check CLS in DevTools Performance tab

### Automated Testing

```javascript
import { measureCLS } from '../utils/layoutShiftPrevention';

describe('Layout Shift Prevention', () => {
  it('should have CLS < 0.1', (done) => {
    const observer = measureCLS((cls) => {
      expect(cls).toBeLessThan(0.1);
      observer.disconnect();
      done();
    });

    // Trigger page load
    render(<MyComponent />);
  });
});
```

---

## References

- [Web Vitals - CLS](https://web.dev/cls/)
- [Optimize CLS](https://web.dev/optimize-cls/)
- [Cumulative Layout Shift Debugger](https://webvitals.dev/cls)
- [Chrome DevTools - Performance](https://developer.chrome.com/docs/devtools/performance/)

---

## Summary

**Key Takeaways:**
1. ✅ Reserve space before content loads (min-height)
2. ✅ Set explicit dimensions on images
3. ✅ Match skeleton dimensions to content
4. ✅ Use GPU-accelerated properties (transform, opacity)
5. ✅ Coordinate multiple loading states
6. ✅ Avoid inserting content above viewport
7. ✅ Use font-display: swap
8. ✅ Measure CLS to verify improvements

**Target:** CLS < 0.1 (Good)

**Tools:**
- `layoutShiftPrevention.js` - Core utilities
- `useLayoutShiftPrevention.js` - React hooks
- `LayoutShiftPreventionExample.jsx` - Examples
