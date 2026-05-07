# Vehicle Class Images Compression

## Overview
Replaced and compressed the vehicle class images (mini.png, midi.png, maxi.png) used in the "Choose your ride" section on the homepage.

## Problem
- New AI-generated images were placed in `backend/Api/wwwroot/uploads/seed/` (wrong location)
- Images were extremely large: ~5 MB each (5122 KB, 5147 KB, 5112 KB)
- Total size: ~15 MB for 3 images

## Solution

### 1. Moved Images to Correct Location
**From:** `backend/Api/wwwroot/uploads/seed/`  
**To:** `frontend/public/img/`

The frontend references these images as:
- `/img/mini.png` - Compact & Mini category
- `/img/midi.png` - Mid-Size & Standard category
- `/img/maxi.png` - SUVs & Maxi category

### 2. Installed Compression Tool
```bash
bun add -D sharp
```

### 3. Created Compression Script
**File:** `frontend/scripts/compress-vehicle-images.ts`

Features:
- Resizes images to max 800x600px (maintains aspect ratio)
- PNG compression with quality 90
- Palette-based PNG for smaller file size
- Compression level 9 (maximum)

### 4. Compression Results

| Image | Original Size | Compressed Size | Saved | Reduction |
|-------|--------------|-----------------|-------|-----------|
| mini.png | 5,122.74 KB | 55.38 KB | 5,067.36 KB | **98.92%** |
| midi.png | 5,147.11 KB | 71.41 KB | 5,075.70 KB | **98.61%** |
| maxi.png | 5,112.15 KB | 72.78 KB | 5,039.38 KB | **98.58%** |
| **Total** | **15,382 KB (~15 MB)** | **199.57 KB (~200 KB)** | **15,182 KB** | **98.70%** |

### 5. Cleaned Up
- Removed duplicate images from `backend/Api/wwwroot/uploads/seed/`
- Images now only exist in the correct frontend location

## Where Images Are Used

### Frontend Component
**File:** `frontend/app/_components/home/VehicleClassesSection.tsx`

```typescript
const vehicleClasses = [
  { title: "Compact & Mini", spec: "4 Seats, 2 Bags", img: "/img/mini.png", price: "$25", category: "Compact" },
  { title: "Mid-Size & Standard", spec: "5 Seats, 3 Bags", img: "/img/midi.png", price: "$35", category: "Standard" },
  { title: "SUVs & Maxi", spec: "5+ Seats, 4+ Bags", img: "/img/maxi.png", price: "$50", category: "Premium" },
];
```

### Image Specifications
- **Format:** PNG with palette compression
- **Max dimensions:** 800x600px
- **Quality:** 90%
- **Compression level:** 9 (maximum)
- **Average size:** ~66 KB per image

## Benefits

1. **Page Load Speed:** 98.7% reduction in image size = much faster homepage loading
2. **Bandwidth Savings:** Saves ~15 MB per page load
3. **Better UX:** Faster initial page render
4. **SEO:** Improved Core Web Vitals (LCP - Largest Contentful Paint)
5. **Mobile Performance:** Significantly better on slow connections

## Future Maintenance

To compress new vehicle class images:

```bash
cd frontend
bun run scripts/compress-vehicle-images.ts
```

The script will automatically:
1. Resize images to optimal dimensions
2. Apply maximum PNG compression
3. Show before/after sizes
4. Replace original files with compressed versions

## Technical Details

### Compression Settings
```typescript
sharp(inputPath)
  .resize(800, 600, {
    fit: 'inside',
    withoutEnlargement: true,
  })
  .png({
    quality: 90,
    compressionLevel: 9,
    palette: true,
  })
```

### Why These Settings?
- **800x600px:** Optimal for web display, maintains quality
- **fit: 'inside':** Maintains aspect ratio, no distortion
- **quality: 90:** Sweet spot between quality and file size
- **compressionLevel: 9:** Maximum compression
- **palette: true:** Uses indexed colors for smaller file size

## Files Modified/Created

### Created:
- `frontend/scripts/compress-vehicle-images.ts` - Compression script

### Modified:
- `frontend/public/img/mini.png` - Replaced and compressed
- `frontend/public/img/midi.png` - Replaced and compressed
- `frontend/public/img/maxi.png` - Replaced and compressed

### Deleted:
- `backend/Api/wwwroot/uploads/seed/mini.png` - Moved to frontend
- `backend/Api/wwwroot/uploads/seed/midi.png` - Moved to frontend
- `backend/Api/wwwroot/uploads/seed/maxi.png` - Moved to frontend

## Verification

To verify the images are working:
1. Navigate to the homepage
2. Scroll to "Choose your ride" section
3. Verify all 3 vehicle class images display correctly
4. Check browser DevTools Network tab to confirm small file sizes

## Notes

- Images are served from `/img/` path (frontend public directory)
- No backend changes required - these are static frontend assets
- Images are not stored in the database
- Compression is lossless for visual quality at web display sizes
