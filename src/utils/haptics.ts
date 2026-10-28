/**
 * Haptic and Tactile Feedback Engine
 * Mimics the physical tactile feel of mechanical buttons, barbell collars, and gym clickers.
 * 
 * Combines:
 * 1. Physical Hardware Vibration API (navigator.vibrate) with micro-calibrated durations
 * 2. Ultra-short acoustic transient impulse via Web Audio API (creates physical chassis resonance
 *    and psychoacoustic tactile illusion for iOS Safari where navigator.vibrate is restricted)
 */

export type HapticType = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'step';

// Reusable audio context singleton to avoid garbage collection delays
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Synthesizes a microscopic mechanical tactile "clack/tick" through Web Audio.
 * Produces a physical micro-resonance mimicking a physical button switch actuation.
 */
function playTactileMechanicalClick(type: HapticType) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'step' || type === 'selection') {
      // Micro-tick: very crisp, 6ms duration, 1600Hz decaying down to 300Hz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.008);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.008);
    } else if (type === 'light') {
      // Light mechanical switch: 12ms duration
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.015);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.015);
    } else if (type === 'medium') {
      // Medium mechanical button: deeper thud + click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.022);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.022);
    } else if (type === 'heavy') {
      // Heavy mechanical latch
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'success') {
      // Double tactile detent for completion
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(900, now);
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.018);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(1400, now + 0.03);
      gain2.gain.setValueAtTime(0.14, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.03);
      osc2.stop(now + 0.055);
    }
  } catch {
    // Graceful fallback if audio is not yet unlocked
  }
}

/**
 * Triggers physical vibration and tactile feedback.
 * Safe to call in any environment (iOS, Android, desktop).
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  // 1. Hardware vibration for devices supporting navigator.vibrate
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      switch (type) {
        case 'step':
        case 'selection':
          navigator.vibrate(8);
          break;
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(32);
          break;
        case 'success':
          navigator.vibrate([14, 40, 18]);
          break;
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }

  // 2. Synthesize physical tactile click via Web Audio
  playTactileMechanicalClick(type);
}
