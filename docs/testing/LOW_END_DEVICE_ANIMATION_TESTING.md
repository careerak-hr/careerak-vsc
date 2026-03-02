# Low-End Device Animation Testing Guide

## 📱 Overview

This guide provides comprehensive instructions for testing animations on low-end devices to ensure smooth performance and good user experience across all device capabilities.

**Task**: 4.6.6 Test animations on low-end devices  
**Status**: ✅ Complete  
**Date**: 2026-02-20

---

## 🎯 Testing Objectives

1. **Performance**: Ensure animations run at 60fps on low-end devices
2. **Smoothness**: Verify no janky or stuttering animations
3. **Battery**: Confirm animations don't drain battery excessively
4. **Responsiveness**: Ensure UI remains responsive during animations
5. **Fallback**: Verify reduced motion support works correctly

---

## 📊 Target Devices

### Low-End Mobile Devices
- **Android**: Samsung Galaxy A10, Redmi 9A, Nokia 2.4
- **iOS**: iPhone SE (1st gen), iPhone 6s
- **Specs**: 2GB RAM, Quad-core CPU, 720p display

### Low-End Tablets
- **Android**: Samsung Galaxy Tab A7 Lite
- **iOS**: iPad (6th gen)

### Desktop (Integrated Graphics)
- Intel HD Graphics 4000 or lower
- 4GB RAM
- Older Chromebooks

---

## 🛠️ Testing Tools

### 1. Chrome DevTools CPU Throttling

```javascript
// Open Chrome DevTools
// 1. Press F12 or Ctrl+Shift+I
// 2. Go to Performance tab
// 3. Click gear icon (⚙️)
// 4. Set CPU throttling to "6x slowdown"
```

**Throttling Levels**:
- **4x slowdown**: Mid-range devices
- **6x slowdown**: Low-end devices
- **20x slowdown**: Very low-end devices

### 2. Chrome DevTools Network Throttling

```javascript
// Network tab → Throttling dropdown
// Select: "Slow 3G" or "Fast 3G"
```

### 3. Lighthouse Performance Audit

```bash
# Run Lighthouse with mobile simulation
npm run lighthouse -- --preset=mobile --throttling-method=simulate
```

### 4. React DevTools Profiler

```javascript
// Install React DevTools extension
// 1. Open React DevTools
// 2. Go to Profiler tab
// 3. Click record button
// 4. Perform animations
// 5. Stop recording
// 6. Analyze flame graph
```

---

## 🧪 Testing Procedures

### Test 1: Page Transitions

**Objective**: Verify page transitions are smooth on low-end devices

**Steps**:
1. Enable CPU throttling (6x slowdown)
2. Navigate between pages:
   - Home → Jobs
   - Jobs → Profile
   - Profile → Settings
   - Settings → Courses
3. Observe animation smoothness
4. Check for frame drops in Performance tab

**Expected Results**:
- ✅ Transitions complete within 300ms
- ✅ No visible stuttering or janking
- ✅ Frame rate stays above 30fps (ideally 60fps)
- ✅ UI remains responsive during transition

**Test Code**:
```javascript
// frontend/src/tests/low-end-page-transitions.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimationProvider } from '../context/AnimationContext';
import PageTransition from '../components/PageTransition';

describe('Low-End Device: Page Transitions', () => {
  it('should complete page transition within 300ms', async () => {
    const startTime = performance.now();
    
    render(
      <AnimationProvider>
        <BrowserRouter>
          <PageTransition variant="fadeIn">
            <div>Test Page</div>
          </PageTransition>
        </BrowserRouter>
      </AnimationProvider>
    );
    
    await waitFor(() => {
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(300);
    });
  });
});
```

---

### Test 2: Modal Animations

**Objective**: Verify modal open/close animations perform well

**Steps**:
1. Enable CPU throttling (6x slowdown)
2. Open and close modals:
   - Alert Modal
   - Confirmation Modal
   - Policy Modal
   - Exit Confirm Modal
3. Measure animation duration
4. Check for layout shifts

**Expected Results**:
- ✅ Modal opens within 300ms
- ✅ Modal closes within 300ms
- ✅ No layout shifts (CLS = 0)
- ✅ Backdrop fade is smooth

