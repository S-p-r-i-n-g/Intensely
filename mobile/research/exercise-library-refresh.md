# Exercise Library Refresh Plan

> **Purpose:** This document is a self-contained execution plan for Claude (chat or Claude Code) to consolidate, deduplicate, enrich, and export the app's exercise library. Feed this entire file as context at the start of a session, along with the current DB export CSV, to perform a full refresh.
>
> **Invocation:** This library should only be executed when explicitly requested. If you are unsure whether or not to invoke the contents of this library, always ask the user.
> **Last executed:** February 12, 2026
> **Result:** 219 exercises (111 updated + 108 new) across 30 families, 7 categories, 15 movement patterns

---

## 1. Project Context

### 1.1 What the app is

A fitness app focused on **home and outdoor workouts** — HIIT (High Intensity Interval Training), HICT (High Intensity Circuit Training), bodyweight calisthenics, compound movements, and optional light-weight exercises. **No gym required.** Users train in living rooms, garages, backyards, and parks.

### 1.2 What this library is for

The exercise library is the atomic unit of the app. Every workout is assembled from exercises in this table. The library must be:

- **Comprehensive** — covering the full movement vocabulary for home/outdoor HIIT and bodyweight training
- **Deduplicated** — one canonical entry per exercise, no near-duplicates (e.g., "Air Bike" and "Bicycle Crunch" are the same exercise)
- **Richly attributed** — every exercise has a complete set of metadata for filtering, programming, and display
- **Schema-compliant** — the CSV output must be a drop-in replacement for the database table

### 1.3 Equipment scope

The library includes exercises requiring ONLY:
- Bodyweight (primary)
- A bench, chair, or step (secondary)
- A pull-up bar or dip bars (secondary)
- A box or plyometric platform (secondary)
- A towel (edge case)

Exercises requiring dumbbells, kettlebells, barbells, bands, machines, or other gym equipment are **out of scope** unless the user explicitly requests expanding the equipment envelope.

---

## 2. Database Schema

The exercise table has **34 columns**. The CSV must match this schema exactly.

### 2.1 Identity columns

| Column | Type | Format | Notes |
|--------|------|--------|-------|
| `id` | string | UUID v4 | `"c2f938f7-1bc7-41dd-b98c-d9935012117c"` — generate for new exercises, preserve for existing |
| `name` | string | Title Case | The display name. Must be unique. |
| `slug` | string | lowercase-hyphenated | `"bodyweight-squat"` — auto-generated from name. Must be unique. |

### 2.2 Classification columns

| Column | Type | Allowed Values | Notes |
|--------|------|---------------|-------|
| `familyName` | string | See §3.1 | Groups exercise variants together (e.g., all push-up variants → `"Push-Up"`) |
| `primaryCategory` | string | `core`, `upper_body`, `lower_body`, `full_body`, `plyometric`, `cardio`, `mobility` | The primary training category for filtering. Only one value per exercise. |
| `difficulty` | string | `beginner`, `intermediate`, `advanced` | Relative difficulty for a general fitness population |
| `movementPattern` | string | See §3.2 | The biomechanical pattern |
| `forceType` | string | `push`, `pull`, `static` | Direction of force production. Can be null for mobility exercises. |
| `mechanic` | string | `compound`, `isolation` | Whether the movement crosses multiple joints. Can be null. |

### 2.3 Muscle columns

| Column | Type | Format | Notes |
|--------|------|--------|-------|
| `primaryMuscles` | string | JSON array of strings | `'["abdominals"]'` or `'["quadriceps", "glutes"]'` |
| `secondaryMuscles` | string | JSON array of strings | Can be `'[]'` if none |

**Muscle vocabulary (closed set — use only these values):**
`abdominals`, `abductors`, `adductors`, `biceps`, `calves`, `chest`, `forearms`, `glutes`, `hamstrings`, `hip flexors`, `lats`, `lower back`, `middle back`, `neck`, `obliques`, `quadriceps`, `shoulders`, `traps`, `triceps`

