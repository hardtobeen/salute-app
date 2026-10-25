/**
 * Types for the Apple-styled Fitness & Nutrition app
 * Based on "Guida aggiornata: massa muscolare e dimagrimento"
 */

export type Weekday = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi' | 'sabato' | 'domenica';

export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string;
  sets: number;
  reps: string;
  notes: string;
  tempo?: string;
  restSeconds: number; // 90-120s for compounds, 60-90s for isolation
  equipment: 'manubri' | 'elastico' | 'carrucola' | 'corpo_libero' | 'panca';
  instructions?: string;
  commonMistakes?: string[];
  variants?: string[];
}

export interface WorkoutSession {
  id: string;
  day: Weekday;
  dayLabel: string;
  title: string;
  category: 'Push A' | 'Pull A' | 'Gambe A' | 'Push B' | 'Pull B' | 'Gambe B' | 'Domenica Leggera';
  focus: string;
  cardio: string; // e.g. "30-45 min dopo i pesi" or "25-35 min cyclette se piove"
  exercises: Exercise[];
  recoveryRules: string;
}

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  rir?: number; // Reps In Reserve
  completed: boolean;
  notes?: string;
}

export interface ExerciseLogEntry {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface CompletedWorkout {
  id: string;
  date: string; // YYYY-MM-DD
  sessionId: string;
  sessionTitle: string;
  weekNumber: number; // 1 to 12
  durationMinutes: number;
  activeCaloriesBurned: number;
  avgHeartRate?: number;
  exercises: ExerciseLogEntry[];
  cardioCompleted: boolean;
  cardioDurationMinutes: number;
  cardioType: 'camminata' | 'cyclette' | 'riposo';
  notes: string;
}

export interface UserProfile {
  name: string;
  heightCm: number; // 193
  initialWeightKg: number; // 110
  currentWeightKg: number;
  targetWeightKg: number; // e.g. 92-95
  initialWaistCm: number; // e.g. 108
  currentWaistCm: number;
  activityLevel: 'sedentario_pesi' | 'moderato' | 'attivo';
  dailyProteinTargetGrams: number; // 160-190g (default 175g)
  dailyCalorieTarget: number; // calculated with modest deficit
  availableEquipment: string[];
  historyNotes: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'Proteine' | 'Carboidrati' | 'Verdure' | 'Grassi' | 'Comodita';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
}

export interface MealEntry {
  id: string;
  mealType: 'colazione' | 'pranzo' | 'spuntino' | 'cena';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  waterLiters: number;
  creatineTaken: boolean; // 3-5g/die
  notes?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  moodRating: 1 | 2 | 3 | 4 | 5; // 1: Basso, 3: Neutro, 5: Eccellente
  moodTags: string[]; // e.g., "Energico", "Concentrato", "Stanco", "Motivato", "Dolore lombare"
  sleepHours: number; // target ~8h
  sleepQuality: 'ottimo' | 'buono' | 'irrequieto' | 'insonnia';
  fatigueLevel: 1 | 2 | 3 | 4 | 5; // 1: fresco, 5: esausto
  sorenessAreas: string[]; // e.g. "Spalle", "Gambe", "Nessun dolore"
  hasJointPain: boolean; // Flag to caution as per PDF
  hasBackPain: boolean; // Flag for scoliosis caution
  notes: string;
}

export interface MeasurementEntry {
  id: string;
  date: string;
  weightKg: number;
  waistCm: number;
  notes?: string;
}

export interface DailyHistoryRecord {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  activeCaloriesBurnedKcal: number;
  exerciseMinutes: number;
}

export interface AppleHealthData {
  synced: boolean;
  currentDate: string; // YYYY-MM-DD
  lastSyncTime: string;
  activeEnergyBurnedTodayKcal: number;
  appleExerciseTimeMinutes: number;
  stepCountToday: number;
  walkingRunningDistanceKm: number;
  sleepDurationHours: number;
  dailyHistory: Record<string, DailyHistoryRecord>;
}