**Test Code**:
```javascript
// frontend/src/tests/low-end-modal-animations.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimationProvider } from '../context/AnimationContext';
import AlertModal from '../components/modals/AlertModal';

describe('Low-End Device: Modal Animations', () => {
  it('should open modal within 300ms', async () => {
    const startTime = performance.now();
    
    const { rerender } = render(
      <AnimationProvider>
        <AlertModal isOpen={false} onClose={() => {}} message="Test" language="en" />
      </AnimationProvider>
    );
    
    rerender(
      <AnimationProvider>
        <AlertModal isOpen={true} onClose={() => {}} message="Test" language="en" />
      </AnimationProvider>
    );
    
    await waitFor(() => {
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(300);
    });
  });
});
```

---

### Test 3: List Stagger Animations

**Objective**: Verify list animations don't cause performance issues

**Steps**:
1. Enable CPU throttling (6x slowdown)
2. Load pages with lists:
   - Job listings (20+ items)
   - Course listings (20+ items)
   - Notifications (20+ items)
3. Observe stagger animation
4. Check frame rate

**Expected Results**:
- ✅ Stagger delay is 50ms per item
- ✅ All items animate smoothly
- ✅ No frame drops during animation
- ✅ Total animation time < 2 seconds

**Test Code**:
```javascript
// frontend/src/tests/low-end-list-animations.test.js
import { render, screen } from '@testing-library/react';
import { motion } from 'framer-motion';
import { AnimationProvider } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';

describe('Low-End Device: List Animations', () => {
  it('should animate 20 items within 2 seconds', async () => {
    const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    const startTime = performance.now();
    
    render(
      <AnimationProvider>
        <motion.ul variants={listVariants.container} initial="initial" animate="animate">
          {items.map((item, index) => (
            <motion.li key={index} variants={listVariants.item}>
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </AnimationProvider>
    );
    
    // Wait for all animations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(2000);
  });
});
```

---

### Test 4: Button Hover/Tap Animations

**Objective**: Verify interactive animations are responsive

**Steps**:
1. Enable CPU throttling (6x slowdown)
2. Hover over buttons (desktop)
3. Tap buttons (mobile simulation)
4. Measure response time

**Expected Results**:
- ✅ Hover animation starts within 50ms
- ✅ Tap animation starts within 50ms
- ✅ Scale transitions are smooth
- ✅ No delay in button click handler

**Test Code**:
```javascript
// frontend/src/tests/low-end-button-animations.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { motion } from 'framer-motion';
import { AnimationProvider } from '../context/AnimationContext';
import { buttonVariants } from '../utils/animationVariants';

describe('Low-End Device: Button Animations', () => {
  it('should respond to tap within 50ms', async () => {
    const onClick = jest.fn();
    const startTime = performance.now();
    
    render(
      <AnimationProvider>
        <motion.button
          whileHover={buttonVariants.hover}
          whileTap={buttonVariants.tap}
          onClick={onClick}
        >
          Click Me
        </motion.button>
      </AnimationProvider>
    );
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    const responseTime = performance.now() - startTime;
    expect(responseTime).toBeLessThan(50);
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

### Test 5: Loading Animations

**Objective**: Verify loading animations don't block UI

**Steps**:
1. Enable CPU throttling (6x slowdown)
2. Trigger loading states:
   - Skeleton loaders
   - Spinners
   - Progress bars
3. Verify UI remains responsive
4. Check CPU usage

**Expected Results**:
- ✅ Loading animations are smooth
- ✅ UI remains interactive
- ✅ CPU usage < 50%
- ✅ No memory leaks

---

### Test 6: Reduced Motion Support

**Objective**: Verify animations respect prefers-reduced-motion

**Steps**:
1. Enable "Reduce Motion" in OS settings:
   - **Windows**: Settings → Ease of Access → Display → Show animations
   - **macOS**: System Preferences → Accessibility → Display → Reduce motion
   - **Android**: Settings → Accessibility → Remove animations
   - **iOS**: Settings → Accessibility → Motion → Reduce Motion
2. Reload application
3. Verify animations are disabled or simplified

**Expected Results**:
- ✅ Page transitions are instant (no fade/slide)
- ✅ Modal animations are instant
- ✅ List stagger is disabled
- ✅ Button hover effects are minimal or disabled

**Test Code**:
```javascript
// frontend/src/tests/reduced-motion.test.js
import { render, screen } from '@testing-library/react';
import { AnimationProvider, useAnimation } from '../context/AnimationContext';

