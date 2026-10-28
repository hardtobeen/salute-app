import { motion } from 'motion/react';
import { Dumbbell, Utensils, TrendingUp, Heart, BookOpen, Activity } from 'lucide-react';
import { playAppleSound } from '../utils/calculations';
import { triggerHaptic } from '../utils/haptics';

export type TabKey = 'workout' | 'nutrition' | 'progress' | 'diary' | 'health' | 'guide';

interface TabBarProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
}

export function TabBar({ activeTab, onChangeTab }: TabBarProps) {
  const tabs = [
    { key: 'workout', label: 'Scheda', icon: Dumbbell },
    { key: 'nutrition', label: 'Nutrizione', icon: Utensils },
    { key: 'progress', label: 'Progressi', icon: TrendingUp },
    { key: 'diary', label: 'Diario', icon: Heart },
    { key: 'health', label: 'Salute', icon: Activity },
    { key: 'guide', label: 'Guida', icon: BookOpen },
  ] as const;

  return (
    <nav
      aria-label="Navigazione principale"
      className="fixed bottom-3 inset-x-0 z-40 max-w-lg mx-auto px-3 pointer-events-auto select-none"
    >
      <div className="apple-liquid-glass rounded-3xl p-1.5 shadow-2xl border border-white/12 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                triggerHaptic('selection');
                playAppleSound('tap');
                onChangeTab(tab.key);
              }}
              className={`relative flex-1 py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white/10 rounded-2xl -z-10 border border-white/10"
                  transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.8 }}
                />
              )}
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  isActive ? 'scale-110 text-rose-500 fill-rose-500/20' : ''
                }`}
              />
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-white' : ''}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
