# Error Boundary Manual Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing both RouteErrorBoundary and ComponentErrorBoundary implementations to verify they meet all requirements.

**Date Created**: 2026-02-21  
**Status**: ✅ Complete  
**Related Tasks**: 7.6.6 - Trigger errors manually to test boundaries

## Requirements Being Tested

### Route-Level Error Boundary (RouteErrorBoundary)
- **FR-ERR-1**: Catch component errors with error boundary
- **FR-ERR-2**: Display user-friendly error messages in Arabic, English, or French
- **FR-ERR-3**: Log error details (component, stack trace, timestamp) to console
- **FR-ERR-4**: Provide "Retry" button to attempt recovery
- **FR-ERR-5**: Provide "Go Home" button to navigate to homepage
- **FR-ERR-6**: Display full-page error boundary for route-level errors
- **FR-ERR-8**: Reset error boundary and re-render on retry

### Component-Level Error Boundary (ComponentErrorBoundary)
- **FR-ERR-1**: Catch component errors with error boundary
- **FR-ERR-2**: Display user-friendly error messages in Arabic, English, or French
- **FR-ERR-3**: Log error details (component, stack trace, timestamp) to console
- **FR-ERR-4**: Provide "Retry" button to attempt recovery
- **FR-ERR-7**: Display inline error boundary without breaking the entire page
- **FR-ERR-8**: Reset error boundary and re-render component on retry

---

## Test Setup

### Prerequisites
1. Frontend development server running (`npm run dev`)
2. Browser DevTools open (Console tab visible)
3. Test component available at `/error-boundary-test` route

### Test Environment
- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Network**: Online (for full functionality testing)
- **Language**: Test in all three languages (ar, en, fr)

---

## Test 1: Component Error Boundary - Render Error

### Objective
Verify that ComponentErrorBoundary catches render errors and displays inline error UI without breaking the page.

### Steps
1. Navigate to `/error-boundary-test` route
2. Open browser DevTools Console
3. Click "Trigger Render Error" button
4. Observe the error boundary behavior

### Expected Results
✅ **Error Catching (FR-ERR-1)**:
- Component error is caught by ComponentErrorBoundary
- Page does not crash or reload
- Other components on the page continue working

✅ **Error Display (FR-ERR-2, FR-ERR-7)**:
- Inline error UI is displayed (not full-page)
- Error message is in the current language (ar/en/fr)
- Error message is user-friendly (no technical jargon)
- Error icon is visible
- UI matches the design (rounded card, proper colors)

✅ **Error Logging (FR-ERR-3)**:
- Console shows "=== ComponentErrorBoundary Error ==="
- Timestamp is logged
- Component name is logged ("ErrorThrowingComponent")
- Error message is logged
- Stack trace is logged
- Component stack is logged
- Retry count is logged (0 for first error)

✅ **Retry Button (FR-ERR-4, FR-ERR-8)**:
- "Retry" button is visible and clickable
- Button has proper aria-label
- Clicking retry resets the error boundary
- Component re-renders successfully
- Error count increments in console on subsequent errors

✅ **Development Details**:
- In development mode, expandable details section is visible
- Details show: component name, timestamp, retry count, error message, stack trace
- Details are hidden in production mode

### Test Data
```javascript
Error Type: Render Error
Error Message: "Test render error from ErrorThrowingComponent"
Component: ErrorThrowingComponent
Expected Behavior: Inline error UI, page remains functional
```

---

## Test 2: Component Error Boundary - Null Reference Error

### Objective
Verify that ComponentErrorBoundary catches null reference errors (common JavaScript error).

### Steps
1. On the `/error-boundary-test` page
2. Ensure Console is open
3. Click "Trigger Null Reference Error" button
4. Observe the error boundary behavior

### Expected Results
✅ **Error Catching**:
- Null reference error is caught
- Error message: "Cannot read properties of null"
- Inline error UI is displayed

✅ **Error Logging**:
- Console shows complete error details
- Stack trace includes the line where null was accessed

✅ **Recovery**:
- Click "Retry" button
- Component resets and displays "Component Working Correctly"
- Retry count increments

### Test Data
```javascript
Error Type: Null Reference Error
Error Message: "Cannot read properties of null (reading 'property')"
Component: ErrorThrowingComponent
Expected Behavior: Inline error UI with retry option
```

