# General Platform Enhancements - Design Document

## 1. Architecture Overview

### 1.1 System Architecture
The platform enhancements are implemented as cross-cutting concerns that wrap the entire application.

### 1.2 Component Hierarchy
- App → ThemeProvider → AnimationProvider → ErrorBoundary → Router → Suspense → Routes
- ServiceWorkerManager runs independently for PWA functionality
- SEOHead component in each route for meta tags
- LoadingStates used throughout components

## 2. Dark Mode Design

### 2.1 ThemeContext
- Context: ThemeContext with isDark, toggleTheme, systemPreference
- Storage: localStorage key 'careerak-theme' ('light' | 'dark' | 'system')
- Detection: window.matchMedia('(prefers-color-scheme: dark)')

### 2.2 CSS Variables
Light: --bg-primary: #E3DAD1, --text-primary: #304B60
Dark: --bg-primary: #1a1a1a, --text-primary: #e0e0e0
Constant: --input-border: #D4816180

### 2.3 Transition
- transition: all 300ms ease-in-out on color properties
- Applied via Tailwind dark: classes

## 3. Performance Optimization Design

### 3.1 Lazy Loading
- React.lazy() for route components
- Suspense with fallback for loading states
- Dynamic imports: const Page = lazy(() => import('./Page'))

### 3.2 Code Splitting
- Route-based splitting (one chunk per route)
- Vendor chunk separation
- Target: <200KB per chunk

### 3.3 Image Optimization
- WebP format with JPEG/PNG fallback
- Lazy loading with Intersection Observer
- Cloudinary transformations: f_auto, q_auto

### 3.4 Caching Strategy
- Static assets: Cache-Control: max-age=2592000 (30 days)
- API responses: stale-while-revalidate
- Service worker cache: CacheFirst for assets, NetworkFirst for API

## 4. PWA Design

### 4.1 Service Worker
- Workbox for service worker generation
- Registration in index.js
- Update detection and notification

### 4.2 Cache Strategies
- Static assets: CacheFirst with 30-day expiration
- API calls: NetworkFirst with 5-minute timeout
- Images: CacheFirst with size limit 50MB
- Offline fallback: precached offline.html

### 4.3 Manifest
- name: "Careerak", short_name: "Careerak"
- icons: 192x192, 512x512 (maskable)
- start_url: "/", display: "standalone"
- theme_color: "#304B60", background_color: "#E3DAD1"

### 4.4 Push Notifications
- Integration with existing Pusher system
- Service worker push event listener
- Notification permission request

## 5. Animation Design

### 5.1 Framer Motion Setup
- AnimationProvider wraps app
- Default transition: { duration: 0.3, ease: "easeInOut" }
- Respect prefers-reduced-motion

### 5.2 Animation Variants
Page transitions: fadeIn, slideIn
Modal: scaleIn with backdrop fade
List: stagger with 50ms delay
Button: scale on hover/tap

### 5.3 Performance
- Use transform and opacity (GPU accelerated)
- Avoid animating width, height, top, left
- layoutId for shared element transitions

## 6. Accessibility Design

### 6.1 ARIA Implementation
- Landmarks: role="navigation", role="main", role="complementary"
- Labels: aria-label on icon buttons
- Live regions: aria-live="polite" for notifications
- States: aria-expanded, aria-selected, aria-checked

### 6.2 Keyboard Navigation
- Tab order: logical flow through interactive elements
- Focus trap: in modals using focus-trap-react
- Escape: closes modals and dropdowns
- Enter/Space: activates buttons

### 6.3 Focus Management
- Visible focus indicators: outline 2px solid
- Focus restoration: after modal close
- Skip links: "Skip to main content"

### 6.4 Screen Reader Support
- Semantic HTML: header, nav, main, article, footer
- Alt text: descriptive for images
- Form labels: associated with inputs
- Error announcements: aria-live regions

## 7. SEO Design

### 7.1 Meta Tags Component
- SEOHead component per route
- Props: title, description, keywords, image, url
- Helmet or react-helmet-async for dynamic updates

