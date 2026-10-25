import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Smile,
  Moon,
  AlertCircle,
  Plus,
  Sparkles,
  Calendar,
  Check,
  ShieldAlert,
  BatteryCharging
} from 'lucide-react';
import { DiaryEntry } from '../types/fitness';
import { playAppleSound } from '../utils/calculations';

interface DiaryViewProps {
  entries: DiaryEntry[];
  onAddEntry: (entry: DiaryEntry) => void;
}

const MOOD_OPTIONS = [
  { val: 1, label: 'Molto Giù', color: 'from-blue-600 to-indigo-800', text: 'text-blue-400' },
  { val: 2, label: 'Sottotono', color: 'from-cyan-600 to-teal-800', text: 'text-cyan-400' },
  { val: 3, label: 'Neutro', color: 'from-emerald-600 to-teal-800', text: 'text-emerald-400' },
  { val: 4, label: 'Sereno / Bene', color: 'from-amber-500 to-orange-700', text: 'text-amber-400' },
  { val: 5, label: 'Energico / Top', color: 'from-rose-500 to-pink-700', text: 'text-rose-400' },
] as const;

const TAG_SUGGESTIONS = [
  'Energico',
  'Motivato',
  'Concentrato',
  'Stanco',
  'Stress lavorativo',
  'Gambe pesanti',
  'Ottimo pompaggio',
  'Poco sonno',
  'Schiena solida',
];

export function DiaryView({ entries, onAddEntry }: DiaryViewProps) {
  const [moodRating, setMoodRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Energico', 'Schiena solida']);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<DiaryEntry['sleepQuality']>('buono');
  const [fatigueLevel, setFatigueLevel] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [hasJointPain, setHasJointPain] = useState<boolean>(false);
  const [hasBackPain, setHasBackPain] = useState<boolean>(false);
  const [personalNotes, setPersonalNotes] = useState<string>('');

  const toggleTag = (tag: string) => {
    playAppleSound('tap');
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playAppleSound('ding');

    const newEntry: DiaryEntry = {
      id: 'diary-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      moodRating,
      moodTags: selectedTags,
      sleepHours,
      sleepQuality,
      fatigueLevel,
      sorenessAreas: [],
      hasJointPain,
      hasBackPain,
      notes: personalNotes.trim(),
    };

    onAddEntry(newEntry);
    setPersonalNotes('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
          Benessere & Diario
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Umore, Sonno & Note Personali
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Filosofia Apple Mindfulness integrata con le regole di recupero della guida (Cap. 9).
        </p>
      </div>

      {/* Main Form Check-in */}
      <form onSubmit={handleSubmit} className="apple-glass rounded-3xl p-6 border border-white/10 space-y-6">
        {/* Apple Mindfulness Mood Selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Come ti senti oggi? (Stato d'Animo)
          </label>

          <div className="grid grid-cols-5 gap-2">
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = moodRating === opt.val;
              return (
                <motion.button
                  key={opt.val}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    playAppleSound('tap');
                    setMoodRating(opt.val);
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-br ${opt.color} text-white shadow-lg shadow-black/40 scale-105 border border-white/20`
                      : 'bg-white/[0.03] text-neutral-400 border border-white/5 hover:text-white'
                  }`}
                >
                  <Smile className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider block mb-2 font-medium">
            Sensazioni Chiave
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TAG_SUGGESTIONS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <motion.button
                  key={tag}
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-rose-500/25 border border-rose-500/50 text-rose-200'
                      : 'bg-white/5 border border-white/5 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sleep & Fatigue Row (PDF Chapter 9: Sonno e Recupero) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          {/* Sleep Hours */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-purple-400" />
                Ore di Sonno
              </span>
              <span className="text-xs font-mono text-purple-300 font-bold">
                {sleepHours} h (Target PDF: ~8h)
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="11"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-black/40 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-2">
              <span>4h</span>
              <span className="text-purple-400">8h ideale per testosterone</span>
              <span>11h</span>
            </div>
          </div>

          {/* Fatigue Level */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-amber-400" />
                Livello di Fatica
              </span>
              <span className="text-xs font-semibold text-amber-300">
                {fatigueLevel === 1 ? 'Riposato' : fatigueLevel <= 3 ? 'Normale' : 'Affaticato'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFatigueLevel(lvl as typeof fatigueLevel)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    fatigueLevel === lvl
                      ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Checks from PDF: Joint and Back Pain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setHasBackPain(!hasBackPain)}
            className={`p-3 rounded-2xl flex items-center justify-between text-left text-xs transition-all ${
              hasBackPain
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
                : 'bg-white/[0.03] border border-white/5 text-neutral-300'
            }`}
          >
            <div>
              <span className="font-semibold block flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Fastidio / Tensione alla Schiena?
              </span>
              <span className="text-[10px] opacity-80">
                Scoliosi pregressa: se presente stop stacco o riduci carichi
              </span>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${hasBackPain ? 'bg-rose-500 text-white' : 'border border-white/20'}`}>
              {hasBackPain && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setHasJointPain(!hasJointPain)}
            className={`p-3 rounded-2xl flex items-center justify-between text-left text-xs transition-all ${
              hasJointPain
                ? 'bg-orange-500/20 border border-orange-500/40 text-orange-200'
                : 'bg-white/[0.03] border border-white/5 text-neutral-300'
            }`}
          >
            <div>
              <span className="font-semibold block flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                Dolori Articolari (Gomiti, Spalle, Ginocchia)
              </span>
              <span className="text-[10px] opacity-80">
                PDF: Non forzare su articolazioni; riduci o sostituisci
              </span>
            </div>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${hasJointPain ? 'bg-orange-500 text-white' : 'border border-white/20'}`}>
              {hasJointPain && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </motion.button>
        </div>

        {/* Freeform Notes Textarea */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
            Note Personali sull'Allenamento & Sensazioni
          </label>
          <textarea
            rows={3}
            placeholder="es. Oggi spinte con manubri da 10kg molto fluide con 3s di eccentrica. Camminata serale di 35 min conclusa con facilità..."
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500 leading-relaxed resize-none"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Salva Check-in Giornaliero
        </motion.button>
      </form>

      {/* Diary History Feed */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-neutral-400" />
          Cronologia Note & Diario ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <div className="apple-glass rounded-2xl p-6 text-center text-xs text-neutral-400">
            Nessuna nota registrata finora. Fai il tuo primo check-in sopra!
          </div>
        ) : (
          entries.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="apple-glass rounded-3xl p-5 border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">{item.date}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-neutral-200">
                    Umore: {MOOD_OPTIONS.find((m) => m.val === item.moodRating)?.label || 'Sereno'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{item.sleepHours}h sonno</span>
                  <span>•</span>
                  <span>Fatica {item.fatigueLevel}/5</span>
                </div>
              </div>

              {item.moodTags && item.moodTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.moodTags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-neutral-200 pt-1 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  "{item.notes}"
                </p>
              )}

              {(item.hasBackPain || item.hasJointPain) && (
                <div className="flex items-center gap-2 pt-1">
                  {item.hasBackPain && (
                    <span className="text-[10px] text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Schiena attenzionata
                    </span>
                  )}
                  {item.hasJointPain && (
                    <span className="text-[10px] text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Dolore articolare
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
