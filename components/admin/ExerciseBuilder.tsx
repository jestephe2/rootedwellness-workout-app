import React from 'react';
import { X } from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseBuilderProps {
  exercise: Exercise;
  exerciseIndex: number;
  onUpdate: (index: number, exercise: Exercise) => void;
  onRemove: (index: number) => void;
}

const ExerciseBuilder: React.FC<ExerciseBuilderProps> = ({
  exercise,
  exerciseIndex,
  onUpdate,
  onRemove,
}) => {
  const handleChange = (field: keyof Exercise, value: string | number) => {
    onUpdate(exerciseIndex, {
      ...exercise,
      [field]: value,
    });
  };

  return (
    <div className="bg-brand-cream/50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-beige">
          Exercise {exerciseIndex + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(exerciseIndex)}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Remove exercise"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Exercise name"
            className="w-full px-4 py-2 rounded-full bg-white text-brand-text text-sm border border-brand-beige/20 focus:border-brand-green focus:outline-none"
            required
          />
        </div>

        <div>
          <input
            type="number"
            min="1"
            value={exercise.sets}
            onChange={(e) => handleChange('sets', parseInt(e.target.value) || 1)}
            placeholder="Sets"
            className="w-full px-4 py-2 rounded-full bg-white text-brand-text text-sm border border-brand-beige/20 focus:border-brand-green focus:outline-none"
            required
          />
        </div>

        <div>
          <input
            type="text"
            value={exercise.reps}
            onChange={(e) => handleChange('reps', e.target.value)}
            placeholder="Reps (e.g., 12 or 8-10)"
            className="w-full px-4 py-2 rounded-full bg-white text-brand-text text-sm border border-brand-beige/20 focus:border-brand-green focus:outline-none"
            required
          />
        </div>

        <div className="col-span-2">
          <input
            type="text"
            value={exercise.equipment || ''}
            onChange={(e) => handleChange('equipment', e.target.value)}
            placeholder="Equipment (optional)"
            className="w-full px-4 py-2 rounded-full bg-white text-brand-text text-sm border border-brand-beige/20 focus:border-brand-green focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ExerciseBuilder;
