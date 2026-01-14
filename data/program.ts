// 6-Week Training Program Data
// This is a TEMPLATE structure - replace with your actual program data

import { ProgramLibrary } from '../types';

export const PROGRAM_LIBRARY: ProgramLibrary = {
  variations: [
    {
      id: 'default',
      name: 'Default Program',
      description: 'Standard 6-week strength training program',
      program: {
  weeks: [
    // Week 1
    {
      week: 1,
      days: [
        {
          day: 1,
          title: 'Lower A',
          exercises: [
            {
              name: 'Back Squat',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Romanian Deadlift',
              sets: 3,
              reps: 10,
              equipment: 'Barbell'
            },
            {
              name: 'Walking Lunges',
              sets: 3,
              reps: '12 per leg',
              equipment: 'Dumbbells'
            },
            {
              name: 'Leg Curl',
              sets: 3,
              reps: 12,
              equipment: 'Machine'
            }
          ]
        },
        {
          day: 2,
          title: 'Upper A',
          exercises: [
            {
              name: 'Bench Press',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Bent Over Row',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Overhead Press',
              sets: 3,
              reps: 10,
              equipment: 'Dumbbells'
            },
            {
              name: 'Lat Pulldown',
              sets: 3,
              reps: 12,
              equipment: 'Cable'
            }
          ]
        },
        {
          day: 3,
          title: 'Lower B',
          exercises: [
            {
              name: 'Front Squat',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Sumo Deadlift',
              sets: 3,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Bulgarian Split Squat',
              sets: 3,
              reps: '10 per leg',
              equipment: 'Dumbbells'
            },
            {
              name: 'Glute Bridge',
              sets: 3,
              reps: 15,
              equipment: 'Barbell'
            }
          ]
        }
      ]
    },
    // Week 2-6: Add your remaining weeks here
    // Copy the structure above and modify for each week
    // For now, we'll create a simple template for weeks 2-6
    ...Array.from({ length: 5 }, (_, i) => ({
      week: i + 2,
      days: [
        {
          day: 1,
          title: `Lower A - Week ${i + 2}`,
          exercises: [
            {
              name: 'Back Squat',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Romanian Deadlift',
              sets: 3,
              reps: 10,
              equipment: 'Barbell'
            }
          ]
        },
        {
          day: 2,
          title: `Upper A - Week ${i + 2}`,
          exercises: [
            {
              name: 'Bench Press',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Bent Over Row',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            }
          ]
        },
        {
          day: 3,
          title: `Lower B - Week ${i + 2}`,
          exercises: [
            {
              name: 'Front Squat',
              sets: 4,
              reps: 8,
              equipment: 'Barbell'
            },
            {
              name: 'Sumo Deadlift',
              sets: 3,
              reps: 8,
              equipment: 'Barbell'
            }
          ]
        }
      ]
    }))
  ]
      }
    }
  ]
};

// Get active program library (checks localStorage first, then falls back to static)
export function getActiveProgramLibrary(): ProgramLibrary {
  try {
    const stored = localStorage.getItem('rsw_program_library');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading program from localStorage:', error);
  }
  return PROGRAM_LIBRARY;
}

// Helper function to get a specific variation
export function getVariation(id: string) {
  const library = getActiveProgramLibrary();
  return library.variations.find(v => v.id === id);
}

// Helper function to get a specific week from a variation
export function getWeekData(variationId: string, weekNumber: number) {
  const variation = getVariation(variationId);
  return variation?.program.weeks.find(w => w.week === weekNumber);
}

// Helper function to get a specific day from a variation
export function getDayData(variationId: string, weekNumber: number, dayNumber: number) {
  const week = getWeekData(variationId, weekNumber);
  return week?.days.find(d => d.day === dayNumber);
}

// Helper function to get all days for a week
export function getDaysForWeek(variationId: string, weekNumber: number) {
  const week = getWeekData(variationId, weekNumber);
  return week?.days || [];
}
