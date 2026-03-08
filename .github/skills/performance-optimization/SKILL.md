---
name: performance-optimization
description: 'Optimize performance for the Careerak job postings page to achieve < 2 second load times. Use for implementing enhanced job postings features with performance validation.'
argument-hint: 'Specify the component, page, or feature to optimize (e.g., job postings page, bookmarks, similar jobs)'
---

# Performance Optimization for Careerak

## When to Use
- When implementing enhanced job postings features (Grid/List toggle, bookmarks, shares, similar jobs, salary estimation, company info)
- To ensure load times remain under 2 seconds
- For auditing and improving frontend/backend performance
- When performance KPIs from requirements.md are not met

## Procedure
1. **Audit Current Performance**
   - Run Lighthouse on job postings page
   - Measure API response times for bookmarks, shares, similar jobs
   - Check bundle size and loading metrics

2. **Implement Feature-Specific Optimizations**
   - **Grid/List Toggle**: Use CSS transforms for smooth transitions, avoid re-renders
   - **Bookmarks**: Implement optimistic updates, cache bookmarked jobs
   - **Shares**: Lazy load share modal, use Web Share API
   - **Similar Jobs**: Cache similar jobs results, limit to 4-6 items
   - **Salary Estimation**: Pre-compute estimates, cache data
   - **Company Info**: Lazy load company cards, optimize images
   - **Skeleton Loading**: Use lightweight skeleton components

3. **Backend Optimizations**
   - Add Redis caching for job data, similar jobs, salary estimates
   - Optimize MongoDB queries with indexes
   - Implement compression for API responses
   - Use pagination for large job lists

4. **Validate Improvements**
   - Re-run Lighthouse (target >90 score)
   - Test on mobile and desktop
   - Ensure no functionality regressions
   - Update requirements.md checklist

## Resources
- [Performance Checklist](./references/checklist.md)
- [Optimization Scripts](./scripts/optimize.js)
- [Project Requirements](../../.kiro/specs/enhanced-job-postings/requirements.md)