### 2.4 Equipment column

| Column | Type | Format | Notes |
|--------|------|--------|-------|
| `equipment` | string | JSON array of strings | Always includes `"bodyweight"`. May also include: `"bench"`, `"pull-up_bar"`, `"box"`, `"dip_bars"`, `"towel"`, `"exercise_ball"`, `"dumbbell"` |

### 2.5 Boolean flag columns

| Column | Type | What it means |
|--------|------|---------------|
| `hictSuitable` | boolean | Can this exercise be used in a timed HICT circuit? (Almost always `true` for this app) |
| `smallSpace` | boolean | Can be performed in a ~7×7 ft area |
| `quiet` | boolean | No jumping, stomping, or impact noise (apartment-friendly) |
| `cardioIntensive` | boolean | Significantly elevates heart rate when performed at pace (e.g., burpees, mountain climbers, jump squats) |
| `strengthFocus` | boolean | Primarily builds strength or muscular endurance |
| `mobilityFocus` | boolean | Primarily improves flexibility, range of motion, or joint health |
| `beginnerFriendly` | boolean | A person with no training background can safely attempt this |
| `minimalTransition` | boolean | Can transition to/from this exercise quickly in a circuit |

**Important:** These booleans should be assessed honestly per exercise. In the original DB, `cardioIntensive` was `false` for ALL 111 exercises, which was incorrect — exercises like jump squats, burpees, mountain climbers, and high knees are clearly cardio-intensive.

### 2.6 Content columns

| Column | Type | Format | Notes |
|--------|------|--------|-------|
| `description` | string | Plain text, 1-3 sentences | A concise description of what the exercise is and what it works |
| `instructions` | string | JSON array of strings | Step-by-step instructions, each element is one step |
| `tips` | string | JSON array of strings | Performance tips. Can be `'[]'` |
| `commonMistakes` | string | JSON array of strings | Common form errors. Can be `'[]'` |
| `breathing` | string | Plain text | Breathing cue (e.g., "Exhale as you press up, inhale as you lower") |

### 2.7 Defaults & metrics columns

| Column | Type | Notes |
|--------|------|-------|
| `defaultReps` | integer/null | Suggested rep count for rep-based exercises |
| `defaultDurationSeconds` | integer/null | Suggested hold time for isometric/timed exercises |
| `caloriesPerMinute` | float/null | Estimated calories burned per minute |
| `metValue` | float/null | Metabolic Equivalent of Task value |

### 2.8 Media & metadata columns

| Column | Type | Notes |
|--------|------|-------|
| `thumbnailUrl` | string/null | URL to thumbnail image |
| `gifUrl` | string/null | URL to animated GIF demonstration |
| `videoUrl` | string/null | URL to video demonstration |
| `isVerified` | boolean | Whether the exercise has been human-reviewed. Set `true` for existing verified exercises, `false` for new additions. |
| `popularityScore` | integer | Usage popularity. Default `0` for new exercises. |

---

## 3. Taxonomy Reference

### 3.1 Exercise Families (30 families as of last refresh)

Families group variants of the same base movement. This is critical for workout programming (e.g., "don't put two Push-Up family exercises back-to-back").