---

## Test 3: Multiple Component Error Boundaries

### Objective
Verify that multiple ComponentErrorBoundaries work independently without affecting each other.

### Steps
1. On the `/error-boundary-test` page
2. Scroll to "Multiple Components Test" section
3. Note that two components are displayed side by side
4. Modify the test to trigger error in only one component
5. Observe isolation behavior

### Expected Results
✅ **Error Isolation (FR-ERR-7)**:
- Error in one component does not affect the other
- Only the errored component shows error UI
- Other component continues to display "Component Working Correctly"
- Page layout remains intact

✅ **Independent Recovery**:
- Each component can be retried independently
- Retry in one component does not affect the other

### Test Data
```javascript
Scenario: Two components, one errors
Component 1: Error state
Component 2: Working state
Expected: Only Component 1 shows error UI
```

---

## Test 4: Route Error Boundary - Simulated Route Error

### Objective
Verify that RouteErrorBoundary catches route-level errors and displays full-page error UI.

### Steps
1. Create a test route that throws an error on render
2. Navigate to that route
3. Open browser DevTools Console
4. Observe the error boundary behavior

### Method 1: Modify Existing Route
```javascript
// In any route component (e.g., ProfilePage.jsx)
// Add this at the top of the component function:
if (true) {
  throw new Error('Test route-level error');
}
```

### Method 2: Create Test Route
```javascript
// In AppRoutes.jsx, add:
<Route path="/test-route-error" element={<TestRouteError />} />

// Create TestRouteError.jsx:
const TestRouteError = () => {
  throw new Error('Test route-level error');
};
```

### Expected Results
✅ **Error Catching (FR-ERR-1)**:
- Route error is caught by RouteErrorBoundary
- Browser does not show default error page

✅ **Full-Page Error UI (FR-ERR-6)**:
- Full-page error UI is displayed (not inline)
- Error takes up entire viewport
- Large error icon (80x80px)
- Error title and description are centered
- UI matches the design (card with shadow, proper spacing)

✅ **Error Logging (FR-ERR-3)**:
- Console shows "=== RouteErrorBoundary Error ==="
- Timestamp is logged
- Component name is logged
- Error message is logged
- Stack trace is logged
- Component stack is logged
- User ID is logged (if authenticated)

✅ **Action Buttons (FR-ERR-4, FR-ERR-5)**:
- "Retry" button is visible
- "Go Home" button is visible
- Both buttons have proper aria-labels
- Buttons are styled correctly (primary and secondary)

✅ **Retry Functionality (FR-ERR-8)**:
- Clicking "Retry" reloads the page
- Error boundary is reset
- Page attempts to render again

✅ **Go Home Functionality (FR-ERR-5)**:
- Clicking "Go Home" navigates to "/"
- Error boundary is reset
- Homepage loads successfully

### Test Data
```javascript
Error Type: Route Render Error
Error Message: "Test route-level error"
Component: TestRouteError or ProfilePage
Expected Behavior: Full-page error UI with retry and home buttons
```

---

## Test 5: Multi-Language Error Messages

### Objective
Verify that error messages are displayed in the correct language (ar, en, fr).

### Steps
1. Navigate to `/error-boundary-test`
2. Change language to Arabic (ar)
3. Trigger a component error
4. Verify error message is in Arabic
5. Click "Retry" to reset
6. Change language to English (en)
7. Trigger error again
8. Verify error message is in English
9. Repeat for French (fr)

### Expected Results
✅ **Arabic (ar)**:
- Title: "عذراً، حدث خطأ"
- Description: "حدث خطأ غير متوقع في هذا المكون"
- Retry Button: "إعادة المحاولة"
- All text is right-to-left (RTL)

✅ **English (en)**:
- Title: "Oops, Something Went Wrong"
- Description: "An unexpected error occurred in this component"
- Retry Button: "Retry"
- All text is left-to-right (LTR)

✅ **French (fr)**:
- Title: "Oups, Une Erreur S'est Produite"
- Description: "Une erreur inattendue s'est produite dans ce composant"
- Retry Button: "Réessayer"
- All text is left-to-right (LTR)

✅ **Language Switching**:
- Error messages update when language changes
- No need to re-trigger error to see new language
- RTL/LTR layout adjusts correctly

