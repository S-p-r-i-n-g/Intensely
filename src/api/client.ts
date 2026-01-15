import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { supabase } from '../config/supabase';
import { API_URL } from '../config/env';

/**
 * API Client
 * Handles all HTTP requests to the backend API
 * Automatically includes authentication tokens
 */

class ApiClient {
  private client: AxiosInstance;
  private cachedSession: any = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize cached session from localStorage (web) or auth state change listener
    this.initializeSession();

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Try to get fresh session, but don't block on errors
          if (!this.cachedSession) {
            const { data: { session } } = await supabase.auth.getSession();
            this.cachedSession = session;
          }

          if (this.cachedSession?.access_token) {
            config.headers.Authorization = `Bearer ${this.cachedSession.access_token}`;
          }
        } catch (error) {
          // If session retrieval fails, try to get from localStorage directly (web only)
          console.warn('Failed to get session for API request, trying localStorage:', error);

          if (typeof window !== 'undefined') {
            try {
              const storageKey = `sb-${new URL(supabase.auth.supabaseUrl).hostname.split('.')[0]}-auth-token`;
              const storedSession = localStorage.getItem(storageKey);
              if (storedSession) {
                const parsed = JSON.parse(storedSession);
                if (parsed?.access_token) {
                  config.headers.Authorization = `Bearer ${parsed.access_token}`;
                  console.log('Using token from localStorage');
                }
              }
            } catch (storageError) {
              console.warn('Failed to get token from localStorage:', storageError);
            }
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, try to refresh
          try {
            const { data: { session } } = await supabase.auth.refreshSession();

            if (session) {
              // Update cached session
              this.cachedSession = session;
              // Retry original request with new token
              error.config.headers.Authorization = `Bearer ${session.access_token}`;
              return this.client.request(error.config);
            } else {
              // Refresh failed, user needs to log in again
              await supabase.auth.signOut();
              this.cachedSession = null;
            }
          } catch (refreshError) {
            console.warn('Failed to refresh session:', refreshError);
            // Can't refresh, clear cached session
            this.cachedSession = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private initializeSession() {
    // Listen for auth state changes to update cached session
    supabase.auth.onAuthStateChange((_event, session) => {
      this.cachedSession = session;
      console.log('Session updated in API client:', session ? 'authenticated' : 'not authenticated');
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
