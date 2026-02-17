import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

/**
 * Supabase Client Configuration
 * Handles authentication and database access
 *
 * Web-compatible storage adapter
 */

// Create a web-compatible storage adapter
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return Promise.resolve();
      },
    };
  }
  // Use AsyncStorage for iOS/Android
  return AsyncStorage as any;
};

/**
 * Only enable detectSessionInUrl when the URL actually contains auth callback
 * parameters (e.g., ?code=... from PKCE email confirmation/password reset).
 * On normal page refreshes, this MUST be false -- otherwise Supabase's
 * _initialize() attempts URL processing that delays or blocks session
 * restoration from localStorage, causing session loss and 5-10s load times.
 */
const shouldDetectSessionInUrl = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  // PKCE flow uses ?code=...&, implicit flow uses #access_token=...
  return params.has('code') || window.location.hash.includes('access_token');
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: shouldDetectSessionInUrl(),
    flowType: 'pkce',
    storageKey: `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`,
    // Disable lock on web to prevent AbortError warnings
    lock: Platform.OS === 'web' ? false : undefined,
  },
});
