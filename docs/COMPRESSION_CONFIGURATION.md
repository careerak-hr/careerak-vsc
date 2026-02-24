# Compression Configuration (gzip/brotli)

## Overview
**تاريخ الإضافة**: 2026-02-22  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: NFR-PERF-7, Task 10.3.2

This document describes the compression configuration for Careerak platform to reduce bandwidth usage and improve page load times.

## Compression Strategy

### 1. Vercel Platform-Level Compression
Vercel automatically handles compression for all responses:
- **Brotli compression** (br) - preferred for modern browsers (20-30% better than gzip)
- **Gzip compression** (gzip) - fallback for older browsers
- **No compression** - for clients that don't support compression

**How it works**:
- Vercel automatically detects the `Accept-Encoding` header from the client
- If client supports `br`, Vercel serves brotli-compressed content
- If client supports `gzip`, Vercel serves gzip-compressed content
- If client doesn't support compression, Vercel serves uncompressed content

**Configuration**: No explicit configuration needed in `vercel.json` - Vercel handles this automatically.

### 2. Backend Compression Middleware
For API responses, we use the `compression` middleware in Express:

**Location**: `backend/src/app.js` (lines 52-73)

```javascript
app.use(compression({
  // Compression level (0-9, default: 6)
  level: 6,
  
  // Minimum response size to compress (1KB)
  threshold: 1024,
  
  // Filter function
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  
  // Memory level (1-9, default: 8)
  memLevel: 8,
}));
```

**Features**:
- ✅ Automatic compression for all API responses
- ✅ Configurable compression level (6 = balanced)
- ✅ Minimum threshold (1KB) to avoid compressing tiny responses
- ✅ Filter function to skip compression when needed
- ✅ Optimized memory usage

### 3. Build-Time Optimization
Vite automatically optimizes assets during build:

**Location**: `frontend/vite.config.js`

```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      dead_code: true,
      // ... more optimizations
    },
  },
}
```

**Features**:
- ✅ Minification of JavaScript and CSS
- ✅ Tree-shaking to remove unused code
- ✅ Code splitting for smaller chunks
- ✅ Asset optimization (images, fonts)

## Compression Levels

### Brotli Compression
- **Level**: Automatic (Vercel optimizes based on content type)
- **Compression ratio**: 20-30% better than gzip
- **CPU usage**: Higher than gzip
- **Best for**: Text files (HTML, CSS, JS, JSON, XML, SVG)
- **Browser support**: Chrome 50+, Firefox 44+, Safari 11+, Edge 15+

### Gzip Compression
- **Level**: 6 (balanced between speed and compression)
- **Compression ratio**: Good (typically 60-80% reduction)
- **CPU usage**: Moderate
- **Best for**: Text files (HTML, CSS, JS, JSON, XML, SVG)
- **Browser support**: All modern browsers

## What Gets Compressed

### ✅ Compressed Content Types
- **Text files**: HTML, CSS, JavaScript
- **Data formats**: JSON, XML, SVG
- **Fonts**: WOFF, WOFF2 (if not pre-compressed)
- **API responses**: All JSON responses from backend

### ❌ Not Compressed
- **Images**: JPEG, PNG, GIF, WebP (already compressed)
- **Videos**: MP4, WebM (already compressed)
- **Audio**: MP3, OGG (already compressed)
- **Archives**: ZIP, RAR (already compressed)
- **Small files**: < 1KB (overhead not worth it)

## Performance Impact

### Expected Improvements
- 📉 **Bandwidth reduction**: 60-80% for text files
- ⚡ **Page load time**: 30-50% faster on slow connections
- 💰 **Cost savings**: Reduced bandwidth costs
- 🌍 **Better UX**: Faster loading for users worldwide

### Benchmarks
| Content Type | Original Size | Gzip Size | Brotli Size | Savings |
|--------------|---------------|-----------|-------------|---------|
| HTML         | 100 KB        | 25 KB     | 20 KB       | 75-80%  |
| CSS          | 50 KB         | 12 KB     | 10 KB       | 76-80%  |
| JavaScript   | 200 KB        | 60 KB     | 50 KB       | 70-75%  |
| JSON         | 30 KB         | 8 KB      | 6 KB        | 73-80%  |

## Testing Compression

