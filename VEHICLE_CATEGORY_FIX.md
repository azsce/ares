# Vehicle Category Duplication Fix

## Problem
Users reported that the same cars were appearing in all 3 vehicle class sections on the homepage (Compact & Mini, Mid-Size & Standard, SUVs & Maxi).

## Root Cause
1. The homepage vehicle class cards were linking to the search page without passing a category filter
2. The search page itself had no UI filter for users to manually select a vehicle category

## Database Status ✅
The database is correctly configured with 3 categories:
- **Compact**: 6 vehicles (budget cars, 4-5 seats, $26-40/day)
- **Standard**: 6 vehicles (mid-range sedans/SUVs, 5 seats, $55-70/day)
- **Premium**: 8 vehicles (luxury cars, vans, large SUVs, 5+ seats, $90-150/day)

Total: 20 vehicles properly distributed across categories.

## Solution Implemented

### 1. Updated VehicleClassesSection Component (Homepage)
**File**: `frontend/app/_components/home/VehicleClassesSection.tsx`

Added `category` property to each vehicle class card:
```typescript
const vehicleClasses = [
  { title: "Compact & Mini", spec: "4 Seats, 2 Bags", img: "/img/mini.png", price: "$25", category: "Compact" },
  { title: "Mid-Size & Standard", spec: "5 Seats, 3 Bags", img: "/img/midi.png", price: "$35", category: "Standard" },
  { title: "SUVs & Maxi", spec: "5+ Seats, 4+ Bags", img: "/img/maxi.png", price: "$50", category: "Premium" },
];
```

Updated the search link to include category parameter:
```typescript
<MuiLink href={`/search?pickupLocationId=${defaultLocationId}&category=${vc.category}`} component={Link} underline="none">
```

### 2. Updated Search Page
**File**: `frontend/app/(public)/search/page.tsx`

- Extract category from URL search params
- Pass category to `fetchFeaturedVehicles` function
- Pass category to `SearchPageContent` component

### 3. Updated fetchFeaturedVehicles Function
**File**: `frontend/utils/public-data.ts`

- Added optional `category` parameter
- Conditionally add category to API query params if provided
- Backend API already supports category filtering

### 4. Updated SearchPageContent Component
**File**: `frontend/app/(public)/search/SearchPageContent.tsx`

- Added `category` prop to interface
- Map category codes to display names:
  - `Compact` → "Compact & Mini"
  - `Standard` → "Mid-Size & Standard"
  - `Premium` → "SUVs & Maxi"
- Display active category filter as a green chip badge
- Pass category to SearchFormFilter component

### 5. Added Category Filter to Search Form ✨ NEW
**File**: `frontend/app/(public)/search/SearchFormFilter.tsx`

Added a new "Vehicle class" dropdown filter with options:
- **All Categories** (shows all vehicles)
- **Compact & Mini** (filters to Compact category)
- **Mid-Size & Standard** (filters to Standard category)
- **SUVs & Maxi** (filters to Premium category)

The filter:
- Appears in the search form alongside location and date pickers
- Preserves the selected category when searching
- Allows users to manually change or clear the category filter
- Responsive layout: stacks on mobile, single row on desktop

## Result
Now users can filter vehicles by category in two ways:

### 1. From Homepage "Choose your ride" Section
When users click "Search Class" on any of the 3 cards:
- **"Compact & Mini"** → Shows only 6 compact vehicles
- **"Mid-Size & Standard"** → Shows only 6 standard vehicles
- **"SUVs & Maxi"** → Shows only 8 premium vehicles

### 2. From Search Page Filter
Users can manually select a vehicle class from the dropdown:
- **All Categories** → Shows all 20 vehicles
- **Compact & Mini** → Shows only 6 compact vehicles
- **Mid-Size & Standard** → Shows only 6 standard vehicles
- **SUVs & Maxi** → Shows only 8 premium vehicles

The active category filter is displayed as a green chip badge below the search form.

## Testing
1. **Homepage Flow:**
   - Navigate to homepage
   - Click "Search Class" on "Compact & Mini" card
   - Verify only compact cars are shown (Chevrolet Spark, Hyundai Accent, Kia Rio, Toyota Yaris)
   - Verify "Compact & Mini" chip badge is displayed
   - Verify "Vehicle class" dropdown shows "Compact & Mini" selected

2. **Manual Filter Flow:**
   - Navigate to search page
   - Select "SUVs & Maxi" from "Vehicle class" dropdown
   - Click "Search cars"
   - Verify only premium vehicles are shown (BMW, Mercedes, Audi, Volvo, Mazda CX-5, Kia Carnival, Ford Transit, Nissan X-Trail)
   - Verify "SUVs & Maxi" chip badge is displayed

3. **Clear Filter Flow:**
   - From a filtered search, select "All Categories" from dropdown
   - Click "Search cars"
   - Verify all 20 vehicles are shown
   - Verify no category chip badge is displayed

## Files Modified
- `frontend/app/_components/home/VehicleClassesSection.tsx`
- `frontend/app/(public)/search/page.tsx`
- `frontend/utils/public-data.ts`
- `frontend/app/(public)/search/SearchPageContent.tsx`
- `frontend/app/(public)/search/SearchFormFilter.tsx` ✨ NEW

## No Backend Changes Required
The backend API (`/api/vehicles/search`) already supports category filtering via the `category` query parameter. No changes were needed to the backend code.
