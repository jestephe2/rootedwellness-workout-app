import React from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ProgramDay, Exercise } from '../../types';
import ExerciseBuilder from './ExerciseBuilder';

interface DayBuilderProps {
  day: ProgramDay;
  dayIndex: number;
  onUpdate: (index: number, day: ProgramDay) => void;
  onRemove: (index: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const DayBuilder: React.FC<DayBuilderProps> = ({
  day,
  dayIndex,
  onUpdate,
  onRemove,
  isExpanded,
  onToggleExpand,
}) => {
  const handleDayChange = (field: 'day' | 'title', value: number | string) => {
    onUpdate(dayIndex, {
      ...day,
      [field]: value,
    });
  };

  const handleAddExercise = () => {
    onUpdate(dayIndex, {
      ...day,
      exercises: [
        ...day.exercises,
        { name: '', sets: 3, reps: 10, equipment: '' },
      ],
    });
  };

  const handleUpdateExercise = (exerciseIndex: number, exercise: Exercise) => {
    const newExercises = [...day.exercises];
    newExercises[exerciseIndex] = exercise;
    onUpdate(dayIndex, {
      ...day,
      exercises: newExercises,
    });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    onUpdate(dayIndex, {
      ...day,
      exercises: day.exercises.filter((_, i) => i !== exerciseIndex),
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-beige/20 overflow-hidden">
      {/* Day Header */}
      <div className="p-4 bg-brand-beige/10 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <input
            type="number"
            min="1"
            value={day.day}
            onChange={(e) => handleDayChange('day', parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 rounded-full bg-white text-brand-text text-sm border border-brand-beige/20 focus:border-brand-green focus:outline-none"
            placeholder="Day #"
            required
          />
          <input
            type="text"
            value={day.title}
            onChange={(e) => handleDayChange('title', e.target.value)}
            className="flex-1 px-4 py-2 rounded-full bg-white text-brand-text text-sm border border-brand-beige/20 focus:border-brand-green focus:outline-none"
            placeholder="Day title (e.g., Lower A)"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 hover:bg-brand-beige/20 rounded-full transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(dayIndex)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Remove day"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Day Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Exercises */}
          <div className="space-y-3">
            {day.exercises.map((exercise, idx) => (
              <ExerciseBuilder
                key={idx}
                exercise={exercise}
                exerciseIndex={idx}
                onUpdate={handleUpdateExercise}
                onRemove={handleRemoveExercise}
              />
            ))}
          </div>

          {/* Add Exercise Button */}
          <button
            type="button"
            onClick={handleAddExercise}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-brand-beige text-brand-tan hover:border-brand-green hover:text-brand-green transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus size={18} />
            <span>Add Exercise</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DayBuilder;
