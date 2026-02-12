** This file is outdated. Please only use it for historical context. **

# Exercise Taxonomy Structure
## Version 1.0 | 2026-01-08

---

## Overview

The Exercise Taxonomy (ET) is the authoritative classification system for all exercises in Intensely. It enables intelligent workout curation, filtering, progression tracking, and ensures balanced circuit design.

---

## Taxonomy Dimensions

### 1. Primary Category
Top-level classification by body region or workout type.

| Category | Description | Exercise Count Target |
|----------|-------------|----------------------|
| **Upper Body Push** | Chest, shoulders, triceps | 20+ |
| **Upper Body Pull** | Back, biceps, forearms | 20+ |
| **Lower Body** | Quads, hamstrings, glutes, calves | 35+ |
| **Core** | Abs, obliques, lower back | 30+ |
| **Cardio** | Aerobic, cardiovascular endurance | 15+ |
| **Plyometric** | Explosive, jumping movements | 25+ |
| **Full Body** | Compound, multi-joint | 15+ |

**Total Target:** 160+ exercises minimum

---

### 2. Target Muscles

#### Primary Muscles
The main muscles being worked.

**Upper Body:**
- Chest (Pectorals)
- Shoulders (Deltoids: Anterior, Lateral, Posterior)
- Triceps
- Back (Lats, Rhomboids, Traps)
- Biceps
- Forearms

**Lower Body:**
- Quadriceps
- Hamstrings
- Glutes (Gluteus Maximus, Medius, Minimus)
- Calves (Gastrocnemius, Soleus)
- Hip Flexors
- Adductors/Abductors

**Core:**
- Rectus Abdominis (Six-pack)
- Obliques (Internal, External)
- Transverse Abdominis
- Lower Back (Erector Spinae)

#### Secondary Muscles
Supporting muscles engaged during the exercise.

---

### 3. Equipment Requirements

| Equipment | Description | Priority for HICT |
|-----------|-------------|-------------------|
| **Bodyweight** | No equipment needed | ⭐⭐⭐ High |
| **Pull-up Bar** | Bar for hanging exercises | ⭐⭐⭐ High |
| **Chair/Bench** | Elevated surface | ⭐⭐⭐ High |
| **Wall** | Vertical support | ⭐⭐ Medium |
| **Resistance Band** | Elastic bands | ⭐⭐ Medium |
| **Dumbbells** | Free weights | ⭐ Low (future) |
| **Kettlebell** | Handled weight | ⭐ Low (future) |
| **Medicine Ball** | Weighted ball | ⭐ Low (future) |
| **Jump Rope** | Cardio equipment | ⭐⭐ Medium |
| **Box/Platform** | Elevated platform for jumps | ⭐⭐ Medium |

**MVP Focus:** Bodyweight, Pull-up Bar, Chair/Bench, Wall

---

### 4. Difficulty Level

| Level | Description | Characteristics | Target Audience |
|-------|-------------|-----------------|-----------------|
| **Beginner** | Entry-level movements | 5-12 reps, 20-30s holds, Modified positions | 0-6 months training |
| **Intermediate** | Standard movements | 12-20 reps, 30-60s holds, Full ROM | 6-18 months training |
| **Advanced** | Expert-level movements | 20+ reps, 60s+ holds, One-limb variations | 18+ months training |

**Progression Indicators:**
- Beginner → Intermediate: Can perform 15 reps with good form
- Intermediate → Advanced: Can perform 25 reps or progress to one-limb variation

---

### 5. Movement Patterns

Based on functional fitness classifications:

| Pattern | Description | Examples |
|---------|-------------|----------|
| **Push (Vertical)** | Overhead pressing | Handstand push-ups, pike push-ups |
| **Push (Horizontal)** | Chest pressing | Push-ups, dips |
| **Pull (Vertical)** | Pulling downward | Pull-ups, chin-ups |
| **Pull (Horizontal)** | Rowing | Inverted rows, bodyweight rows |
| **Squat** | Hip & knee flexion | Squats, pistol squats |
| **Hinge** | Hip flexion, knee stable | Good mornings, single-leg deadlifts |
| **Lunge** | Single-leg knee flexion | Forward lunges, Bulgarian split squats |
| **Rotation** | Twisting/rotating | Russian twists, bicycle crunches |
| **Anti-rotation** | Resisting rotation | Side planks, Pallof press variations |
| **Flexion** | Spine flexion | Crunches, V-ups |
| **Extension** | Spine extension | Superman holds, back extensions |
| **Locomotion** | Moving through space | Bear crawls, crab walks |
| **Jump** | Explosive vertical | Jump squats, tuck jumps |
| **Bound** | Explosive horizontal | Broad jumps, bounding |

---

### 6. Force Type

| Force | Description | Examples |
|-------|-------------|----------|
| **Push** | Pushing away from body | Push-ups, squats |
| **Pull** | Pulling toward body | Pull-ups, inverted rows |
| **Static** | Isometric hold | Planks, wall sits |