| Family | Example Members | Count |
|--------|----------------|-------|
| Crunch | Crunches, Air Bike, Bicycle Crunch, Cross-Body Crunch, Jackknife Sit-Up, Sit-Up, V-Up, Cocoons, Toe Touchers | 39 |
| Push-Up | Pushups, Diamond Push-Ups, Dive-Bomber, Incline, Decline, Pike, Plyo, Single-Arm, Scapular | 32 |
| Squat | Bodyweight Squat, Jump Squat, Pistol Squat, Sumo Squat Pulses, Wall Sit, Skater Squat | 17 |
| Plank | Plank, Side Bridge, Mountain Climbers, Plank Jacks, Plank Shoulder Taps, RKC Plank | 16 |
| Jump | Tuck Jump, Knee Tuck Jump, Star Jump, Box Jump, Jumping Jacks, Skaters | 14 |
| Lunge | Pulse Lunges, Bulgarian Split Squats, Cossack Lunges, Walking Lunges, Jumping Lunges | 11 |
| Glute Bridge | Butt Lift (Bridge), Single Leg Glute Bridge, Frog Pumps, Bridge Marches, Donkey Kicks | 10 |
| Leg Raise | Flutter Kicks, Scissor Kick, Hanging Leg Raise, Side Leg Raises | 9 |
| Running | High Knees, Butt Kicks, Lateral Shuffles, Wind Sprints, Running In Place | 8 |
| Stretch | 90/90 Hamstring, Lying Crossover, Lying Glute, Seated Glute | 7 |
| Pull-Up | Pullups, Chin-Up, Scapular Pull-Ups, V-Bar Pullup, Wide-Grip | 6 |
| Walk-Out | Inchworm, Ab Walk-Outs, Walk-Out Push-Ups, Inch Worm to Pike Push-Up | 5 |
| Superman | Superman, Contralateral Supermans, Lower Back Curl, Hyperextensions | 5 |
| Prone Raise | Floor T-Raises, Floor Y Raises, Reverse Snow Angels, Standing T-Raises | 5 |
| Isometric | Chest Squeezes, Seated Biceps, Neck Exercises | 5 |
| Burpee | Burpees, Burpees (No Push-Up) | 2 |
| Other families | Calf Raise, Core Stability, Crab, Crawl, Dip, Downward Dog, Hip Hinge, Hip Mobility, Kick-Through, Mobility, Quad Extension, Quadruped, Rotation, Row | 1-3 each |

**When adding new exercises:** Always assign a `familyName`. If it's a variant of an existing family, use that family name. If it's truly novel, create a new family — but this should be rare.

### 3.2 Movement Patterns (15 patterns as of last refresh)

| Pattern | Description | Example |
|---------|-------------|---------|
| `push` | Pressing away from body | Push-ups, Dips, Handstand Push-Ups |
| `pull` | Pulling toward body | Pull-ups, Rows, Prone Raises |
| `squat` | Bilateral knee-dominant lower body | Bodyweight Squat, Jump Squat, Wall Sit |
| `lunge` | Unilateral/split-stance lower body | Lunges, Bulgarian Split Squats, Step-Ups |
| `hip-hinge` | Hip-dominant posterior chain | Glute Bridge, RDL, Good Morning, Superman |
| `anti-flexion` | Resisting spinal flexion (most crunches) | Crunches, Sit-Ups, V-Ups, Leg Raises |
| `anti-extension` | Resisting spinal extension | Planks, Dead Bug, Hollow Body Hold |
| `rotation` | Producing or controlling rotation | Russian Twist, Windshield Wipers, Hip Plank Drops |
| `anti-rotation` | Resisting rotation | Plank Shoulder Taps, Isometric Wipers |
| `anti-lateral-flexion` | Resisting lateral bending | Side Plank, Side Bridge |
| `lateral-flexion` | Producing lateral bending | Oblique Crunches, Heel Taps |
| `locomotion` | Moving through space | Mountain Climbers, Bear Crawl, Running, High Knees |
| `static` | Isometric hold, no movement | Stretches, Isometric holds |
| `abduction` | Moving limb away from midline | Side Leg Raises, Fire Hydrants |
| `hip-flexion` | Raising the leg forward | Front Leg Raises |

---

## 4. Execution Steps

### Phase 1: Load & Audit Current State

