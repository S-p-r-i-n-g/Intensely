import { supabase } from '../config/supabase';
import { ApiResponse, User, UserPreference } from '../types/api';

/**
 * Users API Service
 * Handles user profile and preferences
 * Queries Supabase directly
 */

// Supabase returns snake_case columns; map to the camelCase User interface.
const mapDbUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name ?? row.firstName,
  lastName: row.last_name ?? row.lastName,
  avatarUrl: row.avatar_url ?? row.avatarUrl,
  fitnessLevel: row.fitness_level ?? row.fitnessLevel ?? 'beginner',
  createdAt: row.created_at ?? row.createdAt,
  preferences: null,
});

// Convert camelCase User fields back to snake_case for DB writes.
const mapUserToDb = (data: Partial<User>): Record<string, any> => {
  const result: Record<string, any> = {};
  if (data.firstName !== undefined) result.first_name = data.firstName;
  if (data.lastName !== undefined) result.last_name = data.lastName;
  if (data.avatarUrl !== undefined) result.avatar_url = data.avatarUrl;
  if (data.fitnessLevel !== undefined) result.fitness_level = data.fitnessLevel;
  return result;
};

export const usersApi = {
  /**
   * Sync user with Supabase (creates if doesn't exist)
   */
  sync: async (): Promise<ApiResponse<User>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
          data: mapDbUser(existingUser),
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
        data: mapDbUser(newUser),
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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
        data: mapDbUser(data),
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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('Not authenticated');
      }

      const updateData = { ...mapUserToDb(data), updated_at: new Date().toISOString() };
      const { data: updated, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: mapDbUser(updated),
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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
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
