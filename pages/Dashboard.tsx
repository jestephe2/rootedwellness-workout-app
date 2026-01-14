import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Dumbbell, Info, Check } from 'lucide-react';
import { User, CyclePhase, WorkoutLog, ProgramLibrary } from '../types';
import { getDayData, getDaysForWeek, getActiveProgramLibrary } from '../data/program';
import { getPhaseGuidance } from '../data/phaseGuidance';
import { logWeight, getLogs } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<CyclePhase>('Follicular');
  const [programLibrary, setProgramLibrary] = useState<ProgramLibrary>(getActiveProgramLibrary());
  const [selectedVariation, setSelectedVariation] = useState('default');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});

  const phases: CyclePhase[] = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'];

  // Listen for program updates from admin
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rsw_program_library') {
        // Reload program library when admin publishes updates
        setProgramLibrary(getActiveProgramLibrary());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rsw_user');
    const storedEmail = localStorage.getItem('rsw_email');
    const storedPhase = localStorage.getItem('rsw_phase');
    const storedVariation = localStorage.getItem('rsw_variation');
    const storedWeek = localStorage.getItem('rsw_week');
    const storedDay = localStorage.getItem('rsw_day');
    const storedLogs = localStorage.getItem('rsw_logs');

    if (!storedEmail) {
      // No email found, redirect to home
      navigate('/');
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedPhase && phases.includes(storedPhase as CyclePhase)) {
      setPhase(storedPhase as CyclePhase);
    }

    if (storedVariation) {
      setSelectedVariation(storedVariation);
    }

    if (storedWeek) {
      const week = parseInt(storedWeek);
      if (week >= 1 && week <= 6) {
        setSelectedWeek(week);
      }
    }

    if (storedDay) {
      setSelectedDay(parseInt(storedDay));
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, [navigate]);

  // Load weight values from logs when day/week/variation changes
  useEffect(() => {
    const dayData = getDayData(selectedVariation, selectedWeek, selectedDay);
    if (!dayData) return;

    const newWeights: Record<string, number> = {};

    dayData.exercises.forEach(exercise => {
      // Find most recent weight for this exercise
      const exerciseLogs = logs
        .filter(log => log.exercise_name === exercise.name)
        .sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return 0;
        });

      if (exerciseLogs.length > 0) {
        newWeights[exercise.name] = exerciseLogs[0].weight;
      }
    });

    setWeights(newWeights);
  }, [selectedVariation, selectedWeek, selectedDay, logs]);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('rsw_phase', phase);
  }, [phase]);

  useEffect(() => {
    localStorage.setItem('rsw_variation', selectedVariation);
  }, [selectedVariation]);

  useEffect(() => {
    localStorage.setItem('rsw_week', selectedWeek.toString());
  }, [selectedWeek]);

  useEffect(() => {
    localStorage.setItem('rsw_day', selectedDay.toString());
  }, [selectedDay]);

  const handleWeightChange = (exerciseName: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeights({
        ...weights,
        [exerciseName]: numValue
      });
    } else if (value === '') {
      const newWeights = { ...weights };
      delete newWeights[exerciseName];
      setWeights(newWeights);
    }
  };

  const handleWeightBlur = async (exerciseName: string) => {
    const weight = weights[exerciseName];
    if (weight === undefined || weight === null) return;

    const email = localStorage.getItem('rsw_email');
    if (!email) return;

    // Set saving state
    setSavingStates({ ...savingStates, [exerciseName]: true });
    setSavedStates({ ...savedStates, [exerciseName]: false });

    try {
      const response = await logWeight({
        email,
        week: selectedWeek,
        day: selectedDay,
        exercise_name: exerciseName,
        weight
      });

      if (response.status === 'ok') {
        // Create new log entry
        const newLog: WorkoutLog = {
          email,
          week: selectedWeek,
          day: selectedDay,
          exercise_name: exerciseName,
          weight,
          timestamp: new Date().toISOString()
        };

        // Update logs
        const updatedLogs = [...logs, newLog];
        setLogs(updatedLogs);
        localStorage.setItem('rsw_logs', JSON.stringify(updatedLogs));

        // Show saved state
        setSavedStates({ ...savedStates, [exerciseName]: true });

        // Clear saved state after 2 seconds
        setTimeout(() => {
          setSavedStates(prev => ({ ...prev, [exerciseName]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving weight:', error);
      // Could add error state here
    } finally {
      setSavingStates({ ...savingStates, [exerciseName]: false });
    }
  };

  const dayData = getDayData(selectedVariation, selectedWeek, selectedDay);
  const daysInWeek = getDaysForWeek(selectedVariation, selectedWeek);
  const phaseGuidance = getPhaseGuidance(phase);

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-text max-w-md mx-auto pb-24">
      {/* Header */}
      <header className="bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Hey, {user?.first_name || 'there'}!
        </h1>
        <p className="text-sm text-brand-tan mt-1">
          Week {selectedWeek} • Day {selectedDay}
        </p>
      </header>

      <main className="px-6 space-y-6 mt-6">
        {/* Program Selector */}
        {programLibrary.variations.length > 1 && (
          <section className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20">
            <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3">
              Select Program
            </label>
            <div className="relative">
              <select
                value={selectedVariation}
                onChange={(e) => setSelectedVariation(e.target.value)}
                className="appearance-none w-full bg-brand-cream text-brand-text py-3 pl-5 pr-10 rounded-full font-semibold focus:outline-none border-2 border-transparent focus:border-brand-green cursor-pointer"
              >
                {programLibrary.variations.map(variation => (
                  <option key={variation.id} value={variation.id}>
                    {variation.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-tan">
                <ChevronDown size={16} />
              </div>
            </div>
            {programLibrary.variations.find(v => v.id === selectedVariation)?.description && (
              <p className="text-sm text-brand-tan mt-3">
                {programLibrary.variations.find(v => v.id === selectedVariation)?.description}
              </p>
            )}
          </section>
        )}

        {/* Week Selector */}
        <section className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20">
          <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3">
            Select Week
          </label>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }, (_, i) => i + 1).map(week => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`py-3 rounded-2xl font-semibold transition-all ${
                  selectedWeek === week
                    ? 'bg-brand-green text-white shadow-md'
                    : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
                }`}
              >
                {week}
              </button>
            ))}
          </div>
        </section>

        {/* Day Selector */}
        <section className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20">
          <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3">
            Select Day
          </label>
          <div className="grid grid-cols-4 gap-3">
            {daysInWeek.map(day => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`py-3 px-4 rounded-2xl font-semibold transition-all text-sm ${
                  selectedDay === day.day
                    ? 'bg-brand-green text-white shadow-md'
                    : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>
        </section>

        {/* Phase Selector & Guidance */}
        <section className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-beige">
              Cycle Phase
            </h3>
            <div className="relative inline-block text-left">
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as CyclePhase)}
                className="appearance-none bg-brand-cream text-brand-text py-2 pl-4 pr-10 rounded-full text-xs font-bold uppercase focus:outline-none border-none cursor-pointer tracking-wider"
              >
                {phases.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-tan">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="bg-brand-cream/50 rounded-3xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-brand-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-brand-text">
                  {phaseGuidance.guidance}
                </p>
                <ul className="mt-2 space-y-1">
                  {phaseGuidance.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-brand-tan flex items-start gap-1">
                      <span className="text-brand-green mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Workout Display */}
        {dayData ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Dumbbell className="text-brand-green" size={24} />
              <h2 className="text-xl font-bold">{dayData.title}</h2>
            </div>

            <div className="space-y-3">
              {dayData.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-brand-beige/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-brand-text">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-brand-tan mt-0.5">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.equipment && ` • ${exercise.equipment}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={weights[exercise.name] || ''}
                        onChange={(e) => handleWeightChange(exercise.name, e.target.value)}
                        onBlur={() => handleWeightBlur(exercise.name)}
                        placeholder="Enter weight"
                        className="w-full px-4 py-3 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors"
                      />
                    </div>
                    {savingStates[exercise.name] && (
                      <div className="text-brand-tan text-xs mt-6">
                        Saving...
                      </div>
                    )}
                    {savedStates[exercise.name] && (
                      <div className="flex items-center gap-1 text-brand-green text-xs mt-6">
                        <Check size={14} />
                        <span>Saved</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-4xl p-8 shadow-sm text-center">
            <p className="text-brand-tan">
              No workout scheduled for this day. Select a different day.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
