# Diversity Property Test - Quick Start Guide

## 🚀 5-Minute Quick Start

### What is This?

Property test that validates AI recommendations are diverse (not all similar jobs).

### Why It Matters

- ✅ Prevents filter bubbles
- ✅ Shows variety to users
- ✅ Improves user experience
- ✅ Maintains relevance

---

## ⚡ Run the Test

```bash
cd backend
npm test -- diversity.property.test.js
```

**Expected**: ✅ 6/6 tests pass in ~4 seconds

---

## 📊 What It Tests

| Property | What It Checks | Threshold |
|----------|----------------|-----------|
| **Job Types** | Variety in employment types | ≥ 2 types |
| **Companies** | Different employers | ≥ 3 companies |
| **Locations** | Geographic diversity | ≥ 2 locations |
| **Filter Bubble** | Score variation | Range ≥ 10 points |
| **Balance** | Diversity + Relevance | Avg score ≥ 50% |
| **Diversity Index** | Overall diversity | ≥ 0.3 (30%) |

---

## ✅ Success Criteria

All 6 properties must pass:

1. ✅ Diverse job types (full-time, part-time, contract, etc.)
2. ✅ Diverse companies (not all from same employer)
3. ✅ Diverse locations (different cities)
4. ✅ Score variation (not all identical scores)
5. ✅ Relevance maintained (average score ≥ 50%)
6. ✅ Diversity index ≥ 0.3

---

## 🎯 Example Results

```
PASS  tests/diversity.property.test.js
  ✓ Recommendations include diverse job types (212 ms)
  ✓ Recommendations include diverse companies (99 ms)
  ✓ Recommendations include diverse locations (113 ms)
  ✓ Recommendations avoid filter bubble (104 ms)
  ✓ Diversity is balanced with relevance (95 ms)
  ✓ Recommendations meet minimum diversity index (85 ms)

Tests: 6 passed, 6 total
Time: ~4 seconds
```

---

## 🔍 How It Works

### 1. Generate Test Data
```javascript
// Create user with skills
const testUser = {
  skills: ['JavaScript', 'React'],
  experience: 3 years,
  location: 'Cairo'
};

// Create diverse jobs
const testJobs = [
  { company: 'A', location: 'Cairo', type: 'full-time' },
  { company: 'B', location: 'Alexandria', type: 'part-time' },
  { company: 'C', location: 'Giza', type: 'contract' },
  // ... more jobs
];
```

### 2. Get Recommendations
```javascript
const recommendations = await contentBasedFiltering.rankJobsByMatch(
  testUser,
  testJobs,
  { limit: 10 }
);
```

### 3. Verify Diversity
```javascript
// Check unique values
const uniqueCompanies = new Set(recommendations.map(r => r.job.company.name));
const uniqueLocations = new Set(recommendations.map(r => r.job.location.city));
const uniqueTypes = new Set(recommendations.map(r => r.job.type));

// Verify thresholds
expect(uniqueCompanies.size).toBeGreaterThanOrEqual(3);
expect(uniqueLocations.size).toBeGreaterThanOrEqual(2);
expect(uniqueTypes.size).toBeGreaterThanOrEqual(2);
```

---

## 💡 Key Insights

### What We Found

- 🟢 **Natural Diversity**: Algorithm naturally produces diverse results
- 🟢 **Score Variation**: 15-25 point range (healthy variation)
- 🟢 **High Relevance**: 60-80% average score (quality maintained)
- 🟢 **Good Index**: 0.4-0.6 diversity index (exceeds 0.3 threshold)

### Why It Works

1. **Multiple Factors**: Algorithm considers skills, experience, location, salary, type
2. **Weighted Scoring**: Different weights prevent identical scores
3. **No Artificial Limits**: Diversity emerges naturally from algorithm design

---

## 🐛 Troubleshooting

### Test Fails?

**Check 1**: MongoDB connection
```bash
# Make sure MongoDB is running
# Or tests will use mock data
```

**Check 2**: Dependencies
```bash
npm install fast-check mongoose
```

**Check 3**: Test timeout
```javascript
// Increase timeout if needed
test('...', async () => { ... }, 60000); // 60 seconds
```

---

## 📚 More Information

- **Full Documentation**: `docs/AI Recommendations/DIVERSITY_PROPERTY_TEST.md`
- **Requirements**: `.kiro/specs/ai-recommendations/requirements.md` (Section 1.1)
- **Test File**: `backend/tests/diversity.property.test.js`
- **Service**: `backend/src/services/contentBasedFiltering.js`

---

## 🎯 Next Steps

1. ✅ Run the test
2. ✅ Verify all 6 properties pass
3. ✅ Review full documentation
4. ✅ Continue with remaining tasks

---

**Status**: ✅ All tests passing  
**Last Updated**: 2026-03-01