```python
import pandas as pd
import json

# Load the current DB export
df = pd.read_csv('exercise_library_export.csv')

# Audit
print(f"Total exercises: {len(df)}")
print(f"Unique names: {df['name'].nunique()}")

# Check empty/uniform columns
for col in df.columns:
    null_pct = df[col].isna().mean() * 100
    nunique = df[col].nunique()
    if null_pct > 50 or nunique <= 2:
        print(f"  FLAG: {col} — {null_pct:.0f}% null, {nunique} unique values")

# Check category distribution
print(f"\nprimaryCategory: {df['primaryCategory'].value_counts().to_dict()}")
print(f"familyName populated: {df['familyName'].notna().mean()*100:.0f}%")
print(f"movementPattern populated: {df['movementPattern'].notna().mean()*100:.0f}%")
```

**What to look for:**
- Columns that are universally empty or have placeholder values
- Categories that are under-differentiated (e.g., only 2 values when there should be 7)
- Boolean flags that are uniformly true/false when they shouldn't be
- Missing descriptions or instructions

### Phase 2: Research & Build Master Exercise List

**Goal:** Build a comprehensive superset of all bodyweight/HIIT/HICT exercises from multiple sources, then merge with existing DB.

**Open-source databases to mine:**
1. **free-exercise-db** (GitHub: `yuhonas/free-exercise-db`) — 800+ exercises in JSON, public domain. Filter for `equipment: "body only"`.
2. **wger API** (`wger.de/api/v2/exercise/`) — 690+ exercises, CC-BY-SA licensed. Filter for bodyweight category.
3. **exercemus** (GitHub: `exercemus/exercises`) — Curated from wger + exercises.json, includes muscle group mapping.
4. **ACE Fitness Exercise Library** — Professional descriptions and form cues.
5. **ExRx.net** — Reference for muscle targeting and biomechanics.

**Filtering criteria:**
- Equipment: body only, or body + bench/bar/box
- Relevance: suitable for HIIT/HICT circuits, home training, outdoor training
- Exclude: machine exercises, heavy barbell movements, exercises requiring specialized equipment

**Deduplication rules:**
- Same exercise with different names → keep one canonical name, note aliases
- Bilateral vs unilateral variant (e.g., "Glute Bridge" vs "Single Leg Glute Bridge") → keep both as separate entries
- Equipment variant of same movement (e.g., "Incline Push-Up" vs "Push-Up") → keep both
- Minor grip/stance variations → consolidate unless they meaningfully change the muscle targeting

**Known aliases from previous refresh:**
- "Air Bike" = "Bicycle Crunch" = "Ab Bicycles"
- "Freehand Jump Squat" = "Jump Squats"
- "Butt Lift (Bridge)" = "Body Weight Glute Bridges"
- "Scissors Jump" = "Split Jump" = "Jumping Lunges" (note: these are similar but have subtle differences — keep if distinct)
- "Push Up to Side Plank" = "Push-Up to Side Plank" (punctuation variant — consolidate)

### Phase 3: Enrich All Attributes

For every exercise (existing and new), ensure these fields are properly populated:

**Priority 1 — Must have:**
- `familyName` (assign using the family taxonomy in §3.1)
- `primaryCategory` (assign using the 7-value taxonomy)
- `movementPattern` (assign using the 15-value taxonomy in §3.2)
- `difficulty` (beginner/intermediate/advanced)
- `primaryMuscles` and `secondaryMuscles` (use closed muscle vocabulary)
- `forceType` and `mechanic`
- All 8 boolean flags, assessed honestly
- `description` (1-3 sentences)
- `instructions` (step-by-step JSON array)

**Priority 2 — Should have:**
- `tips` (2-3 performance tips)
- `commonMistakes` (2-3 common errors)
- `breathing` (breathing cue)
- `defaultReps` or `defaultDurationSeconds` (one or the other)

**Priority 3 — Nice to have:**
- `caloriesPerMinute` and `metValue`
- Media URLs (these are typically populated by a separate asset pipeline)

**Boolean assessment guidelines:**

