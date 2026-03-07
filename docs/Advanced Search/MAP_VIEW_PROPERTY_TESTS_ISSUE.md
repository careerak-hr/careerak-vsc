# Map View Property Tests - Model Issue

## Status: ⚠️ Tests Identify Model Schema Issue

## Summary
The property tests for geographic boundary filtering (Task 10.3 and 10.4) have successfully identified a fundamental issue with the `JobPosting` model's `location` field schema definition.

## The Problem

### Current Schema Definition
The `JobPosting` model defines `location` as a String type with nested properties:

```javascript
location: { 
  type: String,  // ← String type
  required: true,
  city: String,  // ← Nested properties
  country: String,
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  }
}
```

This is **not a standard Mongoose schema pattern** and causes issues:
1. Cannot save nested properties when `location` is a String
2. Geospatial index on `location.coordinates` doesn't work properly
3. MongoDB `$geoWithin` and `$near` queries return 0 results

### Test Results
- ✅ `map-marker-completeness.property.test.js`: 4/5 tests passing
- ❌ `geographic-boundary-filtering.property.test.js`: 2/6 tests passing
  - Rectangular boundary test: FAIL (coordinates not saved)
  - Polygon boundary test: FAIL (coordinates not saved)
  - Circular boundary test: PASS ✅
  - Distance ordering test: PASS ✅
  - Empty boundary test: PASS ✅
  - Combined filters test: PASS ✅

### Error Messages
```
ValidationError: JobPosting validation failed: location: Cast to string failed for value "{ city: 'Cairo', coordinates: {...} }" (type Object) at path "location"
```

OR when using dot notation:
```
First job coords: undefined
Found 0 jobs in boundary
```

## The Solution

### Option 1: Fix the Schema (Recommended)
Change `location` to be an embedded document:

```javascript
location: {
  type: {
    address: { type: String, required: true },  // "Cairo, Egypt"
    city: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],  // [longitude, latitude]
        required: true
      }
    }
  },
  required: true
}

// Add geospatial index
jobPostingSchema.index({ 'location.coordinates': '2dsphere' });
```

### Option 2: Use Mixed Type
```javascript
location: {
  type: mongoose.Schema.Types.Mixed,
  required: true
}
```

### Option 3: Separate Fields
```javascript
locationString: { type: String, required: true },  // "Cairo, Egypt"
locationCity: String,
locationCountry: String,
locationCoordinates: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
}
```

## Impact

### What Works
- Basic job creation (without coordinates)
- Text search
- Filtering by skills, salary, etc.
- The 4 passing geospatial tests (using simpler queries)

### What Doesn't Work
- Saving jobs with coordinates using standard Mongoose methods
- `$geoWithin` queries with `$box` (rectangular boundaries)
- `$geoWithin` queries with `$geometry` (polygon boundaries)
- Property tests that create jobs with coordinates

### Affected Features
- ❌ Task 10.3: Map view with boundary filtering
- ❌ Task 10.4: Property tests for map view
- ⚠️ Task 10.2: Map search API (partially working)
- ✅ Task 10.1: Geo indexes (created but not usable)
- ✅ Task 10.5: Bilingual support (working)

## Recommendation

**Fix the JobPosting model schema before proceeding with map view implementation.**

The property tests have done their job - they've identified a critical issue that would have caused problems in production. The tests themselves are correct; the model schema needs to be fixed.

### Steps to Fix:
1. Update `backend/src/models/JobPosting.js` with Option 1 schema
2. Run migration script to update existing jobs (if any)
3. Update all job creation code to use new schema
4. Re-run property tests to verify fix
5. Update map search API to use correct field paths

## Files Involved
- `backend/src/models/JobPosting.js` - Model schema (needs fix)
- `backend/tests/geographic-boundary-filtering.property.test.js` - Property tests (correct)
- `backend/tests/map-marker-completeness.property.test.js` - Property tests (correct)
- `backend/tests/mapSearch.test.js` - Integration tests (also failing due to same issue)

## Conclusion

The property tests are **working correctly** and have successfully identified a real issue with the data model. This is exactly what property-based testing is designed to do - find edge cases and issues that unit tests might miss.

**Status**: Tests are correct, model needs fixing.

---

**Date**: 2026-03-04  
**Author**: Kiro AI Assistant  
**Related Tasks**: 10.3, 10.4 from advanced-search-filter spec
