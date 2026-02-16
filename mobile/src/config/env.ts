/**
 * Environment Configuration
 * Update these values for your environment
 */

// Backend API URL
export const API_URL = __DEV__
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-production-api.com/api';  // Production

// Supabase Configuration
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// App Configuration
export const APP_NAME = 'Intensely';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  enableDebugMode: __DEV__,
  enableAnalytics: !__DEV__,
};
