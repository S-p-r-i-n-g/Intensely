# Phase 5 API Documentation

## Overview

Phase 5 introduces user engagement features including favorites, personal records tracking, ratings/reviews, and workout session management. All endpoints require authentication unless otherwise specified.

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

---

## Favorites API

### Exercise Favorites

#### Add Exercise to Favorites
```http
POST /api/favorites/exercises/:exerciseId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Exercise added to favorites",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "exerciseId": "uuid",
    "exercise": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Remove Exercise from Favorites
```http
DELETE /api/favorites/exercises/:exerciseId
Authorization: Bearer <token>
```

#### Get User's Favorite Exercises
```http
GET /api/favorites/exercises
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "exerciseId": "uuid",
      "exercise": {
        "name": "Push-ups",
        "difficulty": "beginner",
        ...
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Workout Favorites

#### Add Workout to Favorites
```http
POST /api/favorites/workouts/:workoutId
Authorization: Bearer <token>
```

#### Remove Workout from Favorites
```http
DELETE /api/favorites/workouts/:workoutId
Authorization: Bearer <token>
```

#### Get User's Favorite Workouts
```http
GET /api/favorites/workouts
Authorization: Bearer <token>
```

**Response:** Returns workouts with full circuit and exercise details.

---

## Progress & Personal Records API

### Log Exercise Progress

```http
POST /api/progress/exercises/:exerciseId
Authorization: Bearer <token>

Content-Type: application/json
{
  "maxReps": 25,
  "maxDurationSeconds": 60,
  "maxWeight": 10.5,
  "notes": "Felt great today!",
  "achievedAt": "2024-01-01T12:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "isNewPR": true,
  "message": "🎉 New personal record!",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "exerciseId": "uuid",
    "maxReps": 25,
    "maxDurationSeconds": 60,
    "maxWeightKg": 10.5,
    "timesPerformed": 5,
    "notes": "Felt great today!",
    "exercise": { ... }
  }
}
```

**Notes:**
- Only values that exceed previous records will be updated
- `isNewPR` indicates if any personal record was broken
- `timesPerformed` automatically increments

### Get Exercise Progress

```http
GET /api/progress/exercises/:exerciseId
Authorization: Bearer <token>
```

### Get All Progress

```http
GET /api/progress/exercises?sortBy=updatedAt&order=desc
Authorization: Bearer <token>
```

**Query Parameters:**
- `sortBy`: Field to sort by (default: `updatedAt`)
- `order`: `asc` or `desc` (default: `desc`)

### Get Progress Summary

```http
GET /api/progress/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalExercisesTracked": 15,
    "totalPerformances": 120,
    "recentImprovements": 5,
    "topExercises": [
      {
        "exerciseName": "Push-ups",
        "timesPerformed": 25,
        "maxReps": 30,
        "maxDurationSeconds": null
      }
    ]
  }
}
```

### Delete Exercise Progress

```http
DELETE /api/progress/exercises/:exerciseId
Authorization: Bearer <token>
```

---

## Ratings & Reviews API

### Rate a Workout

```http
POST /api/ratings/workouts/:workoutId
Authorization: Bearer <token>

Content-Type: application/json
{
  "historyId": "uuid",  // Optional: specific history entry to rate
  "rating": 5,          // 1-5 stars
  "difficulty": 3,      // 1-5 scale
  "review": "Great workout! Really felt the burn."
}
```

**Notes:**
- If `historyId` is not provided, rates the most recent completed workout
- Rating and difficulty must be between 1-5
- Automatically updates the workout's average rating

**Response:**
```json
{
  "success": true,
  "message": "Rating saved",
  "data": {
    "id": "uuid",
    "workoutId": "uuid",
    "userRating": 5,
    "perceivedDifficulty": 3,
    "notes": "Great workout! Really felt the burn.",
    ...
  }
}
```

### Get Workout Ratings

```http
GET /api/ratings/workouts/:workoutId?includeReviews=true
```

**Public endpoint** - No authentication required.

**Query Parameters:**
- `includeReviews`: `true` or `false` (default: `true`)

**Response:**
```json
{
  "success": true,
  "data": {
    "workout": {
      "id": "uuid",
      "name": "Morning HIIT",
      "averageRating": 4.5,
      "totalRatings": 10,
      "timesCompleted": 15
    },
    "statistics": {
      "averageDifficulty": "3.2",
      "ratingDistribution": {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        "5": 4
      }
    },
    "reviews": [
      {
        "rating": 5,
        "difficulty": 3,
        "review": "Excellent workout!",
        "completedAt": "2024-01-01T12:00:00.000Z",
        "user": {
          "id": "uuid",
          "name": "John",
          "avatarUrl": "https://..."
        }
      }
    ]
  }
}
```

### Get My Ratings

```http
GET /api/ratings/me
Authorization: Bearer <token>
```

**Response:** Returns all workouts the user has rated.

### Delete a Rating

```http
DELETE /api/ratings/:historyId
Authorization: Bearer <token>
```

**Notes:**
- Clears rating fields but preserves the workout history entry
- Automatically recalculates the workout's average rating

---

## Workout Session API

Manage live workout sessions with progress tracking.

### Start a Workout Session

```http
POST /api/sessions/start
Authorization: Bearer <token>

Content-Type: application/json
{
  "workoutId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workout session started",
  "data": {
    "sessionId": "uuid",
    "workout": {
      "id": "uuid",
      "name": "Morning HIIT",
      "totalCircuits": 3,
      "setsPerCircuit": 4,
      "intervalSeconds": 20,
      "restSeconds": 60,
      "totalExercises": 12
    },
    "circuits": [
      {
        "id": "uuid",
        "order": 1,
        "exercises": [
          {
            "id": "uuid",
            "exerciseId": "uuid",
            "order": 1,
            "name": "Push-ups",
            "reps": 15,
            "durationSeconds": 30,
            "instructions": [...]
          }
        ]
      }
    ],
    "startedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Get Session State

```http
GET /api/sessions/:sessionId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "workoutId": "uuid",
    "workoutSnapshot": {...},
    "startedAt": "2024-01-01T12:00:00.000Z",
    "completedAt": null,
    "elapsedSeconds": 600,
    "circuitsCompleted": 1,
    "totalExercisesCompleted": 4,
    "completionPercentage": 33.33,
    "isActive": true
  }
}
```

### Update Session Progress

```http
PATCH /api/sessions/:sessionId/progress
Authorization: Bearer <token>