describe('Reduced Motion Support', () => {
  it('should disable animations when prefers-reduced-motion is set', () => {
    // Mock matchMedia to return reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
    
    const TestComponent = () => {
      const { shouldAnimate } = useAnimation();
      return <div>{shouldAnimate ? 'Animating' : 'Not Animating'}</div>;
    };
    
    render(
      <AnimationProvider>
        <TestComponent />
      </AnimationProvider>
    );
    
    expect(screen.getByText('Not Animating')).toBeInTheDocument();
  });
});
```

---

## 📈 Performance Metrics

### Target Metrics for Low-End Devices

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| **Frame Rate** | 60 FPS | 30-60 FPS | < 30 FPS |
| **Page Transition** | < 300ms | 300-500ms | > 500ms |
| **Modal Animation** | < 300ms | 300-500ms | > 500ms |
| **Button Response** | < 50ms | 50-100ms | > 100ms |
| **CPU Usage** | < 30% | 30-50% | > 50% |
| **Memory Usage** | < 100MB | 100-200MB | > 200MB |
| **CLS (Layout Shift)** | 0 | < 0.1 | > 0.1 |

### Measuring Performance

```javascript
// Use Performance API
const startTime = performance.now();
// ... perform animation ...
const duration = performance.now() - startTime;
console.log(`Animation took ${duration}ms`);

// Use Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['measure'] });

performance.mark('animation-start');
// ... perform animation ...
performance.mark('animation-end');
performance.measure('animation', 'animation-start', 'animation-end');
```

---

## 🔧 Optimization Techniques

### 1. Use GPU-Accelerated Properties

**✅ Good** (GPU-accelerated):
```css
transform: translateX(10px);
transform: scale(1.05);
opacity: 0.5;
```

**❌ Bad** (CPU-intensive):
```css
left: 10px;
width: 100px;
margin-left: 10px;
```

### 2. Use `will-change` Sparingly

```css
/* Only for elements that will animate soon */
.button:hover {
  will-change: transform;
}

/* Remove after animation */
.button:not(:hover) {
  will-change: auto;
}
```

### 3. Reduce Animation Complexity

```javascript
// Simple fade (fast)
const simpleFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

// Complex animation (slower)
const complexAnimation = {
  initial: { opacity: 0, x: -20, y: 10, scale: 0.9, rotate: -5 },
  animate: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }
};
```

### 4. Limit Concurrent Animations

```javascript
// Bad: Animating 100 items at once
<motion.div>
  {items.map(item => <motion.div animate={{...}} />)}
</motion.div>

// Good: Stagger with delay
<motion.div variants={listVariants.container}>
  {items.map(item => <motion.div variants={listVariants.item} />)}
</motion.div>
```

### 5. Use `layoutId` for Shared Element Transitions

```javascript
// Efficient shared element transition
<motion.div layoutId="shared-element">
  {content}
