# How to Test the Intensely Mobile App

## Quick Start - Choose Your Method

### Method 1: Web Browser (FASTEST) 🌐
```bash
cd /Users/dspring/Projects/CursorClaudeCode/mobile
npm run web
```
- Opens in your default browser
- Good for testing UI and navigation
- Limited mobile features (no camera, etc.)

### Method 2: iOS Simulator (RECOMMENDED) 📱
```bash
cd /Users/dspring/Projects/CursorClaudeCode/mobile
npm run ios
```
- Requires macOS with Xcode
- Full iOS experience
- Hot reloading enabled

### Method 3: Your Phone with QR Code 📲

**Step 1:** Install Expo Go
- iOS: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

**Step 2:** Start the dev server
```bash
cd /Users/dspring/Projects/CursorClaudeCode/mobile
npm start
```

**Step 3:** Scan the QR code
- iOS: Open Camera app → scan QR → opens in Expo Go
- Android: Open Expo Go app → scan QR from app

### Method 4: Android Emulator 🤖
```bash
cd /Users/dspring/Projects/CursorClaudeCode/mobile
npm run android
```
- Requires Android Studio + emulator
- Full Android experience

---

## Interactive Menu Options

When you run `npm start`, you'll see an interactive menu:

```
› Metro waiting on exp://192.168.x.x:8081

› Press i │ open iOS simulator
› Press a │ open Android emulator
› Press w │ open web browser
› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

Just press the letter for what you want!

---

## Before Testing - Start the Backend

For full functionality, the backend API needs to be running:

```bash
# In a separate terminal
cd /Users/dspring/Projects/CursorClaudeCode/backend
npm run dev
```

Backend will run on `http://localhost:3000`

---

## Testing Scenarios

### 1. Test Authentication Flow (No backend needed for UI)
1. Open app → see Welcome screen
2. Tap "Sign Up" → test form validation
3. Tap "Log In" → test form validation
4. Try to submit with empty fields
5. Try to submit with invalid email

### 2. Test Navigation
1. Bottom tabs should show 5 options
2. Tap each tab to verify navigation
3. Check that tab bar highlights active tab

### 3. Test with Backend Running
1. Start backend: `cd backend && npm run dev`
2. Configure Supabase (see below)
3. Actually sign up for an account
4. Log in and test profile screen
5. Try the quick start options on home screen

---

## Configure Supabase (Required for Auth)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Enable Email Auth in Authentication settings

### Step 2: Update Environment Variables

Edit `/Users/dspring/Projects/CursorClaudeCode/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

Get these values from:
Supabase Dashboard → Settings → API

### Step 3: Update Backend Config

Edit `/Users/dspring/Projects/CursorClaudeCode/backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Step 4: Restart Both Servers
```bash
# Terminal 1 - Backend
cd /Users/dspring/Projects/CursorClaudeCode/backend
npm run dev

# Terminal 2 - Mobile
cd /Users/dspring/Projects/CursorClaudeCode/mobile
npm start
```

---

## Troubleshooting

### "Cannot connect to Metro"
- Make sure you're on the same WiFi network (phone + computer)
- Try running: `npm start -- --tunnel` (uses tunneling)
- Restart the dev server

### "Network request failed"
- Backend not running → start it with `npm run dev`
- Check API URL in `mobile/src/config/env.ts`
- Make sure firewall allows connections

### Blank white screen
- Check Metro bundler for errors
- Try: `npm start -- --reset-cache`
- Check console for JavaScript errors

### TypeScript errors
```bash
cd /Users/dspring/Projects/CursorClaudeCode/mobile
npx tsc --noEmit
```

### Clear cache and restart
```bash
cd /Users/dspring/Projects/CursorClaudeCode/mobile
rm -rf node_modules
npm install
npm start -- --reset-cache
```

---

## What You Can Test Right Now (Without Backend)

✅ **UI and Navigation**
- All screens load correctly
- Tab navigation works
- Screen transitions are smooth
- Forms render properly

✅ **Authentication UI**
- Welcome screen displays
- Login form validation (client-side)
- Sign up form validation
- Error messages display correctly

❌ **Cannot Test Without Backend**
- Actual login/signup
- API calls
- Data fetching
- Workout generation
- Progress tracking

---

## Recommended Test Flow

1. **First Time:**
   ```bash
   cd /Users/dspring/Projects/CursorClaudeCode/mobile
   npm run web
   ```
   Just to see the UI and navigate around

2. **Full Test:**
   - Start backend
   - Configure Supabase
   - Run on iOS simulator or your phone
   - Test authentication
   - Explore all screens

3. **Development:**
   - Keep Metro bundler running
   - Make code changes
   - App auto-reloads
   - Check console for errors

---

## Current App Features

### ✅ Implemented
- Welcome/Login/Sign Up screens
- Tab navigation (Home, Workouts, Exercises, Progress, Profile)
- Home screen with quick start cards
- Profile screen with sign out
- API client with auth token injection
- State management stores

### 🚧 Coming Soon
- Workout flow screens (Jump Right In, etc.)
- Workout execution with timer
- Exercise library browse/search
- Progress tracking and PR logging
- Profile editing

---

## Performance Tips

- **Faster Builds:** Use web for quick UI tests
- **Realistic Testing:** Use iOS simulator or real device
- **Debug Tools:** Shake device/press Cmd+D for developer menu
- **Network:** Use WiFi (not cellular data) for Expo Go

---

## Need Help?

**Common Questions:**

Q: Which method is best?
A: iOS simulator for full testing, web for quick UI checks

Q: Do I need Xcode?
A: Only for iOS simulator. Use web or your phone otherwise.

Q: Can I test without backend?
A: Yes! UI and navigation work. Auth requires backend.

Q: Why can't I sign in?
A: Need backend running + Supabase configured

---

**Ready to test!** Start with `npm run web` for the quickest preview. 🚀
