import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: any | null;
  error: Error | null;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  },

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { user: data.user, session: data.session, error };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async updateProfile(updates: { name?: string; avatar_url?: string }): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    return { error };
  }
}; 