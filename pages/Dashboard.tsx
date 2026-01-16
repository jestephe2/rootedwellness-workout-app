import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Dumbbell, Info, Check } from 'lucide-react';
import { User, CyclePhase, WorkoutLog, ProgramLibrary } from '../types';
import { getDayData, getDaysForWeek, getActiveProgramLibrary } from '../data/program';
import { getPhaseGuidance } from '../data/phaseGuidance';
import { logWeight, getLogs } from '../services/api';

// DEV MODE - Set to true to bypass authentication and use mock data
const DEV_MODE = true;

// Mock user data for development
const MOCK_USER: User = {
  email: 'dev@example.com',
  first_name: 'Rachel',
  primary_goal: 'build_strength',
  target_days_per_week: '3',
  biggest_obstacle: 'motivation',
  created_at: new Date().toISOString(),
  last_active_at: new Date().toISOString()
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<CyclePhase>('Follicular');
  const [programLibrary, setProgramLibrary] = useState<ProgramLibrary>(getActiveProgramLibrary());
  const [selectedVariation, setSelectedVariation] = useState('default');
  const [daysPerWeek, setDaysPerWeek] = useState<3 | 4>(3);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [weights, setWeights] = useState<Record<string, Record<number, number>>>({});
  const [savingStates, setSavingStates] = useState<Record<string, Record<number, boolean>>>({});
  const [savedStates, setSavedStates] = useState<Record<string, Record<number, boolean>>>({});

  // Workout session state
  const [workoutStatus, setWorkoutStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');
  const [selectorsExpanded, setSelectorsExpanded] = useState(false);
  const [phaseInfoExpanded, setPhaseInfoExpanded] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showNourishment, setShowNourishment] = useState(false);
  const [reflectionMoods, setReflectionMoods] = useState<string[]>([]);
  const [reflectionNote, setReflectionNote] = useState('');
  const [selectedTips, setSelectedTips] = useState<string[]>([]);
  const [showProgramComplete, setShowProgramComplete] = useState(false);
  const [showSplitWarning, setShowSplitWarning] = useState(false);
  const [pendingDaysPerWeek, setPendingDaysPerWeek] = useState<3 | 4 | null>(null);

  const phases: CyclePhase[] = ['Menstrual', 'Follicular', 'Ovulatory', 'Luteal'];

  // Nourishment tips for post-workout
  const nourishmentTips = [
    "Drink 16-20oz of water in the next hour to rehydrate your body",
    "Get 20-30g of protein within the next 2 hours to support muscle recovery",
    "Your muscles grow during rest, not during the workout",
    "Aim for 7-9 hours of quality sleep tonight for optimal recovery",
    "A 10-minute walk helps clear metabolic waste and reduce soreness",
    "Eat whole, colorful foods to support your body's natural recovery",
    "You just invested in your future self—that's something to celebrate",
    "Stretching for 5-10 minutes can reduce tomorrow's soreness",
    "Magnesium-rich foods (spinach, nuts, seeds) support muscle relaxation",
    "Your body is adapting and getting stronger right now",
    "Recovery is when the magic happens—honor your rest days",
    "Electrolytes (sodium, potassium) help replenish what you lost",
    "Consistent effort over time creates lasting change",
    "Listen to your body's signals—it knows what it needs",
    "Nutrition is fuel, not a reward or punishment"
  ];

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
    // DEV MODE: Skip authentication and use mock data
    if (DEV_MODE) {
      setUser(MOCK_USER);
      return;
    }

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

    const storedDaysPerWeek = localStorage.getItem('rsw_days_per_week');
    if (storedDaysPerWeek) {
      const days = parseInt(storedDaysPerWeek);
      if (days === 3 || days === 4) {
        setDaysPerWeek(days as 3 | 4);
      }
    }

    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, [navigate]);

  // Load weight values from logs when day/week/variation changes
  useEffect(() => {
    const dayData = getDayData(selectedVariation, selectedWeek, selectedDay);
    if (!dayData) return;

    const newWeights: Record<string, Record<number, number>> = {};

    dayData.exercises.forEach(exercise => {
      // Find most recent weights for each set of this exercise
      const exerciseLogs = logs
        .filter(log => log.exercise_name === exercise.name)
        .sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return 0;
        });

      if (exerciseLogs.length > 0) {
        newWeights[exercise.name] = {};
        // Assign most recent logs to sets
        exerciseLogs.slice(0, exercise.sets).forEach((log, idx) => {
          newWeights[exercise.name][idx + 1] = log.weight;
        });
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

  useEffect(() => {
    localStorage.setItem('rsw_days_per_week', daysPerWeek.toString());
  }, [daysPerWeek]);

  const handleWeightChange = (exerciseName: string, setNumber: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeights({
        ...weights,
        [exerciseName]: {
          ...(weights[exerciseName] || {}),
          [setNumber]: numValue
        }
      });
    } else if (value === '') {
      const newWeights = { ...weights };
      if (newWeights[exerciseName]) {
        delete newWeights[exerciseName][setNumber];
        if (Object.keys(newWeights[exerciseName]).length === 0) {
          delete newWeights[exerciseName];
        }
      }
      setWeights(newWeights);
    }
  };

  const handleWeightBlur = async (exerciseName: string, setNumber: number) => {
    const weight = weights[exerciseName]?.[setNumber];
    if (weight === undefined || weight === null) return;

    // DEV MODE: Skip API call, just show saved state
    if (DEV_MODE) {
      setSavingStates({
        ...savingStates,
        [exerciseName]: { ...(savingStates[exerciseName] || {}), [setNumber]: true }
      });
      setTimeout(() => {
        setSavingStates({
          ...savingStates,
          [exerciseName]: { ...(savingStates[exerciseName] || {}), [setNumber]: false }
        });
        setSavedStates({
          ...savedStates,
          [exerciseName]: { ...(savedStates[exerciseName] || {}), [setNumber]: true }
        });
        setTimeout(() => {
          setSavedStates(prev => ({
            ...prev,
            [exerciseName]: { ...(prev[exerciseName] || {}), [setNumber]: false }
          }));
        }, 2000);
      }, 500);
      return;
    }

    const email = localStorage.getItem('rsw_email');
    if (!email) return;

    // Set saving state
    setSavingStates({
      ...savingStates,
      [exerciseName]: { ...(savingStates[exerciseName] || {}), [setNumber]: true }
    });
    setSavedStates({
      ...savedStates,
      [exerciseName]: { ...(savedStates[exerciseName] || {}), [setNumber]: false }
    });

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
        setSavedStates({
          ...savedStates,
          [exerciseName]: { ...(savedStates[exerciseName] || {}), [setNumber]: true }
        });

        // Clear saved state after 2 seconds
        setTimeout(() => {
          setSavedStates(prev => ({
            ...prev,
            [exerciseName]: { ...(prev[exerciseName] || {}), [setNumber]: false }
          }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving weight:', error);
    } finally {
      setSavingStates({
        ...savingStates,
        [exerciseName]: { ...(savingStates[exerciseName] || {}), [setNumber]: false }
      });
    }
  };

  const dayData = getDayData(selectedVariation, selectedWeek, selectedDay);
  const daysInWeek = getDaysForWeek(selectedVariation, selectedWeek);
  const phaseGuidance = getPhaseGuidance(phase);

  // Calculate workout progress (count total sets completed)
  const totalSets = dayData?.exercises.reduce((sum, ex) => sum + ex.sets, 0) || 0;
  const completedSets = dayData?.exercises.reduce((sum, ex) => {
    const exerciseSets = weights[ex.name];
    if (!exerciseSets) return sum;
    return sum + Object.keys(exerciseSets).length;
  }, 0) || 0;

  // Helper functions
  const startWorkout = () => {
    setWorkoutStatus('in_progress');
    localStorage.setItem('rsw_workout_status', 'in_progress');
  };

  const completeWorkout = () => {
    setWorkoutStatus('completed');
    setShowReflection(true);
    localStorage.setItem('rsw_workout_status', 'completed');
  };

  const submitReflection = () => {
    // Save reflection data
    const reflectionData = {
      date: new Date().toISOString(),
      week: selectedWeek,
      day: selectedDay,
      moods: reflectionMoods,
      note: reflectionNote
    };
    localStorage.setItem('rsw_last_reflection', JSON.stringify(reflectionData));

    // Randomly select 4 tips
    const shuffled = [...nourishmentTips].sort(() => Math.random() - 0.5);
    setSelectedTips(shuffled.slice(0, 4));

    // Show nourishment screen
    setShowReflection(false);
    setShowNourishment(true);
  };

  const closeNourishment = () => {
    // Check if at end of program (Week 6, last day)
    if (selectedWeek === 6 && selectedDay === daysPerWeek) {
      // Show program completion modal
      setShowNourishment(false);
      setShowProgramComplete(true);
      return;
    }

    // Calculate next day/week
    let nextWeek = selectedWeek;
    let nextDay = selectedDay;

    if (selectedDay < daysPerWeek) {
      // Progress to next day in current week
      nextDay = selectedDay + 1;
    } else {
      // Current day is the last day of the week, progress to next week
      nextWeek = selectedWeek + 1;
      nextDay = 1;
    }

    // Update state
    setSelectedWeek(nextWeek);
    setSelectedDay(nextDay);

    // Reset for next workout
    setShowNourishment(false);
    setWorkoutStatus('not_started');
    setReflectionMoods([]);
    setReflectionNote('');
    setSelectedTips([]);
    localStorage.setItem('rsw_workout_status', 'not_started');
  };

  const restartProgram = () => {
    // Reset to Week 1, Day 1
    setSelectedWeek(1);
    setSelectedDay(1);
    setShowProgramComplete(false);
    setWorkoutStatus('not_started');
    setReflectionMoods([]);
    setReflectionNote('');
    setSelectedTips([]);
    localStorage.setItem('rsw_workout_status', 'not_started');
  };

  const closeProgramComplete = () => {
    // Stay at Week 6, last day
    setShowProgramComplete(false);
    setWorkoutStatus('not_started');
    setReflectionMoods([]);
    setReflectionNote('');
    setSelectedTips([]);
    localStorage.setItem('rsw_workout_status', 'not_started');
  };

  const handleDaysPerWeekChange = (newDays: 3 | 4) => {
    // Check if changing from 4 to 3 and currently on day 4
    if (newDays < daysPerWeek && selectedDay > newDays) {
      // Show warning modal
      setPendingDaysPerWeek(newDays);
      setShowSplitWarning(true);
    } else {
      // Safe to change directly
      setDaysPerWeek(newDays);
    }
  };

  const confirmSplitChange = () => {
    if (pendingDaysPerWeek) {
      setDaysPerWeek(pendingDaysPerWeek);
      setSelectedDay(pendingDaysPerWeek); // Move to last valid day
      setPendingDaysPerWeek(null);
    }
    setShowSplitWarning(false);
  };

  const cancelSplitChange = () => {
    setPendingDaysPerWeek(null);
    setShowSplitWarning(false);
  };

  const toggleMood = (mood: string) => {
    if (reflectionMoods.includes(mood)) {
      setReflectionMoods(reflectionMoods.filter(m => m !== mood));
    } else {
      setReflectionMoods([...reflectionMoods, mood]);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-text max-w-md mx-auto pb-28">
      {/* Header */}
      <header className="bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Hey, {user?.first_name || 'there'}!
        </h1>
        <p className="text-sm text-brand-tan mt-1">
          Week {selectedWeek} • Day {selectedDay}
        </p>
        {workoutStatus === 'in_progress' && totalSets > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-brand-beige mb-1">
              <span>{completedSets} of {totalSets} sets logged</span>
            </div>
            <div className="w-full bg-brand-cream rounded-full h-2">
              <div
                className="bg-brand-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSets / totalSets) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="px-6 space-y-6 mt-6">
        {/* Collapsed Selectors - Only show when not in active workout */}
        {workoutStatus === 'not_started' && (
          <button
            onClick={() => setSelectorsExpanded(!selectorsExpanded)}
            className="w-full bg-white rounded-3xl p-4 shadow-sm border border-brand-beige/20 flex items-center justify-between"
          >
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-beige">
                Today's Workout
              </p>
              <p className="text-sm font-semibold text-brand-text mt-1">
                Week {selectedWeek}, Day {selectedDay} • {daysPerWeek} day split
              </p>
            </div>
            <ChevronDown
              size={20}
              className={`text-brand-tan transition-transform ${selectorsExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {selectorsExpanded && workoutStatus === 'not_started' && (
          <section className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20 space-y-6">
            {/* Days Per Week Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3">
                Days Per Week
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDaysPerWeekChange(3)}
                  className={`flex-1 py-4 px-6 rounded-full font-semibold transition-all min-h-[52px] ${
                    daysPerWeek === 3
                      ? 'bg-brand-green text-white shadow-md'
                      : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
                  }`}
                >
                  3 Days
                </button>
                <button
                  onClick={() => handleDaysPerWeekChange(4)}
                  className={`flex-1 py-4 px-6 rounded-full font-semibold transition-all min-h-[52px] ${
                    daysPerWeek === 4
                      ? 'bg-brand-green text-white shadow-md'
                      : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
                  }`}
                >
                  4 Days
                </button>
              </div>
            </div>

            {/* Week Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3">
                Select Week
              </label>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, i) => i + 1).map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`py-4 rounded-2xl font-semibold transition-all min-h-[48px] ${
                      selectedWeek === week
                        ? 'bg-brand-green text-white shadow-md'
                        : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
                    }`}
                  >
                    {week}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3">
                Select Day
              </label>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: daysPerWeek }, (_, i) => i + 1).map(dayNum => (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`py-4 px-4 rounded-2xl font-semibold transition-all text-sm min-h-[48px] ${
                      selectedDay === dayNum
                        ? 'bg-brand-green text-white shadow-md'
                        : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
                    }`}
                  >
                    Day {dayNum}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Slim Cycle Phase Banner */}
        <div className="bg-white rounded-3xl px-4 py-3 shadow-sm border border-brand-beige/20">
          <button
            onClick={() => setPhaseInfoExpanded(!phaseInfoExpanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Info size={16} className="text-brand-green" />
              <span className="text-sm font-medium text-brand-text">
                {phase} Phase
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-brand-tan transition-transform ${phaseInfoExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {phaseInfoExpanded && (
            <div className="mt-3 pt-3 border-t border-brand-beige/20">
              <p className="text-sm text-brand-text mb-2">
                {phaseGuidance.guidance}
              </p>
              <ul className="space-y-1">
                {phaseGuidance.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-brand-tan flex items-start gap-1">
                    <span className="text-brand-green mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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

                  <div className="space-y-3">
                    {Array.from({ length: exercise.sets }, (_, setIdx) => {
                      const setNum = setIdx + 1;
                      const lastLog = logs
                        .filter(log => log.exercise_name === exercise.name)
                        .sort((a, b) => {
                          if (a.timestamp && b.timestamp) {
                            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                          }
                          return 0;
                        })[setIdx];

                      return (
                        <div key={setNum} className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-2">
                                Set {setNum}
                              </label>
                              <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="5"
                                value={weights[exercise.name]?.[setNum] || ''}
                                onChange={(e) => handleWeightChange(exercise.name, setNum, e.target.value)}
                                onBlur={() => handleWeightBlur(exercise.name, setNum)}
                                placeholder="Weight (lbs)"
                                disabled={workoutStatus === 'completed'}
                                className="w-full px-4 py-4 rounded-full bg-brand-cream text-brand-text text-base border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors disabled:opacity-50 min-h-[48px]"
                              />
                            </div>
                            {savingStates[exercise.name]?.[setNum] && (
                              <div className="text-brand-tan text-sm mt-6">
                                Saving...
                              </div>
                            )}
                            {savedStates[exercise.name]?.[setNum] && (
                              <div className="flex items-center gap-1 text-brand-green text-sm mt-6">
                                <Check size={16} />
                                <span>Saved</span>
                              </div>
                            )}
                          </div>
                          {lastLog && (
                            <p className="text-xs text-brand-tan pl-4">
                              Last time: {lastLog.weight} lbs
                            </p>
                          )}
                        </div>
                      );
                    })}
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

      {/* Sticky Start/Complete Workout CTA */}
      {dayData && !showReflection && !showNourishment && (
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto transition-all ${
          workoutStatus === 'in_progress'
            ? 'px-6 py-3'
            : 'bg-white border-t border-brand-beige/20 shadow-lg px-6 py-4'
        }`}>
          {workoutStatus === 'not_started' ? (
            <button
              onClick={startWorkout}
              className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-bold text-lg shadow-lg hover:bg-brand-green/90 transition-all"
            >
              <div className="flex flex-col items-center">
                <span>Start {dayData.title} Workout</span>
                <span className="text-xs font-normal opacity-90 mt-1">
                  ~{dayData.exercises.reduce((sum, ex) => sum + ex.sets, 0) * 3} minutes
                </span>
              </div>
            </button>
          ) : workoutStatus === 'in_progress' ? (
            <button
              onClick={completeWorkout}
              className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-semibold shadow-lg hover:bg-brand-green/90 transition-all min-h-[56px]"
            >
              Click me when done!
            </button>
          ) : null}
        </div>
      )}

      {/* Post-Workout Reflection Modal */}
      {showReflection && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 max-w-md mx-auto">
          <div className="bg-white rounded-t-4xl w-full p-6 pb-8 space-y-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-brand-text">Great Work!</h2>
              <p className="text-sm text-brand-tan mt-2">How did this workout feel?</p>
            </div>

            {/* Mood Selection - Tap to Select */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '💪', label: 'Felt strong' },
                { emoji: '🧠', label: 'Mind felt clear' },
                { emoji: '🫁', label: 'Breathing felt easy' },
                { emoji: '🦵', label: 'Joints felt good' },
                { emoji: '⚡', label: 'Energy increased' },
                { emoji: '😌', label: 'Felt calm after' },
                { emoji: '😴', label: 'Slept better later' },
                { emoji: '🤷', label: 'Didn\'t feel great today' }
              ].map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => toggleMood(mood.label)}
                  className={`py-4 px-4 rounded-2xl border-2 transition-all text-left min-h-[60px] ${
                    reflectionMoods.includes(mood.label)
                      ? 'border-brand-green bg-brand-green/10'
                      : 'border-brand-beige/30 bg-white hover:border-brand-green/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-sm font-medium text-brand-text">{mood.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Optional Note - Collapsed by Default */}
            <details className="group">
              <summary className="text-sm text-brand-tan cursor-pointer hover:text-brand-text transition-colors list-none flex items-center gap-2">
                <span>Add a note (optional)</span>
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <textarea
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                placeholder="Any thoughts about today's workout..."
                className="w-full mt-3 px-4 py-3 rounded-2xl bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors resize-none"
                rows={3}
              />
            </details>

            {/* Submit Button */}
            <button
              onClick={submitReflection}
              className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-bold shadow-lg hover:bg-brand-green/90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Post-Workout Nourishment Screen */}
      {showNourishment && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 max-w-md mx-auto">
          <div className="bg-white rounded-t-4xl w-full p-6 pb-8 space-y-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-brand-text">
                Great job, you showed up for yourself! 🎉
              </h2>
              <p className="text-brand-tan">
                Here's how to nourish your body:
              </p>
            </div>

            {/* Nourishment Tips */}
            <div className="space-y-3">
              {selectedTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-brand-cream/50 rounded-2xl p-4 border-l-4 border-brand-green"
                >
                  <p className="text-sm text-brand-text leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={closeNourishment}
              className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-bold shadow-lg hover:bg-brand-green/90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Program Completion Celebration Modal */}
      {showProgramComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 max-w-md mx-auto p-6">
          <div className="bg-white rounded-4xl w-full p-8 space-y-6 animate-slide-up">
            <div className="text-center space-y-3">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-bold text-brand-text">
                Program Complete!
              </h2>
              <p className="text-brand-tan">
                You just completed all 6 weeks! That's incredible dedication. You showed up for yourself consistently and that's what creates lasting change.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={restartProgram}
                className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-bold shadow-lg hover:bg-brand-green/90 transition-all"
              >
                Restart Program
              </button>
              <button
                onClick={closeProgramComplete}
                className="w-full bg-brand-cream text-brand-text py-4 px-6 rounded-full font-semibold hover:bg-brand-beige/30 transition-all"
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split-Switch Warning Modal */}
      {showSplitWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 max-w-md mx-auto p-6">
          <div className="bg-white rounded-4xl w-full p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="text-5xl">⚠️</div>
              <h2 className="text-2xl font-bold text-brand-text">
                Switch to {pendingDaysPerWeek}-Day Split?
              </h2>
              <p className="text-brand-tan">
                You're currently on Day {selectedDay}. Switching to a {pendingDaysPerWeek}-day split will move you to Day {pendingDaysPerWeek}.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={confirmSplitChange}
                className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-bold shadow-lg hover:bg-brand-green/90 transition-all"
              >
                Continue
              </button>
              <button
                onClick={cancelSplitChange}
                className="w-full bg-brand-cream text-brand-text py-4 px-6 rounded-full font-semibold hover:bg-brand-beige/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