### Test Data
```javascript
Languages: ar, en, fr
Component: ComponentErrorBoundary
Expected: Error messages in correct language with proper text direction
```

---

## Test 6: Error Logging Details

### Objective
Verify that all required error details are logged to the console.

### Steps
1. Open browser DevTools Console
2. Clear console
3. Trigger any error (component or route)
4. Examine console output

### Expected Results
✅ **Console Output Format**:
```
=== ComponentErrorBoundary Error === (or RouteErrorBoundary)
Timestamp: 2026-02-21T10:30:45.123Z
Component: ErrorThrowingComponent
User ID: 507f1f77bcf86cd799439011 (if authenticated)
Error: Error: Test render error from ErrorThrowingComponent
Stack Trace: Error: Test render error...
    at ErrorThrowingComponent (ErrorBoundaryTest.jsx:12:11)
    ...
Component Stack:
    at ErrorThrowingComponent (http://localhost:5173/src/test/ErrorBoundaryTest.jsx:12:11)
    ...
Retry Count: 0 (ComponentErrorBoundary only)
====================================
```

✅ **Required Fields (FR-ERR-3)**:
- Timestamp in ISO format
- Component name
- User ID (if authenticated)
- Error message
- Stack trace
- Component stack
- Retry count (for ComponentErrorBoundary)

✅ **Console Formatting**:
- Clear section headers (===)
- Readable formatting
- All information is accessible

### Test Data
```javascript
Verification: All FR-ERR-3 requirements met
Console: Complete error details logged
Format: Structured and readable
```

---

## Test 7: Network Error Handling

### Objective
Verify that network errors are handled with specific error messages.

### Steps
1. Simulate a network error in a component
2. Observe error boundary behavior

### Method: Simulate Network Error
```javascript
// In a component wrapped by ComponentErrorBoundary:
const fetchData = async () => {
  try {
    const response = await fetch('/api/nonexistent');
    if (!response.ok) {
      const error = new Error('Network request failed');
      error.networkError = true;
      throw error;
    }
  } catch (error) {
    error.networkError = true;
    throw error;
  }
};
```

### Expected Results
✅ **Network Error Detection**:
- Error boundary detects `networkError` flag
- NetworkError component is rendered instead of generic error UI

✅ **Network Error UI (FR-ERR-9)**:
- Specific network error message is displayed
- Retry button is available
- Auto-retry functionality works when online
- Different styling from generic errors

### Test Data
```javascript
Error Type: Network Error
Flag: error.networkError = true
Expected: NetworkError component with retry and auto-retry
```

---

## Test 8: Development vs Production Mode

### Objective
Verify that error details are shown in development but hidden in production.

### Steps
1. **Development Mode**:
   - Run `npm run dev`
   - Trigger an error
   - Verify details section is visible

2. **Production Mode**:
   - Run `npm run build`
   - Run `npm run preview`
   - Trigger an error
   - Verify details section is hidden

### Expected Results
✅ **Development Mode**:
- Expandable "Error Details" section is visible
- Details include: timestamp, component, error, stack trace
- Details can be expanded/collapsed
- Useful for debugging

✅ **Production Mode**:
- Error Details section is completely hidden
- Only user-friendly message is shown
- No technical information exposed
- Professional appearance

### Test Data
```javascript
Environment: Development vs Production
NODE_ENV: development vs production
Expected: Details visible in dev, hidden in prod
```

---

## Test 9: Error Recovery Success Rate

### Objective
Verify that error recovery works in 95% of cases (NFR-REL-1).

### Steps
1. Trigger 20 different errors (mix of render, null, undefined, etc.)
2. For each error, click "Retry"
3. Count successful recoveries
4. Calculate success rate

### Expected Results
✅ **Success Rate (NFR-REL-1)**:
- At least 19 out of 20 errors recover successfully (95%)
- Component re-renders after retry
- No page reload required (except for RouteErrorBoundary)
- Error state is cleared

✅ **Recovery Scenarios**:
- Render errors: ✅ Recoverable
- Null reference: ✅ Recoverable
- Undefined access: ✅ Recoverable
- Type errors: ✅ Recoverable
- Async errors: ⚠️ May not be caught (limitation of React error boundaries)

### Test Data
```javascript
Total Errors: 20
Successful Recoveries: ≥19
Success Rate: ≥95%
Requirement: NFR-REL-1
```

