/**
 * Progressive Overload & Adaptive Volume Engine
 * Implements deterministic progression algorithms based on body weight delta,
 * rep thresholds, recovery score, and volume tonnage from the PDF guide.
 */

import { Exercise, MeasurementEntry, CompletedWorkout, UserProfile, DiaryEntry } from '../types/fitness';
import { WORKOUT_SESSIONS } from '../data/workoutProgram';

export interface ProgressionRecommendation {
  action: 'increase_volume' | 'increase_reps' | 'increase_load' | 'auto_deload' | 'maintain';
  suggestedSets: number;
  suggestedReps: number;
  suggestedWeightKg: number;
  badgeLabel: string;
  rationale: string;
  relativeStrengthBonus: boolean;
}

/**
 * Calculates adaptive workout target based on weight loss and past performance
 */
export function calculateAdaptiveRecommendation(
  exercise: Exercise,
  lastPerfString: string | null,
  currentWeightKg: number,
  initialWeightKg: number = 120.0,
  recentDiaryEntry?: DiaryEntry | null
): ProgressionRecommendation {
  const baseSets = exercise.sets;

  // Default targets from exercise definition
  let lastWeight = exercise.equipment === 'manubri' ? 10 : exercise.equipment === 'elastico' ? 30 : 0;
  let lastReps = exercise.reps.includes('10-15') ? 12 : exercise.reps.includes('12-20') ? 15 : 12;

  if (lastPerfString) {
    const clean = lastPerfString.split(':')[1] || '';
    const match = clean.match(/([\d.]+)x(\d+)/);
    if (match) {
      lastWeight = parseFloat(match[1]) || lastWeight;
      lastReps = parseInt(match[2]) || lastReps;
    } else {
      const singleNum = clean.match(/(\d+)/);
      if (singleNum) {
        lastReps = parseInt(singleNum[1]) || lastReps;
      }
    }
  }

  const weightDeltaKg = currentWeightKg - initialWeightKg;
  const isLosingWeight = weightDeltaKg <= -0.5;

  // Check for auto-deload conditions (poor sleep, high fatigue, or back tension)
  const isFatigued = recentDiaryEntry && (
    recentDiaryEntry.sleepHours < 6.5 ||
    recentDiaryEntry.fatigueLevel >= 4 ||
    recentDiaryEntry.hasBackPain ||
    recentDiaryEntry.hasJointPain
  );

  if (isFatigued) {
    return {
      action: 'auto_deload',
      suggestedSets: Math.max(2, baseSets - 1),
      suggestedReps: lastReps,
      suggestedWeightKg: lastWeight,
      badgeLabel: 'Auto-Deload: -1 serie',
      rationale: 'Fatica o sonno sotto soglia: volume ridotto di 1 serie per favorire il recupero senza compromettere la tecnica.',
      relativeStrengthBonus: false,
    };
  }

  // Parse rep ceiling from target range (e.g., '12-20' -> 20, '10-15' -> 15, '15-25' -> 25)
  let repCeiling = 20;
  if (exercise.reps.includes('10-15')) repCeiling = 15;
  else if (exercise.reps.includes('15-25')) repCeiling = 25;
  else if (exercise.reps.includes('12-20')) repCeiling = 20;
  else if (exercise.reps.includes('12-15')) repCeiling = 15;

  // First time ever performing this exercise (Week 1 / Day 1)
  if (!lastPerfString) {
    return {
      action: 'maintain',
      suggestedSets: baseSets,
      suggestedReps: lastReps,
      suggestedWeightKg: lastWeight,
      badgeLabel: `Target Iniziale: ${lastReps} rip`,
      rationale: 'Seduta di partenza: registra le ripetizioni reali a cedimento tecnico con cadenza 3-0-1 per calibrare il sovraccarico progressivo.',
      relativeStrengthBonus: false,
    };
  }

  const hitRepCeiling = lastReps >= repCeiling;

  // If rep ceiling is hit with dumbbells or bands
  if (hitRepCeiling) {
    if (isLosingWeight) {
      // Recomposition superpower: weight down + rep ceiling reached -> Increase volume (+1 set)
      return {
        action: 'increase_volume',
        suggestedSets: baseSets + 1,
        suggestedReps: Math.max(10, repCeiling - 4),
        suggestedWeightKg: lastWeight,
        badgeLabel: `+1 Serie Addizionale (${baseSets + 1} tot)`,
        rationale: `Ricomposizione attiva (${weightDeltaKg.toFixed(1)}kg): hai raggiunto il top delle ripetizioni (${lastReps}). Volume aumentato a ${baseSets + 1} serie con tempo eccentrico 3s.`,
        relativeStrengthBonus: true,
      };
    }

    return {
      action: 'increase_load',
      suggestedSets: baseSets,
      suggestedReps: Math.max(10, repCeiling - 3),
      suggestedWeightKg: exercise.equipment === 'elastico' && lastWeight === 10 ? 30 : lastWeight,
      badgeLabel: 'Sovraccarico: Tempo Lento / +Tensione',
      rationale: `Top delle ripetizioni raggiunto (${lastReps}). Applica pausa di 1s a fine corsa ed eccentrica 3-4s per incrementare lo stimolo.`,
      relativeStrengthBonus: false,
    };
  }

  // Intermediate progression: +1 or +2 reps
  const targetReps = Math.min(repCeiling, lastReps + 1);
  return {
    action: 'increase_reps',
    suggestedSets: baseSets,
    suggestedReps: targetReps,
    suggestedWeightKg: lastWeight,
    badgeLabel: `Target: ${targetReps} rip (+1)`,
    rationale: `Doppia progressione: supera le ${lastReps} ripetizioni della seduta precedente mantenendo tecnica pulita.`,
    relativeStrengthBonus: isLosingWeight,
  };
}