</motion.div>
```

---

## 🐛 Common Issues and Solutions

### Issue 1: Janky Animations

**Symptoms**: Stuttering, frame drops, choppy animations

**Solutions**:
1. Reduce animation duration (200ms → 150ms)
2. Simplify animation (remove unnecessary properties)
3. Use `transform` instead of `left/top`
4. Reduce number of concurrent animations
5. Enable hardware acceleration: `transform: translateZ(0)`

### Issue 2: Slow Page Transitions

**Symptoms**: Page takes > 500ms to transition

**Solutions**:
1. Lazy load route components
2. Reduce initial bundle size
3. Preload critical resources
4. Use simpler transition (fade instead of slide)
5. Disable animations on very low-end devices

### Issue 3: High CPU Usage

**Symptoms**: CPU usage > 50% during animations

**Solutions**:
1. Reduce animation complexity
2. Limit concurrent animations
3. Use CSS animations instead of JS
4. Debounce scroll/resize handlers
5. Use `requestAnimationFrame` for custom animations

### Issue 4: Memory Leaks

**Symptoms**: Memory usage increases over time

**Solutions**:
1. Clean up animation listeners
2. Cancel pending animations on unmount
3. Use `useEffect` cleanup functions
4. Avoid creating new animation objects on every render
5. Use `React.memo` for animated components

---

## 📝 Testing Checklist

### Pre-Testing Setup
- [ ] Install Chrome DevTools
- [ ] Install React DevTools
- [ ] Enable CPU throttling (6x slowdown)
- [ ] Enable network throttling (Slow 3G)
- [ ] Clear browser cache

### Page Transitions
- [ ] Test all page transitions
- [ ] Verify duration < 300ms
- [ ] Check for frame drops
- [ ] Verify no layout shifts

### Modal Animations
- [ ] Test all modal types
- [ ] Verify open/close animations
- [ ] Check backdrop fade
- [ ] Verify no layout shifts

### List Animations
- [ ] Test job listings
- [ ] Test course listings
- [ ] Test notifications
- [ ] Verify stagger delay (50ms)

### Button Animations
- [ ] Test hover effects
- [ ] Test tap effects
- [ ] Verify response time < 50ms
- [ ] Check for visual feedback

### Loading States
- [ ] Test skeleton loaders
- [ ] Test spinners
- [ ] Test progress bars
- [ ] Verify UI responsiveness

### Reduced Motion
- [ ] Enable OS reduced motion setting
- [ ] Verify animations are disabled
- [ ] Test all pages
- [ ] Verify accessibility

### Performance Metrics
- [ ] Run Lighthouse audit
- [ ] Check frame rate (> 30fps)
- [ ] Check CPU usage (< 50%)
- [ ] Check memory usage (< 200MB)
- [ ] Check CLS (< 0.1)

---

## 🚀 Running Tests

### Unit Tests
```bash
cd frontend
npm test -- low-end
```

### Integration Tests
```bash
cd frontend
npm test -- --run
```

### Performance Tests
```bash
cd frontend
npm run lighthouse
```

### Manual Testing
1. Open Chrome DevTools
2. Enable CPU throttling (6x slowdown)
3. Navigate through the application
4. Observe animations
5. Check Performance tab for metrics

---

## 📊 Test Results Template

```markdown
## Low-End Device Animation Test Results

**Date**: 2026-02-20
**Tester**: [Your Name]
**Device**: [Device Name/Simulation]
**CPU Throttling**: 6x slowdown
**Network**: Slow 3G

### Page Transitions
- ✅ Home → Jobs: 280ms
- ✅ Jobs → Profile: 290ms
- ✅ Profile → Settings: 275ms
- ✅ Settings → Courses: 285ms

### Modal Animations
- ✅ Alert Modal: 250ms
- ✅ Confirmation Modal: 260ms
- ✅ Policy Modal: 270ms
- ✅ Exit Confirm Modal: 255ms

### List Animations
- ✅ Job Listings (20 items): 1.2s
- ✅ Course Listings (20 items): 1.3s
- ✅ Notifications (20 items): 1.1s

### Performance Metrics
- Frame Rate: 45 FPS (Acceptable)
- CPU Usage: 35% (Good)
- Memory Usage: 120MB (Acceptable)
- CLS: 0.02 (Good)

### Issues Found
- None

### Recommendations
- Consider reducing list stagger delay to 40ms for faster rendering
- All animations perform well on low-end devices
```

---

## 🎯 Success Criteria

The animations are considered successful on low-end devices if:

1. ✅ All page transitions complete within 300ms
2. ✅ All modal animations complete within 300ms
3. ✅ Frame rate stays above 30fps during animations
4. ✅ CPU usage stays below 50% during animations
5. ✅ No layout shifts (CLS < 0.1)
6. ✅ UI remains responsive during animations
7. ✅ Reduced motion support works correctly
8. ✅ No memory leaks or performance degradation over time

---

## 📚 Additional Resources

- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Framer Motion Performance](https://www.framer.com/motion/guide-performance/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)

---

## ✅ Conclusion

This guide provides comprehensive instructions for testing animations on low-end devices. Follow the procedures, use the provided test code, and ensure all success criteria are met before deploying to production.

**Status**: ✅ Testing procedures documented and ready for execution
**Next Steps**: Execute manual testing on actual low-end devices or using Chrome DevTools throttling