Content-Type: application/json
{
  "circuitsCompleted": 2,
  "totalExercisesCompleted": 8,
  "completionPercentage": 66.67
}
```

**Notes:**
- Call this endpoint as the user progresses through the workout
- Cannot update a completed session

### Complete a Session

```http
POST /api/sessions/:sessionId/complete
Authorization: Bearer <token>

Content-Type: application/json
{
  "circuitsCompleted": 3,
  "totalExercisesCompleted": 12,
  "completionPercentage": 100,
  "estimatedCaloriesBurned": 250,
  "perceivedDifficulty": 4,
  "notes": "Great workout!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workout completed! Great job!",
  "data": {
    "sessionId": "uuid",
    "durationSeconds": 1200,
    "completionPercentage": 100,
    "estimatedCaloriesBurned": 250
  }
}
```

**Notes:**
- Automatically calculates duration based on start/end times
- Increments the workout's `timesCompleted` counter
- Session can now be rated via the Ratings API

### Cancel a Session

```http
DELETE /api/sessions/:sessionId
Authorization: Bearer <token>
```

**Notes:**
- Completely removes the session record
- Use this if the user abandons a workout

### Get Active Sessions

```http
GET /api/sessions/active
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "uuid",
      "workoutId": "uuid",
      "workoutName": "Morning HIIT",
      "startedAt": "2024-01-01T12:00:00.000Z",
      "elapsedSeconds": 300,
      "completionPercentage": 25
    }
  ]
}
```

**Notes:**
- Returns all uncompleted sessions for the user
- Useful for resuming interrupted workouts

---

## Typical User Flow Examples

### Example 1: Favorite an Exercise
```javascript
// User browses exercises and favorites one
const response = await fetch('/api/favorites/exercises/abc-123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Later, get all favorites
const favorites = await fetch('/api/favorites/exercises', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Example 2: Track a Personal Record
```javascript
// After completing push-ups, log new PR
const response = await fetch('/api/progress/exercises/abc-123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    maxReps: 50,
    notes: 'New PR! Felt strong today.'
  })
});

// Response shows if it's a new PR
const { isNewPR, message } = await response.json();
// message: "🎉 New personal record!"
```

### Example 3: Complete a Workout with Rating
```javascript
// 1. Start workout session
const startResp = await fetch('/api/sessions/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ workoutId: 'workout-123' })
});
const { sessionId } = (await startResp.json()).data;

// 2. Update progress as user works out
await fetch(`/api/sessions/${sessionId}/progress`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    circuitsCompleted: 1,
    totalExercisesCompleted: 4,
    completionPercentage: 33.33
  })
});

// 3. Complete the workout
const completeResp = await fetch(`/api/sessions/${sessionId}/complete`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    circuitsCompleted: 3,
    totalExercisesCompleted: 12,
    completionPercentage: 100,
    estimatedCaloriesBurned: 250,
    perceivedDifficulty: 4
  })
});

// 4. Rate the workout
await fetch('/api/ratings/workouts/workout-123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 5,
    difficulty: 4,
    review: 'Amazing workout! Really challenged me.'
  })
});
```

---

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Status Codes

- `200 OK` - Successful GET/DELETE request
- `201 Created` - Successful POST request creating a resource
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Notes

### Schema Fixes Applied in Phase 5

Several schema mismatches were identified and fixed:
- `UserExerciseProgress.maxWeight` → `maxWeightKg` (line 401 in schema)
- `UserExerciseProgress.lastImprovedAt` field removed (didn't exist in schema, using `updatedAt` instead)

### Rate Limiting

Consider implementing rate limiting on the following endpoints in production:
- POST `/api/favorites/*` - Prevent spam favoriting
- POST `/api/progress/*` - Prevent spam PR logging
- POST `/api/ratings/*` - Prevent review bombing

### Caching Recommendations

Consider caching these public endpoints:
- GET `/api/ratings/workouts/:workoutId` - Cache for 5-10 minutes
- Invalidate cache when new ratings are posted

---

## Testing Phase 5 Endpoints

### Prerequisites
1. Set up Supabase authentication
2. Create a test user and obtain JWT token
3. Ensure database is populated with exercises and workouts

### Test Checklist
- [ ] Add/remove exercise favorites
- [ ] Add/remove workout favorites
- [ ] Log exercise progress and verify PR detection
- [ ] View progress summary
- [ ] Rate a completed workout
- [ ] View workout ratings (public)
- [ ] Start a workout session
- [ ] Update session progress
- [ ] Complete a session
- [ ] View active sessions

---

## Phase 5 Implementation Summary

**Total New Endpoints:** 23

- Favorites API: 6 endpoints
- Progress API: 5 endpoints
- Ratings API: 4 endpoints
- Sessions API: 6 endpoints
- Health Check: 2 endpoints (existing)

**Files Created:**
- `/backend/src/controllers/favorites.controller.ts`
- `/backend/src/controllers/progress.controller.ts`
- `/backend/src/controllers/ratings.controller.ts`
- `/backend/src/controllers/workout-session.controller.ts`
- `/backend/src/routes/favorites.routes.ts`
- `/backend/src/routes/progress.routes.ts`
- `/backend/src/routes/ratings.routes.ts`
- `/backend/src/routes/workout-session.routes.ts`

**Files Modified:**
- `/backend/src/index.ts` - Added route registrations

**Status:** ✅ All Phase 5 features implemented and server running successfully.
