/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { TabBar, TabKey } from './components/TabBar';
import { WorkoutView } from './components/WorkoutView';
import { NutritionView } from './components/NutritionView';
import { ProgressView } from './components/ProgressView';
import { DiaryView } from './components/DiaryView';
import { AppleHealthSyncView } from './components/AppleHealthSyncView';
import { GuideView } from './components/GuideView';

import {
  UserProfile,
  CompletedWorkout,
  MealEntry,
  DiaryEntry,
  MeasurementEntry,
  AppleHealthData,
} from './types/fitness';
import { DEFAULT_USER_PROFILE, GROCERY_ITEMS } from './data/workoutProgram';
import { exportFull12WeeksCSV } from './utils/progressiveOverloadEngine';
import { playAppleSound } from './utils/calculations';

const TODAY_DATE = new Date().toISOString().split('T')[0];

// Clean storage keys - versioned to purge any deprecated mock data from previous sessions
const STORAGE_KEYS = {
  PROFILE: 'clean_tracker_profile_v3',
  MEASUREMENTS: 'clean_tracker_measurements_v3',
  MEALS: 'clean_tracker_meals_v3',
  DIARY: 'clean_tracker_diary_v3',
  WORKOUTS: 'clean_tracker_workouts_v3',
  HEALTH: 'clean_tracker_health_v3',
  TWELVE_WEEKS: 'clean_tracker_twelve_weeks_v3',
  CREATINE: 'clean_tracker_creatine_v3',
  WATER: 'clean_tracker_water_v3',
};