---

## Test 10: Accessibility Testing

### Objective
Verify that error boundaries are accessible to keyboard and screen reader users.

### Steps
1. Trigger an error
2. Test keyboard navigation
3. Test screen reader announcements

### Keyboard Navigation
1. Press Tab to focus on "Retry" button
2. Press Enter to activate retry
3. Verify focus management

### Screen Reader Testing
1. Use NVDA (Windows) or VoiceOver (Mac)
2. Trigger an error
3. Listen to announcements

### Expected Results
✅ **ARIA Attributes**:
- Error container has `role="alert"`
- Route errors have `aria-live="assertive"`
- Component errors have `aria-live="polite"`
- Buttons have proper `aria-label`

✅ **Keyboard Navigation**:
- Tab key moves focus to buttons
- Enter/Space activates buttons
- Focus is visible (outline)
- Logical tab order

✅ **Screen Reader Announcements**:
- Error is announced when it occurs
- Error message is read aloud
- Button labels are announced
- Details section is accessible

### Test Data
```javascript
Tools: NVDA, VoiceOver, Keyboard
Attributes: role, aria-live, aria-label
Expected: Full accessibility support
```

---

## Test 11: Animation and Transitions

### Objective
Verify that error UI appears with smooth animations (FR-ANIM-8).

### Steps
1. Trigger an error
2. Observe the animation
3. Measure animation duration

### Expected Results
✅ **Animation Properties**:
- Fade in animation (opacity 0 → 1)
- Slide animation (y: -10 → 0 for component, scale: 0.9 → 1 for route)
- Duration: 300ms
- Easing: ease-out

✅ **Smooth Appearance**:
- No jarring transitions
- Smooth fade and slide
- Professional appearance
- Matches design system

✅ **Reduced Motion**:
- Respects `prefers-reduced-motion` setting
- Animations disabled if user prefers reduced motion

### Test Data
```javascript
Animation: Fade + Slide/Scale
Duration: 300ms
Easing: ease-out
Requirement: FR-ANIM-8
```

---

## Test 12: Error Boundary Nesting

### Objective
Verify that nested error boundaries work correctly.

### Steps
1. Create a component with nested error boundaries:
```javascript
<RouteErrorBoundary>
  <ComponentErrorBoundary name="Outer">
    <ComponentErrorBoundary name="Inner">
      <ErrorThrowingComponent />
    </ComponentErrorBoundary>
  </ComponentErrorBoundary>
</RouteErrorBoundary>
```
2. Trigger an error in the innermost component
3. Observe which boundary catches it

### Expected Results
✅ **Boundary Hierarchy**:
- Innermost boundary catches the error first
- Error does not propagate to outer boundaries
- Only the inner component shows error UI
- Outer components remain functional

✅ **Isolation**:
- Error is contained at the lowest level
- Page structure remains intact
- Other components continue working

### Test Data
```javascript
Nesting: Route > Component > Component
Error Location: Innermost component
Expected: Caught by innermost boundary
```

---

## Test Checklist

Use this checklist to track your testing progress:

### Component Error Boundary
- [ ] Test 1: Render error caught and displayed inline
- [ ] Test 2: Null reference error caught
- [ ] Test 3: Multiple boundaries work independently
- [ ] Test 5: Multi-language messages (ar, en, fr)
- [ ] Test 6: Error logging details complete
- [ ] Test 7: Network errors handled specifically
- [ ] Test 8: Details shown in dev, hidden in prod
- [ ] Test 9: 95%+ recovery success rate
- [ ] Test 10: Accessibility (keyboard, screen reader)
- [ ] Test 11: Smooth animations (300ms)
- [ ] Test 12: Nested boundaries work correctly

### Route Error Boundary
- [ ] Test 4: Route error caught and displayed full-page
- [ ] Test 4: Retry button reloads page
- [ ] Test 4: Go Home button navigates to /
- [ ] Test 5: Multi-language messages (ar, en, fr)
- [ ] Test 6: Error logging details complete
- [ ] Test 8: Details shown in dev, hidden in prod
- [ ] Test 10: Accessibility (keyboard, screen reader)
- [ ] Test 11: Smooth animations (300ms)

