import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, ChevronDown, ChevronUp, Zap, ShieldCheck, Scale, Dumbbell } from 'lucide-react';
import { calculateAdaptiveRecommendation } from '../utils/progressiveOverloadEngine';
import { Exercise } from '../types/fitness';
import { playAppleSound } from '../utils/calculations';

interface EngineLogicInspectorProps {
  currentWeightKg: number;
  initialWeightKg: number;
}

export function EngineLogicInspector({ currentWeightKg, initialWeightKg }: EngineLogicInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Simulation inputs
  const [testWeight, setTestWeight] = useState(currentWeightKg);
  const [testReps, setTestReps] = useState(20);
  const [testCondition, setTestCondition] = useState<'ottimo' | 'normale' | 'affaticato_schiena'>('ottimo');

  // Sample exercise: Spinte manubri (base: 4 sets, 12-20 reps, 10kg)
  const sampleExercise: Exercise = {
    id: 'sim-spinte',
    name: 'Spinte manubri panca inclinata',
    targetMuscles: 'Pettorali, deltoidi, tricipiti',
    sets: 4,
    reps: 'cedimento, 12-20',
    notes: 'Discesa controllata 3s',
    restSeconds: 90,
    equipment: 'manubri',
  };

  const simulatedDiary = testCondition === 'affaticato_schiena' ? {
    id: 'sim-diary',
    date: 'sim',
    moodRating: 2 as const,
    moodTags: ['Affaticato'],
    sleepHours: 5.5,
    sleepQuality: 'insonnia' as const,
    fatigueLevel: 4 as const,
    sorenessAreas: ['Lombari'],
    hasJointPain: false,
    hasBackPain: true,
    notes: 'Tensione alla schiena',
  } : null;

  // Run the real engine function
  const recommendation = calculateAdaptiveRecommendation(
    sampleExercise,
    `S1:10x${testReps}`,
    testWeight,
    initialWeightKg,
    simulatedDiary
  );

  return (
    <div className="apple-liquid-glass rounded-3xl border border-white/10 overflow-hidden transition-all mb-4">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          playAppleSound('tap');
          setIsOpen(!isOpen);
        }}
        className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                Engine di Sovraccarico Deterministico
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                Logica Attiva
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Verifica le formule matematiche e simula l'algoritmo in tempo reale
            </p>
          </div>
        </div>
        <div className="text-neutral-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="px-4 pb-4 pt-1 space-y-4 border-t border-white/[0.06]"
          >
            {/* Logic Rules Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>1. Tetto Ripetizioni & Volume</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Con manubri fissi (10 kg), quando tocchi il tetto massimo del target (es. 20 rip) e il peso scende, l'algoritmo aggiunge <strong>+1 serie di volume</strong> ed eccentrica 3s.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                  <Scale className="w-3.5 h-3.5" />
                  <span>2. Ricomposizione & RSI</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Relative Strength Index = <code className="text-cyan-300 font-mono">Tonnellaggio / Peso Corporeo</code>. Mantenere le ripetizioni mentre scendi di peso aumenta la forza relativa.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. Auto-Deload & Sicurezza</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Se sonno &lt; 6.5h, fatica &ge; 4 o tensione alla colonna (scoliosi citata nel PDF), l'algoritmo riduce istantaneamente il volume (-1 serie) per prevenire infortuni.
                </p>
              </div>
            </div>

            {/* Interactive Live Simulator */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Simulatore Algoritmo in Tempo Reale
                </span>
                <span className="text-[10px] text-neutral-400">
                  Esercizio test: Spinte panca (Base 4 serie da 12-20 rip)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Simulated Weight */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Peso Corporeo:</span>
                    <span className="font-bold text-white font-mono">{testWeight.toFixed(1)} kg</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="112"
                    step="0.5"
                    value={testWeight}
                    onChange={(e) => setTestWeight(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                    <span>100 kg (in discesa)</span>
                    <span>110 kg (inizio)</span>
                  </div>
                </div>

                {/* Simulated Reps */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Ripetizioni Eseguite:</span>
                    <span className="font-bold text-white font-mono">{testReps} rip</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="22"
                    step="1"
                    value={testReps}
                    onChange={(e) => setTestReps(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                    <span>10 rip</span>
                    <span>20 (tetto)</span>
                    <span>22 rip</span>
                  </div>
                </div>

                {/* State/Fatigue */}
                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1">Condizione fisica:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTestCondition('ottimo')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                        testCondition === 'ottimo'
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}
                    >
                      Riposato
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestCondition('affaticato_schiena')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                        testCondition === 'affaticato_schiena'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/5 border-white/10 text-neutral-400'
                      }`}
                    >
                      Affaticato/Schiena
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculated Real Output */}
              <div className="mt-2 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Output Algoritmo:</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono">
                      {recommendation.badgeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-snug">
                    {recommendation.rationale}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <div className="px-2.5 py-1 rounded-lg bg-white/5 text-center">
                    <span className="text-[9px] text-neutral-400 block uppercase">Serie Suggerite</span>
                    <span className="text-sm font-bold text-white">{recommendation.suggestedSets}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white/5 text-center">
                    <span className="text-[9px] text-neutral-400 block uppercase">Target Rip</span>
                    <span className="text-sm font-bold text-white">{recommendation.suggestedReps}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
