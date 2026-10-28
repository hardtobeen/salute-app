import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  Timer,
  Info,
  Flame,
  CloudRain,
  Moon,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Dumbbell,
  Footprints,
  Activity,
  Award,
  Sparkles,
  Download,
  TrendingUp,
} from 'lucide-react';
import { Exercise, WorkoutSession, LoggedSet, CompletedWorkout, UserProfile, DiaryEntry } from '../types/fitness';
import { WORKOUT_SESSIONS } from '../data/workoutProgram';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { RestTimerModal } from './RestTimerModal';
import { playAppleSound } from '../utils/calculations';
import { triggerHaptic } from '../utils/haptics';
import { calculateAdaptiveRecommendation } from '../utils/progressiveOverloadEngine';
import { EngineLogicInspector } from './EngineLogicInspector';

interface WorkoutViewProps {
  onWorkoutCompleted: (workout: CompletedWorkout) => void;
  activeWeek: number;
  twelveWeekLogs: Record<string, Record<string, string>>;
  workouts: CompletedWorkout[];
  profile: UserProfile;
  diaryEntries: DiaryEntry[];
  onDownloadAllData: () => void;
}

export function WorkoutView({
  onWorkoutCompleted,
  activeWeek,
  twelveWeekLogs,
  workouts,
  profile,
  diaryEntries,
  onDownloadAllData,
}: WorkoutViewProps) {
  // Determine current day of week (0 is Sunday, 1 is Monday...)
  const dayIndex = new Date().getDay();
  const dayMap: Record<number, string> = {
    1: 'push-a',
    2: 'pull-a',
    3: 'legs-a',
    4: 'push-b',
    5: 'pull-b',
    6: 'legs-b',
    0: 'rest-sunday'
  };
  const initialSessionId = dayMap[dayIndex] || 'push-a';

  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);

  // Live Workout State
  const [isLiveWorkout, setIsLiveWorkout] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [isRaining, setIsRaining] = useState(false);
  const [nightShiftTired, setNightShiftTired] = useState(false);

  const recentDiary = diaryEntries[0] || null;

  // Helper to extract last recorded performance for an exercise
  const getLastPerformance = (sessionCategory: string, exerciseId: string) => {
    const sessionLogs = twelveWeekLogs[sessionCategory] || {};
    const logStr = sessionLogs[exerciseId];
    if (logStr) {
      const parts = logStr.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1]; // e.g. "S1:10x15"
      }
    }
    return null;
  };

  // Sets state mapping: [exerciseId]: LoggedSet[]
  const currentSession = WORKOUT_SESSIONS.find((s) => s.id === selectedSessionId) || WORKOUT_SESSIONS[0];

  const initializeSets = (session: WorkoutSession) => {
    const map: Record<string, LoggedSet[]> = {};
    session.exercises.forEach((ex) => {
      const lastPerf = getLastPerformance(session.category, ex.id);
      const rec = calculateAdaptiveRecommendation(
        ex,
        lastPerf,
        profile.currentWeightKg,
        profile.initialWeightKg,
        nightShiftTired ? { ...recentDiary, sleepHours: 5, fatigueLevel: 4, id: 'temp', date: '', moodRating: 2, moodTags: [], sleepQuality: 'insonnia', sorenessAreas: [], hasJointPain: false, hasBackPain: false, notes: '' } : recentDiary
      );

      const setsCount = rec.suggestedSets;
      const defaultWeight = rec.suggestedWeightKg;
      const defaultReps = rec.suggestedReps;

      map[ex.id] = Array.from({ length: setsCount }, (_, i) => ({
        setNumber: i + 1,
        weightKg: defaultWeight,
        reps: defaultReps,
        completed: false,
      }));
    });
    return map;
  };

  const [liveSets, setLiveSets] = useState<Record<string, LoggedSet[]>>(() => initializeSets(currentSession));

  // Switch session tab
  const handleSelectSession = (sessionId: string) => {
    triggerHaptic('selection');
    playAppleSound('tap');
    setSelectedSessionId(sessionId);
    const newSession = WORKOUT_SESSIONS.find((s) => s.id === sessionId) || WORKOUT_SESSIONS[0];
    setLiveSets(initializeSets(newSession));
    setIsLiveWorkout(false);
  };

  const startLiveWorkout = () => {
    triggerHaptic('heavy');
    playAppleSound('tap');
    setIsLiveWorkout(true);
    setWorkoutStartTime(Date.now());
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number, restSeconds: number) => {
    setLiveSets((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets[setIndex]) {
        const wasCompleted = exSets[setIndex].completed;
        const nextState = !wasCompleted;
        if (nextState) {
          triggerHaptic('success');
          playAppleSound('ding');
        } else {
          triggerHaptic('light');
        }
        exSets[setIndex] = {
          ...exSets[setIndex],
          completed: nextState,
        };
        // Auto open rest timer if newly completed
        if (!wasCompleted) {
          setTimerSeconds(restSeconds);
          setIsRestTimerOpen(true);
        }
      }
      return { ...prev, [exerciseId]: exSets };
    });
  };

  const updateSetField = (exerciseId: string, setIndex: number, field: 'weightKg' | 'reps', value: number) => {
    setLiveSets((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets[setIndex]) {
        exSets[setIndex] = {
          ...exSets[setIndex],
          [field]: Math.max(0, value),
        };
      }
      return { ...prev, [exerciseId]: exSets };
    });
  };

  const stepWeight = (exerciseId: string, setIndex: number, delta: number) => {
    triggerHaptic('step');
    setLiveSets((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets[setIndex]) {
        const currentVal = exSets[setIndex].weightKg ?? 0;
        const newVal = Math.max(0, Math.round((currentVal + delta) * 10) / 10);
        exSets[setIndex] = { ...exSets[setIndex], weightKg: newVal };
      }
      return { ...prev, [exerciseId]: exSets };
    });
  };

  const stepReps = (exerciseId: string, setIndex: number, delta: number) => {
    triggerHaptic('step');
    setLiveSets((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets[setIndex]) {
        const currentVal = exSets[setIndex].reps ?? 0;
        const newVal = Math.max(1, currentVal + delta);
        exSets[setIndex] = { ...exSets[setIndex], reps: newVal };
      }
      return { ...prev, [exerciseId]: exSets };
    });
  };

  const addNewSet = (exerciseId: string) => {
    triggerHaptic('medium');
    playAppleSound('tap');
    setLiveSets((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      const nextNum = exSets.length + 1;
      const lastSet = exSets[exSets.length - 1];
      exSets.push({
        setNumber: nextNum,
        weightKg: lastSet ? lastSet.weightKg : 10,
        reps: lastSet ? lastSet.reps : 12,
        completed: false,
      });
      return { ...prev, [exerciseId]: exSets };
    });
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    triggerHaptic('light');
    setLiveSets((prev) => {
      const exSets = [...(prev[exerciseId] || [])];
      if (exSets.length > 1) {
        exSets.splice(setIndex, 1);
        const renumbered = exSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...prev, [exerciseId]: renumbered };
      }
      return prev;
    });
  };

  // Calculate completed stats
  const totalSets = Object.values(liveSets).reduce((acc, sets) => acc + sets.length, 0);
  const completedSets = Object.values(liveSets).reduce((acc, sets) => acc + sets.filter((s) => s.completed).length, 0);
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleFinishWorkout = () => {
    triggerHaptic('success');
    playAppleSound('ring');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34c759', '#ff9500', '#007aff', '#ff2d55'],
      });
    } catch {
      // ignore
    }

    const durationMin = workoutStartTime ? Math.max(15, Math.round((Date.now() - workoutStartTime) / 60000)) : 45;
    const activeKcal = Math.round(durationMin * 7.5); // ~340 kcal for 45 min

    const finishedWorkout: CompletedWorkout = {
      id: 'wkt-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      sessionId: currentSession.id,
      sessionTitle: currentSession.title,
      weekNumber: activeWeek,
      durationMinutes: durationMin,
      activeCaloriesBurned: activeKcal,
      avgHeartRate: 126,
      exercises: currentSession.exercises.map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: liveSets[ex.id] || [],
      })),
      cardioCompleted: true,
      cardioDurationMinutes: isRaining ? 30 : 35,
      cardioType: isRaining ? 'cyclette' : 'camminata',
      notes: nightShiftTired ? 'Seduta gestita con poco sonno (volume ridotto come da guida)' : 'Seduta completata con ottima tecnica',
    };

    onWorkoutCompleted(finishedWorkout);
    setIsLiveWorkout(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 6-Day PPL Segmented Carousel */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        <div className="flex items-center gap-2 min-w-max">
          {WORKOUT_SESSIONS.map((s) => {
            const isSelected = s.id === selectedSessionId;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleSelectSession(s.id)}
                className={`px-4 py-2.5 rounded-2xl flex flex-col items-start transition-all ${
                  isSelected
                    ? 'apple-glass-bright text-white shadow-lg border-white/20'
                    : 'apple-glass-subtle text-neutral-400 hover:text-white border-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                    {s.dayLabel}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                </div>
                <span className="text-sm font-semibold mt-0.5">{s.title}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Engine Sovraccarico Progressivo - Simulator and Logic Inspector */}
      <EngineLogicInspector currentWeightKg={profile.currentWeightKg} initialWeightKg={profile.initialWeightKg} />

      {/* Main Session Hero Card */}
      <div className="apple-glass rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
                Settimana {activeWeek} di 12
              </span>
              <span className="text-xs text-neutral-400">• {currentSession.dayLabel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentSession.title}
            </h1>
            <p className="text-sm text-neutral-300 mt-0.5">{currentSession.focus}</p>
          </div>

          {/* Start / Finish Button */}
          {!isLiveWorkout ? (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={startLiveWorkout}
              className="px-6 py-3 rounded-2xl bg-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Inizia Allenamento
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsRestTimerOpen(true)}
                className="p-3 rounded-2xl bg-white/10 text-white flex items-center gap-1.5 hover:bg-white/15"
                aria-label="Apri timer di recupero"
              >
                <Timer className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium">Timer</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleFinishWorkout}
                className="px-5 py-3 rounded-2xl bg-emerald-500 text-neutral-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Termina Seduta
              </motion.button>
            </div>
          )}
        </div>

        {/* Live Progress Bar if workout active */}
        {isLiveWorkout && (
          <div className="mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-300 font-medium">
                Serie completate: {completedSets} su {totalSets}
              </span>
              <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* Weather & Fatigue Smart Adaptations from PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsRaining(!isRaining)}
            className={`p-2.5 rounded-2xl flex items-center gap-2 text-xs text-left transition-all ${
              isRaining
                ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                : 'bg-white/[0.03] border border-white/5 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CloudRain className={`w-4 h-4 shrink-0 ${isRaining ? 'text-blue-400' : 'text-neutral-500'}`} />
            <div>
              <span className="font-semibold block">Piove oggi?</span>
              <span className="text-[11px] opacity-80">
                {isRaining ? 'Attivato: Cyclette 25-35 min a ritmo moderato' : 'Camminata standard 30-45 min'}
              </span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const nextState = !nightShiftTired;
              setNightShiftTired(nextState);
              if (nextState) {
                // reduce 1 set from each
                setLiveSets(initializeSets(currentSession));
              }
            }}
            className={`p-2.5 rounded-2xl flex items-center gap-2 text-xs text-left transition-all ${
              nightShiftTired
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200'
                : 'bg-white/[0.03] border border-white/5 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Moon className={`w-4 h-4 shrink-0 ${nightShiftTired ? 'text-purple-400' : 'text-neutral-500'}`} />
            <div>
              <span className="font-semibold block">Poco sonno o turno notte?</span>
              <span className="text-[11px] opacity-80">
                {nightShiftTired ? 'Riduci 1 serie per esercizio (come da guida)' : 'Regime di volume pieno'}
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Routine Standard Warm-up (PDF: 6-8 minuti) */}
      <div className="apple-glass rounded-2xl p-4 flex items-center justify-between border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Riscaldamento Standard (6-8 min)</h4>
            <p className="text-xs text-neutral-400">5 min camminata/cyclette + 1 serie leggera primo esercizio (10-12 rip)</p>
          </div>
        </div>
        <span className="text-xs text-amber-400 font-medium px-2 py-1 bg-amber-400/10 rounded-lg">
          Consigliato
        </span>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-rose-400" />
            Esercizi del Giorno ({currentSession.exercises.length})
          </h3>
          <span className="text-xs text-neutral-400">Tocca per dettagli tecnici ed errori</span>
        </div>

        {currentSession.exercises.map((ex, exIndex) => {
          const sets = liveSets[ex.id] || [];
          const allCompleted = sets.length > 0 && sets.every((s) => s.completed);
          const lastPerf = getLastPerformance(currentSession.category, ex.id);
          const rec = calculateAdaptiveRecommendation(
            ex,
            lastPerf,
            profile.currentWeightKg,
            profile.initialWeightKg,
            recentDiary
          );

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: exIndex * 0.04 }}
              className={`apple-liquid-glass rounded-3xl p-5 border transition-all ${
                allCompleted ? 'border-emerald-500/40 bg-emerald-950/15' : 'border-white/10'
              }`}
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Esercizio {exIndex + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-neutral-300">
                      {ex.equipment}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-[11px] text-orange-400 font-mono">
                      Rec. {ex.restSeconds}s
                    </span>
                    {lastPerf && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                        Ultimo: {lastPerf}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    {ex.name}
                  </h4>
                  <p className="text-xs text-rose-300/90 mt-0.5">{ex.notes}</p>

                  {/* Adaptive Overload Engine Pill */}
                  <div className="mt-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/8 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-[11px] leading-tight">
                      <span className="font-bold text-amber-300 mr-1.5">{rec.badgeLabel}:</span>
                      <span className="text-neutral-300">{rec.rationale}</span>
                    </div>
                  </div>
                </div>

                {/* Details Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedExerciseForModal(ex)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 flex items-center justify-center shrink-0 border border-white/10"
                  aria-label={`Dettagli ${ex.name}`}
                >
                  <Info className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Sets Table */}
              <div className="space-y-2 mt-4">
                <div className="grid grid-cols-12 text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-3 pb-1">
                  <span className="col-span-2">Serie</span>
                  <span className="col-span-4 text-center">Carico (kg)</span>
                  <span className="col-span-4 text-center">Ripetizioni</span>
                  <span className="col-span-2 text-right">Fatto</span>
                </div>

                {sets.map((set, sIdx) => (
                  <motion.div
                    key={sIdx}
                    whileHover={{ scale: 1.005 }}
                    className={`grid grid-cols-12 items-center px-2 sm:px-3 py-2.5 rounded-2xl transition-all ${
                      set.completed
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
                        : 'bg-white/[0.03] border border-white/5 text-neutral-200'
                    }`}
                  >
                    {/* Set Number & quick remove if > 1 */}
                    <div className="col-span-2 flex items-center gap-1">
                      <span className="font-bold text-xs text-white">
                        #{set.setNumber}
                      </span>
                      {sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(ex.id, sIdx)}
                          className="w-4 h-4 rounded text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                          title="Rimuovi serie"
                          aria-label={`Rimuovi serie ${set.setNumber}`}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Weight Stepper with Tactile Haptic Buttons */}
                    <div className="col-span-4 flex items-center justify-center gap-0.5 sm:gap-1">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.82 }}
                        onClick={() => stepWeight(ex.id, sIdx, -0.5)}
                        className="w-6 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:bg-rose-500/25 active:border-rose-500/40 text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 select-none touch-manipulation cursor-pointer shadow-sm transition-all"
                        aria-label={`Diminuisci carico serie ${set.setNumber}`}
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <input
                        type="number"
                        step="0.5"
                        value={set.weightKg}
                        onChange={(e) => {
                          triggerHaptic('step');
                          updateSetField(ex.id, sIdx, 'weightKg', parseFloat(e.target.value) || 0);
                        }}
                        className="w-12 h-7 text-center bg-black/50 rounded-lg border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-rose-500 font-mono"
                        aria-label={`Carico serie ${set.setNumber} per ${ex.name}`}
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.82 }}
                        onClick={() => stepWeight(ex.id, sIdx, 0.5)}
                        className="w-6 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:bg-rose-500/25 active:border-rose-500/40 text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 select-none touch-manipulation cursor-pointer shadow-sm transition-all"
                        aria-label={`Aumenta carico serie ${set.setNumber}`}
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>

                    {/* Reps Stepper with Tactile Haptic Buttons */}
                    <div className="col-span-4 flex items-center justify-center gap-0.5 sm:gap-1">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.82 }}
                        onClick={() => stepReps(ex.id, sIdx, -1)}
                        className="w-6 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:bg-rose-500/25 active:border-rose-500/40 text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 select-none touch-manipulation cursor-pointer shadow-sm transition-all"
                        aria-label={`Diminuisci ripetizioni serie ${set.setNumber}`}
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => {
                          triggerHaptic('step');
                          updateSetField(ex.id, sIdx, 'reps', parseInt(e.target.value) || 0);
                        }}
                        className="w-10 h-7 text-center bg-black/50 rounded-lg border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-rose-500 font-mono"
                        aria-label={`Ripetizioni serie ${set.setNumber} per ${ex.name}`}
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.82 }}
                        onClick={() => stepReps(ex.id, sIdx, 1)}
                        className="w-6 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:bg-rose-500/25 active:border-rose-500/40 text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 select-none touch-manipulation cursor-pointer shadow-sm transition-all"
                        aria-label={`Aumenta ripetizioni serie ${set.setNumber}`}
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>

                    {/* Completed Checkbox */}
                    <div className="col-span-2 flex justify-end">
                      <motion.button
                        whileTap={{ scale: 0.82 }}
                        onClick={() => toggleSetComplete(ex.id, sIdx, ex.restSeconds)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          set.completed
                            ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30'
                            : 'bg-white/10 text-transparent hover:text-white/40 border border-white/10'
                        }`}
                        aria-label={`Segna completata serie ${set.setNumber} di ${ex.name}`}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

                {/* Add Extra Set */}
                <div className="flex justify-end pt-1">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => addNewSet(ex.id)}
                    className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/8 transition-all cursor-pointer font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aggiungi serie
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Post Workout Cardio & Rules Summary */}
      <div className="apple-glass rounded-3xl p-5 border border-white/5 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Footprints className="w-4 h-4" />
          <h4 className="text-sm font-bold text-white tracking-tight">Camminata o Cyclette Quotidiana</h4>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {currentSession.cardio}. Come sottolineato dal programma: <span className="text-white italic">"Camminata o cyclette ogni giorno come movimento, non come punizione."</span>
        </p>
        <div className="text-[11px] text-neutral-400 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
          <strong className="text-neutral-200">Regola di Sicurezza Schiena:</strong> Fermati sempre prima che la postura ceda. Dolore acuto, formicolio o perdita di forza significano stop immediato.
        </div>
      </div>

      {/* Modals */}
      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        onClose={() => setSelectedExerciseForModal(null)}
      />

      <RestTimerModal
        isOpen={isRestTimerOpen}
        defaultSeconds={timerSeconds}
        onClose={() => setIsRestTimerOpen(false)}
      />
    </div>
  );
}
