import { supabase } from '../lib/supabase';

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const databaseService = {
  // Workout operations
  async getWorkouts(): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert([workout])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteWorkout(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Exercise operations
  async getExercises(workoutId: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExercise(id: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 