---

### 7. Mechanic Type

| Mechanic | Description | Joints Involved |
|----------|-------------|-----------------|
| **Isolation** | Single joint movement | One primary joint |
| **Compound** | Multi-joint movement | Multiple joints |

**HICT Preference:** Compound movements (more muscles, more calories, more functional)

---

### 8. Exercise Families & Variants

Track relationships between exercise variations.

**Structure:**
```
Exercise Family (Base)
├── Beginner Variant 1
├── Beginner Variant 2
├── Intermediate Variant 1
├── Intermediate Variant 2
├── Advanced Variant 1
└── Advanced Variant 2
```

**Example: Squat Family**
```
Squat (Base Family)
├── Wall Sits (Beginner)
├── Bodyweight Squats (Beginner)
├── Jump Squats (Intermediate)
├── Sumo Squats (Intermediate)
├── Cossack Squats (Intermediate)
├── Pistol Squats (Advanced)
├── Shrimp Squats (Advanced)
└── Sissy Squats (Advanced)
```

**Major Families:**
1. Squat Family (12+ variants)
2. Push-up Family (15+ variants)
3. Plank Family (15+ variants)
4. Lunge Family (10+ variants)
5. Pull-up Family (15+ variants)
6. Burpee Family (8+ variants)
7. Leg Raise Family (8+ variants)

---

### 9. Intensity Modifiers

| Modifier | Description | Effect |
|----------|-------------|--------|
| **Explosive** | Fast, powerful movements | +25% intensity |
| **Slow/Tempo** | Controlled speed | +15% intensity, +form focus |
| **Pause** | Hold at position | +20% intensity |
| **Pulse** | Small range mini-reps | +15% intensity |
| **Isometric** | Static hold | Endurance focus |

**Example Applications:**
- Jump Squats = Explosive Squats
- Tempo Push-ups = 3-second down, 1-second up
- Pause Squats = Hold at bottom for 2 seconds
- Squat Pulses = Mini reps at bottom position

---

### 10. Suitability Tags

Boolean flags for workout context.

| Tag | Description |
|-----|-------------|
| **HICT_Suitable** | Good for circuit training |
| **Small_Space** | Requires <6 feet of space |
| **Quiet** | Low impact, apartment-friendly |
| **Cardio_Intensive** | Significantly raises heart rate |
| **Strength_Focus** | Primarily strength building |
| **Mobility_Focus** | Improves flexibility/ROM |
| **Beginner_Friendly** | Safe for complete beginners |
| **Minimal_Transition** | Easy to switch to/from |

---

## Taxonomy Data Structure

### Exercise Object Schema

```json
{
  "id": "uuid-string",
  "name": "Exercise Name",
  "slug": "exercise-name",
  "family_id": "uuid-string-of-parent-family",

  "taxonomy": {
    "primary_category": "Upper Body Push|Upper Body Pull|Lower Body|Core|Cardio|Plyometric|Full Body",
    "difficulty": "beginner|intermediate|advanced",
    "equipment": ["bodyweight", "pull-up-bar", "chair"],

    "muscles": {
      "primary": ["chest", "triceps"],
      "secondary": ["shoulders", "core"]
    },

    "movement_pattern": "push_horizontal",
    "force_type": "push",
    "mechanic": "compound|isolation",

    "tags": {
      "hict_suitable": true,
      "small_space": true,
      "quiet": true,
      "cardio_intensive": false,
      "strength_focus": true,
      "mobility_focus": false,
      "beginner_friendly": true,
      "minimal_transition": true
    }
  },

  "content": {
    "description": "Brief description of the exercise",
    "instructions": [
      "Step 1",
      "Step 2",
      "Step 3"
    ],
    "tips": [
      "Keep core tight",
      "Don't lock elbows"
    ],
    "common_mistakes": [
      "Sagging hips",
      "Flared elbows"
    ],
    "breathing": "Exhale on exertion, inhale on return"
  },

  "media": {
    "thumbnail_url": "https://cdn.intensely.app/exercises/thumbnails/push-up.jpg",
    "gif_url": "https://cdn.intensely.app/exercises/gifs/push-up.gif",
    "video_url": "https://cdn.intensely.app/exercises/videos/push-up.mp4",
    "images": [
      "https://cdn.intensely.app/exercises/images/push-up-1.jpg",
      "https://cdn.intensely.app/exercises/images/push-up-2.jpg"
    ]
  },

  "metrics": {
    "default_reps": 10,
    "default_duration_seconds": 30,
    "calories_per_minute": 8,
    "met_value": 3.8
  },

  "metadata": {
    "created_at": "2026-01-08T00:00:00Z",
    "updated_at": "2026-01-08T00:00:00Z",
    "created_by": "system|user_id",
    "is_verified": true,
    "popularity_score": 95
  }
}
```

---

## Filtering & Search Strategy

