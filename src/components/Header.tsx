import { motion } from 'motion/react';
import { Download, WifiOff, Heart } from 'lucide-react';
import { UserProfile } from '../types/fitness';
import { playAppleSound } from '../utils/calculations';

interface HeaderProps {
  profile: UserProfile;
  activeTab: string;
  onOpenHealth: () => void;
  activeWeek: number;
  onDownloadAllData: () => void;
}

export function Header({
  profile,
  activeTab,
  onOpenHealth,
  activeWeek,
  onDownloadAllData,
}: HeaderProps) {
  const deltaKg = (profile.currentWeightKg - profile.initialWeightKg).toFixed(1);

  return (
    <header className="sticky top-0 z-40 w-full apple-liquid-glass border-b border-white/[0.08] px-4 py-2.5 select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Minimalist HUD - No logos, no branding */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-tight">
              S{activeWeek}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">/12</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 text-xs font-mono">
            <span className="text-rose-400 font-bold">{profile.currentWeightKg} kg</span>
            <span className="text-neutral-500 hidden sm:inline">• {profile.heightCm}cm</span>
            {Math.abs(parseFloat(deltaKg)) > 0.05 ? (
              <span className={`text-[10px] font-semibold ${parseFloat(deltaKg) < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({parseFloat(deltaKg) < 0 ? `${deltaKg}kg` : `+${deltaKg}kg`})
              </span>
            ) : (
              <span className="text-[10px] text-neutral-400">
                (Inizio)
              </span>
            )}
          </div>
        </div>

        {/* High-productivity controls: Offline status + 1-Click Download Everything + HealthKit */}
        <div className="flex items-center gap-2">
          {/* Offline indicator badge */}
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Offline</span>
          </div>

          {/* Quick Export Everything Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              playAppleSound('complete');
              onDownloadAllData();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Scarica tutti i dati e le 12 settimane in CSV"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Esporta 12 Settimane</span>
            <span className="sm:hidden">Scarica</span>
          </motion.button>

          {/* Apple Health Quick Access */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              playAppleSound('tap');
              onOpenHealth();
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
            aria-label="Apple Health"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-[11px] font-medium hidden md:inline">Salute</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
