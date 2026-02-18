# How to Run Bundle Analysis

Quick guide for analyzing the Careerak frontend bundle size and composition.

---

## 🚀 Quick Start

```bash
# 1. Navigate to frontend
cd frontend

# 2. Run production build with analysis
npm run build

# 3. Open visualization
start build/stats.html
# Or manually: Open frontend/build/stats.html in your browser
```

---

## 📊 What You'll See

### Treemap View (Default)
- **Large rectangles** = Large chunks (optimization opportunities)
- **Colors** = Different chunks/modules
- **Hover** = Shows exact sizes (minified, gzipped, brotli)
- **Click** = Zoom into that module

### Alternative Views
The visualizer supports multiple templates. To change, edit `vite.config.js`:

```javascript
visualizer({
  template: 'treemap',  // Default - best for overview
  // template: 'sunburst',  // Hierarchical view
  // template: 'network',   // Dependency graph
})
```

---

## 🔍 What to Look For

### 1. Chunks Over 200KB
```bash
# Check for large chunks
Get-ChildItem build/assets/js/*.js | Where-Object {$_.Length -gt 200KB} | Select-Object Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}
```

**Action**: Consider lazy loading or splitting these chunks.

### 2. Duplicate Dependencies
- Look for the same library appearing in multiple chunks
- Check if tree-shaking is working correctly

### 3. Unexpected Large Modules
- Libraries you didn't know were that big
- Opportunities for lighter alternatives

### 4. Route Chunk Sizes
- Each route should be a separate chunk
- Route chunks should be relatively small (< 50KB)

---

## 📈 Comparing Builds

### Save Current Sizes
```bash
# PowerShell
Get-ChildItem build/assets/js/*.js | Select-Object Name, Length | Export-Csv -Path bundle-sizes-$(Get-Date -Format 'yyyy-MM-dd').csv

# Or manually save the build output
npm run build > build-output-$(Get-Date -Format 'yyyy-MM-dd').txt
```

### Compare with Previous Build
```bash
# Compare two CSV files
$old = Import-Csv bundle-sizes-2026-02-10.csv
$new = Import-Csv bundle-sizes-2026-02-17.csv

# Show differences
Compare-Object $old $new -Property Name, Length
```

---

## 🎯 Bundle Size Targets

### Current Targets (as of 2026-02-17)
- **Total JS (gzipped)**: < 600KB
- **Largest chunk**: < 200KB (except zxcvbn - to be optimized)
- **Route chunks**: < 50KB each
- **Vendor chunks**: < 150KB each

### How to Check
```bash
# Total gzipped size (approximate)
Get-ChildItem build/assets/js/*.js | Measure-Object -Property Length -Sum | Select-Object @{Name="TotalMB";Expression={[math]::Round($_.Sum/1MB,2)}}

# Gzipped size is typically 30-40% of minified size
# So multiply by 0.35 for estimate
```

---

## 🔧 Configuration

### Current Configuration (vite.config.js)
```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './build/stats.html',
      open: false,           // Set to true to auto-open
      gzipSize: true,        // Show gzipped sizes
      brotliSize: true,      // Show brotli sizes
      template: 'treemap',   // Visualization type
    }),
  ],
  // ... rest of config
});
```

### Customization Options

**Auto-open after build**:
```javascript
visualizer({
  open: true,  // Opens in browser automatically
})
```

**Different visualization**:
```javascript
visualizer({
  template: 'sunburst',  // Circular hierarchical view
})
```

**Custom output location**:
```javascript
visualizer({
  filename: './analysis/bundle-report.html',
})
```

---

## 🧪 Testing After Optimization

### 1. Verify Bundle Size Reduction
```bash
# Before optimization
npm run build
# Note the sizes

# After optimization
npm run build
# Compare the sizes
```

### 2. Check Lighthouse Score
```bash
npm run build
npm run preview
# In another terminal:
npx lighthouse http://localhost:3000 --view
```

### 3. Test on Slow Network
```bash
# Start preview server
npm run preview

# Open DevTools → Network tab
# Throttle to "Slow 3G"
# Reload page and measure load time
```

---

## 📊 Interpreting Results

### Good Signs ✅
- Most chunks under 200KB
- Route-based splitting working (many small chunks)
- No duplicate dependencies
- Vendor chunks appropriately sized

### Warning Signs ⚠️
- Any chunk over 200KB (except known large libraries)
- Same library in multiple chunks
- Unexpectedly large vendor chunks
- Route chunks over 50KB

### Critical Issues 🚨
- Any chunk over 500KB
- Total bundle over 2MB (minified)
- Duplicate React/React DOM
- Missing code splitting

---

## 🔄 Regular Monitoring

### When to Run Analysis
1. **After adding new dependencies**
   ```bash
   npm install new-library
   npm run build
   # Check if bundle size increased significantly
   ```

2. **Before major releases**
   ```bash
   npm run build
   # Review stats.html
   # Compare with previous release
   ```

3. **When performance degrades**
   ```bash
   # If Lighthouse score drops
   npm run build
   # Look for new large chunks
   ```

### Automated Monitoring (Future)
```json
// Add to package.json
{
  "scripts": {
    "analyze": "vite build && start build/stats.html",
    "size-check": "npm run build && size-limit"
  }
}
```

---

## 🛠️ Troubleshooting

### Visualizer Not Generating
```bash
# Check if plugin is installed
npm list rollup-plugin-visualizer

# Reinstall if needed
npm install --save-dev rollup-plugin-visualizer

# Verify vite.config.js has the plugin
```

### Stats.html Not Opening
```bash
# Manual open
start frontend/build/stats.html

# Or use full path
start "C:\path\to\Careerak\frontend\build\stats.html"
```

### Build Fails with Visualizer
```bash
# Try building without visualizer
# Comment out visualizer in vite.config.js
npm run build

# If it works, reinstall visualizer
npm uninstall rollup-plugin-visualizer
npm install --save-dev rollup-plugin-visualizer
```

---

## 📚 Additional Resources

- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [rollup-plugin-visualizer GitHub](https://github.com/btd/rollup-plugin-visualizer)
- [Bundle Size Optimization Guide](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Lighthouse Performance](https://web.dev/performance-scoring/)

---

## 📝 Quick Reference Commands

```bash
# Full analysis workflow
cd frontend
npm run build
start build/stats.html

# Check largest chunks
Get-ChildItem build/assets/js/*.js | Sort-Object Length -Descending | Select-Object -First 10 Name, @{Name="Size(KB)";Expression={[math]::Round($_.Length/1KB,2)}}

# Total bundle size
Get-ChildItem build/assets/js/*.js | Measure-Object -Property Length -Sum

# Compare with target (600KB gzipped ≈ 1.7MB minified)
# If total > 1.7MB, optimization needed
```

---

**Last Updated**: 2026-02-17  
**Related Documents**: 
- `docs/BUNDLE_ANALYSIS_REPORT.md` - Detailed analysis results
- `.kiro/specs/general-platform-enhancements/design.md` - Performance requirements
