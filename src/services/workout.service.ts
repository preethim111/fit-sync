import apiClient from '@/lib/api-client';
import { Workout, ApiResponse } from '@/types';

export const workoutService = {
  getWorkouts: async (): Promise<ApiResponse<Workout[]>> => {
    const response = await apiClient.get('/workouts');
    return response.data;
  },

  getWorkout: async (id: string): Promise<ApiResponse<Workout>> => {
    const response = await apiClient.get(`/workouts/${id}`);
    return response.data;
  },

  createWorkout: async (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Workout>> => {
    const response = await apiClient.post('/workouts', workout);
    return response.data;
  },

  updateWorkout: async (id: string, workout: Partial<Workout>): Promise<ApiResponse<Workout>> => {
    const response = await apiClient.put(`/workouts/${id}`, workout);
    return response.data;
  },

  deleteWorkout: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/workouts/${id}`);
    return response.data;
  },
}; 