import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Footprints,
  Timer,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  Database,
  Calendar,
  Share2,
  Plus,
  RotateCcw,
  Navigation
} from 'lucide-react';
import { AppleHealthData, CompletedWorkout, MeasurementEntry, UserProfile } from '../types/fitness';
import { AppleActivityRings } from './AppleActivityRings';
import { generateAppleHealthKitXML, playAppleSound } from '../utils/calculations';

interface AppleHealthSyncViewProps {
  profile: UserProfile;
  measurements: MeasurementEntry[];
  workouts: CompletedWorkout[];
  healthData: AppleHealthData;
  onUpdateHealthData: (data: AppleHealthData) => void;
  onRestoreBackup?: (backupData: any) => void;
}

export function AppleHealthSyncView({
  profile,
  measurements,
  workouts,
  healthData,
  onUpdateHealthData,
  onRestoreBackup,
}: AppleHealthSyncViewProps) {
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Manual update helpers
  const handleUpdateSteps = (newSteps: number) => {
    playAppleSound('tap');
    const val = Math.max(0, Math.round(newSteps));
    // Auto-calculate distance estimate if distance was 0 or closely tied
    const autoKm = parseFloat((val * 0.00078).toFixed(2));
    onUpdateHealthData({
      ...healthData,
      stepCountToday: val,
      walkingRunningDistanceKm: autoKm,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleUpdateDistance = (km: number) => {
    onUpdateHealthData({
      ...healthData,
      walkingRunningDistanceKm: Math.max(0, parseFloat(km.toFixed(2)) || 0),
    });
  };

  const handleUpdateExerciseMinutes = (mins: number) => {
    onUpdateHealthData({
      ...healthData,
      appleExerciseTimeMinutes: Math.max(0, Math.round(mins)),
    });
  };

  const handleUpdateCalories = (kcal: number) => {
    onUpdateHealthData({
      ...healthData,
      activeEnergyBurnedTodayKcal: Math.max(0, Math.round(kcal)),
    });
  };

  const handleResetToday = () => {
    playAppleSound('tap');
    onUpdateHealthData({
      ...healthData,
      stepCountToday: 0,
      walkingRunningDistanceKm: 0,
      activeEnergyBurnedTodayKcal: 0,
      appleExerciseTimeMinutes: 0,
    });
  };

  const handleDownloadXML = () => {
    playAppleSound('complete');
    const xmlData = generateAppleHealthKitXML(profile, measurements, workouts, healthData);
    const blob = new Blob([xmlData], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AppleHealth_Export_${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    playAppleSound('complete');
    const exportData = {
      app: 'Fitness Tracker Offline',
      exportedAt: new Date().toISOString(),
      user: profile,
      measurements,
      workouts,
      appleHealthSnapshot: healthData,
      twelveWeekLogs: JSON.parse(localStorage.getItem('aurafit_12week_logs') || '{}'),
      diary: JSON.parse(localStorage.getItem('aurafit_diary') || '[]'),
      meals: JSON.parse(localStorage.getItem('aurafit_meals') || '[]'),
      localDatabaseHistory: healthData.dailyHistory || {},
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Completo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (onRestoreBackup) {
          onRestoreBackup(json);
          playAppleSound('ring');
          setRestoreMessage('Database ripristinato con successo!');
          setTimeout(() => setRestoreMessage(null), 4000);
        }
      } catch (err) {
        setRestoreMessage('Errore nel formato del file di backup.');
      }
    };
    reader.readAsText(file);
  };

  const ring1 = {
    label: 'Movimento',
    current: healthData.activeEnergyBurnedTodayKcal,
    max: 650,
    unit: 'kcal',
    color: '#fa114f',
    subColor: '#ff5277',
  };

  const ring2 = {
    label: 'Esercizio',
    current: healthData.appleExerciseTimeMinutes,
    max: 45,
    unit: 'min',
    color: '#a1ff00',
    subColor: '#00e676',
  };

  const ring3 = {
    label: 'Passi',
    current: healthData.stepCountToday,
    max: 10000,
    unit: 'passi',
    color: '#00f0ff',
    subColor: '#0072ff',
  };

  const historyEntries = Object.entries(healthData.dailyHistory || {}).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-6 pb-24">
      {/* Activity Rings & Summary Card */}
      <div className="apple-liquid-glass rounded-3xl p-6 border border-white/12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Concentric SVG Rings */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <AppleActivityRings ring1={ring1} ring2={ring2} ring3={ring3} size={190} strokeWidth={15} />
          <span className="text-[11px] text-neutral-400 uppercase tracking-widest mt-3 font-semibold">
            Anelli Attività
          </span>
        </div>

        {/* Breakdown of the 3 Rings */}
        <div className="md:col-span-7 space-y-3">
          {/* Ring 1 - Movimento (Kcal) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#fa114f]/20 text-[#fa114f] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Movimento</span>
                <span className="text-[10px] text-neutral-400">Target: {ring1.max} kcal</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#fa114f] font-mono">{ring1.current}</span>
              <span className="text-xs text-neutral-400 ml-1">kcal</span>
            </div>
          </div>

          {/* Ring 2 - Esercizio (Minuti) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#a1ff00]/20 text-[#a1ff00] flex items-center justify-center">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Esercizio</span>
                <span className="text-[10px] text-neutral-400">Target: {ring2.max} min</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#a1ff00] font-mono">{ring2.current}</span>
              <span className="text-xs text-neutral-400 ml-1">min</span>
            </div>
          </div>

          {/* Ring 3 - Passi */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Passi</span>
                <span className="text-[10px] text-neutral-400">Target: {ring3.max.toLocaleString()} passi</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#00f0ff] font-mono">{ring3.current.toLocaleString()}</span>
              <span className="text-xs text-neutral-400 ml-1">passi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input Controls - Real User Input */}
      <div className="apple-liquid-glass rounded-3xl p-6 border border-white/12 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Inserimento Dati Reali di Oggi
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Inserisci a Mano i Tuoi Dati
            </h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleResetToday}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-[11px] flex items-center gap-1 border border-white/5 cursor-pointer"
            title="Azzera dati di oggi"
          >
            <RotateCcw className="w-3 h-3" /> Azzera Oggi
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Steps Input */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Footprints className="w-4 h-4 text-cyan-400" />
                Passi Effettuati Oggi
              </span>
              <span className="font-mono text-cyan-400 text-sm">
                {healthData.stepCountToday.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="50"
                min="0"
                value={healthData.stepCountToday === 0 ? '' : healthData.stepCountToday}
                placeholder="es. 6500"
                onChange={(e) => handleUpdateSteps(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {[500, 1000, 2000, 5000].map((inc) => (
                <motion.button
                  key={inc}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleUpdateSteps(healthData.stepCountToday + inc)}
                  className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-neutral-300 border border-white/5 transition-colors"
                >
                  +{inc >= 1000 ? `${inc / 1000}k` : inc}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Distance Input */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Navigation className="w-4 h-4 text-emerald-400" />
                Distanza a Piedi (km)
              </span>
              <span className="font-mono text-emerald-400 text-sm">
                {healthData.walkingRunningDistanceKm} km
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                value={healthData.walkingRunningDistanceKm === 0 ? '' : healthData.walkingRunningDistanceKm}
                placeholder="es. 4.5"
                onChange={(e) => handleUpdateDistance(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {[0.5, 1.0, 2.0].map((kmInc) => (
                <motion.button
                  key={kmInc}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleUpdateDistance(healthData.walkingRunningDistanceKm + kmInc)}
                  className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-neutral-300 border border-white/5 transition-colors"
                >
                  +{kmInc} km
                </motion.button>
              ))}
            </div>
          </div>

          {/* Exercise Minutes Input */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-lime-300">
                <Timer className="w-4 h-4 text-lime-400" />
                Minuti di Esercizio
              </span>
              <span className="font-mono text-lime-400 text-sm">
                {healthData.appleExerciseTimeMinutes} min
              </span>
            </div>
            <input
              type="number"
              step="5"
              min="0"
              value={healthData.appleExerciseTimeMinutes === 0 ? '' : healthData.appleExerciseTimeMinutes}
              placeholder="es. 45"
              onChange={(e) => handleUpdateExerciseMinutes(parseInt(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-lime-400 font-mono"
            />
          </div>

          {/* Active Calories Input */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-rose-300">
                <Flame className="w-4 h-4 text-rose-400" />
                Calorie Attive (kcal)
              </span>
              <span className="font-mono text-rose-400 text-sm">
                {healthData.activeEnergyBurnedTodayKcal} kcal
              </span>
            </div>
            <input
              type="number"
              step="25"
              min="0"
              value={healthData.activeEnergyBurnedTodayKcal === 0 ? '' : healthData.activeEnergyBurnedTodayKcal}
              placeholder="es. 350"
              onChange={(e) => handleUpdateCalories(parseInt(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Midnight Reset & Local Mini-Database Explanation */}
      <div className="apple-liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white tracking-tight">
            Reset Notturno Automatico & Database Locale
          </h4>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          A <strong>mezzanotte</strong> i contatori di passi, distanza e calorie attive si azzerano a <strong>0</strong> per la nuova giornata. I dati delle giornate passate <strong>non si accumulano</strong> sulla schermata odierna, ma vengono salvati permanentemente nel tuo mini database locale.
        </p>

        {/* Local Mini Database Archive Table */}
        {historyEntries.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Archivio Giornate Precedenti ({historyEntries.length})
            </span>
            <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
              {historyEntries.map(([dateKey, record]) => (
                <div
                  key={dateKey}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <span className="font-mono text-neutral-300 font-bold">{dateKey}</span>
                  <div className="flex items-center gap-3 text-neutral-400 text-[11px] font-mono">
                    <span>{record.steps.toLocaleString()} passi</span>
                    <span>•</span>
                    <span>{record.distanceKm} km</span>
                    <span>•</span>
                    <span className="text-rose-400">{record.activeCaloriesBurnedKcal} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backup & Export Hub */}
      <div className="apple-liquid-glass rounded-3xl p-6 border border-white/10 space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Esportazione & Backup Istantaneo
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">
            I Tuoi Dati Sono Tuoi (100% Offline)
          </h3>
          <p className="text-xs text-neutral-300">
            Scarica l'intero database in JSON o XML per Apple Health in qualsiasi momento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadXML}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2.5 text-left transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Apple Health XML</span>
              <span className="text-[10px] text-neutral-400">HealthData.dtd</span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadJSON}
            className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2.5 text-left transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Backup JSON</span>
              <span className="text-[10px] text-neutral-400">Database completo</span>
            </div>
          </motion.button>

          <label className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2.5 text-left transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">Ripristina JSON</span>
              <span className="text-[10px] text-neutral-400">Carica file</span>
            </div>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
          </label>
        </div>

        {restoreMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium"
          >
            {restoreMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}
