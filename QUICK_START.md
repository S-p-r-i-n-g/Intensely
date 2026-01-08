# Quick Start Guide - Testing Without Backend

This guide helps you test the mobile app with authentication working, even without the full backend API running.

## Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account (free tier works great)

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: Intensely (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait ~2 minutes for setup to complete

### 1.2 Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **anon public** key (starts with `eyJ...`, it's long!)

### 1.3 Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Under **Email Auth** settings:
   - **Confirm email**: Turn OFF for testing (optional)
   - **Secure email change**: Turn OFF for testing (optional)
4. Click **Save**

## Step 2: Configure the Mobile App

### 2.1 Update Environment Variables

Edit `/mobile/.env` and replace the placeholder values:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key...
```

### 2.2 Restart the App

```bash
# Stop the current Metro bundler (Ctrl+C)

# Clear cache and restart
npm start --reset-cache

# Or use Expo CLI
npx expo start --clear
```

## Step 3: Test Authentication

### 3.1 Sign Up

1. Open the app (on device, simulator, or web)
2. Tap **"Sign Up"**
3. Enter:
   - **Email**: your-email@example.com
   - **Password**: minimum 6 characters
   - **First Name** (optional)
   - **Last Name** (optional)
4. Tap **"Sign Up"**

**Expected Result**: You should be redirected to the main app (Home screen) after successful signup.

### 3.2 Sign Out and Sign In

1. Tap the **Profile** tab
2. Tap **"Sign Out"**
3. You'll be back at the Welcome screen
4. Tap **"Log In"**
5. Enter the same credentials
6. Tap **"Log In"**

**Expected Result**: You should be logged in and see the Home screen.

## Step 4: Verify It's Working

### 4.1 Check Console Output

In the Metro bundler terminal, you should see:
```
Failed to sync profile with backend: [Error: Network Error]
```
This is **NORMAL** - it means authentication worked, but the backend API isn't running.

### 4.2 Look for Warning Banner

On the Home screen, you should see a yellow warning banner:
```
⚠️ Backend Offline
Some features may be limited. Authentication still works!
```

This confirms:
- ✅ Authentication is working with Supabase
- ⚠️ Backend API is not running (expected)

## What Works Without Backend

With just Supabase configured:

✅ **Works:**
- User signup and login
- Session persistence (stays logged in)
- Profile display (from Supabase user metadata)
- Sign out functionality
- Auto token refresh

⚠️ **Limited or Not Working:**
- Workout generation (needs backend API)
- Exercise library (needs backend API)
- Progress tracking (needs backend API)
- Workout history (needs backend API)

## Next Steps

### To Get Full Functionality

You need to run the backend API server. See the main project README for backend setup instructions.

Once the backend is running at `http://localhost:3000`, restart the mobile app and the warning banner will disappear. All features will work!

### Test Without Backend

You can still test:
- Navigation between screens
- UI components and layouts
- Authentication flow
- Profile editing interface
- Settings and preferences (local state only)

## Troubleshooting

### "Invalid login credentials"

- Check that your Supabase project is set up correctly
- Verify the credentials in `.env` are correct
- Make sure you're using the correct email/password
- Check Supabase dashboard → Authentication → Users to see if your user was created

### App crashes on startup

```bash
# Clear all caches
npm start -- --reset-cache

# Or delete cache manually
rm -rf .expo
rm -rf node_modules/.cache
```

### "Network request failed"

- Normal if backend isn't running
- Check that Supabase URL and key are correct
- Make sure you restarted the app after updating `.env`

### Still redirected to login after signup

- Check Metro bundler terminal for errors
- Verify Supabase credentials are correct
- Try clearing AsyncStorage:
  ```javascript
  // In the app, open console and run:
  import AsyncStorage from '@react-native-async-storage/async-storage';
  AsyncStorage.clear();
  ```

## Support

If you encounter issues:

1. Check the Metro bundler terminal for error messages
2. Verify Supabase credentials in `.env`
3. Make sure you restarted the app after changes
4. Clear cache with `npm start -- --reset-cache`

---

**Remember**: This setup allows you to test authentication and UI without the backend. For full functionality, you'll need to run the backend API server!
