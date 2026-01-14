
// RSW Workout App Types - V1 Spec
import React from 'react';

// User profile data structure (matches Airtable users table)
export interface User {
  email: string;
  first_name: string;
  primary_goal: string;
  target_days_per_week: '2' | '3' | '4' | 'not_sure';
  biggest_obstacle?: string;
  created_at?: string;
  last_active_at?: string;
}

// Workout log entry (matches Airtable workout_logs table)
export interface WorkoutLog {
  log_id?: string;
  email: string;
  week: number; // 1-6
  day: number;
  exercise_name: string;
  weight: number;
  timestamp?: string;
}

// Exercise structure for 6-week program
export interface Exercise {
  name: string;
  sets: number;
  reps: number | string; // Can be "8-10" or "12"
  equipment?: string;
}

// Day structure in program
export interface ProgramDay {
  day: number;
  title: string; // e.g., "Lower A", "Upper B"
  exercises: Exercise[];
}

// Week structure in program
export interface ProgramWeek {
  week: number;
  days: ProgramDay[];
}

// Complete 6-week program structure
export interface TrainingProgram {
  weeks: ProgramWeek[];
}

// Program variation (e.g., "3-Day Split", "4-Day Split")
export interface ProgramVariation {
  id: string;
  name: string;
  description: string;
  program: TrainingProgram;
}

// All available programs with variations
export interface ProgramLibrary {
  variations: ProgramVariation[];
}

// Cycle phase type
export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

// Phase guidance structure (local only, not stored)
export interface PhaseGuidance {
  phase: CyclePhase;
  guidance: string;
  recommendations: string[];
}

// API response types
export interface InitResponse {
  status: 'existing_user' | 'new_user';
  email: string;
  user?: User;
  recent_logs?: WorkoutLog[];
}

export interface OnboardResponse {
  status: 'ok' | 'error';
  user?: User;
  message?: string;
}

export interface LogWeightResponse {
  status: 'ok' | 'error';
  message?: string;
}

export interface GetLogsResponse {
  status: 'ok' | 'error';
  logs?: WorkoutLog[];
}

// App state
export interface AppState {
  email: string | null;
  userProfile: User | null;
  phase: CyclePhase;
  selectedWeek: number;
  selectedDay: number;
  recentLogs: WorkoutLog[];
  isLoading: boolean;
  error: string | null;
}
