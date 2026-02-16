/**
 * Environment Configuration
 * Reads from Expo Constants (configured in app.config.js)
 */
import Constants from 'expo-constants';

// Get values from Expo Constants (set via app.config.js from Vercel env vars)
const expoExtra = Constants.expoConfig?.extra || {};

// Backend API URL (currently not deployed, using Supabase directly)
export const API_URL = __DEV__
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-production-api.com/api';  // Production (placeholder - not deployed yet)

// Supabase Configuration - from Expo Constants
export const SUPABASE_URL = expoExtra.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cfmgxtnnluoyxazxmixw.supabase.co';
export const SUPABASE_ANON_KEY = expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// App Configuration
export const APP_NAME = 'Intensely';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  enableDebugMode: __DEV__,
  enableAnalytics: !__DEV__,
};