### 7.2 Structured Data
JobPosting schema: title, description, datePosted, employmentType, location
Course schema: name, description, provider, courseMode

### 7.3 Sitemap Generation
- Build-time generation
- Include all public routes
- Update frequency: weekly
- Priority: homepage 1.0, jobs 0.8, courses 0.7

### 7.4 Robots.txt
- Allow: /
- Disallow: /admin, /api
- Sitemap: https://careerak.com/sitemap.xml

## 8. Error Boundary Design

### 8.1 Route-Level Boundary
- Wraps entire router
- Full-page error UI
- Retry reloads page
- Go Home navigates to /

### 8.2 Component-Level Boundary
- Wraps individual components
- Inline error UI
- Retry re-renders component
- Fallback to null if retry fails

### 8.3 Error Logging
- Console.error with stack trace
- Future: send to error tracking service
- Include: component name, timestamp, user ID

### 8.4 Error Types
- Component errors: caught by boundary
- Network errors: specific message with retry
- 404: custom page with navigation
- 500: server error page

## 9. Loading States Design

### 9.1 Skeleton Loaders
- Match content layout
- Pulse animation
- Tailwind: animate-pulse with bg-gray-200/dark:bg-gray-700

### 9.2 Progress Indicators
- Top bar: NProgress or custom
- Button spinner: inside button, disable during load
- Overlay: centered spinner with backdrop

### 9.3 Suspense Fallbacks
- Route level: full-page skeleton
- Component level: component-specific skeleton
- Lazy images: placeholder with blur-up

## 10. File Structure

```
frontend/src/
├── contexts/
│   ├── ThemeContext.jsx              # Dark mode context
│   └── AnimationContext.jsx          # Animation settings
├── components/
│   ├── ErrorBoundary/
│   │   ├── RouteErrorBoundary.jsx
│   │   └── ComponentErrorBoundary.jsx
│   ├── Loading/
│   │   ├── SkeletonLoader.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ButtonSpinner.jsx
│   │   └── OverlaySpinner.jsx
│   ├── SEO/
│   │   ├── SEOHead.jsx
│   │   └── StructuredData.jsx
│   └── Accessibility/
│       ├── SkipLink.jsx
│       └── FocusTrap.jsx
├── hooks/
│   ├── useTheme.js
│   ├── useLazyLoad.js
│   ├── useIntersectionObserver.js
│   └── useKeyboardNav.js
├── utils/
│   ├── imageOptimization.js
│   ├── seoHelpers.js
│   └── a11yHelpers.js
├── styles/
│   ├── darkMode.css
│   └── animations.css
├── service-worker.js
├── manifest.json
└── offline.html
```

## 11. Technology Stack

### 11.1 Core Libraries
- React 18.2.0 (Suspense, lazy)
- React Router 6.x (routing)
- Framer Motion 10.16.0 (animations)
- Workbox 7.0.0 (service worker)

### 11.2 Development Tools
- fast-check 3.13.0 (property-based testing)
- @testing-library/react (unit testing)
- lighthouse (performance auditing)
- axe-core (accessibility testing)

### 11.3 Build Tools
- Vite (bundler with code splitting)
- PostCSS (CSS processing)
- Tailwind CSS (styling)

## 12. Integration Points

### 12.1 Existing Systems
- Pusher: PWA push notifications
- Cloudinary: image optimization
- MongoDB: user preferences storage
- Auth: theme preference per user
- i18n: multi-language error messages

### 12.2 API Endpoints
- GET /api/user/preferences (theme, language)
- PUT /api/user/preferences (update theme)
- POST /api/analytics/performance (performance metrics)

## 13. Correctness Properties

### 13.1 Dark Mode Properties

**Property DM-1: Theme Toggle Idempotence**
```
∀ initialTheme ∈ {light, dark}:
  toggleTheme(toggleTheme(initialTheme)) = initialTheme
```
Test: Toggle twice returns to original theme

**Property DM-2: Theme Persistence**
```
∀ theme ∈ {light, dark, system}:
  setTheme(theme) → localStorage.get('careerak-theme') = theme
```
Test: Set theme persists to localStorage