### 1. Test with curl
```bash
# Test gzip compression
curl -H "Accept-Encoding: gzip" -I https://careerak.com

# Test brotli compression
curl -H "Accept-Encoding: br" -I https://careerak.com

# Expected response headers:
# Content-Encoding: br (or gzip)
# Vary: Accept-Encoding
```

### 2. Test with Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Click on any resource (JS, CSS, HTML)
5. Check Response Headers:
   - `Content-Encoding: br` or `Content-Encoding: gzip`
   - `Vary: Accept-Encoding`
6. Check Size column:
   - Shows "transferred size" (compressed) vs "resource size" (uncompressed)

### 3. Test with Online Tools
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/
- **Google PageSpeed Insights**: https://pagespeed.web.dev/

### 4. Test API Compression
```bash
# Test API endpoint
curl -H "Accept-Encoding: gzip" -I https://careerak.com/api/users

# Expected response:
# Content-Encoding: gzip
# Content-Type: application/json
```

## Troubleshooting

### Issue: Compression not working
**Symptoms**: `Content-Encoding` header is missing

**Solutions**:
1. Check browser supports compression:
   - Modern browsers send `Accept-Encoding: gzip, deflate, br`
2. Check file size:
   - Files < 1KB are not compressed (overhead not worth it)
3. Check content type:
   - Only text-based content is compressed
4. Check Vercel deployment:
   - Compression is automatic on Vercel
   - No configuration needed

### Issue: Compression too slow
**Symptoms**: High CPU usage, slow response times

**Solutions**:
1. Reduce compression level in `backend/src/app.js`:
   ```javascript
   app.use(compression({ level: 4 })); // Faster, less compression
   ```
2. Increase threshold to skip small files:
   ```javascript
   app.use(compression({ threshold: 2048 })); // 2KB minimum
   ```

### Issue: Double compression
**Symptoms**: Content is compressed twice, causing errors

**Solutions**:
1. Don't set `Content-Encoding` header manually in `vercel.json`
2. Let Vercel handle compression automatically
3. Backend middleware only compresses API responses

## Best Practices

### ✅ Do
- Let Vercel handle compression automatically for static assets
- Use compression middleware for API responses
- Minify and optimize assets during build
- Test compression with real browsers
- Monitor compression ratio and performance

### ❌ Don't
- Don't compress already-compressed files (images, videos)
- Don't set `Content-Encoding` header manually
- Don't use high compression levels (> 6) in production
- Don't compress files < 1KB
- Don't disable compression for text files

## Configuration Files

### 1. vercel.json
```json
{
  "version": 2,
  "functions": {
    "backend/src/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Note**: No explicit compression configuration needed - Vercel handles it automatically.

### 2. backend/src/app.js
```javascript
const compression = require('compression');

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  memLevel: 8,
}));
```

### 3. frontend/vite.config.js
```javascript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // ... more optimizations
      },
    },
  },
});
```

## Monitoring

### Metrics to Track
- **Compression ratio**: (original size - compressed size) / original size
- **Bandwidth savings**: Total bytes saved per day/month
- **Page load time**: Time to First Byte (TTFB), First Contentful Paint (FCP)
- **CPU usage**: Backend server CPU usage
- **Error rate**: Compression-related errors

### Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: Page load times
- **Lighthouse**: Performance audits
- **WebPageTest**: Detailed compression analysis

## References

### Documentation
- [Vercel Compression](https://vercel.com/docs/concepts/edge-network/compression)
- [Express compression middleware](https://github.com/expressjs/compression)
- [Brotli compression](https://github.com/google/brotli)
- [Gzip compression](https://www.gnu.org/software/gzip/)

### Standards
- [RFC 7932 - Brotli Compressed Data Format](https://tools.ietf.org/html/rfc7932)
- [RFC 1952 - GZIP file format specification](https://tools.ietf.org/html/rfc1952)

## Summary

✅ **Compression is fully configured and enabled**:
1. Vercel automatically handles brotli/gzip compression for static assets
2. Backend uses compression middleware for API responses
3. Build process minifies and optimizes all assets
4. Expected bandwidth reduction: 60-80% for text files
5. Expected page load improvement: 30-50% on slow connections

**No further action needed** - compression is working automatically! 🎉