| Flag | When TRUE | When FALSE |
|------|-----------|------------|
| `hictSuitable` | Can be performed for timed intervals in a circuit | Requires too much setup or transition time |
| `smallSpace` | Fits in ~7×7 ft | Needs running room, lateral space, or forward travel |
| `quiet` | No jumping, stomping, or dropping | Involves jumps, bounds, or ground impact |
| `cardioIntensive` | Gets heart rate to 70%+ MHR at pace | Primarily strength or mobility focused |
| `strengthFocus` | Builds strength or muscular endurance | Primarily cardio or mobility |
| `mobilityFocus` | Improves flexibility or ROM | Primarily strength or cardio |
| `beginnerFriendly` | No training prerequisite, low injury risk | Requires prerequisite strength or skill |
| `minimalTransition` | Can start/stop within 5 seconds | Requires setup (bench positioning, bar gripping, etc.) |

### Phase 4: Normalize & Format for DB Import

```python
import uuid
import re
import json

def make_slug(name):
    s = name.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')

# For new exercises
new_id = str(uuid.uuid4())
new_slug = make_slug(exercise_name)

# JSON array formatting
muscles_json = json.dumps(["abdominals", "obliques"])  # → '["abdominals", "obliques"]'
instructions_json = json.dumps(["Step 1.", "Step 2.", "Step 3."])

# Ensure slugs are unique
assert df['slug'].nunique() == len(df), "Duplicate slugs found!"

# Ensure all booleans are actual booleans, not strings
for col in ['hictSuitable', 'smallSpace', 'quiet', 'cardioIntensive',
            'strengthFocus', 'mobilityFocus', 'beginnerFriendly', 'minimalTransition',
            'isVerified']:
    df[col] = df[col].astype(bool)
```

**Critical format rules:**
- `id`: UUID v4 string. **Preserve existing IDs** for existing exercises — only generate new UUIDs for net-new exercises.
- `slug`: All lowercase, hyphens for spaces, no special characters. Must be unique.
- JSON array columns (`primaryMuscles`, `secondaryMuscles`, `equipment`, `instructions`, `tips`, `commonMistakes`): Must be valid JSON strings, not Python list representations.
- Booleans: `True`/`False` (Python) which become `true`/`false` in the CSV.
- Null values: Use `NaN`/empty for truly null fields. Do NOT use `"null"` string.

### Phase 5: Export & Validate

```python
# Column order must match schema
columns = [
    'id', 'name', 'slug', 'familyName', 'primaryCategory', 'difficulty',
    'primaryMuscles', 'secondaryMuscles', 'movementPattern', 'forceType',
    'mechanic', 'equipment', 'hictSuitable', 'smallSpace', 'quiet',
    'cardioIntensive', 'strengthFocus', 'mobilityFocus', 'beginnerFriendly',
    'minimalTransition', 'description', 'instructions', 'tips', 'commonMistakes',
    'breathing', 'thumbnailUrl', 'gifUrl', 'videoUrl', 'defaultReps',
    'defaultDurationSeconds', 'caloriesPerMinute', 'metValue', 'isVerified',
    'popularityScore'
]

df = df[columns].sort_values('name').reset_index(drop=True)
df.to_csv('exercise_library_master.csv', index=False)
```

**Validation checklist:**
- [ ] Total exercise count ≥ previous count (no accidental deletions)
- [ ] All names unique
- [ ] All slugs unique
- [ ] All IDs unique (UUIDs)
- [ ] Existing exercise IDs preserved (not regenerated)
- [ ] `familyName` populated for 100% of rows
- [ ] `primaryCategory` uses only the 7 allowed values
- [ ] `movementPattern` populated for 100% of rows
- [ ] `difficulty` uses only the 3 allowed values
- [ ] `primaryMuscles` uses only the closed muscle vocabulary
- [ ] `description` populated for 95%+ of rows
- [ ] `instructions` populated for 95%+ of rows
- [ ] Boolean flags vary appropriately (no uniformly true/false flags that should vary)
- [ ] JSON arrays are valid JSON (not Python list repr)
- [ ] No `"Push Up to Side Plank"` / `"Push-Up to Side Plank"` type near-duplicate names