**Property DM-3: System Preference Detection**
```
IF userPreference = null AND systemPreference = dark
THEN appliedTheme = dark
```
Test: System preference used when no user preference

**Property DM-4: Color Consistency**
```
∀ element ∈ UIElements:
  isDark = true → element.backgroundColor ∈ {#1a1a1a, #2d2d2d}
```
Test: All elements use dark colors in dark mode

**Property DM-5: Input Border Invariant**
```
∀ mode ∈ {light, dark}, ∀ input ∈ InputElements:
  input.borderColor = #D4816180
```
Test: Input borders never change color

### 13.2 Performance Properties

**Property PERF-1: Lazy Loading**
```
∀ route ∈ Routes:
  route.loaded = false UNTIL route.visited = true
```
Test: Routes not loaded until visited

**Property PERF-2: Code Splitting**
```
∀ chunk ∈ Chunks:
  chunk.size ≤ 200KB
```
Test: No chunk exceeds 200KB

**Property PERF-3: Image Lazy Loading**
```
∀ image ∈ Images:
  image.loaded = false UNTIL image.inViewport = true
```
Test: Images load only when in viewport

**Property PERF-4: Cache Validity**
```
∀ asset ∈ StaticAssets:
  cached(asset) AND age(asset) < 30days → serve(cache)
```
Test: Cached assets served within 30 days

**Property PERF-5: Bundle Size Reduction**
```
newBundleSize ≤ originalBundleSize * 0.6
```
Test: Bundle size reduced by at least 40%

### 13.3 PWA Properties

**Property PWA-1: Service Worker Registration**
```
navigator.serviceWorker.register() → registration.active ≠ null
```
Test: Service worker registers successfully

**Property PWA-2: Offline Caching**
```
∀ page ∈ VisitedPages:
  offline = true → serve(cache(page))
```
Test: Visited pages served offline

**Property PWA-3: Cache Strategy**
```
∀ asset ∈ StaticAssets:
  cacheStrategy(asset) = CacheFirst
∀ api ∈ APIRequests:
  cacheStrategy(api) = NetworkFirst
```
Test: Correct cache strategy applied

**Property PWA-4: Update Notification**
```
serviceWorker.updated = true → showNotification() = true
```
Test: Update notification shown

**Property PWA-5: Installability**
```
manifest.valid = true AND serviceWorker.active = true
  → installable = true
```
Test: PWA is installable

### 13.4 Animation Properties

**Property ANIM-1: Animation Duration**
```
∀ animation ∈ Animations:
  200ms ≤ animation.duration ≤ 300ms
```
Test: All animations within duration range

**Property ANIM-2: Reduced Motion**
```
prefersReducedMotion = true → ∀ animation: animation.disabled = true
```
Test: Animations disabled when user prefers reduced motion

**Property ANIM-3: Stagger Delay**
```
∀ item[i] ∈ ListItems:
  item[i].delay = i * 50ms
```
Test: List items stagger with 50ms delay

**Property ANIM-4: Modal Animation**
```
modal.open → animation.type = scaleIn AND animation.duration ≤ 300ms
```
Test: Modals animate with scale and fade

**Property ANIM-5: GPU Acceleration**
```
∀ animation ∈ Animations:
  animation.properties ⊆ {transform, opacity}
```
Test: Only GPU-accelerated properties animated

### 13.5 Accessibility Properties

**Property A11Y-1: ARIA Labels**
```
∀ button ∈ IconButtons:
  button.hasAttribute('aria-label') = true
```
Test: All icon buttons have ARIA labels

**Property A11Y-2: Keyboard Navigation**
```
∀ element ∈ InteractiveElements:
  element.tabIndex ≥ 0 OR element.tabIndex = -1
```
Test: All interactive elements keyboard accessible

**Property A11Y-3: Focus Trap**
```
modal.open = true → focus ∈ modal.elements
```
Test: Focus trapped in open modals

**Property A11Y-4: Color Contrast**
```
∀ text ∈ TextElements:
  contrastRatio(text.color, text.backgroundColor) ≥ 4.5
```
Test: All text meets contrast requirements

