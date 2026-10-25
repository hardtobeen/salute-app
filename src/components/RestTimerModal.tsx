import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Bell, Plus, Minus } from 'lucide-react';
import { formatTimeMMSS, playAppleSound } from '../utils/calculations';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSeconds?: number;
}

export function RestTimerModal({ isOpen, onClose, defaultSeconds = 90 }: RestTimerModalProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTotalSeconds(defaultSeconds);
    setTimeLeft(defaultSeconds);
    setIsRunning(false);
  }, [defaultSeconds, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playAppleSound('complete');
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const handlePreset = (sec: number) => {
    playAppleSound('tap');
    setTotalSeconds(sec);
    setTimeLeft(sec);
    setIsRunning(true);
  };

  const adjustTime = (delta: number) => {
    playAppleSound('tap');
    const newTime = Math.max(10, timeLeft + delta);
    setTimeLeft(newTime);
    if (newTime > totalSeconds) {
      setTotalSeconds(newTime);
    }
  };

  const toggleRun = () => {
    playAppleSound('tap');
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    playAppleSound('tap');
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
          {/* Backdrop dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
            className="relative w-full max-w-sm apple-glass rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl z-10 border border-white/10"
          >
            {/* Grabber indicator */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight">Timer di Recupero</h3>
                  <p className="text-xs text-neutral-400">Guida PDF: 90-120s composti, 60-90s isolamento</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 text-neutral-300 flex items-center justify-center hover:bg-white/15"
                aria-label="Chiudi timer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Circular Timer Visual */}
            <div className="relative flex flex-col items-center justify-center my-4 py-2">
              <svg width="160" height="160" className="transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={timeLeft === 0 ? '#34c759' : '#ff9500'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold font-mono tracking-tighter text-white">
                  {formatTimeMMSS(timeLeft)}
                </span>
                <span className="text-[11px] text-neutral-400 uppercase tracking-widest mt-0.5">
                  {isRunning ? 'In corso...' : timeLeft === 0 ? 'Finito!' : 'In pausa'}
                </span>
              </div>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => adjustTime(-15)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center gap-1 active:bg-white/10"
              >
                <Minus className="w-3 h-3" /> 15s
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => adjustTime(15)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center gap-1 active:bg-white/10"
              >
                <Plus className="w-3 h-3" /> 15s
              </motion.button>
            </div>

            {/* Presets from PDF */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { sec: 60, label: '60s', desc: 'Isolamento' },
                { sec: 75, label: '75s', desc: 'Medio' },
                { sec: 90, label: '90s', desc: 'Composti' },
                { sec: 120, label: '120s', desc: 'Squat/Spinte' },
              ].map((p) => (
                <motion.button
                  key={p.sec}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handlePreset(p.sec)}
                  className={`py-2 rounded-2xl flex flex-col items-center justify-center text-xs transition-all ${
                    totalSeconds === p.sec
                      ? 'bg-orange-500/25 border border-orange-500/50 text-orange-300'
                      : 'bg-white/5 border border-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="font-semibold text-sm">{p.label}</span>
                  <span className="text-[9px] opacity-70">{p.desc}</span>
                </motion.button>
              ))}
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={resetTimer}
                className="w-12 h-12 rounded-2xl bg-white/10 text-neutral-300 flex items-center justify-center hover:bg-white/15"
                aria-label="Azzera timer"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleRun}
                className={`flex-1 h-12 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-colors ${
                  isRunning
                    ? 'bg-amber-500 text-neutral-950 shadow-amber-500/20'
                    : 'bg-orange-500 text-white shadow-orange-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Sospendi
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Avvia Recupero
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