Also produce a **changelog CSV** with columns: `name`, `status` (NEW/UPDATED/REMOVED), `familyName`, `primaryCategory`, `changes_notes`.

---

## 5. Deduplication Decision Log

When near-duplicates are found, document the decision here for future reference.

| Kept Name | Merged/Removed | Reason |
|-----------|----------------|--------|
| Air Bike | Ab Bicycles, Bicycle Crunch | Same exercise — alternate elbow-to-knee pedaling motion |
| Butt Lift (Bridge) | Body Weight Glute Bridges | Same exercise — standard glute bridge |
| Freehand Jump Squat | Jump Squats | Same exercise — bodyweight squat + jump |
| Push-Up to Side Plank | Push Up to Side Plank | Punctuation variant — consolidated to hyphenated form |
| Bodyweight Squat | Body Weight Squats | Same exercise — used existing DB name |

**Add future dedup decisions to this table.**

---

## 6. Known Gaps & Future Work

### 6.1 Under-populated fields (as of Feb 2026)

- `tips`: Populated for ~50% of exercises. New exercises added as `[]`.
- `commonMistakes`: Populated for ~50%. New exercises added as `[]`.
- `breathing`: Populated for ~30%. Many null.
- `defaultReps` / `defaultDurationSeconds`: Populated for ~30%.
- `caloriesPerMinute` / `metValue`: Populated for ~20%.
- Media URLs (`thumbnailUrl`, `gifUrl`, `videoUrl`): All null. Separate asset pipeline needed.

### 6.2 Exercises to consider adding in future refreshes

- **Resistance band exercises** (if equipment scope expands): Banded squats, banded pull-aparts, face pulls
- **Yoga/flow movements**: Sun salutation, warrior sequences, crow pose
- **Agility drills**: Ladder drills, cone drills (if outdoor scope expands)
- **Isometric progressions**: L-sit, front lever, back lever (calisthenics progression)
- **Regression variants**: Knee push-ups, assisted pistol squats, negative pull-ups

### 6.3 Schema changes to consider

- `aliases` column (JSON array) — to track alternative names for dedup history
- `prerequisites` column — exercises that should be mastered before attempting this one
- `progressionLevel` column (integer) — where this exercise sits in a difficulty progression within its family
- `unilateral` boolean — whether the exercise is single-limb
- `impactLevel` (string: `none`, `low`, `high`) — more granular than just `quiet`

---

## 7. Quality Benchmarks

After a successful refresh, the library should meet these targets:

| Metric | Target | Feb 2026 Actual |
|--------|--------|----------------|
| Total exercises | 200+ | 219 |
| familyName coverage | 100% | 100% |
| primaryCategory coverage | 100% | 100% |
| movementPattern coverage | 100% | 100% |
| description coverage | 95%+ | 99% |
| instructions coverage | 95%+ | 100% |
| Category distribution balance | No category < 5% | ✅ (smallest: cardio 4.1%) |
| Difficulty distribution | 50-65% beginner, 25-40% intermediate, 5-15% advanced | 60/32/8 |
| cardioIntensive true rate | 10-25% | 16% |
| Unique families | 20+ | 30 |

---

## 8. Session Kickoff Prompt

When starting a new refresh session, use this prompt with the current DB export attached:

> I need to refresh my app's exercise library. I've attached the current database export as a CSV. Please read the attached `EXERCISE_LIBRARY_REFRESH.md` for the complete execution plan, schema, taxonomy, and quality benchmarks.
>
> Please:
> 1. Load and audit the current CSV against the plan's schema and benchmarks
> 2. Research open-source exercise databases for new bodyweight/HIIT exercises to add
> 3. Deduplicate and merge (reference the dedup decision log)
> 4. Enrich all attributes per the taxonomy reference
> 5. Export as a schema-compliant CSV + changelog
>
> Flag any decisions or ambiguities for my review before finalizing.

---

*This document should be updated after each refresh to keep the dedup log, gap list, and benchmarks current.*