**Property A11Y-5: Alt Text**
```
∀ img ∈ MeaningfulImages:
  img.hasAttribute('alt') = true AND img.alt.length > 0
```
Test: All meaningful images have alt text

### 13.6 SEO Properties

**Property SEO-1: Unique Titles**
```
∀ page[i], page[j] ∈ Pages WHERE i ≠ j:
  page[i].title ≠ page[j].title
```
Test: All pages have unique titles

**Property SEO-2: Title Length**
```
∀ page ∈ Pages:
  50 ≤ page.title.length ≤ 60
```
Test: All titles within character limit

**Property SEO-3: Meta Description**
```
∀ page ∈ Pages:
  150 ≤ page.description.length ≤ 160
```
Test: All descriptions within character limit

**Property SEO-4: Structured Data**
```
∀ job ∈ JobPostings:
  job.hasStructuredData('JobPosting') = true
```
Test: All jobs have structured data

**Property SEO-5: Canonical URLs**
```
∀ page ∈ Pages:
  page.hasCanonical = true AND page.canonical = page.url
```
Test: All pages have canonical URLs

### 13.7 Error Boundary Properties

**Property ERR-1: Error Catching**
```
∀ error ∈ ComponentErrors:
  errorBoundary.catch(error) = true
```
Test: All component errors caught

**Property ERR-2: Error Display**
```
error.caught = true → errorUI.visible = true
```
Test: Error UI shown when error caught

**Property ERR-3: Retry Functionality**
```
errorUI.retry() → component.rerender() = true
```
Test: Retry button re-renders component

**Property ERR-4: Error Logging**
```
∀ error ∈ CaughtErrors:
  console.error.called = true
```
Test: All errors logged to console

**Property ERR-5: Graceful Degradation**
```
componentError.caught = true → page.functional = true
```
Test: Page remains functional after component error

### 13.8 Loading State Properties

**Property LOAD-1: Skeleton Matching**
```
∀ content ∈ Content:
  skeleton(content).layout = content.layout
```
Test: Skeleton matches content layout

**Property LOAD-2: Loading Transition**
```
loading.change → transition.duration = 200ms
```
Test: Loading transitions are smooth

**Property LOAD-3: Button Disable**
```
button.loading = true → button.disabled = true
```
Test: Buttons disabled during loading

**Property LOAD-4: Progress Indication**
```
page.loading = true → progressBar.visible = true
```
Test: Progress bar shown during page load

**Property LOAD-5: Layout Stability**
```
∀ loadingState ∈ LoadingStates:
  CLS(loadingState) < 0.1
```
Test: No layout shifts during loading

## 14. Testing Strategy

### 14.1 Property-Based Tests
- Use fast-check for all properties above
- Minimum 100 iterations per property
- Test with random inputs and edge cases

### 14.2 Unit Tests
- Theme toggle functionality
- Service worker registration
- SEO meta tag generation
- Error boundary error catching
- Animation timing

### 14.3 Integration Tests
- PWA offline functionality
- Lazy loading with routing
- Keyboard navigation flow
- SEO structured data validation

### 14.4 Performance Tests
- Lighthouse CI in build pipeline
- Bundle size monitoring
- Load time tracking
- CLS measurement

### 14.5 Accessibility Tests
- axe-core automated testing
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)
- Color contrast validation

## 15. Deployment Considerations

### 15.1 Build Configuration
- Enable code splitting in Vite
- Generate service worker with Workbox
- Optimize images during build
- Generate sitemap.xml

### 15.2 Vercel Configuration
- Set cache headers for static assets
- Enable compression (gzip/brotli)
- Configure redirects for SEO
- Set environment variables

### 15.3 Monitoring
- Track Lighthouse scores
- Monitor bundle sizes
- Track error rates
- Monitor PWA install rate

## 16. Future Enhancements

### 16.1 Phase 2
- Advanced animations (shared element transitions)
- Offline data synchronization
- Advanced error recovery strategies
- Performance budgets enforcement

### 16.2 Phase 3
- A/B testing for animations
- Advanced PWA features (background sync, periodic sync)
- Machine learning for performance optimization
- Advanced accessibility features (voice navigation)
