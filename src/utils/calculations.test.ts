import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  generateAppleHealthKitXML,
  formatTimeMMSS,
} from './calculations';
import { DEFAULT_USER_PROFILE } from '../data/workoutProgram';

test('calculateBMR returns accurate calories for 193cm 110kg male', () => {
  // BMR = (10 * 110) + (6.25 * 193) - (5 * 28) + 5 = 1100 + 1206.25 - 140 + 5 = 2171.25 -> ~2171
  const bmr = calculateBMR(110, 193, 28, true);
  assert.ok(bmr > 2100 && bmr < 2250, `BMR was ${bmr}`);
});

test('calculateTDEE applies activity multiplier correctly', () => {
  const bmr = 2000;
  const tdeeModerato = calculateTDEE(bmr, 'moderato');
  assert.equal(tdeeModerato, 3000); // 2000 * 1.5

  const tdeeSedentario = calculateTDEE(bmr, 'sedentario_pesi');
  assert.equal(tdeeSedentario, 2700); // 2000 * 1.35
});

test('calculateMacros preserves protein within 160-190g window', () => {
  const macros = calculateMacros(110, 193, 'moderato', 175);
  assert.equal(macros.proteinGrams, 175);
  assert.ok(macros.targetCalories >= 2000, 'Target calories should be safe and sustainable');
  assert.ok(macros.fatGrams > 45, 'Fats should provide essential fatty acids');
  assert.ok(macros.carbsGrams > 150, 'Carbohydrates must support 6 training days');

  // Test clamping
  const macrosLow = calculateMacros(110, 193, 'moderato', 120);
  assert.equal(macrosLow.proteinGrams, 160);

  const macrosHigh = calculateMacros(110, 193, 'moderato', 250);
  assert.equal(macrosHigh.proteinGrams, 190);
});

test('formatTimeMMSS formats seconds accurately', () => {
  assert.equal(formatTimeMMSS(0), '00:00');
  assert.equal(formatTimeMMSS(65), '01:05');
  assert.equal(formatTimeMMSS(90), '01:30');
  assert.equal(formatTimeMMSS(120), '02:00');
});

test('generateAppleHealthKitXML outputs valid HealthData XML structure', () => {
  const dummyHealthData = {
    synced: true,
    currentDate: '2026-10-25',
    lastSyncTime: '2026-10-25T12:00:00Z',
    activeEnergyBurnedTodayKcal: 620,
    appleExerciseTimeMinutes: 45,
    stepCountToday: 8450,
    walkingRunningDistanceKm: 6.2,
    sleepDurationHours: 7.8,
    dailyHistory: {},
  };
  const dummyMeasurement = [
    { id: 'm1', date: '2026-10-24', weightKg: 108.5, waistCm: 103 },
  ];
  const dummyWorkouts = [
    {
      id: 'w1',
      date: '2026-10-24',
      sessionId: 'push-a',
      sessionTitle: 'Push A',
      weekNumber: 1,
      durationMinutes: 52,
      activeCaloriesBurned: 410,
      avgHeartRate: 128,
      exercises: [],
      cardioCompleted: true,
      cardioDurationMinutes: 35,
      cardioType: 'camminata' as const,
      notes: 'Ottima spinta sui manubri da 10kg',
    },
  ];

  const xml = generateAppleHealthKitXML(DEFAULT_USER_PROFILE, dummyMeasurement, dummyWorkouts, dummyHealthData);
  assert.ok(xml.includes('<!DOCTYPE HealthData SYSTEM "HealthData.dtd">'));
  assert.ok(xml.includes('HKQuantityTypeIdentifierBodyMass'));
  assert.ok(xml.includes('HKWorkoutActivityTypeTraditionalStrengthTraining'));
  assert.ok(xml.includes('HKQuantityTypeIdentifierActiveEnergyBurned'));
  assert.ok(xml.includes('108.5'));
});
