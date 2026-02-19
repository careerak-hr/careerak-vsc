# Vercel Caching Rules Configuration

## Overview
This document describes the complete Vercel caching rules configuration for the Careerak platform, implementing requirements FR-PERF-6, FR-PERF-7, and NFR-PERF-6.

**Date**: 2026-02-19  
**Status**: ✅ Implemented  
**Task**: 2.4.4 Configure Vercel caching rules

---

## Caching Strategy Summary

| Resource Type | Cache Duration | Strategy | Reason |
|--------------|----------------|----------|---------|
| Static Assets (JS/CSS) | 30 days | Immutable | Content-hashed, never changes |
| Images | 30 days | Immutable | Content-hashed, optimized |
| Fonts | 1 year | Immutable | Rarely change, large files |
| HTML Files | 0 seconds | Must-revalidate | Always fetch latest |
| Manifest | 1 day | Public | May update with features |
| Service Worker | 0 seconds | Must-revalidate | Critical for PWA updates |
| Offline Page | 1 day | Public | Fallback for offline mode |
| API Responses | No cache | No-store | Dynamic content |

---

## Detailed Configuration

### 1. Static Assets (JS/CSS) - 30 Days

**Pattern**: `/assets/*` and `*.js`, `*.css`  
**Cache-Control**: `public, max-age=2592000, immutable`  
**Duration**: 2,592,000 seconds = 30 days

```json
{
  "source": "/assets/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=2592000, immutable"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    }
  ]
}
```

**Why 30 days?**
- Files are content-hashed (e.g., `main-abc123.js`)
- Once deployed, content never changes
- Browsers can cache aggressively
- Reduces bandwidth by 40-60%

**Why i