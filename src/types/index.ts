// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Workout related types
export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
} 