/**
 * Calculates Relative Strength Index (tonnage / body weight)
 */
export function calculateRelativeStrengthIndex(tonnageKg: number, weightKg: number): number {
  if (weightKg <= 0) return 0;
  return Math.round((tonnageKg / weightKg) * 10) / 10;
}

/**
 * Generates an exhaustive CSV file containing all 12 weeks of training records,
 * body measurements, and logged sessions for Excel/Numbers/Notion offline backup.
 */
export function exportFull12WeeksCSV(
  twelveWeekLogs: Record<string, Record<string, string>>,
  measurements: MeasurementEntry[],
  workouts: CompletedWorkout[],
  profile: UserProfile
): string {
  let csv = '=== REGISTRO AVANZAMENTO 12 SETTIMANE ===\n';
  csv += `Profilo: Altezza ${profile.heightCm} cm | Peso Iniziale ${profile.initialWeightKg} kg | Peso Attuale ${profile.currentWeightKg} kg\n`;
  csv += `Data Esportazione: ${new Date().toISOString()}\n\n`;

  // Section 1: 12-Week Exercise Progression Matrix
  csv += '--- TABELLE MATRICE 12 SETTIMANE (Carico x Ripetizioni) ---\n';
  csv += 'Sessione,Esercizio,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12\n';

  WORKOUT_SESSIONS.forEach((session) => {
    const sessionLogs = twelveWeekLogs[session.category] || {};
    session.exercises.forEach((ex) => {
      const exString = sessionLogs[ex.id] || '';
      const weekVals: Record<number, string> = {};
      exString.split(',').forEach((part) => {
        const [k, v] = part.split(':');
        if (k && v) {
          const wNum = parseInt(k.replace('S', ''));
          weekVals[wNum] = v.trim();
        }
      });

      const rowCols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => `"${weekVals[w] || '-'}"`);
      csv += `"${session.title}","${ex.name}",${rowCols.join(',')}\n`;
    });
  });

  // Section 2: Weight & Measurements Log
  csv += '\n--- STORICO MISURAZIONI CORPOREE ---\n';
  csv += 'Data,Peso (kg),Girovita (cm),Delta Inizio (kg),Note\n';
  measurements.forEach((m) => {
    const delta = (m.weightKg - profile.initialWeightKg).toFixed(1);
    csv += `"${m.date}",${m.weightKg},${m.waistCm},"${delta} kg","${m.notes || ''}"\n`;
  });

  // Section 3: Completed Workouts
  csv += '\n--- ALLENAMENTI COMPLETATI ---\n';
  csv += 'Data,Sessione,Settimana,Durata (min),Calorie (kcal),Cardio Tipo,Cardio (min),Note\n';
  workouts.forEach((w) => {
    csv += `"${w.date}","${w.sessionTitle}",${w.weekNumber},${w.durationMinutes},${w.activeCaloriesBurned},"${w.cardioType}",${w.cardioDurationMinutes},"${w.notes || ''}"\n`;
  });

  return csv;
}
