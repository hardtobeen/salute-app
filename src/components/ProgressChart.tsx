import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingDown,
  Scale,
  Ruler,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { MeasurementEntry, UserProfile } from '../types/fitness';
import { playAppleSound } from '../utils/calculations';

interface ProgressChartProps {
  profile: UserProfile;
  measurements: MeasurementEntry[];
  activeWeek: number;
  onSelectWeek?: (week: number) => void;
}

type MetricMode = 'weight' | 'waist' | 'both';

const PHASES = [
  { start: 1, end: 2, label: 'Adattamento', desc: 'Attivazione neuromuscolare' },
  { start: 3, end: 6, label: 'Sovraccarico', desc: 'Accumulo volume e carichi' },
  { start: 7, end: 7, label: 'Deload', desc: 'Scarico attivo (-40% vol)' },
  { start: 8, end: 11, label: 'Intensità', desc: 'Intensificazione RIR 1-0' },
  { start: 12, end: 12, label: 'Test', desc: 'Test massimali finale' },
];

export function ProgressChart({
  profile,
  measurements,
  activeWeek,
  onSelectWeek,
}: ProgressChartProps) {
  const [metricMode, setMetricMode] = useState<MetricMode>('weight');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(activeWeek);

  // Sort measurements chronologically
  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [measurements]);

  // Baseline and target numbers
  const startWeight = profile.initialWeightKg;
  const targetWeight = profile.targetWeightKg;
  const startWaist = profile.initialWaistCm;
  const targetWaist = Math.max(85, Math.round(startWaist - 14));

  // Chart Dimensions (100% Mobile Native SVG ViewBox: scales fluidly to any screen)
  const width = 600;
  const height = 270;
  const pad = { top: 30, bottom: 42, left: 46, right: 22 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;

  // X coordinate for week (1 to 12)
  const getX = (w: number) => {
    const clamped = Math.max(1, Math.min(12, w));
    return pad.left + ((clamped - 1) / 11) * plotWidth;
  };

  // Weight scale limits
  const weightValues = [
    startWeight,
    targetWeight,
    ...sortedMeasurements.map((m) => m.weightKg),
  ];
  const minWeight = Math.floor(Math.min(...weightValues) - 1.5);
  const maxWeight = Math.ceil(Math.max(...weightValues) + 1.5);

  const getYWeight = (w: number) => {
    const ratio = (w - minWeight) / (maxWeight - minWeight || 1);
    return pad.top + plotHeight - ratio * plotHeight;
  };

  // Waist scale limits
  const waistValues = [
    startWaist,
    targetWaist,
    ...sortedMeasurements.map((m) => m.waistCm),
  ];
  const minWaist = Math.floor(Math.min(...waistValues) - 2);
  const maxWaist = Math.ceil(Math.max(...waistValues) + 2);

  const getYWaist = (cm: number) => {
    const ratio = (cm - minWaist) / (maxWaist - minWaist || 1);
    return pad.top + plotHeight - ratio * plotHeight;
  };

  // Map each measurement to its week position
  const mappedPoints = useMemo(() => {
    if (sortedMeasurements.length === 0) return [];
    const firstDate = new Date(sortedMeasurements[0].date).getTime();

    return sortedMeasurements.map((m) => {
      let weekPos = 1;
      if (sortedMeasurements.length > 1) {
        const mDate = new Date(m.date).getTime();
        const diffDays = (mDate - firstDate) / (1000 * 60 * 60 * 24);
        weekPos = 1 + diffDays / 7;
      } else {
        weekPos = 1;
      }
      weekPos = Math.max(1, Math.min(12, weekPos));
      return {
        ...m,
        weekPos,
        x: getX(weekPos),
        yWeight: getYWeight(m.weightKg),
        yWaist: getYWaist(m.waistCm),
      };
    });
  }, [sortedMeasurements, minWeight, maxWeight, minWaist, maxWaist]);

  // Target trajectory coordinates for all 12 weeks
  const targetTrajectory = useMemo(() => {
    const arr = [];
    for (let w = 1; w <= 12; w++) {
      const frac = (w - 1) / 11;
      const idealW = startWeight - frac * (startWeight - targetWeight);
      const idealWaist = startWaist - frac * (startWaist - targetWaist);
      arr.push({
        week: w,
        weight: Number(idealW.toFixed(1)),
        waist: Number(idealWaist.toFixed(1)),
        x: getX(w),
        yWeight: getYWeight(idealW),
        yWaist: getYWaist(idealWaist),
        yWeightUpper: getYWeight(idealW + 0.8),
        yWeightLower: getYWeight(idealW - 0.8),
      });
    }
    return arr;
  }, [startWeight, targetWeight, startWaist, targetWaist, minWeight, maxWeight]);

  // Target trajectory path string
  const targetWeightPath = useMemo(() => {
    return targetTrajectory
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yWeight.toFixed(1)}`)
      .join(' ');
  }, [targetTrajectory]);

  // Target safe corridor polygon path string (Weight)
  const targetCorridorPath = useMemo(() => {
    const top = targetTrajectory.map((p) => `${p.x.toFixed(1)} ${p.yWeightUpper.toFixed(1)}`);
    const bottom = [...targetTrajectory]
      .reverse()
      .map((p) => `${p.x.toFixed(1)} ${p.yWeightLower.toFixed(1)}`);
    return `M ${top.join(' L ')} L ${bottom.join(' L ')} Z`;
  }, [targetTrajectory]);

  // Actual measured weight path & area
  const actualWeightPath = useMemo(() => {
    if (mappedPoints.length < 2) return '';
    return mappedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yWeight.toFixed(1)}`)
      .join(' ');
  }, [mappedPoints]);

  const actualWeightArea = useMemo(() => {
    if (mappedPoints.length < 2) return '';
    const first = mappedPoints[0];
    const last = mappedPoints[mappedPoints.length - 1];
    const baselineY = pad.top + plotHeight;
    const line = mappedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yWeight.toFixed(1)}`)
      .join(' ');
    return `${line} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [mappedPoints, pad.top, plotHeight]);

  // Actual measured waist path & area
  const actualWaistPath = useMemo(() => {
    if (mappedPoints.length < 2) return '';
    return mappedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yWaist.toFixed(1)}`)
      .join(' ');
  }, [mappedPoints]);

  const actualWaistArea = useMemo(() => {
    if (mappedPoints.length < 2) return '';
    const first = mappedPoints[0];
    const last = mappedPoints[mappedPoints.length - 1];
    const baselineY = pad.top + plotHeight;
    const line = mappedPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yWaist.toFixed(1)}`)
      .join(' ');
    return `${line} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [mappedPoints, pad.top, plotHeight]);

  // Y-axis ticks
  const weightTicks = useMemo(() => {
    const ticks = [];
    const step = (maxWeight - minWeight) > 16 ? 5 : 2.5;
    for (let v = Math.ceil(minWeight / step) * step; v <= maxWeight; v += step) {
      ticks.push(Number(v.toFixed(1)));
    }
    return ticks;
  }, [minWeight, maxWeight]);

  const waistTicks = useMemo(() => {
    const ticks = [];
    const step = (maxWaist - minWaist) > 16 ? 4 : 2;
    for (let v = Math.ceil(minWaist / step) * step; v <= maxWaist; v += step) {
      ticks.push(Number(v.toFixed(1)));
    }
    return ticks;
  }, [minWaist, maxWaist]);

  // Inspected week details
  const inspectedWeekNum = hoveredWeek ?? activeWeek;
  const inspectedTarget = targetTrajectory.find((t) => t.week === inspectedWeekNum) || targetTrajectory[0];
  const inspectedActual = mappedPoints.find((m) => Math.round(m.weekPos) === inspectedWeekNum);
  const inspectedPhase = PHASES.find(
    (p) => inspectedWeekNum >= p.start && inspectedWeekNum <= p.end
  ) || PHASES[0];

  return (
    <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-white/12 space-y-4 shadow-2xl relative overflow-hidden w-full">
      {/* Subtle background ambient lights */}
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Header & Controls - Mobile friendly flex wrap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
              <TrendingDown className="w-3 h-3" /> Progresso 12 Settimane
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            Traiettoria Peso & Sovraccarico
          </h3>
          <p className="text-[11px] text-neutral-400">
            Target prudente: -0.4 kg/settimana per non perdere massa muscolare
          </p>
        </div>

        {/* Metric Switcher Tabs - 100% width on phone, touch friendly */}
        <div className="grid grid-cols-3 p-1 bg-black/50 rounded-2xl border border-white/10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              playAppleSound('tap');
              setMetricMode('weight');
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              metricMode === 'weight'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Scale className="w-3 h-3 text-rose-300" />
            <span>Peso</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playAppleSound('tap');
              setMetricMode('waist');
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              metricMode === 'waist'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3 h-3 text-cyan-900" />
            <span>Girovita</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playAppleSound('tap');
              setMetricMode('both');
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              metricMode === 'both'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-200" />
            <span>Tutto</span>
          </button>
        </div>
      </div>

      {/* Interactive Week Inspector Strip - Compact & Mobile Friendly */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs">
                Settimana {inspectedWeekNum}
              </span>
              {inspectedWeekNum === activeWeek && (
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white">
                  Oggi
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 block">
              Fase: <strong className="text-neutral-200">{inspectedPhase.label}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono justify-between xs:justify-end">
          <div>
            <span className="text-neutral-400 text-[10px] block">Target</span>
            <span className="text-emerald-400 font-bold text-xs">
              {metricMode === 'waist'
                ? `${inspectedTarget.waist}cm`
                : `${inspectedTarget.weight}kg`}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 text-[10px] block">Rilevato</span>
            <span className="text-rose-400 font-bold text-xs">
              {inspectedActual
                ? metricMode === 'waist'
                  ? `${inspectedActual.waistCm}cm`
                  : `${inspectedActual.weightKg}kg`
                : inspectedWeekNum === 1
                ? `${startWeight}kg (Inizio)`
                : 'In attesa'}
            </span>
          </div>
          {onSelectWeek && inspectedWeekNum !== activeWeek && (
            <button
              type="button"
              onClick={() => {
                playAppleSound('tap');
                onSelectWeek(inspectedWeekNum);
              }}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
            >
              Attiva S{inspectedWeekNum} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Viewport - 100% fluid, NO scrollbars, pristine vector scaling on mobile */}
      <div className="w-full overflow-hidden rounded-2xl bg-black/60 border border-white/10 p-2 sm:p-3 relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[310px] overflow-visible select-none block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Neon Glow Filters */}
            <filter id="m-glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#fa114f" floodOpacity="0.8" />
            </filter>
            <filter id="m-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#00f5d4" floodOpacity="0.8" />
            </filter>
            <filter id="m-glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#30d158" floodOpacity="0.65" />
            </filter>

            {/* Area Gradients */}
            <linearGradient id="m-roseArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fa114f" stopOpacity="0.4" />
              <stop offset="65%" stopColor="#fa114f" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#fa114f" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="m-cyanArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f5d4" stopOpacity="0.35" />
              <stop offset="65%" stopColor="#00f5d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#00f5d4" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="m-corridorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#30d158" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#30d158" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="m-activeBeamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fa114f" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#fa114f" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Background Phase Bands */}
          {PHASES.map((ph, idx) => {
            const xStart = getX(ph.start) - (ph.start === 1 ? 8 : 12);
            const xEnd = getX(ph.end) + (ph.end === 12 ? 8 : 12);
            const bWidth = Math.max(16, xEnd - xStart);
            const isEven = idx % 2 === 0;

            return (
              <g key={ph.label}>
                <rect
                  x={xStart}
                  y={pad.top - 14}
                  width={bWidth}
                  height={plotHeight + 14}
                  fill={isEven ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.035)'}
                  rx="4"
                />
                <text
                  x={xStart + bWidth / 2}
                  y={pad.top - 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.35)"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  {ph.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Horizontal Grid lines with high contrast Y-ticks */}
          {(metricMode === 'waist' ? waistTicks : weightTicks).map((tick) => {
            const yPos = metricMode === 'waist' ? getYWaist(tick) : getYWeight(tick);
            return (
              <g key={`m-grid-y-${tick}`}>
                <line
                  x1={pad.left}
                  y1={yPos}
                  x2={width - pad.right}
                  y2={yPos}
                  stroke="rgba(255,255,255,0.10)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Left Y label */}
                <text
                  x={pad.left - 6}
                  y={yPos + 3.5}
                  textAnchor="end"
                  fill="#a1a1aa"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Target Corridor (Weight) */}
          {(metricMode === 'weight' || metricMode === 'both') && (
            <path d={targetCorridorPath} fill="url(#m-corridorGrad)" />
          )}

          {/* Target Trajectory Line (Emerald Dash) */}
          {(metricMode === 'weight' || metricMode === 'both') && (
            <g>
              <path
                d={targetWeightPath}
                fill="none"
                stroke="#30d158"
                strokeWidth="2"
                strokeDasharray="5 3"
                strokeLinecap="round"
                filter="url(#m-glow-emerald)"
                opacity="0.85"
              />
              <text
                x={getX(12) + 4}
                y={getYWeight(targetWeight) + 3}
                fill="#30d158"
                fontSize="9"
                fontWeight="700"
                fontFamily="monospace"
              >
                {targetWeight}k
              </text>
            </g>
          )}

          {/* Target Line (Waist) */}
          {metricMode === 'waist' && (
            <path
              d={targetTrajectory
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yWaist.toFixed(1)}`)
                .join(' ')}
              fill="none"
              stroke="#30d158"
              strokeWidth="2"
              strokeDasharray="5 3"
              strokeLinecap="round"
              filter="url(#m-glow-emerald)"
              opacity="0.85"
            />
          )}

          {/* Active Week Column Beam */}
          <g>
            <rect
              x={getX(activeWeek) - 12}
              y={pad.top}
              width="24"
              height={plotHeight}
              fill="url(#m-activeBeamGrad)"
              rx="6"
            />
            <line
              x1={getX(activeWeek)}
              y1={pad.top}
              x2={getX(activeWeek)}
              y2={pad.top + plotHeight}
              stroke="#fa114f"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          </g>

          {/* Hovered Week Line */}
          {hoveredWeek !== null && hoveredWeek !== activeWeek && (
            <line
              x1={getX(hoveredWeek)}
              y1={pad.top}
              x2={getX(hoveredWeek)}
              y2={pad.top + plotHeight}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Actual Weight Curve */}
          {(metricMode === 'weight' || metricMode === 'both') && (
            <>
              {actualWeightArea && <path d={actualWeightArea} fill="url(#m-roseArea)" />}
              {actualWeightPath && (
                <path
                  d={actualWeightPath}
                  fill="none"
                  stroke="#fa114f"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#m-glow-rose)"
                />
              )}
            </>
          )}

          {/* Actual Waist Curve */}
          {(metricMode === 'waist' || metricMode === 'both') && (
            <>
              {actualWaistArea && <path d={actualWaistArea} fill="url(#m-cyanArea)" />}
              {actualWaistPath && (
                <path
                  d={actualWaistPath}
                  fill="none"
                  stroke="#00f5d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#m-glow-cyan)"
                />
              )}
            </>
          )}

          {/* Plotted Data Nodes (Weight) */}
          {(metricMode === 'weight' || metricMode === 'both') &&
            mappedPoints.map((pt, idx) => {
              const isLatest = idx === mappedPoints.length - 1;
              return (
                <g key={`m-w-node-${pt.id}`}>
                  {isLatest && (
                    <circle
                      cx={pt.x}
                      cy={pt.yWeight}
                      r="10"
                      fill="none"
                      stroke="#fa114f"
                      strokeWidth="1.5"
                      strokeOpacity="0.45"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.yWeight}
                    r="4.5"
                    fill="#fa114f"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    filter="url(#m-glow-rose)"
                  />
                  {/* Badge over point */}
                  <g transform={`translate(${pt.x}, ${pt.yWeight - 12})`}>
                    <rect
                      x="-17"
                      y="-10"
                      width="34"
                      height="14"
                      rx="3.5"
                      fill="#18181b"
                      stroke="#fa114f"
                      strokeWidth="0.8"
                      opacity="0.95"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      {pt.weightKg}k
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Plotted Data Nodes (Waist) */}
          {(metricMode === 'waist' || metricMode === 'both') &&
            mappedPoints.map((pt) => {
              return (
                <g key={`m-c-node-${pt.id}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.yWaist}
                    r="4"
                    fill="#00f5d4"
                    stroke="#000000"
                    strokeWidth="1.2"
                    filter="url(#m-glow-cyan)"
                  />
                  {metricMode === 'waist' && (
                    <g transform={`translate(${pt.x}, ${pt.yWaist - 12})`}>
                      <rect
                        x="-17"
                        y="-10"
                        width="34"
                        height="14"
                        rx="3.5"
                        fill="#0f172a"
                        stroke="#00f5d4"
                        strokeWidth="0.8"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill="#00f5d4"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {pt.waistCm}cm
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* 12 Weeks X-Axis - Perfectly spaced, zero collisions, tap-friendly */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => {
            const xPos = getX(w);
            const isActive = w === activeWeek;
            const isHovered = w === hoveredWeek;
            const isDeload = w === 7;

            return (
              <g
                key={`m-week-${w}`}
                className="cursor-pointer"
                onClick={() => {
                  playAppleSound('tap');
                  setHoveredWeek(w);
                  if (onSelectWeek) onSelectWeek(w);
                }}
              >
                {/* Generous touch target */}
                <rect
                  x={xPos - plotWidth / 24}
                  y={pad.top}
                  width={plotWidth / 12}
                  height={plotHeight + 35}
                  fill="transparent"
                />

                {/* Tick */}
                <line
                  x1={xPos}
                  y1={pad.top + plotHeight}
                  x2={xPos}
                  y2={pad.top + plotHeight + 5}
                  stroke={isActive ? '#fa114f' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={isActive ? '1.5' : '1'}
                />

                {/* Label */}
                <text
                  x={xPos}
                  y={pad.top + plotHeight + 17}
                  textAnchor="middle"
                  fill={
                    isActive
                      ? '#fa114f'
                      : isHovered
                      ? '#ffffff'
                      : isDeload
                      ? '#eab308'
                      : '#71717a'
                  }
                  fontSize={isActive || isHovered ? '10.5' : '9.5'}
                  fontWeight={isActive || isHovered ? '800' : '600'}
                  fontFamily="monospace"
                >
                  S{w}
                </text>

                {isDeload && (
                  <text
                    x={xPos}
                    y={pad.top + plotHeight + 27}
                    textAnchor="middle"
                    fill="#eab308"
                    fontSize="7"
                    fontWeight="700"
                  >
                    DELOAD
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend - Responsive wrapped pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-white font-medium">Peso (kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t border-dashed border-emerald-400" />
            <span className="text-emerald-400 font-medium">Target (-0.4k/sett)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300 font-medium">Girovita (cm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-yellow-300 font-medium">S7 Scarico</span>
          </div>
        </div>

        <span className="text-[10px] text-neutral-400 font-mono">
          Tocca qualsiasi settimana per dettagli
        </span>
      </div>

      {/* 4 Bottom Telemetry Cards - Fluid 2x2 on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
        <div className="apple-glass rounded-2xl p-2.5 border border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
            Inizio S1
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-white">{startWeight.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-400">kg</span>
          </div>
          <span className="text-[9px] text-neutral-400 block truncate">Girovita: {startWaist} cm</span>
        </div>

        <div className="apple-glass rounded-2xl p-2.5 border border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 block mb-0.5">
            Attuale (S{activeWeek})
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-white">
              {(sortedMeasurements[sortedMeasurements.length - 1]?.weightKg || startWeight).toFixed(1)}
            </span>
            <span className="text-[10px] text-neutral-400">kg</span>
          </div>
          <span className="text-[9px] text-emerald-400 block truncate">Inizio percorso veritiero</span>
        </div>

        <div className="apple-glass rounded-2xl p-2.5 border border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
            Target S12
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-emerald-400">{targetWeight.toFixed(1)}</span>
            <span className="text-[10px] text-neutral-400">kg</span>
          </div>
          <span className="text-[9px] text-neutral-400 block truncate">
            -{(startWeight - targetWeight).toFixed(1)} kg programmabili
          </span>
        </div>

        <div className="apple-glass rounded-2xl p-2.5 border border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
            Velocità Media
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-cyan-300">-0.45</span>
            <span className="text-[10px] text-neutral-400">kg/sett</span>
          </div>
          <span className="text-[9px] text-neutral-400 block truncate">Ricomposizione corporea</span>
        </div>
      </div>
    </div>
  );
}
