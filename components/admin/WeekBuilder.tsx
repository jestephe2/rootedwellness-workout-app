import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ProgramWeek, ProgramDay } from '../../types';
import DayBuilder from './DayBuilder';

interface WeekBuilderProps {
  week: ProgramWeek;
  weekIndex: number;
  onUpdate: (index: number, week: ProgramWeek) => void;
}

const WeekBuilder: React.FC<WeekBuilderProps> = ({ week, weekIndex, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(weekIndex === 0);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    0: true,
  });

  const handleAddDay = () => {
    onUpdate(weekIndex, {
      ...week,
      days: [
        ...week.days,
        {
          day: week.days.length + 1,
          title: '',
          exercises: [{ name: '', sets: 3, reps: 10, equipment: '' }],
        },
      ],
    });
  };

  const handleUpdateDay = (dayIndex: number, day: ProgramDay) => {
    const newDays = [...week.days];
    newDays[dayIndex] = day;
    onUpdate(weekIndex, {
      ...week,
      days: newDays,
    });
  };

  const handleRemoveDay = (dayIndex: number) => {
    onUpdate(weekIndex, {
      ...week,
      days: week.days.filter((_, i) => i !== dayIndex),
    });
  };

  const toggleDayExpand = (dayIndex: number) => {
    setExpandedDays({
      ...expandedDays,
      [dayIndex]: !expandedDays[dayIndex],
    });
  };

  return (
    <div className="bg-brand-cream rounded-4xl border-2 border-brand-beige/30 overflow-hidden">
      {/* Week Header */}
      <div
        className="p-5 bg-brand-green/10 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-bold text-brand-text">
          Week {week.week}
          <span className="ml-3 text-sm font-normal text-brand-tan">
            ({week.days.length} day{week.days.length !== 1 ? 's' : ''})
          </span>
        </h3>
        <button
          type="button"
          className="p-2 hover:bg-brand-green/10 rounded-full transition-colors"
        >
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {/* Week Content */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Days */}
          <div className="space-y-4">
            {week.days.map((day, idx) => (
              <DayBuilder
                key={idx}
                day={day}
                dayIndex={idx}
                onUpdate={handleUpdateDay}
                onRemove={handleRemoveDay}
                isExpanded={expandedDays[idx] || false}
                onToggleExpand={() => toggleDayExpand(idx)}
              />
            ))}
          </div>

          {/* Add Day Button */}
          <button
            type="button"
            onClick={handleAddDay}
            className="w-full py-4 px-6 rounded-3xl border-2 border-dashed border-brand-green/40 text-brand-green hover:border-brand-green hover:bg-brand-green/5 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Plus size={20} />
            <span>Add Day to Week {week.week}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WeekBuilder;
