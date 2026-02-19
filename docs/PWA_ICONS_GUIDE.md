# PWA Icons Guide

## Overview
This guide explains the PWA icon generation system for Careerak, including standard and maskable icons required for Progressive Web App installation.

## Generated Icons

### Standard Icons (purpose: "any")
- **icon-192x192.png** - 192x192px standard icon
- **icon-512x512.png** - 512x512px standard icon

### Maskable Icons (purpose: "maskable")
- **icon-192x192-maskable.png** - 192x192px with 10% safe zone padding
- **icon-512x512-maskable.png** - 512x512px with 10% safe zone padding

## What are Maskable Icons?

Maskable icons are adaptive icons that allow the PWA icon to be displayed in different shapes on different devices (circle, squircle, rounded square, etc.). They require a **safe zone** of at least 10% padding on all sides to ensure the important content isn't cut off.

### Safe Zone Requirements
- **Minimum safe zone**: 10% padding on all sides
- **Content area**: 80% of the icon size
- **Background**: Uses the app's secondary color (#E3DAD1)

## Icon Generation Script

### Location
`frontend/scripts/generate-icons.js`

### Usage
```bash
# From frontend directory
npm run generate-icons

# Or directly
node scripts/generate-icons.js
```

### What the Script Does
1. Reads the source logo from `frontend/public/logo.png`
2. Generates 4 icon files:
   - 2 standard icons (192x192, 512x512)
   - 2 maskable icons with safe zone padding (192x192, 512x512)
3. Saves all icons to `frontend/public/`
4. Uses the app's secondary color (#E3DAD1) as background

### Dependencies
- **sharp**: Image processing library (installed as devDependency)

## Manifest Configuration

The icons are referenced in `frontend/public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any"
    },
    {
      "src": "icon-192x192-maskable.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "maskable"
    },
    {
      "src": "icon-512x512-maskable.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable"
    }
  ]
}
```

## Testing Icons

### 1. Test in Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in the left sidebar
4. Verify all icons are listed and display correctly
5. Check for any warnings or errors

### 2. Test PWA Installation
1. Open the app in Chrome on mobile or desktop
2. Look for the "Install" prompt
3. Install the PWA
4. Check the installed app icon on your home screen/app drawer

### 3. Test Maskable Icons
1. Visit [Maskable.app](https://maskable.app/)
2. Upload your maskable icon
3. Preview how it looks in different shapes
4. Verify the safe zone is adequate

### 4. Lighthouse Audit
```bash
# Run Lighthouse audit
npm run build
npm run preview
# Then run Lighthouse in Chrome DevTools
```

Check the PWA section for:
- ✅ Manifest includes icons
- ✅ Icons are the correct size
- ✅ Maskable icons are provided

## Updating Icons

### When to Regenerate
- Logo design changes
- Brand color updates
- Icon quality improvements

### How to Update
1. Replace `frontend/public/logo.png` with the new logo
2. Run the generation script:
   ```bash
   npm run generate-icons
   ```
3. Verify the new icons in the browser
4. Test PWA installation

### Manual Adjustments
If you need to manually adjust icons:
1. Edit `frontend/scripts/generate-icons.js`
2. Modify the icon configurations:
   - Change sizes
   - Adjust padding for maskable icons
   - Update background color
3. Regenerate icons

## Icon Specifications

### Size Requirements
- **Minimum**: 192x192px (required for PWA)
- **Recommended**: 512x512px (for high-DPI displays)
- **Optional**: 144x144px, 256x256px, 384x384px

### Format
- **Type**: PNG (recommended)
- **Quality**: 100% (no compression artifacts)
- **Color space**: sRGB

### Maskable Icon Guidelines
- **Safe zone**: 10% minimum padding
- **Content area**: 80% of icon size
- **Background**: Solid color (no transparency)
- **Test**: Use maskable.app to verify

## Troubleshooting

### Icons Not Showing
1. Clear browser cache
2. Uninstall and reinstall PWA
3. Check manifest.json for correct paths
4. Verify icons exist in public/ directory

### Maskable Icons Cut Off
1. Increase padding in generate-icons.js
2. Regenerate icons
3. Test on maskable.app

### Icons Look Blurry
1. Ensure source logo is high resolution (at least 512x512)
2. Check PNG quality setting (should be 100)
3. Regenerate icons

### Script Fails
1. Verify sharp is installed: `npm list sharp`
2. Check Node.js version (should be 14+)
3. Ensure logo.png exists in public/
4. Check file permissions

## File Sizes

Generated icon sizes (approximate):
- icon-192x192.png: ~16 KB
- icon-512x512.png: ~63 KB
- icon-192x192-maskable.png: ~13 KB
- icon-512x512-maskable.png: ~52 KB

**Total**: ~145 KB

## Best Practices

### Design
- ✅ Use simple, recognizable logo
- ✅ Ensure logo works at small sizes
- ✅ Use high contrast colors
- ✅ Avoid fine details that may be lost

### Technical
- ✅ Always provide both standard and maskable icons
- ✅ Use appropriate background color
- ✅ Test on multiple devices
- ✅ Optimize file sizes without losing quality

### Maintenance
- ✅ Keep source logo in version control
- ✅ Document any manual adjustments
- ✅ Test after regenerating icons
- ✅ Update manifest.json if paths change

## Resources

- [Web.dev - Maskable Icons](https://web.dev/maskable-icon/)
- [Maskable.app - Icon Editor](https://maskable.app/)
- [PWA Icon Guidelines](https://web.dev/add-manifest/#icons)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)

## Related Files

- `frontend/scripts/generate-icons.js` - Icon generation script
- `frontend/public/manifest.json` - PWA manifest with icon references
- `frontend/public/logo.png` - Source logo file
- `frontend/public/icon-*.png` - Generated icon files

## Next Steps

After generating icons:
1. ✅ Update manifest.json (already done)
2. ✅ Test PWA installation
3. ✅ Run Lighthouse audit
4. ✅ Test on multiple devices
5. ✅ Verify icons in different contexts (home screen, app drawer, splash screen)

---

**Last Updated**: 2026-02-19  
**Status**: ✅ Complete
