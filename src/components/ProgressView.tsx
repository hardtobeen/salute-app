import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingDown,
  Scale,
  Ruler,
  Calendar,
  Award,
  ChevronRight,
  Plus,
  Dumbbell,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Settings2,
  X,
  Check,
} from 'lucide-react';
import { MeasurementEntry, CompletedWorkout, UserProfile } from '../types/fitness';
import { WORKOUT_SESSIONS, TWELVE_WEEK_PERIODIZATION } from '../data/workoutProgram';
import { playAppleSound } from '../utils/calculations';
import { exportFull12WeeksCSV } from '../utils/progressiveOverloadEngine';
import { EngineLogicInspector } from './EngineLogicInspector';
import { ProgressChart } from './ProgressChart';

interface ProgressViewProps {
  profile: UserProfile;
  measurements: MeasurementEntry[];
  onAddMeasurement: (entry: MeasurementEntry) => void;
  workouts: CompletedWorkout[];
  twelveWeekLogs: Record<string, Record<string, string>>; // sessionCategory -> exerciseId -> "S1: 10x12, S2: 10x14..."
  onUpdateTwelveWeekLog: (sessionCategory: string, exerciseId: string, week: number, val: string) => void;
  activeWeek: number;
  onSetActiveWeek: (week: number) => void;
  onResetAllData?: (startWeight?: number, startWaist?: number) => void;
}

