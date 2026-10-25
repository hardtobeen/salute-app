import { motion } from 'motion/react';

interface AppleActivityRingsProps {
  ring1: { label: string; current: number; max: number; unit: string; color: string; subColor: string }; // e.g. Calories (Red)
  ring2: { label: string; current: number; max: number; unit: string; color: string; subColor: string }; // e.g. Protein (Green)
  ring3: { label: string; current: number; max: number; unit: string; color: string; subColor: string }; // e.g. Cardio/Movement (Cyan)
  size?: number;
  strokeWidth?: number;
}

export function AppleActivityRings({
  ring1,
  ring2,
  ring3,
  size = 180,
  strokeWidth = 14,
}: AppleActivityRingsProps) {
  const center = size / 2;
  const gap = 3;

  // Radii for 3 concentric rings
  const r1 = center - strokeWidth / 2 - 4;
  const r2 = r1 - strokeWidth - gap;
  const r3 = r2 - strokeWidth - gap;

  const circumference1 = 2 * Math.PI * r1;
  const circumference2 = 2 * Math.PI * r2;
  const circumference3 = 2 * Math.PI * r3;

  const pct1 = Math.min(ring1.current / (ring1.max || 1), 1.75);
  const pct2 = Math.min(ring2.current / (ring2.max || 1), 1.75);
  const pct3 = Math.min(ring3.current / (ring3.max || 1), 1.75);

  const offset1 = circumference1 - Math.min(pct1, 1) * circumference1;
  const offset2 = circumference2 - Math.min(pct2, 1) * circumference2;
  const offset3 = circumference3 - Math.min(pct3, 1) * circumference3;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="grad-ring1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fa114f" />
            <stop offset="100%" stopColor="#ff5277" />
          </linearGradient>
          <linearGradient id="grad-ring2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a1ff00" />
            <stop offset="100%" stopColor="#00e676" />
          </linearGradient>
          <linearGradient id="grad-ring3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>
        </defs>

        {/* Ring 1 - Background */}
        <circle
          cx={center}
          cy={center}
          r={r1}
          fill="none"
          stroke="rgba(250, 17, 79, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Ring 1 - Progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={r1}
          fill="none"
          stroke="url(#grad-ring1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference1}
          initial={{ strokeDashoffset: circumference1 }}
          animate={{ strokeDashoffset: offset1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8 }}
        />

        {/* Ring 2 - Background */}
        <circle
          cx={center}
          cy={center}
          r={r2}
          fill="none"
          stroke="rgba(161, 255, 0, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Ring 2 - Progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={r2}
          fill="none"
          stroke="url(#grad-ring2)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference2}
          initial={{ strokeDashoffset: circumference2 }}
          animate={{ strokeDashoffset: offset2 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8, delay: 0.08 }}
        />

        {/* Ring 3 - Background */}
        <circle
          cx={center}
          cy={center}
          r={r3}
          fill="none"
          stroke="rgba(0, 240, 255, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Ring 3 - Progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={r3}
          fill="none"
          stroke="url(#grad-ring3)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference3}
          initial={{ strokeDashoffset: circumference3 }}
          animate={{ strokeDashoffset: offset3 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8, delay: 0.16 }}
        />
      </svg>
    </div>
  );
}
