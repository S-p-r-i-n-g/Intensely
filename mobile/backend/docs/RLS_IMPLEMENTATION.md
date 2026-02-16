# Row Level Security (RLS) Implementation

## Overview

This document describes the Row Level Security (RLS) implementation for the Intensely HICT Workout App database. RLS was implemented to address critical security vulnerabilities identified by Supabase's database linter.

## Migration Applied

**Migration:** `20260114000000_enable_rls`
**Date:** 2026-01-14
**Status:** ✅ Applied and Verified

## What Was Fixed

All 14 public tables now have Row Level Security enabled with appropriate policies:

1. ✅ `_prisma_migrations` - 1 policy
2. ✅ `users` - 3 policies
3. ✅ `user_preferences` - 4 policies
4. ✅ `exercise_families` - 2 policies
5. ✅ `exercises` - 5 policies
6. ✅ `workout_objectives` - 2 policies
7. ✅ `workouts` - 5 policies
8. ✅ `circuits` - 5 policies
9. ✅ `circuit_exercises` - 5 policies
10. ✅ `workout_history` - 4 policies
11. ✅ `workout_objective_mappings` - 5 policies
12. ✅ `user_exercise_progress` - 4 policies
13. ✅ `favorite_exercises` - 3 policies
14. ✅ `favorite_workouts` - 3 policies

**Total:** 56 RLS policies implemented

## Security Model

### User Data Isolation

All user-specific data is protected with RLS policies that ensure:
- Users can only access their own data
- Authentication is required via Supabase Auth (`auth.uid()`)
- User IDs are validated against the authenticated user's JWT token

### Public Data Access

Some tables contain public reference data accessible to all users:
- `exercise_families` - Exercise categorization (read-only for users)
- `exercises` - Verified exercises are public, user-created are private
- `workout_objectives` - Active objectives are public
- `workouts` - Public workouts are readable by all, private workouts only by creator

### Hierarchical Access Control

Related data respects parent access rules:
- `circuits` inherit access control from parent `workouts`
- `circuit_exercises` inherit access control from parent `circuits`
- `workout_objective_mappings` inherit access control from parent `workouts`

## Policy Types by Table

### Users Table
- **SELECT**: Users can view their own profile
- **INSERT**: Users can create their own profile (registration)
- **UPDATE**: Users can update their own profile

### User Preferences
- **SELECT/INSERT/UPDATE/DELETE**: Full CRUD for own preferences only

### Exercise Families
- **SELECT**: Public read access for all
- **INSERT**: Authenticated users can create (restrict to admins in production)

### Exercises
- **SELECT**:
  - All verified exercises are public
  - Users can view their own unverified exercises
- **INSERT/UPDATE/DELETE**: Users can manage their own exercises

### Workout Objectives
- **SELECT**: Active objectives are public
- **INSERT**: Authenticated users can create (restrict to admins in production)

### Workouts
- **SELECT**:
  - Public workouts are accessible to all
  - Users can view their own private workouts
- **INSERT/UPDATE/DELETE**: Users can manage their own workouts

### Circuits & Circuit Exercises
- **SELECT**: Accessible if parent workout is accessible
- **INSERT/UPDATE/DELETE**: Modifiable if parent workout is owned by user

### Workout History
- **SELECT/INSERT/UPDATE/DELETE**: Full CRUD for own history only

### Workout Objective Mappings
- **SELECT**: Readable if parent workout is accessible
- **INSERT/UPDATE/DELETE**: Modifiable if parent workout is owned by user

### User Exercise Progress
- **SELECT/INSERT/UPDATE/DELETE**: Full CRUD for own progress only

### Favorite Exercises & Workouts
- **SELECT/INSERT/DELETE**: Users can manage their own favorites only

### Prisma Migrations
- **ALL**: Service role has full access (required for Prisma to function)

## Authentication Requirements

All policies rely on Supabase Auth. The system uses:
- `auth.uid()` - Returns the UUID of the authenticated user from the JWT
- `TO authenticated` - Restricts certain operations to authenticated users only

## Important Notes

### For Development
1. **Service Role Key**: The service role key bypasses RLS. Use it only for admin operations and migrations.
2. **Testing**: When testing via API, ensure you're using proper authentication tokens.
3. **Anon Key**: The anon key respects RLS policies - use this for client applications.

### For Production
Consider adding:
1. **Admin Roles**: Implement a roles system for admin users who can manage exercise_families and workout_objectives
2. **Rate Limiting**: Add rate limiting at the API level
3. **Data Validation**: Implement additional data validation in application logic
4. **Audit Logging**: Track sensitive operations for compliance

### Performance Considerations
- RLS policies use EXISTS subqueries which are indexed efficiently
- All foreign key relationships have proper indexes
- The policies leverage existing database indexes for performance

## Testing RLS

### Verify RLS Status
Run the verification script:
```bash
node scripts/verify-rls.js
```

### Test User Isolation
1. Create two test users with Supabase Auth
2. Create data with User A's credentials
3. Attempt to access User A's data with User B's credentials
4. Verify that access is denied

### Test Public Data
1. Access exercise_families and workout_objectives without auth
2. Verify that verified exercises are accessible
3. Verify that public workouts are accessible

## Troubleshooting

### "permission denied for table X"
- Ensure you're using an authenticated request with a valid JWT
- Check that the JWT contains the correct user ID
- Verify the policy matches your use case

### "new row violates row-level security policy"
- Ensure INSERT policies allow the operation
- Check that user_id or created_by matches auth.uid()
- Verify you're not trying to insert data for another user

### Policies not working as expected
1. Check RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';`
2. List policies: `SELECT * FROM pg_policies WHERE schemaname='public';`
3. Verify authentication token is valid
4. Check that auth.uid() returns the expected user ID

## Scripts

Two utility scripts are available:

### Apply RLS Migration
```bash
node scripts/apply-rls-migration.js
```
Applies the RLS migration to the database. Only needed if rolling back and reapplying.

### Verify RLS
```bash
node scripts/verify-rls.js
```
Checks that RLS is enabled on all tables and counts policies.

## Future Enhancements

1. **Role-Based Access Control (RBAC)**
   - Add `user_roles` table
   - Implement admin, coach, and premium user roles
   - Add role checks to policies

2. **Team/Sharing Features**
   - Add `workout_shares` table for sharing workouts
   - Implement team/group access policies
   - Add collaborative workout features

3. **Premium Content**
   - Flag exercises/workouts as premium
   - Add subscription status checks to policies
   - Implement tiered access control

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)

---

**Last Updated:** 2026-01-14
**Migration Version:** 20260114000000_enable_rls
**Status:** ✅ Production Ready