export function ProgressView({
  profile,
  measurements,
  onAddMeasurement,
  workouts,
  twelveWeekLogs,
  onUpdateTwelveWeekLog,
  activeWeek,
  onSetActiveWeek,
  onResetAllData,
}: ProgressViewProps) {
  const [selectedSessionTab, setSelectedSessionTab] = useState<string>('Push A');
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [showAddMeasure, setShowAddMeasure] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [calibWeight, setCalibWeight] = useState(profile.initialWeightKg.toString());
  const [calibWaist, setCalibWaist] = useState(profile.initialWaistCm.toString());

  const handleDownloadCSV = () => {
    playAppleSound('complete');
    const csvContent = exportFull12WeeksCSV(twelveWeekLogs, measurements, workouts, profile);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Registro_12_Settimane_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Latest measurements
  const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentMeas = sortedMeasurements[sortedMeasurements.length - 1] || {
    weightKg: profile.currentWeightKg,
    waistCm: profile.currentWaistCm,
    date: 'Oggi',
  };

  const initialMeas = sortedMeasurements[0] || currentMeas;
  const weightDelta = (currentMeas.weightKg - initialMeas.weightKg).toFixed(1);
  const waistDelta = (currentMeas.waistCm - initialMeas.waistCm).toFixed(1);

  const handleAddMeasurementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    const wst = parseFloat(newWaist);
    if (!w) return;
    playAppleSound('ding');
    onAddMeasurement({
      id: 'm-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      weightKg: w,
      waistCm: wst || currentMeas.waistCm,
    });
    setNewWeight('');
    setNewWaist('');
    setShowAddMeasure(false);
  };

  // Find exercises for selected session
  const activeSessionDef = WORKOUT_SESSIONS.find((s) => s.category === selectedSessionTab) || WORKOUT_SESSIONS[0];

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header & Fast Metric Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
            Monitoraggio Corporeo & Sovraccarico
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Progressi & 12 Settimane</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 font-semibold text-xs flex items-center gap-1.5 border border-white/12 cursor-pointer shadow-sm"
            title="Scarica tutte le 12 settimane in formato foglio di calcolo CSV"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" /> Scarica CSV
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddMeasure(!showAddMeasure)}
            className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold text-xs flex items-center gap-1.5 border border-rose-500/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Registra Misure
          </motion.button>
          {onResetAllData && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                playAppleSound('tap');
                setShowResetModal(true);
              }}
              className="px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center gap-1.5 border border-white/10 cursor-pointer"
              title="Calibra il tuo vero peso iniziale o azzera tutti i log a zero"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" /> Calibra Inizio
            </motion.button>
          )}
        </div>
      </div>

      {/* Reset & Calibration Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="apple-liquid-glass rounded-3xl p-6 max-w-md w-full border border-white/15 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Punto di Partenza Reale</h3>
                    <p className="text-[11px] text-neutral-400">Imposta i tuoi dati iniziali veritieri</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-neutral-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Nessun dato finto: inserisci il tuo vero peso e girovita di oggi. Tutti i conteggi partiranno da zero con Settimana 1.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Peso Iniziale (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={calibWeight}
                    onChange={(e) => setCalibWeight(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Girovita Iniziale (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={calibWaist}
                    onChange={(e) => setCalibWaist(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const w = parseFloat(calibWeight) || 120.0;
                    const wst = parseFloat(calibWaist) || 110.0;
                    if (onResetAllData) {
                      onResetAllData(w, wst);
                    }
                    setShowResetModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salva e Inizia da Zero
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Measurement Collapse */}
      {showAddMeasure && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddMeasurementSubmit}
          className="apple-glass rounded-3xl p-4 border border-rose-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div>
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
              Nuovo Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="es. 119.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
              Girovita (cm)
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="es. 110.0"
              value={newWaist}
              onChange={(e) => setNewWaist(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="flex items-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full h-9 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              Salva Misurazione
            </motion.button>
          </div>
        </motion.form>
      )}

      {/* Apple Health Metric Cards - Truthful Baseline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Weight */}
        <div className="apple-glass rounded-3xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Peso Attuale</span>
            <Scale className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{currentMeas.weightKg}</span>
            <span className="text-xs text-neutral-400">kg</span>
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${
            Math.abs(parseFloat(weightDelta)) < 0.05
              ? 'text-neutral-400'
              : parseFloat(weightDelta) < 0
              ? 'text-emerald-400'
              : 'text-rose-400'
          }`}>
            {Math.abs(parseFloat(weightDelta)) < 0.05
              ? '0.0 kg • Inizio percorso'
              : parseFloat(weightDelta) < 0
              ? `${weightDelta} kg da inizio`
              : `+${weightDelta} kg`}
          </span>
        </div>

        {/* Waist */}
        <div className="apple-glass rounded-3xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Girovita</span>
            <Ruler className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{currentMeas.waistCm}</span>
            <span className="text-xs text-neutral-400">cm</span>
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${
            Math.abs(parseFloat(waistDelta)) < 0.05
              ? 'text-neutral-400'
              : parseFloat(waistDelta) < 0
              ? 'text-emerald-400'
              : 'text-rose-400'
          }`}>
            {Math.abs(parseFloat(waistDelta)) < 0.05
              ? '0.0 cm • Misura iniziale'
              : parseFloat(waistDelta) < 0
              ? `${waistDelta} cm persi`
              : `+${waistDelta} cm`}
          </span>
        </div>

        {/* Workouts Completed */}
        <div className="apple-glass rounded-3xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Allenamenti</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{workouts.length}</span>
            <span className="text-xs text-neutral-400">sedute</span>
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${
            workouts.length === 0 ? 'text-neutral-400' : 'text-emerald-400'
          }`}>
            {workouts.length === 0 ? 'Pronto per Seduta 1' : `${workouts.length} completate`}
          </span>
        </div>

        {/* Active Week */}
        <div className="apple-glass rounded-3xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settimana</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">S{activeWeek}</span>
            <span className="text-xs text-neutral-400">/ 12</span>
          </div>
          <span className="text-[11px] text-purple-400 font-semibold mt-1 block">
            Fase attiva
          </span>
        </div>
      </div>

      {/* Engine Sovraccarico Progressivo - Interactive Logic & Formula Inspector */}
      <EngineLogicInspector currentWeightKg={currentMeas.weightKg} initialWeightKg={initialMeas.weightKg} />

      {/* 12-Week Progress Chart (Mobile Native, Dual Metric, Scientific Target Trajectory) */}
      <ProgressChart
        profile={profile}
        measurements={sortedMeasurements}
        activeWeek={activeWeek}
        onSelectWeek={onSetActiveWeek}
      />

      {/* 12-Week Periodization Phase Info (PDF Cap. 5.3) */}
      <div className="apple-glass rounded-3xl p-5 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
          Periodizzazione 12 Settimane (PDF Cap. 5.3)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {TWELVE_WEEK_PERIODIZATION.map((item, idx) => {
            const isCurrent =
              (idx === 0 && activeWeek <= 2) ||
              (idx === 1 && activeWeek >= 3 && activeWeek <= 6) ||
              (idx === 2 && activeWeek === 7) ||
              (idx === 3 && activeWeek >= 8 && activeWeek <= 11) ||
              (idx === 4 && activeWeek === 12);

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-md'
                    : 'bg-white/[0.02] border-white/5 text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{item.phase}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{item.rule}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive 12-Week Workout Log (Pages 18-23 from PDF) */}
      <div className="apple-glass rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Registri Stampabili Digitalizzati
            </span>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Registro Carico x Ripetizioni (12 Settimane)
            </h3>
            <p className="text-xs text-neutral-400">
              Modifica direttamente le celle per ciascuna settimana come sui fogli cartacei.
            </p>
          </div>

          {/* Session Switcher - Responsive Grid on Mobile, Flex on Desktop */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
            {['Push A', 'Pull A', 'Gambe A', 'Push B', 'Pull B', 'Gambe B'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playAppleSound('tap');
                  setSelectedSessionTab(cat);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-center text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSessionTab === cat
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MOBILE-NATIVE Exercise Card View (Zero horizontal scrollbars, 100% viewport fit) */}
        <div className="block md:hidden space-y-3">
          {/* Mobile Week Picker Strip */}
          <div className="flex items-center justify-between gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 pl-1 uppercase">Settimana:</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    playAppleSound('tap');
                    onSetActiveWeek(w);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                    activeWeek === w
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white bg-white/5'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise cards for the selected week */}
          <div className="space-y-2">
            {activeSessionDef.exercises.map((ex) => {
              const sessionLogs = twelveWeekLogs[selectedSessionTab] || {};
              const exString = sessionLogs[ex.id] || '';

              const weekValues: Record<number, string> = {};
              exString.split(',').forEach((part) => {
                const [k, v] = part.split(':');
                if (k && v) {
                  const wNum = parseInt(k.replace('S', ''));
                  weekValues[wNum] = v.trim();
                }
              });

              const prevWeekVal = activeWeek > 1 ? weekValues[activeWeek - 1] : null;

              return (
                <div
                  key={ex.id}
                  className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{ex.name}</h4>
                      <span className="text-[10px] text-neutral-400">
                        {ex.sets} set • {ex.reps}
                      </span>
                    </div>
                    {prevWeekVal && (
                      <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md font-mono">
                        S{activeWeek - 1}: {prevWeekVal}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rose-400 shrink-0 font-mono">
                      S{activeWeek}:
                    </span>
                    <input
                      type="text"
                      placeholder="es. 14kg x 12, 14kg x 10"
                      value={weekValues[activeWeek] || ''}
                      onChange={(e) => onUpdateTwelveWeekLog(selectedSessionTab, ex.id, activeWeek, e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-neutral-200 focus:outline-none focus:border-rose-500 placeholder:text-neutral-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DESKTOP Matrix Table (Visible on md and larger) */}
        <div className="hidden md:block overflow-x-auto no-scrollbar -mx-5 px-5">
          <table className="w-full text-xs text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 text-[10px] uppercase tracking-wider">
                <th className="py-2.5 pr-3 font-semibold sticky left-0 bg-[#121216] z-10">Esercizio</th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <th
                    key={w}
                    onClick={() => onSetActiveWeek(w)}
                    className={`py-2.5 px-2 text-center font-bold cursor-pointer transition-colors ${
                      activeWeek === w ? 'text-rose-400 bg-rose-500/10 rounded-t-lg' : 'hover:text-white'
                    }`}
                  >
                    S{w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeSessionDef.exercises.map((ex) => {
                const sessionLogs = twelveWeekLogs[selectedSessionTab] || {};
                const exString = sessionLogs[ex.id] || '';

                // Helper to parse "S1:10x12,S2:10x15..."
                const weekValues: Record<number, string> = {};
                exString.split(',').forEach((part) => {
                  const [k, v] = part.split(':');
                  if (k && v) {
                    const wNum = parseInt(k.replace('S', ''));
                    weekValues[wNum] = v.trim();
                  }
                });

                return (
                  <tr key={ex.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3 font-medium text-white sticky left-0 bg-[#121216] z-10 max-w-[160px] truncate">
                      <span className="block truncate">{ex.name}</span>
                      <span className="text-[10px] text-neutral-400 block">{ex.sets} set • {ex.reps}</span>
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                      <td key={w} className={`py-1.5 px-1 text-center ${activeWeek === w ? 'bg-rose-500/5' : ''}`}>
                        <input
                          type="text"
                          placeholder="-"
                          value={weekValues[w] || ''}
                          onChange={(e) => onUpdateTwelveWeekLog(selectedSessionTab, ex.id, w, e.target.value)}
                          className="w-14 h-7 text-center rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-rose-500 placeholder:text-neutral-700"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
