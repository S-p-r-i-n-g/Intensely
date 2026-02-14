# Data Directory

## Required File

Place `exercise_library_master.csv` in this directory.

## Expected CSV Columns

The CSV should contain the following columns:

**Required:**
- `slug` - Unique identifier (e.g., "push-up")
- `name` - Exercise name (e.g., "Push-up")

**Recommended for prompt generation:**
- `description` - Brief description of the exercise
- `instructions` - JSON array of step-by-step instructions
- `primaryMuscles` - JSON array of primary muscles targeted
- `movementPattern` - Pattern type (push, pull, squat, etc.)

**Additional columns** (will be ignored by prompt generator but may be used by other scripts):
- `difficulty` - beginner, intermediate, advanced
- `equipment` - bodyweight, dumbbell, etc.
- `primaryCategory` - upper_body, lower_body, core, etc.
- And any other metadata fields

## Example CSV Structure

```csv
slug,name,description,instructions,primaryMuscles,movementPattern
push-up,Push-up,"A classic upper body exercise",["Start in plank position","Lower body to ground","Push back up"],"[""chest"",""triceps""]",push
squat,Bodyweight Squat,"A fundamental lower body movement",["Stand with feet shoulder-width","Lower hips back and down","Drive through heels to stand"],"[""quadriceps"",""glutes""]",squat
```

## Notes

- The script will skip rows without a `slug` value
- Missing optional fields will result in shorter prompts
- `instructions` field can be a JSON array string or plain text
