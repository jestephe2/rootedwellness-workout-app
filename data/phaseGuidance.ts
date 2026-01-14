// Cycle Phase Guidance Data
// Based on RSW spec - guidance is advisory only and never alters program automatically

import { CyclePhase, PhaseGuidance } from '../types';

export const PHASE_GUIDANCE: Record<CyclePhase, PhaseGuidance> = {
  Menstrual: {
    phase: 'Menstrual',
    guidance: 'Light to moderate effort. Stop 2-3 reps shy of failure.',
    recommendations: [
      'Reduce intensity if needed',
      'Focus on movement quality',
      'Reduce sets if energy is low',
      'Prioritize rest between sets'
    ]
  },
  Follicular: {
    phase: 'Follicular',
    guidance: 'Build load gradually. Focus on crisp technique.',
    recommendations: [
      'Great time to progress weights',
      'Energy should be building',
      'Focus on movement precision',
      'Build momentum this week'
    ]
  },
  Ovulatory: {
    phase: 'Ovulatory',
    guidance: 'Option to push intensity if energy is high.',
    recommendations: [
      'Peak performance window',
      'Can handle higher intensity',
      'Consider pushing effort levels',
      'Recovery should be strong'
    ]
  },
  Luteal: {
    phase: 'Luteal',
    guidance: 'Prioritize control and recovery. Slightly reduce load and extend rest.',
    recommendations: [
      'Maintain consistency over intensity',
      'Extend rest periods as needed',
      'Focus on controlled movement',
      'Honor your body\'s signals'
    ]
  }
};

// Helper function to get guidance for a phase
export function getPhaseGuidance(phase: CyclePhase): PhaseGuidance {
  return PHASE_GUIDANCE[phase];
}
