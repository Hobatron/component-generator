# Firebase Performance Optimization Guide

## Performance Logging Added

All services now include detailed performance logging. Open your browser console to see timing information.

## Common Performance Issues & Solutions

### 1. **Cold Start / First Load**

**Symptoms:** Initial page load is slow (2-5 seconds)
**Causes:**

- Firebase SDK initialization
- Network latency to Firestore
- Authentication check
- First-time data fetch

**Solutions:**

- ✅ Already implemented: Caching in `CategorySchemaService`
- Consider: Add loading skeletons/spinners
- Consider: Preload critical data in app initialization

### 2. **Multiple Firestore Reads**

**Symptoms:** Console shows many separate Firestore calls
**Causes:**

- Loading schemas and items separately
- No batching of requests
- Re-fetching on every navigation

**Solutions:**

- ✅ Already implemented: Schema caching
- Consider: Batch reads using `getDocs()` with multiple paths
- Consider: Use Firestore's `onSnapshot()` for real-time updates (reduces re-fetching)

### 3. **Observable Setup Overhead**

**Symptoms:** Component constructor takes long time
**Causes:**

- Setting up multiple observables
- Synchronous operations in constructor
- Complex template bindings

**Solutions:**

- Move heavy operations to `ngOnInit()` lifecycle hook
- Use `async` pipe in templates (already doing this)
- Consider lazy loading routes

### 4. **Network Latency**

**Symptoms:** Firestore fetch times > 500ms
**Causes:**

- Geographic distance to Firestore region
- Slow internet connection
- Large document sizes

**Solutions:**

- Check Firestore region (should be close to users)
- Enable Firestore offline persistence
- Reduce document size (remove unnecessary fields)

### 5. **Change Detection Issues**

**Symptoms:** UI updates slowly after data arrives
**Causes:**

- Too many change detection cycles
- Complex template expressions
- Large lists without `trackBy`

**Solutions:**

- ✅ Already using: `OnPush` change detection
- ✅ Already using: `trackBy` in `@for` loops
- Use signals for state management (already doing this)

## How to Use the Logs

### 1. Open Browser Console

Press F12 and go to Console tab

### 2. Filter Logs

Type one of these in the filter box:

- `[CategorySchemaService]` - Schema loading
- `[ItemService]` - Item operations
- `[ProjectService]` - Project loading
- `[SectionComponent]` - Component lifecycle

### 3. Analyze Timing

Look for:

- **< 100ms** - Excellent (cached or local)
- **100-500ms** - Good (normal Firestore fetch)
- **500-1000ms** - Slow (investigate network/data size)
- **> 1000ms** - Very slow (optimization needed)

## Quick Wins

### Enable Firestore Offline Persistence

Add to `app.config.ts`:

```typescript
import { enableIndexedDbPersistence } from '@angular/fire/firestore';

// In providers array:
provideFirestore(() => {
  const firestore = getFirestore();
  enableIndexedDbPersistence(firestore);
  return firestore;
});
```

### Add Loading States

```typescript
protected readonly isLoading = signal(true);

this.sectionItems$.subscribe(items => {
  this.isLoading.set(false);
});
```

### Use Firestore Indexes

Check Firebase Console → Firestore → Indexes
Create composite indexes for complex queries

### Optimize Data Structure

- Keep documents small (< 1MB)
- Denormalize data when needed
- Use subcollections for large datasets

## Monitoring Checklist

Run through these when investigating slow loads:

- [ ] Check console logs for timing breakdown
- [ ] Verify cache hits vs misses
- [ ] Check network tab for Firestore requests
- [ ] Look for duplicate/redundant fetches
- [ ] Measure total time from navigation to render
- [ ] Test on different network speeds (Chrome DevTools → Network → Throttling)
- [ ] Check Firebase Console → Performance for backend metrics

## Expected Timings (Baseline)

With good network and nearby Firestore region:

- Schema load (cached): < 1ms
- Schema load (uncached): 100-300ms
- Items load: 150-400ms
- Component initialization: < 50ms
- Total page load: 200-500ms

If you're seeing significantly higher numbers, investigate using the logs!
