import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  ChevronDown,
  ShieldCheck,
  Zap,
  Dumbbell,
  Scale,
  Pill,
  Moon,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { SUPPLEMENTS_INFO } from '../data/workoutProgram';
import { playAppleSound } from '../utils/calculations';

export function GuideView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('cap-1');

  const toggleSection = (id: string) => {
    playAppleSound('tap');
    setExpandedSection(expandedSection === id ? null : id);
  };

  const SECTIONS = [
    {
      id: 'cap-1',
      num: 'Cap. 1',
      title: 'Sintesi e Regole del Sistema',
      icon: ShieldCheck,
      color: 'text-rose-400',
      content: (
        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p>
            L'obiettivo è dimagrire costruendo solida massa muscolare. Con esperienza pregressa e ritorno al sovrappeso (193 cm / ~110 kg), il corpo risponde in modo eccellente alla ripresa del lavoro.
          </p>
          <div className="space-y-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
            <h5 className="font-bold text-white text-xs">Le Regole Fondamentali:</h5>
            <ul className="space-y-1.5 list-disc list-inside">
              <li><strong>Sei sedute di pesi</strong> con split push/pull/legs, domenica leggera: nessun gruppo muscolare allenato due giorni di fila.</li>
              <li><strong>Cedimento tecnico</strong> (non più una ripetizione pulita) su isolamento, carrucola, elastici e piegamenti.</li>
              <li><strong>Sugli esercizi di gambe pesanti</strong> (squat, affondi, stacco rumeno) fermati a circa 1 ripetizione dal limite (1 RIR).</li>
              <li><strong>Manubri da 10 kg:</strong> sul bicipite sono impegnativi, altrove diventano presto leggeri; usa tempo lento (3s eccentrica), pause, versioni unilaterali ed elastici.</li>
              <li><strong>Camminata o cyclette:</strong> ogni giorno come movimento benefico, non come punizione.</li>
              <li><strong>Sicurezza schiena:</strong> in presenza di dolore acuto, formicolio o perdita di forza: stop immediato.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'cap-5',
      num: 'Cap. 5',
      title: 'Progressione, Cedimento e Recuperi',
      icon: Zap,
      color: 'text-amber-400',
      content: (
        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <h5 className="font-bold text-white text-xs">5.1 Doppia Progressione</h5>
          <p>
            Resta con lo stesso carico finché arrivi al tetto massimo delle ripetizioni su tutte le serie con tecnica impeccabile. Poi aumenta la difficoltà: elastico più forte (es. 30 kg anziché 10 kg), discesa lenta in 3-4 secondi, pausa di 1 secondo isometrico, oppure versione unilaterale. Poi riparti dalla parte bassa dell'intervallo.
          </p>
          <h5 className="font-bold text-white text-xs pt-2">5.2 Recuperi Scientificamente Ottimali</h5>
          <p>
            Una revisione bayesiana del 2024 su 9 studi evidenzia un chiaro vantaggio per recuperi <strong>sopra i 60 secondi</strong> e nessun miglioramento oltre i 90-120 secondi.
          </p>
          <ul className="space-y-1 list-disc list-inside bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
            <li>Esercizi multiarticolari pesanti: <strong>90 - 120 secondi</strong></li>
            <li>Esercizi di isolamento e braccia: <strong>60 - 90 secondi</strong></li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cap-6',
      num: 'Cap. 6',
      title: 'Testosterone: Cosa Dicono le Evidenze',
      icon: Scale,
      color: 'text-emerald-400',
      content: (
        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <p>
            Non esiste alcun metodo miracoloso naturale per portare il testosterone a livelli altissimi. Le leve realmente efficaci e scientifiche sono la composizione corporea, l'allenamento di forza, il sonno e la valutazione medica.
          </p>
          <div className="space-y-2 bg-emerald-500/[0.06] p-3 rounded-2xl border border-emerald-500/15 text-emerald-200">
            <p><strong>Evidenze chiave da meta-analisi:</strong></p>
            <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
              <li>Revisione endocrinologica 2025: il calo di testosterone nell'obesità è spesso <em>reversibile</em> e legato alla SHBG bassa.</li>
              <li>Meta-analisi 2013: aumenti significativi del testosterone con il solo dimagrimento (+2,87 nmol/L con dieta ipocalorica equilibrata).</li>
              <li>Revisione 2023-2024 su 52 studi: i testo-booster commerciali (Tribulus, DHEA) non aumentano il testosterone nella maggioranza delle evidenze.</li>
              <li>Avviso FDA: evitare assolutamente prodotti anabolizzanti clandestini o SARMs per gravi rischi cardiovascolari ed epatici.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'cap-8',
      num: 'Cap. 8',
      title: 'Integratori: Analisi Scientifica',
      icon: Pill,
      color: 'text-purple-400',
      content: (
        <div className="space-y-3 text-xs text-neutral-300">
          <div className="grid grid-cols-1 gap-2.5">
            {SUPPLEMENTS_INFO.map((sup, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <h6 className="font-bold text-white text-xs">{sup.name}</h6>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-medium">
                    {sup.status}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">{sup.evidence}</p>
                <div className="mt-2 text-[10px] text-neutral-400 bg-black/30 p-2 rounded-xl">
                  <strong>Dosaggio:</strong> {sup.dosage} • <em>{sup.notes}</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'cap-9',
      num: 'Cap. 9',
      title: 'Sonno e Recupero con 6 Allenamenti',
      icon: Moon,
      color: 'text-indigo-400',
      content: (
        <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
          <ul className="space-y-2 list-disc list-inside bg-white/[0.02] p-3 rounded-2xl border border-white/5">
            <li>Proteggi una finestra di <strong>circa 8 ore di sonno</strong> quando possibile.</li>
            <li>Evita notti in bianco prima di sedute pesanti.</li>
            <li>La camminata quotidiana leggera agisce come stimolatore di recupero e ossigenazione, non come fatica extra.</li>
            <li><strong>Dopo una notte di scarso riposo o turno notturno:</strong> riduci 1 serie per esercizio o togli il cedimento.</li>
            <li>Se la forza cala per 2 sedute di fila: riduci di 1 serie tutti gli esercizi (mini-deload).</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cap-10',
      num: 'Cap. 10',
      title: 'Problemi Frequenti & Soluzioni',
      icon: AlertTriangle,
      color: 'text-orange-400',
      content: (
        <div className="space-y-2 text-xs">
          {[
            { p: '10 kg troppo leggeri', s: 'Rallenta la discesa a 3-4 secondi, fai pausa di 1s in basso, usa varianti unilaterali o elastico da 30 kg.' },
            { p: 'Elastico troppo duro', s: 'Cambia punto di ancoraggio, allarga la presa o riduci il range di allungamento.' },
            { p: 'Peso fermo sulla bilancia', s: 'Un solo cambio alla volta nei pasti, misura anche il girovita, bevi regolarmente e attendi 2 settimane.' },
            { p: 'Troppa fatica sistemica', s: 'Fai il cedimento solo sull\'ultima serie di ciascun esercizio anziché su tutte.' },
            { p: 'Fastidio alla schiena', s: 'Stop immediato all\'esercizio, mantieni schiena neutra senza iperestensioni lombari negli hip thrust o stacchi.' },
            { p: 'Poco tempo a disposizione', s: 'Versione minima: fai i primi 3 esercizi della seduta saltando l\'isolamento secondario.' },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="font-bold text-orange-300 block mb-0.5">{item.p}</span>
              <span className="text-neutral-300 text-[11px] leading-relaxed">{item.s}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'cap-12',
      num: 'Cap. 12',
      title: 'Fonti Scientifiche & Bibliografia',
      icon: FileText,
      color: 'text-neutral-400',
      content: (
        <ul className="space-y-1.5 text-[11px] text-neutral-400 list-disc list-inside leading-relaxed">
          <li>Muir CA, Wittert GA. Low testosterone in men with obesity. J Clin Endocrinol Metab 2025.</li>
          <li>Corona G et al. Body weight loss reverts obesity-associated hypogonadotropic hypogonadism. Eur J Endocrinol 2013.</li>
          <li>ACSM resistance training position stand 2026.</li>
          <li>Proximity to failure & hypertrophy: meta-analysis 2022; Robinson et al. 2024; Refalo et al. 2024.</li>
          <li>Kreider RB et al. Creatine supplementation is safe... Front Nutr 2025.</li>
          <li>NIH ODS. Dietary Supplements for Exercise and Athletic Performance.</li>
          <li>Scoliosis Research Society: Living with Scoliosis; SSR UK training guide.</li>
        </ul>
      ),
    },
  ];

  const filteredSections = SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.num.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
          Compendio Ufficiale
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Guida Massa & Dimagrimento
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Tutti i 12 capitoli del documento PDF integrati per una consultazione rapida e scientifica.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cerca nella guida (es. testosterone, cedimento, creatina...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Sections Accordion */}
      <div className="space-y-3">
        {filteredSections.map((sec) => {
          const isExpanded = expandedSection === sec.id;
          const Icon = sec.icon;

          return (
            <div
              key={sec.id}
              className={`apple-glass rounded-3xl border transition-all overflow-hidden ${
                isExpanded ? 'border-white/15 bg-white/[0.05]' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleSection(sec.id)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${sec.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      {sec.num}
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight">{sec.title}</h4>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180 text-rose-400' : ''
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="px-5 pb-5 pt-1 border-t border-white/5"
                  >
                    {sec.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