### Cross-Cutting Concerns
- [ ] All error messages in 3 languages
- [ ] RTL support for Arabic
- [ ] Console logging complete
- [ ] User ID logged when authenticated
- [ ] Animations respect prefers-reduced-motion
- [ ] Error tracking prepared for future integration

---

## Common Issues and Troubleshooting

### Issue 1: Error Not Caught
**Symptom**: Error crashes the app instead of being caught  
**Possible Causes**:
- Error thrown in event handler (not caught by error boundaries)
- Error thrown in async code (not caught by error boundaries)
- Error boundary not wrapping the component

**Solution**:
- Wrap event handlers in try-catch
- Use error boundary for render errors only
- Verify component hierarchy

### Issue 2: Retry Not Working
**Symptom**: Clicking retry doesn't reset the error  
**Possible Causes**:
- State not being reset properly
- Error persists in component state

**Solution**:
- Check error boundary state reset logic
- Verify component re-renders after retry
- Check console for additional errors

### Issue 3: Wrong Language Displayed
**Symptom**: Error message in wrong language  
**Possible Causes**:
- Language context not available
- Translation file missing
- Fallback not working

**Solution**:
- Verify AppContext provides language
- Check errorBoundaryTranslations.json
- Ensure fallback to Arabic works

### Issue 4: Details Not Showing in Development
**Symptom**: Error details hidden even in dev mode  
**Possible Causes**:
- NODE_ENV not set to 'development'
- Build running in production mode

**Solution**:
- Check `process.env.NODE_ENV`
- Run `npm run dev` instead of `npm run preview`
- Verify Vite configuration

---

## Success Criteria

All tests pass if:

✅ **Functionality**:
- All errors are caught by appropriate boundary
- Error UI is displayed correctly
- Retry functionality works
- Recovery success rate ≥ 95%

✅ **User Experience**:
- Error messages are user-friendly
- Multi-language support works (ar, en, fr)
- Animations are smooth (300ms)
- Accessibility is complete

✅ **Developer Experience**:
- Error logging is complete
- Details shown in development
- Details hidden in production
- Console output is readable

✅ **Requirements**:
- All FR-ERR requirements met
- All NFR-REL requirements met
- All design specifications followed
- All acceptance criteria satisfied

---

## Next Steps

After completing manual testing:

1. **Document Results**: Record test results in this document
2. **Fix Issues**: Address any failures found during testing
3. **Update Tests**: Add automated tests for critical scenarios
4. **User Acceptance**: Get stakeholder approval
5. **Deploy**: Deploy to production with confidence

---

## Test Results Log

### Test Session 1
**Date**: _____________  
**Tester**: _____________  
**Environment**: Development / Production  
**Browser**: _____________  

| Test | Status | Notes |
|------|--------|-------|
| Test 1 | ⬜ Pass / ⬜ Fail | |
| Test 2 | ⬜ Pass / ⬜ Fail | |
| Test 3 | ⬜ Pass / ⬜ Fail | |
| Test 4 | ⬜ Pass / ⬜ Fail | |
| Test 5 | ⬜ Pass / ⬜ Fail | |
| Test 6 | ⬜ Pass / ⬜ Fail | |
| Test 7 | ⬜ Pass / ⬜ Fail | |
| Test 8 | ⬜ Pass / ⬜ Fail | |
| Test 9 | ⬜ Pass / ⬜ Fail | |
| Test 10 | ⬜ Pass / ⬜ Fail | |
| Test 11 | ⬜ Pass / ⬜ Fail | |
| Test 12 | ⬜ Pass / ⬜ Fail | |

**Overall Result**: ⬜ Pass / ⬜ Fail  
**Issues Found**: _____________  
**Action Items**: _____________

---

## References

- **Requirements**: `.kiro/specs/general-platform-enhancements/requirements.md`
- **Design**: `.kiro/specs/general-platform-enhancements/design.md`
- **Tasks**: `.kiro/specs/general-platform-enhancements/tasks.md`
- **Components**:
  - `frontend/src/components/ErrorBoundary/RouteErrorBoundary.jsx`
  - `frontend/src/components/ErrorBoundary/ComponentErrorBoundary.jsx`
  - `frontend/src/test/ErrorBoundaryTest.jsx`
- **Translations**: `frontend/src/data/errorBoundaryTranslations.json`

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-21  
**Status**: ✅ Complete and Ready for Testing
