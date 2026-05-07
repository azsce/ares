# Vehicle Class Images - Final Setup

## Overview
Compressed and properly configured the vehicle class images (mini.png, midi.png, maxi.png) for the "Choose your ride" section on the homepage.

## Correct Location ✅
**Images are stored in:** `backend/Api/wwwroot/uploads/seed/`

- `backend/Api/wwwroot/uploads/seed/mini.png` (55.38 KB)
- `backend/Api/wwwroot/uploads/seed/midi.png` (71.41 KB)
- `backend/Api/wwwroot/uploads/seed/maxi.png` (72.78 KB)

**Total size:** ~200 KB (compressed from ~15 MB)

## Frontend Configuration ✅

### Component Updated
**File:** `frontend/app/_components/home/VehicleClassesSection.tsx`

```typescript
import { toImageUrl } from "@/utils/image-url";

const vehicleClasses = [
  { title: "Compact & Mini", spec: "4 Seats, 2 Bags", img: "/uploads/seed/mini.png", price: "$25", category: "Compact" },
  { title: "Mid-Size & Standard", spec: "5 Seats, 3 Bags", img: "/uploads/seed/midi.png", price: "$35", category: "Standard" },
  { title: "SUVs & Maxi", spec: "5+ Seats, 4+ Bags", img: "/uploads/seed/maxi.png", price: "$50", category: "Premium" },
];

// Image rendering
<Image
  src={toImageUrl(vc.img) || vc.img}
  alt={vc.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{
    objectFit: "contain",
    objectPosition: "center",
  }}
/>
```

### How It Works
1. Images are stored in backend `wwwroot/uploads/seed/`
2. Frontend references them as `/uploads/seed/mini.png`
3. `toImageUrl()` utility prepends the API base URL
4. Final URL: `http://localhost:5000/uploads/seed/mini.png` (or production URL)

## Compression Results

| Image | Original Size | Compressed Size | Reduction |
|-------|--------------|-----------------|-----------|
| mini.png | 5,122.74 KB | 55.38 KB | **98.92%** |
| midi.png | 5,147.11 KB | 71.41 KB | **98.61%** |
| maxi.png | 5,112.15 KB | 72.78 KB | **98.58%** |
| **Total** | **~15 MB** | **~200 KB** | **98.70%** |

## Compression Script Updated

**File:** `frontend/scripts/compress-vehicle-images.ts`

Now points to backend location:
```typescript
const images = [
  { name: 'mini.png', path: '../backend/Api/wwwroot/uploads/seed/mini.png' },
  { name: 'midi.png', path: '../backend/Api/wwwroot/uploads/seed/midi.png' },
  { name: 'maxi.png', path: '../backend/Api/wwwroot/uploads/seed/maxi.png' },
];
```

### To Compress Future Images:
```bash
cd frontend
bun run scripts/compress-vehicle-images.ts
```

## Image Specifications
- **Format:** PNG with palette compression
- **Max dimensions:** 800x600px
- **Quality:** 90%
- **Compression level:** 9 (maximum)
- **Average size:** ~66 KB per image

## Benefits

1. **Correct Architecture:** Images served from backend (single source of truth)
2. **Fast Loading:** 98.7% smaller files = much faster page loads
3. **Bandwidth Savings:** Saves ~15 MB per page load
4. **Better UX:** Faster initial page render
5. **SEO:** Improved Core Web Vitals (LCP)
6. **Mobile Performance:** Significantly better on slow connections

## File Structure

```
backend/
  Api/
    wwwroot/
      uploads/
        seed/
          mini.png      ✅ 55.38 KB (Compact & Mini)
          midi.png      ✅ 71.41 KB (Mid-Size & Standard)
          maxi.png      ✅ 72.78 KB (SUVs & Maxi)
          vehicles/     (vehicle photos)
          locations/    (location photos)
          suppliers/    (supplier photos)

frontend/
  app/
    _components/
      home/
        VehicleClassesSection.tsx  ✅ Updated to use toImageUrl()
  scripts/
    compress-vehicle-images.ts     ✅ Updated to backend path
  utils/
    image-url.ts                   ✅ Handles backend URL conversion
```

## API URL Handling

The `toImageUrl()` utility automatically handles:
- **Development:** `http://localhost:5000/uploads/seed/mini.png`
- **Production:** `https://api.yourdomain.com/uploads/seed/mini.png`

No hardcoded URLs needed!

## Verification

To verify everything works:
1. Start backend: `cd backend && dotnet run --project Api`
2. Start frontend: `cd frontend && bun dev`
3. Navigate to homepage
4. Scroll to "Choose your ride" section
5. Verify all 3 vehicle class images display correctly
6. Check browser DevTools Network tab:
   - Images should load from backend URL
   - File sizes should be ~55-73 KB each

## Files Modified

### Created:
- `frontend/scripts/compress-vehicle-images.ts` - Compression script

### Modified:
- `frontend/app/_components/home/VehicleClassesSection.tsx` - Updated image paths and added toImageUrl()
- `backend/Api/wwwroot/uploads/seed/mini.png` - Compressed
- `backend/Api/wwwroot/uploads/seed/midi.png` - Compressed
- `backend/Api/wwwroot/uploads/seed/maxi.png` - Compressed

### Deleted:
- `frontend/public/img/mini.png` - Moved to backend
- `frontend/public/img/midi.png` - Moved to backend
- `frontend/public/img/maxi.png` - Moved to backend

## Notes

- ✅ Images are served from backend (correct architecture)
- ✅ Frontend uses `toImageUrl()` utility for proper URL handling
- ✅ Compression script updated to work with backend location
- ✅ No hardcoded URLs - works in dev and production
- ✅ Images are optimized for web (98.7% smaller)