### Primary Filters
1. **By Category** - Upper Push, Upper Pull, Lower, Core, Cardio, Plyo, Full Body
2. **By Difficulty** - Beginner, Intermediate, Advanced
3. **By Equipment** - Bodyweight only, With pull-up bar, With chair, etc.
4. **By Muscle Group** - Chest, Back, Legs, Core, etc.
5. **By Tags** - HICT suitable, Quiet, Small space, etc.

### Secondary Filters
6. **By Movement Pattern** - Push, Pull, Squat, Hinge, etc.
7. **By Exercise Family** - Show all squat variants, all push-up variants
8. **By Force Type** - Push, Pull, Static
9. **By Intensity** - Explosive, Slow tempo, Isometric

### Search Features
- **Text Search** - Name, description, instructions
- **Muscle Search** - "chest exercises", "leg exercises"
- **Combined Filters** - "beginner bodyweight chest exercises"

---

## Workout Curation Logic

### Balanced Circuit Rules
1. **Alternate muscle groups** - Don't do 2 push exercises in a row
2. **Mix movement patterns** - Push → Pull → Squat → Core
3. **Difficulty consistency** - All exercises match user's level
4. **Equipment availability** - Only use available equipment
5. **Space constraints** - Filter by small_space if needed
6. **Quiet requirement** - Filter by quiet tag if needed

### Example Circuit (3x3x20+60x3)

**Circuit 1:**
1. Push (Upper Body Push) - Push-ups
2. Pull (Upper Body Pull) - Inverted Rows
3. Squat (Lower Body) - Bodyweight Squats

**Circuit 2:**
4. Core (Core) - Planks
5. Cardio (Plyometric) - Jumping Jacks
6. Push (Upper Body Push) - Pike Push-ups

**Circuit 3:**
7. Lunge (Lower Body) - Forward Lunges
8. Pull (Upper Body Pull) - Dead Hangs
9. Core (Core) - Mountain Climbers

**Logic:**
- All bodyweight exercises
- Mix of upper/lower/core
- Alternate push/pull
- Include cardio element
- Minimal transitions

---

## Progression System

### Vertical Progression (Harder Variants)
Move through difficulty levels within same family:
- Wall Push-ups → Knee Push-ups → Standard Push-ups → One-arm Push-ups

### Horizontal Progression (More Volume)
Increase reps, sets, or decrease rest:
- 10 reps → 15 reps → 20 reps
- 30s rest → 20s rest → 15s rest
- 3 sets → 4 sets → 5 sets

### Cross-Family Progression
Move to similar but more challenging family:
- Planks → Hollow Body Holds → L-sit Holds

---

## Implementation Priorities

### Phase 0 (Current - MVP Database)
- ✅ Define taxonomy structure
- ⏭️ Import Free Exercise DB
- ⏭️ Map Free Exercise DB to taxonomy
- ⏭️ Add missing HICT exercises (~40 exercises)
- ⏭️ Target: 200+ exercises total

### Phase 1 (Infrastructure)
- Implement taxonomy in database schema
- Create filtering APIs
- Build exercise browser UI
- Enable search functionality

### Phase 2 (Enhancement)
- Add exercise families/relationships
- Implement progression tracking
- Add user-created exercises
- Community contributions

### Phase 3 (Intelligence)
- ML-powered exercise recommendations
- Automatic progression suggestions
- Workout effectiveness tracking
- Personalized difficulty calibration

---

## Quality Standards

### Required Fields
Every exercise MUST have:
- Name
- Primary category
- Difficulty level
- Equipment requirements
- Primary muscles
- Basic instructions (3+ steps)
- At least 1 image

### Preferred Fields
Should have when possible:
- GIF or video demonstration
- Tips and common mistakes
- Secondary muscles
- Movement pattern
- Tags

### Verified Exercises
Exercises marked as verified meet all quality standards and have been reviewed for:
- Correct form demonstration
- Clear instructions
- Appropriate difficulty classification
- Proper muscle targeting

---

## Maintenance & Evolution

### Regular Updates
- **Monthly:** Add 5-10 new exercises
- **Quarterly:** Review and update difficulty levels based on user data
- **Annually:** Major taxonomy review and reorganization if needed

### User Contributions
- Users can suggest new exercises
- Submissions require review before adding to main taxonomy
- Popular user exercises promoted to verified status

### Analytics-Driven
- Track most-used exercises
- Identify gaps (e.g., not enough beginner lower body)
- Retire rarely-used exercises

---

## Next Steps

1. ✅ Taxonomy structure defined
2. ⏭️ Design database schema implementing this taxonomy
3. ⏭️ Download and import Free Exercise DB
4. ⏭️ Map Free Exercise DB fields to taxonomy
5. ⏭️ Create list of 40+ missing exercises to add
6. ⏭️ Source/create media for exercises

---

*Version 1.0 | Created: 2026-01-08*
*Target: 200+ exercises at MVP launch*
