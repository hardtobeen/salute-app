/**
 * Scientific and mathematical calculations for the fitness app
 * Based on ACSM, NIH, and "Guida aggiornata: massa muscolare e dimagrimento"
 */

import { AppleHealthData, CompletedWorkout, DailyNutritionLog, DiaryEntry, MeasurementEntry, UserProfile } from '../types/fitness';

/**
 * Calculates Basal Metabolic Rate using Mifflin-St Jeor formula:
 * BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age) + 5 (for men)
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number = 28, isMale: boolean = true): number {
  const genderBonus = isMale ? 5 : -161;
  return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + genderBonus);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: 'sedentario_pesi' | 'moderato' | 'attivo'): number {
  const multipliers: Record<string, number> = {
    sedentario_pesi: 1.35, // Pesi + vita sedentaria
    moderato: 1.5, // 6 giorni pesi + 30-45m camminata giornaliera (come nel PDF)
    attivo: 1.65, // Lavoro in piedi + pesi + camminate
  };
  const multiplier = multipliers[activityLevel] || 1.5;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates macro distribution based on:
 * - Protein: 160-190g (NIH recommendation: 1.2 - 2.0 g/kg; PDF suggests 160-190g)
 * - Deficit: prudent 300-500 kcal per day (aiming at 0.25 - 0.5 kg/week loss)
 * - Fats: 20-30% of total daily calories
 * - Carbs: remaining calories to sustain 6 workout days
 */
export function calculateMacros(weightKg: number, heightCm: number, activityLevel: 'sedentario_pesi' | 'moderato' | 'attivo' = 'moderato', targetProteinGrams: number = 175) {
  const bmr = calculateBMR(weightKg, heightCm);
  const tdee = calculateTDEE(bmr, activityLevel);
  // Deficit prudente di circa 400 kcal
  const targetCalories = Math.max(1800, tdee - 450);

  // Protein target clamped to safe window 160-190g
  const clampedProtein = Math.max(160, Math.min(190, targetProteinGrams));
  const proteinKcal = clampedProtein * 4;

  // Fats: ~25% of calories
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: rest
  const remainingKcal = Math.max(0, targetCalories - proteinKcal - fatCalories);
  const carbsGrams = Math.round(remainingKcal / 4);

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams: clampedProtein,
    fatGrams,
    carbsGrams,
    weeklyPaceKg: 0.35, // Safe ~0.35 kg per week
  };
}

/**
 * Generates an Apple HealthKit compliant XML export snippet
 * Allows exporting user workouts, active energy, weight, and heart rate to iOS HealthKit format
 */
export function generateAppleHealthKitXML(
  profile: UserProfile,
  measurements: MeasurementEntry[],
  workouts: CompletedWorkout[],
  healthData: AppleHealthData
): string {
  const now = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE HealthData SYSTEM "HealthData.dtd">
<HealthData locale="it_IT">
  <ExportDate value="${now}"/>
  <Me HKCharacteristicTypeIdentifierDateOfBirth="1998-05-15" HKCharacteristicTypeIdentifierBiologicalSex="HKBiologicalSexMale" HKCharacteristicTypeIdentifierBloodType="HKBloodTypeNotSet" HKCharacteristicTypeIdentifierFitzpatrickSkinType="HKFitzpatrickSkinTypeNotSet"/>
`;

  // Add Body Mass entries
  measurements.forEach((m) => {
    xml += `  <Record type="HKQuantityTypeIdentifierBodyMass" sourceName="AuraFit Apple Companion" unit="kg" creationDate="${m.date} 07:30:00 +0100" startDate="${m.date} 07:30:00 +0100" endDate="${m.date} 07:30:00 +0100" value="${m.weightKg}"/>\n`;
  });

  // Add Workouts
  workouts.forEach((w) => {
    xml += `  <Workout workoutActivityType="HKWorkoutActivityTypeTraditionalStrengthTraining" duration="${w.durationMinutes}" durationUnit="min" totalDistance="0" totalDistanceUnit="km" totalEnergyBurned="${w.activeCaloriesBurned}" totalEnergyBurnedUnit="kcal" sourceName="Scheda PPL" creationDate="${w.date} 18:00:00 +0100" startDate="${w.date} 18:00:00 +0100" endDate="${w.date} 19:00:00 +0100">\n`;
    xml += `    <MetadataEntry key="HKWorkoutBrandName" value="PPL Programma"/>\n`;
    xml += `  </Workout>\n`;
  });

  // Add Step Count and Active Energy (real user input)
  xml += `  <Record type="HKQuantityTypeIdentifierActiveEnergyBurned" sourceName="iPhone" unit="kcal" creationDate="${now}" startDate="${now}" endDate="${now}" value="${healthData.activeEnergyBurnedTodayKcal}"/>\n`;
  xml += `  <Record type="HKQuantityTypeIdentifierStepCount" sourceName="iPhone" unit="count" creationDate="${now}" startDate="${now}" endDate="${now}" value="${healthData.stepCountToday}"/>\n`;
  xml += `  <Record type="HKQuantityTypeIdentifierDistanceWalkingRunning" sourceName="iPhone" unit="km" creationDate="${now}" startDate="${now}" endDate="${now}" value="${healthData.walkingRunningDistanceKm}"/>\n`;

  xml += `</HealthData>`;
  return xml;
}

/**
 * Synthesizes Apple Watch haptic/audio chime using Web Audio API
 */
export function playAppleSound(type: 'tap' | 'ding' | 'complete' | 'ring') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'tap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'ding') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'complete') {
      // 2 chimes: G5 then C6
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(783.99, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(1046.5, now + 0.15);
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);
    } else if (type === 'ring') {
      // Harmonic chord for closing Apple Activity ring
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.6);
      });
    }
  } catch {
    // AudioContext blocked by browser policy until gesture
  }
}

/**
 * Formats seconds into MM:SS
 */
export function formatTimeMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
