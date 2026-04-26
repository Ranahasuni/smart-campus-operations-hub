# Quick Start - Build & Test the Performance Fixes

## Prerequisites
- JDK 17+
- Maven 3.8+
- Node.js 16+ & npm
- MongoDB running and accessible

## Step 1: Build Backend

```bash
cd smart-campus-operations-hub/backend

# Clean build
mvn clean package

# Run the application
mvn spring-boot:run
```

**Expected Output:**
```
✅ All MongoDB indexes created successfully!
Started SmartCampusApplication in X.XXX seconds
```

**What's happening:**
- MongoIndexConfig automatically creates all database indexes on startup
- Connection pool is initialized with 10-50 connections
- Application is ready on http://localhost:8082

## Step 2: Build Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Expected URL:**
- Frontend: http://localhost:5173

## Step 3: Test the Fixes

### 1. Test Timeout & Retry (Simulate Network Issues)

```bash
# Terminal 1: Stop MongoDB temporarily
# This simulates a network error

# Then try to fetch data from the app
# Expected: Error message after 30 seconds, with retry button
# The app should retry 3 times automatically before showing error
```

### 2. Test Pagination (Verify Performance)

```bash
# Navigate to Tickets page
# Expected: Should load in <2 seconds (much faster than before)

# In browser DevTools:
# 1. Open Network tab
# 2. Click "Get Tickets"
# 3. Check response time and payload size
#    - Should be <500ms
#    - Payload should be smaller (max 100 records)
```

### 3. Test Error Handling

```bash
# In browser console:
api.get('/api/tickets/invalid-id')
  .catch(err => console.log(handleApiError(err)))

# Expected: User-friendly error message like:
# "The requested resource was not found."
```

### 4. Check Database Indexes

```bash
# MongoDB shell
use smart_campus_db
db.Ticket.getIndexes()

# Expected: Should see multiple indexes including:
# - idx_userId_desc
# - idx_status_asc
# - idx_resourceId_asc
# - etc.
```

### 5. Monitor Connection Pool

```bash
# Check application logs for connection pool info
# Should see successful connections with pool size info
```

## Step 4: Performance Verification

### Browser DevTools (F12)

1. **Network Tab:**
   - Check response times
   - Before: 3-5 seconds
   - After: <500ms

2. **Console Tab:**
   - Should see no errors about timeouts
   - Should see error boundary messages if any component errors occur

3. **Performance Tab:**
   - Run Lighthouse audit
   - Performance score should be good

### Backend Logs

Look for:
```
✓ Index created: Ticket.userId
✓ Index created: Resource.building
... (multiple index creation messages)
✅ All MongoDB indexes created successfully!
```

This indicates indexes are being used efficiently.

## Troubleshooting

### Problem: MongoDB Connection Timeout
**Solution:**
- Check if MongoDB is running
- Verify connection URI in application.properties
- Check network connectivity to MongoDB server

### Problem: Slow Queries Still
**Solution:**
- Verify indexes are created: `db.collection.getIndexes()`
- Check MongoDB logs for query performance
- Consider adding more indexes for frequently used queries

### Problem: Frontend Timeout Errors
**Solution:**
- Check if backend is running
- Verify baseURL in axiosInstance.js matches backend URL
- Check browser console for detailed error messages

### Problem: "All MongoDB indexes created successfully!" not appearing
**Solution:**
- Application might not be starting correctly
- Check for compilation errors in MongoIndexConfig.java
- Verify Spring Data MongoDB is properly configured

## Performance Benchmarks

Expected improvements:

| Operation | Before | After |
|-----------|--------|-------|
| Fetch all tickets | 3-5s | <500ms |
| Fetch user tickets | 2-3s | <300ms |
| Get resource list | 4-6s | <500ms |
| Filter resources | 2-4s | <200ms |
| Network timeout | Infinite | 30s |

## Next Optimization Steps

1. **Add Caching:** Use Redis for frequently accessed data
2. **Compress Responses:** Enable gzip compression
3. **Lazy Load:** Only load visible items in lists
4. **GraphQL:** More efficient data fetching
5. **CDN:** Cache static assets

## Support

If you encounter any issues:
1. Check PERFORMANCE_FIXES.md for detailed explanation
2. Review application logs for errors
3. Check MongoDB connection and indexes
4. Verify all files were properly modified

Good luck! 🚀