// Purge old mock keys if present in browser
if (typeof window !== 'undefined') {
  try {
    [
      'aurafit_profile',
      'aurafit_measurements',
      'aurafit_meals',
      'aurafit_diary',
      'aurafit_workouts',
      'aurafit_health',
      'aurafit_12week_logs',
      'aurafit_creatine',
      'aurafit_water',
    ].forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// Initial Data starting from Week 1 (110 kg baseline from PDF, 0 fake progress)
const INITIAL_MEASUREMENTS: MeasurementEntry[] = [
  { id: 'm-baseline', date: TODAY_DATE, weightKg: 110.0, waistCm: 106.0, notes: 'Punto di partenza iniziale (da PDF)' },
];

const INITIAL_MEALS: MealEntry[] = [];
const INITIAL_DIARY: DiaryEntry[] = [];
const INITIAL_TWELVE_WEEK_LOGS: Record<string, Record<string, string>> = {};

const SEED_HEALTH: AppleHealthData = {
  synced: true,
  currentDate: TODAY_DATE,
  lastSyncTime: '',
  activeEnergyBurnedTodayKcal: 0,
  appleExerciseTimeMinutes: 0,
  stepCountToday: 0,
  walkingRunningDistanceKm: 0,
  sleepDurationHours: 8.0,
  dailyHistory: {},
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('workout');
  // Week 1 as requested by user
  const [activeWeek, setActiveWeek] = useState<number>(1);

  // Persistent States - Clean, verified, 0 fake data
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Guarantee no stale 108.5kg
        if (parsed.currentWeightKg === 108.5) {
          return DEFAULT_USER_PROFILE;
        }
        return parsed;
      }
      return DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [measurements, setMeasurements] = useState<MeasurementEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      if (stored) {
        const parsed: MeasurementEntry[] = JSON.parse(stored);
        // If parsed contains fake 108.5, reset to baseline
        if (parsed.some((m) => m.weightKg === 108.5)) {
          return INITIAL_MEASUREMENTS;
        }
        return parsed.length > 0 ? parsed : INITIAL_MEASUREMENTS;
      }
      return INITIAL_MEASUREMENTS;
    } catch {
      return INITIAL_MEASUREMENTS;
    }
  });

  const [meals, setMeals] = useState<MealEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEALS);
      return stored ? JSON.parse(stored) : INITIAL_MEALS;
    } catch {
      return INITIAL_MEALS;
    }
  });

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIARY);
      return stored ? JSON.parse(stored) : INITIAL_DIARY;
    } catch {
      return INITIAL_DIARY;
    }
  });

  const [workouts, setWorkouts] = useState<CompletedWorkout[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [healthData, setHealthData] = useState<AppleHealthData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HEALTH);
      if (stored) {
        const parsed: AppleHealthData = JSON.parse(stored);
        // If it's a new day, archive yesterday and start fresh at 0
        if (parsed.currentDate && parsed.currentDate !== TODAY_DATE) {
          const pastRecord = {
            date: parsed.currentDate,
            steps: parsed.stepCountToday,
            distanceKm: parsed.walkingRunningDistanceKm,
            activeCaloriesBurnedKcal: parsed.activeEnergyBurnedTodayKcal,
            exerciseMinutes: parsed.appleExerciseTimeMinutes,
          };
          return {
            ...parsed,
            currentDate: TODAY_DATE,
            stepCountToday: 0,
            walkingRunningDistanceKm: 0,
            activeEnergyBurnedTodayKcal: 0,
            appleExerciseTimeMinutes: 0,
            dailyHistory: {
              ...(parsed.dailyHistory || {}),
              [parsed.currentDate]: pastRecord,
            },
          };
        }
        return parsed;
      }
      return SEED_HEALTH;
    } catch {
      return SEED_HEALTH;
    }
  });

  const [twelveWeekLogs, setTwelveWeekLogs] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TWELVE_WEEKS);
      return stored ? JSON.parse(stored) : INITIAL_TWELVE_WEEK_LOGS;
    } catch {
      return INITIAL_TWELVE_WEEK_LOGS;
    }
  });

  const [creatineTaken, setCreatineTaken] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.CREATINE) === 'true';
  });

  const [waterLiters, setWaterLiters] = useState<number>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.WATER);
    return val ? parseFloat(val) : 0.0;
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(healthData));
  }, [healthData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TWELVE_WEEKS, JSON.stringify(twelveWeekLogs));
  }, [twelveWeekLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREATINE, creatineTaken.toString());
  }, [creatineTaken]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATER, waterLiters.toString());
  }, [waterLiters]);

  // Master Reset Handler: sets initial baseline and clears all logs to 0
  const handleResetAllData = (startWeight: number = 110.0, startWaist: number = 106.0) => {
    playAppleSound('tap');
    const cleanProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      initialWeightKg: startWeight,
      currentWeightKg: startWeight,
      initialWaistCm: startWaist,
      currentWaistCm: startWaist,
    };
    const cleanMeas: MeasurementEntry[] = [
      { id: 'm-baseline', date: TODAY_DATE, weightKg: startWeight, waistCm: startWaist, notes: 'Punto di partenza iniziale' },
    ];
    setProfile(cleanProfile);
    setMeasurements(cleanMeas);
    setWorkouts([]);
    setMeals([]);
    setDiaryEntries([]);
    setTwelveWeekLogs({});
    setWaterLiters(0);
    setCreatineTaken(false);
    setHealthData(SEED_HEALTH);
  };

  // Handlers
  const handleWorkoutCompleted = (completed: CompletedWorkout) => {
    setWorkouts((prev) => [completed, ...prev]);

    // Update 12-week matrix automatically with logged sets
    setTwelveWeekLogs((prev) => {
      const category = completed.sessionTitle;
      const catObj = { ...(prev[category] || {}) };
      completed.exercises.forEach((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        if (completedSets.length > 0) {
          const maxRep = Math.max(...completedSets.map((s) => s.reps));
          const weight = completedSets[0]?.weightKg || 10;
          const currentStr = catObj[ex.exerciseId] || '';
          const newEntry = `S${completed.weekNumber}:${weight}x${maxRep}`;
          catObj[ex.exerciseId] = currentStr ? `${currentStr}, ${newEntry}` : newEntry;
        }
      });
      return { ...prev, [category]: catObj };
    });

    // Update Apple Health active calories & exercise minutes
    setHealthData((prev) => ({
      ...prev,
      activeEnergyBurnedTodayKcal: prev.activeEnergyBurnedTodayKcal + completed.activeCaloriesBurned,
      appleExerciseTimeMinutes: prev.appleExerciseTimeMinutes + completed.durationMinutes,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  };

  const handleAddMeal = (meal: MealEntry) => {
    setMeals((prev) => [meal, ...prev]);
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleAddMeasurement = (m: MeasurementEntry) => {
    setMeasurements((prev) => [...prev, m]);
    setProfile((prev) => ({
      ...prev,
      currentWeightKg: m.weightKg,
      currentWaistCm: m.waistCm,
    }));
  };

  const handleAddDiaryEntry = (entry: DiaryEntry) => {
    setDiaryEntries((prev) => [entry, ...prev]);
  };

  const handleUpdateTwelveWeekLog = (sessionCategory: string, exerciseId: string, week: number, val: string) => {
    setTwelveWeekLogs((prev) => {
      const catObj = { ...(prev[sessionCategory] || {}) };
      const currentStr = catObj[exerciseId] || '';

      const weekMap: Record<number, string> = {};
      currentStr.split(',').forEach((part) => {
        const [k, v] = part.split(':');
        if (k && v) {
          const wNum = parseInt(k.replace('S', ''));
          weekMap[wNum] = v.trim();
        }
      });
      weekMap[week] = val;

      const newStr = Object.entries(weekMap)
        .filter(([, v]) => v)
        .map(([k, v]) => `S${k}:${v}`)
        .join(', ');

      catObj[exerciseId] = newStr;
      return { ...prev, [sessionCategory]: catObj };
    });
  };

  const handleRestoreBackup = (backup: any) => {
    if (backup.user) setProfile(backup.user);
    if (backup.measurements) setMeasurements(backup.measurements);
    if (backup.workouts) setWorkouts(backup.workouts);
    if (backup.appleHealthSnapshot) setHealthData(backup.appleHealthSnapshot);
    if (backup.twelveWeekLogs) setTwelveWeekLogs(backup.twelveWeekLogs);
    if (backup.diary) setDiaryEntries(backup.diary);
    if (backup.meals) setMeals(backup.meals);
  };

  const handleDownloadAllData = () => {
    playAppleSound('complete');
    const csvContent = exportFull12WeeksCSV(twelveWeekLogs, measurements, workouts, profile);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Avanzamento_12_Settimane_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-[#050507] text-[#f5f5f7] flex flex-col font-sans selection:bg-rose-500/25">
      {/* Top Header - Ultra Minimalist, Logo-Free HUD */}
      <Header
        profile={profile}
        activeTab={activeTab}
        onOpenHealth={() => setActiveTab('health')}
        activeWeek={activeWeek}
        onDownloadAllData={handleDownloadAllData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            >
              <WorkoutView
                onWorkoutCompleted={handleWorkoutCompleted}
                activeWeek={activeWeek}
                twelveWeekLogs={twelveWeekLogs}
                workouts={workouts}
                profile={profile}
                diaryEntries={diaryEntries}
                onDownloadAllData={handleDownloadAllData}
              />
            </motion.div>
          )}

          {activeTab === 'nutrition' && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            >
              <NutritionView
                profile={profile}
                onUpdateProfile={setProfile}
                meals={meals}
                onAddMeal={handleAddMeal}
                onDeleteMeal={handleDeleteMeal}
                creatineTaken={creatineTaken}
                onToggleCreatine={() => setCreatineTaken(!creatineTaken)}
                waterLiters={waterLiters}
                onAddWater={(amt) => setWaterLiters((prev) => Math.min(6, prev + amt))}
              />
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            >
              <ProgressView
                profile={profile}
                measurements={measurements}
                onAddMeasurement={handleAddMeasurement}
                workouts={workouts}
                twelveWeekLogs={twelveWeekLogs}
                onUpdateTwelveWeekLog={handleUpdateTwelveWeekLog}
                activeWeek={activeWeek}
                onSetActiveWeek={setActiveWeek}
                onResetAllData={handleResetAllData}
              />
            </motion.div>
          )}

          {activeTab === 'diary' && (
            <motion.div
              key="diary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            >
              <DiaryView entries={diaryEntries} onAddEntry={handleAddDiaryEntry} />
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            >
              <AppleHealthSyncView
                profile={profile}
                measurements={measurements}
                workouts={workouts}
                healthData={healthData}
                onUpdateHealthData={setHealthData}
                onRestoreBackup={handleRestoreBackup}
              />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            >
              <GuideView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Apple Glass TabBar */}
      <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
