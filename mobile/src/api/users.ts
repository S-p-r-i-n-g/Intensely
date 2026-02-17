import { supabase } from '../config/supabase';
import { ApiResponse, User, UserPreference } from '../types/api';

/**
 * Users API Service
 * Handles user profile and preferences
 * Queries Supabase directly
 */

export const usersApi = {
  /**
   * Sync user with Supabase (creates if doesn't exist)
   */
  sync: async (): Promise<ApiResponse<User>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return {
          data: existingUser as User,
          status: 200,
          message: 'User synced'
        };
      }

      // Create user if doesn't exist
      const now = new Date().toISOString();
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.firstName || user.user_metadata?.first_name,
          last_name: user.user_metadata?.lastName || user.user_metadata?.last_name,
          auth_provider: 'email',
          email_verified: !!user.email_confirmed_at,
          fitness_level: 'beginner',
          metric_system: true,
          notification_preferences: {},
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: newUser as User,
        status: 201,
        message: 'User created'
      };
    } catch (error: any) {
      console.error('[UsersAPI] Sync failed:', error);
      return {
        data: {} as User,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return {
        data: data as User,
        status: 200,
        message: 'Success'
      };
    } catch (error: any) {
      return {
        data: {} as User,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const updateData: any = { ...data, updated_at: new Date().toISOString() };
      const { data: updated, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: updated as User,
        status: 200,
        message: 'Profile updated'
      };
    } catch (error: any) {
      return {
        data: {} as User,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<ApiResponse<UserPreference>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        data: data as UserPreference,
        status: 200,
        message: 'Success'
      };
    } catch (error: any) {
      return {
        data: {} as UserPreference,
        status: 500,
        message: error.message
      };
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (data: Partial<UserPreference>): Promise<ApiResponse<UserPreference>> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: updated, error } = await supabase
        .from('user_preferences')
        .update(data)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: updated as UserPreference,
        status: 200,
        message: 'Preferences updated'
      };
    } catch (error: any) {
      return {
        data: {} as UserPreference,
        status: 500,
        message: error.message
      };
    }
  },
};
