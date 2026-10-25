import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Lightbulb, Dumbbell, ShieldCheck } from 'lucide-react';
import { Exercise } from '../types/fitness';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  if (!exercise) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
          className="relative w-full max-w-lg apple-glass rounded-t-[32px] sm:rounded-[32px] p-6 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl z-10 border border-white/10"
        >
          {/* Grabber */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-medium mb-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>{exercise.equipment.replace('_', ' ').toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{exercise.name}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">{exercise.targetMuscles}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-neutral-300 flex items-center justify-center hover:bg-white/15"
              aria-label="Chiudi dettagli esercizio"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Quick Stats Pill Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/5 mb-5">
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Serie</span>
              <span className="text-base font-semibold text-white">{exercise.sets}</span>
            </div>
            <div className="text-center border-x border-white/10">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Ripetizioni</span>
              <span className="text-sm font-semibold text-white">{exercise.reps}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Recupero</span>
              <span className="text-base font-semibold text-orange-400">{exercise.restSeconds}s</span>
            </div>
          </div>

          {/* Execution Instructions */}
          {exercise.instructions && (
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Esecuzione Corretta
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                {exercise.instructions}
              </p>
            </div>
          )}

          {/* Common Mistakes */}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Errori Comuni da Evitare
              </h4>
              <ul className="space-y-1.5">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2 bg-rose-500/[0.08] p-2.5 rounded-xl border border-rose-500/15">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variants & Tips */}
          {exercise.variants && exercise.variants.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Consigli & Sovraccarico Progressivo
              </h4>
              <ul className="space-y-1.5">
                {exercise.variants.map((v, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2 bg-amber-500/[0.08] p-2.5 rounded-xl border border-amber-500/15">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Note from PDF */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[11px] text-neutral-400 block font-medium">Nota della Scheda:</span>
            <p className="text-xs text-neutral-200 mt-1 italic">"{exercise.notes}"</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
