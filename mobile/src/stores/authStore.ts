import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { usersApi } from '../api';
import { User as ApiUser } from '../types/api';
import { User, Session } from '@supabase/supabase-js';

/**
 * Authentication Store
 * Manages authentication state and operations
 */

interface AuthState {
  user: User | null;
  profile: ApiUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  authListener: any; // Store the listener for cleanup

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: { firstName?: string; lastName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  syncProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  authListener: null,

  /**
   * Initialize auth state
   * Called on app start
   */
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Clean up existing listener if any
      const existingListener = get().authListener;
      if (existingListener) {
        console.log('[AuthStore] Removing existing auth listener');
        existingListener.subscription?.unsubscribe();
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({
          user: session.user,
          session,
        });

        // Sync profile with backend
        await get().syncProfile();
      }

      // Listen for auth changes (only set up once).
      // Skip INITIAL_SESSION — getSession() above already handled it.
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AuthStore] Auth state change event:', event, 'hasSession:', !!session);

        if (event === 'INITIAL_SESSION') return;

        set({
          user: session?.user ?? null,
          session,
        });

        if (session) {
          console.log('[AuthStore] Session exists, syncing profile');
          await get().syncProfile();
        } else {
          console.log('[AuthStore] No session, clearing profile');
          set({ profile: null });
        }
      });

      // Store the listener for cleanup
      set({ authListener: listener });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      // Always set initialized to true, even if there's an error
      // This prevents the app from being stuck on the loading screen
      set({ isInitialized: true, isLoading: false });
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
      });

      // Sync profile with backend
      await get().syncProfile();
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, userData?) => {
    try {
      set({ isLoading: true });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        set({
          user: data.user,
          session: data.session,
        });

        // Sync profile with backend
        await get().syncProfile();
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    try {
      console.log('[AuthStore] Sign out started');
      set({ isLoading: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[AuthStore] Supabase sign out error:', error);
        throw error;
      }

      console.log('[AuthStore] Supabase sign out successful, clearing state');
      set({
        user: null,
        profile: null,
        session: null,
      });
      console.log('[AuthStore] State cleared, user should be null now');
    } catch (error) {
      console.error('[AuthStore] Sign out failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
      console.log('[AuthStore] Sign out completed, isLoading set to false');
    }
  },

  /**
   * Sync profile with backend
   */
  syncProfile: async () => {
    try {
      const response = await usersApi.sync();
      set({ profile: response.data });
    } catch (error) {
      console.error('Failed to sync profile with backend:', error);
      // Backend sync is optional - create a minimal profile from Supabase user
      const { user } = get();
      if (user) {
        set({
          profile: {
            id: user.id,
            email: user.email || '',
            firstName: user.user_metadata?.firstName || null,
            lastName: user.user_metadata?.lastName || null,
            createdAt: user.created_at,
            updatedAt: new Date().toISOString(),
            preferences: null,
          } as ApiUser,
        });
      }
    }
  },
}));
