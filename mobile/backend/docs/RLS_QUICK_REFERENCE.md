# RLS Quick Reference

## Summary
All 14 Supabase database tables now have Row Level Security (RLS) enabled with 56 security policies. This fixes all security linter errors.

## What Changed
✅ **Before**: All tables exposed without access control (security vulnerability)
✅ **After**: Database-level security enforces user isolation and access control

## Key Security Features

### User Data Protection
- Users can only access their own data (workouts, history, preferences)
- Authentication required via Supabase Auth JWT tokens
- User IDs automatically validated against `auth.uid()`

### Public Data
- Exercise families and verified exercises are publicly readable
- Active workout objectives are public
- Public workouts are accessible to all users

### Access Control
- Private workouts only accessible by creator
- Circuits and exercises inherit parent workout permissions
- Workout history and progress are strictly user-isolated

## Testing RLS

### Quick Verification
```bash
cd backend
node scripts/verify-rls.js
```

### Expected Output
```
✅ ENABLED  _prisma_migrations
✅ ENABLED  users
✅ ENABLED  exercises
... (all 14 tables)
✅ SUCCESS: All tables have Row Level Security enabled!
```

## Important: API Authentication

### Client Apps (Mobile/Web)
Use the **anon key** - RLS policies are enforced:
```env
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Admin/Backend Operations
Use the **service role key** - bypasses RLS (use with caution):
```env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Issues

### "permission denied for table"
**Cause**: Missing or invalid authentication token
**Fix**: Ensure client includes valid Supabase Auth JWT in request headers

### "new row violates row-level security policy"
**Cause**: Trying to insert data with wrong user_id or created_by
**Fix**: Ensure user_id/created_by matches `auth.uid()` from JWT

## Files Created

1. **Migration**: `prisma/migrations/20260114000000_enable_rls/migration.sql`
2. **Documentation**: `docs/RLS_IMPLEMENTATION.md` (comprehensive guide)
3. **Scripts**:
   - `scripts/apply-rls-migration.js` - Apply migration
   - `scripts/verify-rls.js` - Verify RLS status

## Checkpoint Created

**DATABASE_SECURITY_RLS (2026-01-14)** - Database is now production-ready with full security enabled.

---

For detailed information, see `RLS_IMPLEMENTATION.md`.
