import test from 'node:test';
import assert from 'node:assert';
import { triggerHaptic } from './haptics';

test('triggerHaptic operates gracefully in non-browser environment without errors', () => {
  assert.doesNotThrow(() => {
    triggerHaptic('light');
    triggerHaptic('medium');
    triggerHaptic('heavy');
    triggerHaptic('selection');
    triggerHaptic('step');
    triggerHaptic('success');
  });
});

test('triggerHaptic invokes navigator.vibrate when present', () => {
  const vibrateCalls: (number | number[])[] = [];
  
  Object.defineProperty(globalThis.navigator, 'vibrate', {
    value: (pattern: number | number[]) => {
      vibrateCalls.push(pattern);
      return true;
    },
    configurable: true,
    writable: true,
  });

  triggerHaptic('step');
  triggerHaptic('medium');
  triggerHaptic('success');

  assert.strictEqual(vibrateCalls.length, 3);
  assert.deepStrictEqual(vibrateCalls[0], 8);
  assert.deepStrictEqual(vibrateCalls[1], 20);
  assert.deepStrictEqual(vibrateCalls[2], [14, 40, 18]);
});
