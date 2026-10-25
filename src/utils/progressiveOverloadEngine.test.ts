import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAdaptiveRecommendation,
  calculateRelativeStrengthIndex,
  exportFull12WeeksCSV,
} from './progressiveOverloadEngine';
import { DEFAULT_USER_PROFILE, WORKOUT_SESSIONS } from '../data/workoutProgram';
import { CompletedWorkout } from '../types/fitness';

test('calculateAdaptiveRecommendation handles week 1 first session without previous logs', () => {
  const ex = WORKOUT_SESSIONS[0].exercises[0]; // Spinte manubri panca inclinata (4x12-20)
  const rec = calculateAdaptiveRecommendation(ex, null, 110.0, 110.0, null);
  assert.equal(rec.action, 'maintain');
  assert.equal(rec.suggestedSets, 4);
  assert.ok(rec.badgeLabel.includes('Target Iniziale'));
  assert.ok(rec.rationale.includes('Seduta di partenza'));
});

test('calculateAdaptiveRecommendation suggests +1 rep when below rep ceiling', () => {
  const ex = WORKOUT_SESSIONS[0].exercises[0]; // Spinte manubri panca inclinata (4x12-20)
  const lastPerf = 'S1:10x14';

  const rec = calculateAdaptiveRecommendation(ex, lastPerf, 110.0, 110.0, null);
  assert.equal(rec.action, 'increase_reps');
  assert.equal(rec.suggestedReps, 15); // 14 + 1
  assert.equal(rec.suggestedSets, 4);
});

test('calculateAdaptiveRecommendation increases volume (+1 set) when rep ceiling is reached and body weight drops', () => {
  const ex = WORKOUT_SESSIONS[0].exercises[0]; // Spinte manubri (4x12-20)
  const lastPerf = 'S1:10x20'; // hit ceiling 20

  // User reduced weight from 110kg to 108kg
  const rec = calculateAdaptiveRecommendation(ex, lastPerf, 108.0, 110.0, null);
  assert.equal(rec.action, 'increase_volume');
  assert.equal(rec.suggestedSets, 5); // 4 + 1 = 5 sets
  assert.equal(rec.relativeStrengthBonus, true);
  assert.ok(rec.rationale.includes('Ricomposizione attiva'));
});

test('calculateAdaptiveRecommendation triggers auto-deload if sleep is poor or back pain reported', () => {
  const ex = WORKOUT_SESSIONS[0].exercises[0];
  const lastPerf = 'S1:10x15';

  const badSleepDiary = {
    id: 'd1',
    date: '2026-10-25',
    moodRating: 2 as const,
    moodTags: ['Stanco'],
    sleepHours: 5.5, // < 6.5h
    sleepQuality: 'irrequieto' as const,
    fatigueLevel: 4 as const,
    sorenessAreas: ['Lombari'],
    hasJointPain: false,
    hasBackPain: true, // alert
    notes: 'Poco sonno',
  };

  const rec = calculateAdaptiveRecommendation(ex, lastPerf, 109.0, 110.0, badSleepDiary);
  assert.equal(rec.action, 'auto_deload');
  assert.equal(rec.suggestedSets, 3); // 4 - 1 = 3 sets
  assert.ok(rec.badgeLabel.includes('Auto-Deload'));
});

test('calculateRelativeStrengthIndex computes accurate ratio', () => {
  // 3000 kg tonnage / 100 kg body weight = 30.0
  const rsi = calculateRelativeStrengthIndex(3000, 100);
  assert.equal(rsi, 30.0);
});

test('exportFull12WeeksCSV formats full matrix and measurements', () => {
  const dummyLogs = {
    'Push A': { 'p-a-1': 'S1:10x15, S2:10x16' },
  };
  const dummyMeas = [
    { id: 'm1', date: '2026-10-25', weightKg: 109.0, waistCm: 104.0, notes: 'Progresso' },
  ];
  const dummyWorkouts: CompletedWorkout[] = [];

  const csv = exportFull12WeeksCSV(dummyLogs, dummyMeas, dummyWorkouts, DEFAULT_USER_PROFILE);
  assert.ok(csv.includes('TABELLE MATRICE 12 SETTIMANE'));
  assert.ok(csv.includes('Spinte manubri su panca inclinata'));
  assert.ok(csv.includes('109'));
  assert.ok(csv.includes('104'));
});
