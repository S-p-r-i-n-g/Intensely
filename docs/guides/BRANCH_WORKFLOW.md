# Branch Workflow Guide

## Current Setup

✅ **Main Branch**: `main` (your stable, working code)  
✅ **Feature Branch**: `feature/ux-improvements` (UX improvements work)

---

## Quick Reference Commands

### Check Current Branch
```bash
git branch --show-current
# or
git status
```

### Switch Between Branches
```bash
# Go to UX improvements branch
git checkout feature/ux-improvements

# Go back to main branch
git checkout main
```

### See All Branches
```bash
git branch          # Local branches
git branch -a       # All branches (local + remote)
```

### Create New Branch (if needed)
```bash
# From main branch
git checkout main
git checkout -b feature/ux-improvements-v2
```

---

## Daily Workflow

### Starting Work on UX Improvements

1. **Switch to UX branch**
   ```bash
   git checkout feature/ux-improvements
   ```

2. **Pull latest changes** (if working with remote)
   ```bash
   git pull origin feature/ux-improvements
   ```

3. **Make your changes**
   - Edit files
   - Test changes
   - Update `UX_IMPLEMENTATION_TRACKER.md` as you complete items

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(ux): [description of what you did]"
   ```

5. **Push to remote** (when ready)
   ```bash
   git push origin feature/ux-improvements
   ```

### Need to Work on Main Branch?

1. **Save your work** (commit or stash)
   ```bash
   # Option 1: Commit your work
   git add .
   git commit -m "WIP: [description]"
   
   # Option 2: Stash (temporary save)
   git stash
   ```

2. **Switch to main**
   ```bash
   git checkout main
   ```

3. **Do your work on main**

4. **Switch back to UX branch**
   ```bash
   git checkout feature/ux-improvements
   
   # If you stashed, restore your work
   git stash pop
   ```

---

## Merging Back to Main

### When You're Ready to Merge

**Option 1: Direct Merge (Simple)**
```bash
# Switch to main
git checkout main

# Merge UX improvements
git merge feature/ux-improvements

# Push to remote
git push origin main
```

**Option 2: Pull Request (Recommended for Collaboration)**
```bash
# Push your feature branch
git push origin feature/ux-improvements

# Then create a Pull Request on GitHub/GitLab/etc.
# Review changes, then merge through the UI
```

### If Something Goes Wrong

**Revert the merge** (if you haven't pushed yet):
```bash
git reset --hard HEAD~1
```

**Or revert to before merge**:
```bash
git reset --hard [commit-hash-before-merge]
```

---

## Keeping Branches in Sync

### Update UX Branch with Main Changes

If you make changes to main and want them in your UX branch:

```bash
# Switch to UX branch
git checkout feature/ux-improvements

# Merge main into UX branch
git merge main

# Resolve any conflicts if they occur
```

### Update Main with UX Changes (Selective)

If you want to bring specific changes from UX to main:

```bash
# Switch to main
git checkout main

# Cherry-pick specific commits
git cherry-pick [commit-hash]
```

---

## Branch Safety Tips

### ✅ Safe Operations
- Switching branches (if you've committed or stashed)
- Creating new branches
- Viewing differences: `git diff main..feature/ux-improvements`
- Viewing commit history: `git log`

### ⚠️ Be Careful With
- `git reset --hard` (destroys uncommitted work)
- `git push --force` (can overwrite remote history)
- Merging without reviewing changes first

### 💡 Best Practices
1. **Commit often** - Small, frequent commits are easier to manage
2. **Write clear commit messages** - Helps you remember what you did
3. **Test before merging** - Make sure UX branch works before merging
4. **Keep main stable** - Only merge when UX improvements are ready

---

## Common Scenarios

### Scenario 1: I Made Changes on Wrong Branch

```bash
# If you haven't committed yet
git stash                    # Save changes
git checkout feature/ux-improvements
git stash pop               # Restore changes

# If you already committed
git checkout feature/ux-improvements
git cherry-pick [commit-hash]
git checkout main
git reset --hard HEAD~1     # Remove commit from main
```

### Scenario 2: I Want to Test UX Changes on Main

```bash
# Create a temporary branch from UX branch
git checkout feature/ux-improvements
git checkout -b test-ux-on-main

# Merge main into it
git merge main

# Test, then delete when done
git checkout main
git branch -D test-ux-on-main
```

### Scenario 3: I Want to Abandon UX Branch

```bash
# Switch to main
git checkout main

# Delete UX branch
git branch -D feature/ux-improvements

# If you want to start fresh later
git checkout -b feature/ux-improvements
```

---

## Viewing Differences

### See What's Different Between Branches
```bash
# See file differences
git diff main..feature/ux-improvements

# See commit differences
git log main..feature/ux-improvements

# See summary of changes
git diff --stat main..feature/ux-improvements
```

---

## Commit Message Conventions

Use clear, descriptive commit messages:

```bash
# Good examples
git commit -m "feat(ux): add design tokens and color system"
git commit -m "feat(ux): enhance home screen with stats cards"
git commit -m "fix(ux): correct button spacing in workout cards"
git commit -m "refactor(ux): extract Button component"

# Format: type(scope): description
# Types: feat, fix, refactor, style, docs, test
```

---

## Quick Status Check

```bash
# See current branch and status
git status

# See what branch you're on
git branch --show-current

# See recent commits
git log --oneline -10

# See uncommitted changes
git diff
```

---

## Need Help?

- **View help**: `git help [command]`
- **See all commands**: `git help`
- **Undo last commit** (keep changes): `git reset --soft HEAD~1`
- **Undo last commit** (discard changes): `git reset --hard HEAD~1`
- **See remote branches**: `git branch -r`

---

**Remember**: Your main branch is safe! All UX work is on `feature/ux-improvements` branch. You can always switch back to main and it will be exactly as you left it.
