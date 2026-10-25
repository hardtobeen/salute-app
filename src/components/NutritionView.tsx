import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  Plus,
  Trash2,
  Check,
  Droplets,
  Pill,
  Sparkles,
  Flame,
  ChevronDown,
  ShoppingBag,
  Info,
  Sliders
} from 'lucide-react';
import { MealEntry, UserProfile, FoodItem } from '../types/fitness';
import { GROCERY_ITEMS } from '../data/workoutProgram';
import { calculateMacros, playAppleSound } from '../utils/calculations';

interface NutritionViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  meals: MealEntry[];
  onAddMeal: (meal: MealEntry) => void;
  onDeleteMeal: (mealId: string) => void;
  creatineTaken: boolean;
  onToggleCreatine: () => void;
  waterLiters: number;
  onAddWater: (amount: number) => void;
}

export function NutritionView({
  profile,
  onUpdateProfile,
  meals,
  onAddMeal,
  onDeleteMeal,
  creatineTaken,
  onToggleCreatine,
  waterLiters,
  onAddWater,
}: NutritionViewProps) {
  const [activeTab, setActiveTab] = useState<'tracker' | 'spesa' | 'guida'>('tracker');
  const [showMacroCalc, setShowMacroCalc] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'colazione' | 'pranzo' | 'spuntino' | 'cena'>('pranzo');
  const [customFoodName, setCustomFoodName] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');

  // Grocery checked items
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});

  // Calculate current totals
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

  // Targets calculated from formula
  const calculated = calculateMacros(profile.currentWeightKg, profile.heightCm, profile.activityLevel, profile.dailyProteinTargetGrams);

  const proteinPct = Math.min(100, Math.round((totalProtein / calculated.proteinGrams) * 100));
  const caloriesPct = Math.min(100, Math.round((totalCalories / calculated.targetCalories) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / calculated.carbsGrams) * 100));
  const fatsPct = Math.min(100, Math.round((totalFats / calculated.fatGrams) * 100));

  const handleQuickAddFood = (food: FoodItem) => {
    playAppleSound('ding');
    const newMeal: MealEntry = {
      id: 'meal-' + Date.now() + Math.random(),
      mealType: selectedMealType,
      foodName: `${food.name} (${food.portion})`,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddMeal(newMeal);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;
    playAppleSound('ding');
    const prot = parseFloat(customProtein) || 0;
    const cal = parseFloat(customCalories) || (prot * 4);
    const cb = parseFloat(customCarbs) || 0;
    const ft = parseFloat(customFats) || 0;

    const newMeal: MealEntry = {
      id: 'meal-' + Date.now(),
      mealType: selectedMealType,
      foodName: customFoodName.trim(),
      calories: Math.round(cal),
      protein: Math.round(prot),
      carbs: Math.round(cb),
      fats: Math.round(ft),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddMeal(newMeal);
    setCustomFoodName('');
    setCustomProtein('');
    setCustomCalories('');
    setCustomCarbs('');
    setCustomFats('');
  };

  const toggleGrocery = (id: string) => {
    playAppleSound('tap');
    setCheckedGroceries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Segmented Tabs: Diario Pasti / Lista Spesa / Criteri PDF */}
      <div className="flex p-1 apple-glass rounded-2xl max-w-md mx-auto">
        {[
          { key: 'tracker', label: 'Diario & Macro' },
          { key: 'spesa', label: 'Spesa Tipo' },
          { key: 'guida', label: 'Regole Alimentari' },
        ].map((t) => (
          <motion.button
            key={t.key}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playAppleSound('tap');
              setActiveTab(t.key as typeof activeTab);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      {activeTab === 'tracker' && (
        <>
          {/* Main Macro Summary Card */}
          <div className="apple-glass rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Target Nutrizionale
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  160 - 190 g Proteine al Giorno
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Calcolato con deficit prudente (0.25 - 0.5 kg/settimana)
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMacroCalc(!showMacroCalc)}
                className="w-9 h-9 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 flex items-center justify-center border border-white/10"
                aria-label="Regola impostazioni macro"
              >
                <Sliders className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Protein Focus Ring & Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              {/* Protein Big Card */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Proteine (Target PDF)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {totalProtein} / {calculated.proteinGrams} g
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-extrabold text-white">{totalProtein}</span>
                  <span className="text-xs text-neutral-400">grammi assunti</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-400 rounded-full"
                    animate={{ width: `${proteinPct}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-2">
                  <span>Min: 160g</span>
                  <span className="text-emerald-400 font-semibold">{proteinPct}% del target</span>
                  <span>Max: 190g</span>
                </div>
              </div>

              {/* Calories Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-950/30 border border-rose-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Calorie
                  </span>
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <span className="text-2xl font-bold text-white block">
                  {totalCalories}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Target: {calculated.targetCalories} kcal
                </span>
                <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mt-2">
                  <motion.div
                    className="h-full bg-rose-400 rounded-full"
                    animate={{ width: `${caloriesPct}%` }}
                  />
                </div>
              </div>

              {/* Carbs & Fats Mini */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-cyan-400 font-semibold">Carboidrati</span>
                    <span className="text-neutral-300 font-mono text-[11px]">{Math.round(totalCarbs)}g / {calculated.carbsGrams}g</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${carbsPct}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-semibold">Grassi</span>
                    <span className="text-neutral-300 font-mono text-[11px]">{Math.round(totalFats)}g / {calculated.fatGrams}g</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${fatsPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Habits: Creatine & Water */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onToggleCreatine}
                className={`p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                  creatineTaken
                    ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200'
                    : 'bg-white/[0.03] border border-white/5 text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${creatineTaken ? 'bg-purple-500 text-white' : 'bg-white/10 text-purple-400'}`}>
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold block">Creatina Monoidrato (3-5g)</span>
                    <span className="text-[10px] opacity-70">Studio ISSN 2025: ritenzione idrica benefica</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${creatineTaken ? 'bg-purple-500 text-white' : 'border border-white/20'}`}>
                  {creatineTaken && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </motion.button>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold block text-neutral-200">Acqua: {waterLiters.toFixed(2)} L</span>
                    <span className="text-[10px] text-neutral-400">Target idratazione ~3.0 - 3.5 L</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAddWater(0.25)}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-all text-xs"
                  >
                    +250ml
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Macro Calculator Drawer */}
          <AnimatePresence>
            {showMacroCalc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="apple-glass rounded-3xl p-5 border border-white/10 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-400" />
                    Personalizzazione Parametri Corporei
                  </h3>
                  <button
                    onClick={() => setShowMacroCalc(false)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Chiudi
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Peso Attuale (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.currentWeightKg}
                      onChange={(e) =>
                        onUpdateProfile({ ...profile, currentWeightKg: parseFloat(e.target.value) || 110 })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Altezza (cm)
                    </label>
                    <input
                      type="number"
                      value={profile.heightCm}
                      onChange={(e) =>
                        onUpdateProfile({ ...profile, heightCm: parseInt(e.target.value) || 193 })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Target Proteine (g)
                    </label>
                    <input
                      type="number"
                      min="160"
                      max="190"
                      value={profile.dailyProteinTargetGrams}
                      onChange={(e) =>
                        onUpdateProfile({
                          ...profile,
                          dailyProteinTargetGrams: Math.min(190, Math.max(160, parseInt(e.target.value) || 175)),
                        })
                      }
                      className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">
                      Livello Attività
                    </label>
                    <select
                      value={profile.activityLevel}
                      onChange={(e) =>
                        onUpdateProfile({ ...profile, activityLevel: e.target.value as UserProfile['activityLevel'] })
                      }
                      className="w-full h-9 px-2 rounded-xl bg-black/40 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="sedentario_pesi">Pesi + Sedentario (x1.35)</option>
                      <option value="moderato">6gg Pesi + Camminata (x1.50)</option>
                      <option value="attivo">Molto attivo (x1.65)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meal Section Switcher & Quick Add Food */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Registra Alimento
              </h3>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                {[
                  { key: 'colazione', label: 'Colazione (25-40g P)' },
                  { key: 'pranzo', label: 'Pranzo (40-60g P)' },
                  { key: 'spuntino', label: 'Spuntino (20-30g P)' },
                  { key: 'cena', label: 'Cena (40-60g P)' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      playAppleSound('tap');
                      setSelectedMealType(m.key as typeof selectedMealType);
                    }}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all ${
                      selectedMealType === m.key
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {m.key.charAt(0).toUpperCase() + m.key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Suggestions from PDF Guide */}
            <div className="overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
              <div className="flex items-center gap-2 min-w-max">
                {GROCERY_ITEMS.slice(0, 10).map((food) => (
                  <motion.button
                    key={food.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleQuickAddFood(food)}
                    className="px-3 py-2 rounded-2xl apple-glass-subtle border border-white/5 hover:border-emerald-500/30 flex items-center gap-2 text-left transition-all"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">{food.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">+{food.protein}g prot • {food.calories} kcal</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Food Input Form */}
            <form onSubmit={handleCustomAdd} className="apple-glass rounded-2xl p-4 border border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nome alimento (es. Petto di pollo 180g)"
                  value={customFoodName}
                  onChange={(e) => setCustomFoodName(e.target.value)}
                  className="sm:col-span-2 h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Proteine (g)"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="h-9 px-2 text-center rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Calorie (kcal)"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="h-9 px-2 text-center rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Carbo (g)"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="h-9 px-2 text-center rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  className="h-9 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Aggiungi
                </motion.button>
              </div>
            </form>

            {/* Logged Meals List */}
            <div className="space-y-3">
              {(['colazione', 'pranzo', 'spuntino', 'cena'] as const).map((mealType) => {
                const group = meals.filter((m) => m.mealType === mealType);
                const mealProtein = group.reduce((acc, m) => acc + m.protein, 0);
                const mealCalories = group.reduce((acc, m) => acc + m.calories, 0);

                const targetLabel =
                  mealType === 'colazione'
                    ? '25-40g'
                    : mealType === 'pranzo'
                    ? '40-60g'
                    : mealType === 'spuntino'
                    ? '20-30g'
                    : '40-60g';

                return (
                  <div key={mealType} className="apple-glass rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold capitalize text-white">{mealType}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
                          Target PDF: {targetLabel} P
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-300">
                        {mealProtein}g P • {mealCalories} kcal
                      </span>
                    </div>

                    {group.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-1">Nessun alimento registrato</p>
                    ) : (
                      <div className="space-y-1.5">
                        {group.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-neutral-200"
                          >
                            <span className="font-medium">{item.foodName}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-400 font-mono">{item.protein}g P</span>
                              <span className="text-neutral-400 font-mono">{item.calories} kcal</span>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => onDeleteMeal(item.id)}
                                className="text-neutral-500 hover:text-rose-400 p-1"
                                aria-label={`Rimuovi ${item.foodName}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Grocery List Tab (Spesa tipo) */}
      {activeTab === 'spesa' && (
        <div className="space-y-5">
          <div className="apple-glass rounded-3xl p-5 border border-white/10">
            <div className="flex items-center gap-2 text-rose-400 mb-1">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white tracking-tight">Spesa Tipo da Guida PDF</h3>
            </div>
            <p className="text-xs text-neutral-300">
              Gli alimenti consigliati dal capitolo 7.2 per fare la spesa senza complicarsi la vita. Spunta gli articoli mentre sei al supermercato.
            </p>
          </div>

          {(['Proteine', 'Carboidrati', 'Verdure', 'Grassi', 'Comodita'] as const).map((cat) => {
            const items = GROCERY_ITEMS.filter((g) => g.category === cat);
            return (
              <div key={cat} className="apple-glass rounded-3xl p-5 border border-white/5 space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-3">
                  {cat === 'Comodita' ? 'Comodità & Scatolame' : cat} ({items.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item) => {
                    const isChecked = checkedGroceries[item.id] || false;
                    return (
                      <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleGrocery(item.id)}
                        className={`p-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                          isChecked
                            ? 'bg-emerald-500/10 border border-emerald-500/25 text-neutral-300'
                            : 'bg-white/[0.03] border border-white/5 text-neutral-200 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div>
                          <span className={`text-sm font-semibold block ${isChecked ? 'line-through text-neutral-400' : 'text-white'}`}>
                            {item.name}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            Porzione: {item.portion} • {item.protein}g P
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-emerald-500 text-neutral-950 font-bold' : 'border border-white/20'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guidelines Tab */}
      {activeTab === 'guida' && (
        <div className="space-y-4">
          <div className="apple-glass rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Come ridurre il grasso senza stravolgere tutto (Cap. 7.1)
            </h3>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  <strong className="text-white block">Cambia una cosa alla volta</strong>
                  Inizia tagliando bevande zuccherate, snack fuori pasto e dosando l'olio a cucchiai anziché a occhio.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  <strong className="text-white block">Metti proteine in ogni pasto</strong>
                  Ti saziano a lungo, stimolano la sintesi proteica e proteggono la massa magra durante il calo di peso.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  <strong className="text-white block">Non eliminare i carboidrati</strong>
                  Servono come benzina per sostenere sei allenamenti settimanali con carichi impegnativi e carrucola.
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-xs">4</span>
                <div>
                  <strong className="text-white block">Ritmo prudente: 0,25 - 0,5 kg a settimana</strong>
                  Se forza ed energia crollano nei workout, non aumentare il deficit. La costanza batte la fretta.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
