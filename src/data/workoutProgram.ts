import { WorkoutSession, FoodItem, UserProfile } from '../types/fitness';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  heightCm: 193,
  initialWeightKg: 110.0,
  currentWeightKg: 110.0,
  targetWeightKg: 95.0,
  initialWaistCm: 106.0,
  currentWaistCm: 106.0,
  activityLevel: 'moderato',
  dailyProteinTargetGrams: 175, // Inside 160-190 g from the PDF
  dailyCalorieTarget: 2450, // Moderate deficit ~400 kcal
  availableEquipment: [
    'Panca regolabile',
    '2 Manubri da 10 kg',
    'Carrucola alta',
    'Elastico 10 kg',
    'Elastico 30 kg'
  ],
  historyNotes: 'Scoliosi pregressa riferita (nessun dolore attuale). Test iniziale: 10 curl con 10 kg a due braccia insieme.'
};

export const WORKOUT_SESSIONS: WorkoutSession[] = [
  {
    id: 'push-a',
    day: 'lunedi',
    dayLabel: 'Lunedì',
    title: 'Push A',
    category: 'Push A',
    focus: 'Petto, Spalle, Tricipiti',
    cardio: '30-45 min di camminata dopo i pesi (o 25-35 min cyclette se piove)',
    recoveryRules: 'Recuperi: 90-120 s sui principali, 60-90 s sull\'isolamento. Cedimento tecnico su isolamento, carrucola, elastici e piegamenti.',
    exercises: [
      {
        id: 'p-a-1',
        name: 'Spinte manubri su panca inclinata',
        targetMuscles: 'Petto alto, deltoidi anteriori, tricipiti',
        sets: 4,
        reps: 'cedimento, 12-20',
        notes: 'Discesa controllata in 3 secondi. Prima serie più leggera di prova, poi serie di lavoro.',
        tempo: '3-0-1',
        restSeconds: 90,
        equipment: 'manubri',
        instructions: 'Panca inclinata a circa 30-45°. Impugna i manubri da 10 kg, apri il torace, scendi controllando per 3 secondi completi e spingi senza bloccare rigidamente i gomiti.',
        commonMistakes: ['Discesa frettolosa', 'Gomiti troppo aperti a 90° con stress sulle spalle', 'Inarcare eccessivamente la zona lombare'],
        variants: ['Con manubri da 10 kg mantieni 3-4s in discesa per aumentare l\'intensità', 'Pausa di 1s in basso']
      },
      {
        id: 'p-a-2',
        name: 'Piegamenti con piedi sulla panca',
        targetMuscles: 'Petto alto, spalle, tricipiti, core',
        sets: 3,
        reps: 'cedimento',
        notes: 'Elastico sulla schiena se diventano facili.',
        restSeconds: 90,
        equipment: 'corpo_libero',
        instructions: 'Piedi sulla panca, mani a terra larghezza spalle. Corpo perfettamente allineato a tavola. Scendi fino a sfiorare il pavimento.',
        commonMistakes: ['Bacino che cede verso il basso', 'Collo proteso in avanti'],
        variants: ['Aggiunta elastico 10 kg incrociato dietro la schiena', 'Pausa a metà discesa']
      },
      {
        id: 'p-a-3',
        name: 'Spinte con elastico 30 kg ancorato dietro',
        targetMuscles: 'Pettorali, stabilità scapolare',
        sets: 3,
        reps: '12-20',
        notes: 'Busto fermo. Più tensione facendo un passo avanti.',
        restSeconds: 75,
        equipment: 'elastico',
        instructions: 'Ancora l\'elastico da 30 kg dietro di te ad altezza petto. Afferra le estremità e spingi in avanti mantenendo il busto solido.',
        commonMistakes: ['Busto che dondola in avanti e indietro per inerzia', 'Spalle sollevate verso le orecchie'],
        variants: ['Passo più lungo in avanti per tensione massima in chiusura', 'Trattenuta 1 secondo a picco contrazione']
      },
      {
        id: 'p-a-4',
        name: 'Alzate laterali',
        targetMuscles: 'Deltoidi laterali',
        sets: 3,
        reps: '15-25, cedimento',
        notes: 'Peso leggero o elastico. Controllo totale senza slancio.',
        restSeconds: 60,
        equipment: 'manubri',
        instructions: 'Gomiti leggermente flessi. Sali fino alla linea delle spalle senza oscillare con il busto.',
        commonMistakes: ['Slancio col tronco', 'Braccia tese a leva troppo rigida o sollevamento sopra la linea scapolare'],
        variants: ['Con manubri 10kg usa tecnica parziale/controllata o elastico 10kg sotto i piedi']
      },
      {
        id: 'p-a-5',
        name: 'Tricipiti alla carrucola alta',
        targetMuscles: 'Tricipiti (capo laterale e mediale)',
        sets: 3,
        reps: 'cedimento, 12-20',
        notes: 'Gomiti fermi aderenti al corpo.',
        restSeconds: 60,
        equipment: 'carrucola',
        instructions: 'Impugna la corda o sbarra alla carrucola alta. Gomiti fissati lungo i fianchi, estendi completamente l\'avambraccio verso il basso.',
        commonMistakes: ['Gomiti che si muovono avanti e indietro tipo rematore', 'Spalle chiuse in avanti']
      },
      {
        id: 'p-a-6',
        name: 'Estensioni tricipiti sopra la testa con elastico',
        targetMuscles: 'Capo lungo del tricipite',
        sets: 2,
        reps: 'cedimento',
        notes: 'Senza inarcare la schiena.',
        restSeconds: 60,
        equipment: 'elastico',
        instructions: 'Elastico sotto i talloni o ancorato in basso. Porta le mani dietro la testa con gomiti chiusi ed estendi verso l\'alto mantenendo addome compatto.',
        commonMistakes: ['Inarcare la colonna lombare', 'Gomiti eccessivamente allargati verso l\'esterno']
      }
    ]
  },
  {
    id: 'pull-a',
    day: 'martedi',
    dayLabel: 'Martedì',
    title: 'Pull A',
    category: 'Pull A',
    focus: 'Dorso, Bicipiti, Spalle posteriori',
    cardio: '30-45 min di camminata (o cyclette se piove)',
    recoveryRules: 'Recuperi: 90-120 s sui principali, 60-90 s sull\'isolamento. Cedimento tecnico su trazioni, elastici e curl.',
    exercises: [
      {
        id: 'pl-a-1',
        name: 'Trazioni alla carrucola alta (Lat pulldown)',
        targetMuscles: 'Gran dorsale, grande rotondo, bicipiti',
        sets: 4,
        reps: 'cedimento, 10-15',
        notes: 'Tira verso la parte alta del petto. Busto solido.',
        restSeconds: 90,
        equipment: 'carrucola',
        instructions: 'Siediti o inginocchiati, afferra la barra con presa prona o neutra. Retrai le scapole e tira la barra al petto pensando di portare i gomiti verso le tasche.',
        commonMistakes: ['Tirare dietro il collo', 'Dondolare violentemente indietro con la schiena']
      },
      {
        id: 'pl-a-2',
        name: 'Rematore a un braccio con petto appoggiato',
        targetMuscles: 'Dorso, romboidi, deltoide posteriore',
        sets: 3,
        reps: '12-20/lato',
        notes: 'Discesa lenta. Petto stabilizzato sulla panca inclinata (ottimo per proteggere la schiena).',
        restSeconds: 75,
        equipment: 'manubri',
        instructions: 'Pancia appoggiata su panca inclinata a 30-45°. Questo scarica completamente il rachide lombare. Esegui la remata tirando il manubrio da 10 kg verso il fianco.',
        commonMistakes: ['Ruotare il busto per sollevare il peso', 'Discesa incontrollata']
      },
      {
        id: 'pl-a-3',
        name: 'Face pull con elastico 10 kg',
        targetMuscles: 'Deltoidi posteriori, extrarotatori, trapezio medio/inferiore',
        sets: 3,
        reps: '15-25',
        notes: 'Spalle basse, gomiti alti, pausa di 1s a fine corsa.',
        restSeconds: 60,
        equipment: 'elastico',
        instructions: 'Ancora l\'elastico da 10 kg all\'altezza degli occhi. Tira verso il viso aprendo le mani e mantenendo i gomiti alti.',
        commonMistakes: ['Alzare le spalle verso il collo', 'Perdere la tensione dell\'elastico in discesa']
      },
      {
        id: 'pl-a-4',
        name: 'Curl manubri 10 kg, braccia insieme',
        targetMuscles: 'Bicipite brachiale',
        sets: 3,
        reps: 'cedimento',
        notes: 'Parti dal tuo test di 10 ripetizioni e cerca di progredire gradualmente.',
        restSeconds: 75,
        equipment: 'manubri',
        instructions: 'In piedi o seduto su panca. Braccia lungo i fianchi, fletti entrambi gli avambracci ruotando i polsi in supinazione. Massima contrazione senza slanciare i fianchi.',
        commonMistakes: ['Dondolio della schiena', 'Gomiti che salgono troppo avanti togliendo tensione']
      },
      {
        id: 'pl-a-5',
        name: 'Curl a martello (Hammer curl)',
        targetMuscles: 'Brachiale, brachioradiale',
        sets: 2,
        reps: 'cedimento',
        notes: 'Presa neutra (pollici verso l\'alto), presa ferma.',
        restSeconds: 60,
        equipment: 'manubri',
        instructions: 'Mantieni i palmi rivolti uno verso l\'altro. Fletti lentamente l\'avambraccio. Ottimo rinforzo per l\'avambraccio e lo spessore del braccio.',
        commonMistakes: ['Alternare con fretta', 'Usare slancio di gambe']
      },
      {
        id: 'pl-a-6',
        name: 'Apertura posteriore con elastico',
        targetMuscles: 'Deltoide posteriore, stabilità scapolare',
        sets: 2,
        reps: '15-25',
        notes: 'Controllo costante, movimento a croce orizzontale.',
        restSeconds: 60,
        equipment: 'elastico',
        instructions: 'Tieni l\'elastico davanti al petto con entrambe le mani. Apri le braccia verso l\'esterno fino a sentire strizzare la parte posteriore delle spalle.',
        commonMistakes: ['Gomiti piegati eccessivamente', 'Perdita di postura del collo']
      }
    ]
  },
  {
    id: 'legs-a',
    day: 'mercoledi',
    dayLabel: 'Mercoledì',
    title: 'Gambe A',
    category: 'Gambe A',
    focus: 'Gambe, Glutei, Polpacci, Core',
    cardio: '20-30 min facili di camminata (non affaticare troppo dopo le gambe)',
    recoveryRules: 'Recuperi: 90-120 s su squat e stacco rumeno, 60-90 s su isolamento. IMPORTANTE: Fermati a circa 1 RIR sugli esercizi pesanti per tutelare la schiena.',
    exercises: [
      {
        id: 'lg-a-1',
        name: 'Goblet squat con manubrio 10 kg',
        targetMuscles: 'Quadricipiti, glutei, addome',
        sets: 4,
        reps: '12-20, 1 RIR',
        notes: 'Pausa di 1 s in basso. Busto verticale, gomiti chiusi.',
        tempo: '3-1-1',
        restSeconds: 90,
        equipment: 'manubri',
        instructions: 'Tieni il manubrio da 10 kg al petto con entrambe le mani. Scendi controllato aprendo le ginocchia nella direzione delle punte dei piedi. Fermati un secondo in buca ed esplodi.',
        commonMistakes: ['Ginocchia che collassano verso l\'interno', 'Talloni che si staccano dal suolo', 'Curvare la schiena']
      },
      {
        id: 'lg-a-2',
        name: 'Affondi indietro (Reverse lunge)',
        targetMuscles: 'Quadricipiti, glutei, equilibrio',
        sets: 3,
        reps: '10-15/lato',
        notes: 'Passo piccolo per enfasi quadricipiti. Usa appoggio stabile se serve stabilità.',
        restSeconds: 75,
        equipment: 'corpo_libero',
        instructions: 'Fai un passo controllato indietro, piega entrambe le ginocchia a circa 90°. Torna in posizione spingendo con il tallone anteriore.',
        commonMistakes: ['Perdita di equilibrio', 'Impatto brusco del ginocchio posteriore sul pavimento']
      },
      {
        id: 'lg-a-3',
        name: 'Stacco rumeno con elastico 30 kg sotto i piedi',
        targetMuscles: 'Femorali, glutei, erettori spinali',
        sets: 3,
        reps: '12-15, 1-2 RIR',
        notes: 'Schiena neutra, movimento corto. Spingi i fianchi indietro. Fermati quando la schiena perde controllo.',
        restSeconds: 90,
        equipment: 'elastico',
        instructions: 'Posiziona l\'elastico da 30 kg sotto le piante dei piedi. Afferra l\'elastico. Con schiena neutra e petto fiero, spingi il bacino indietro (hip hinge) piegando pochissimo le ginocchia. Ritorna contraendo i glutei.',
        commonMistakes: ['Curvare la schiena (pericolo per colonna)', 'Piegare troppo le ginocchia trasformandolo in uno squat']
      },
      {
        id: 'lg-a-4',
        name: 'Ponte glutei / Hip thrust con spalle sulla panca',
        targetMuscles: 'Glutei, catena posteriore',
        sets: 3,
        reps: '12-20',
        notes: 'Pausa in alto. Riferimento ACE: non iperestendere la zona lombare, contrai il bacino a cucchiaio.',
        restSeconds: 60,
        equipment: 'panca',
        instructions: 'Spalle appoggiate alla panca, piedi a terra larghezza fianchi. Spingi con i talloni sollevando il bacino fino a formare una tavola orizzontale. Strizza i glutei per 1 secondo.',
        commonMistakes: ['Spingere troppo in alto inarcando la schiena lombare', 'Piedi troppo lontani o troppo vicini']
      },
      {
        id: 'lg-a-5',
        name: 'Polpacci (Calf raise su rialzo/panca)',
        targetMuscles: 'Gastrocnemio e soleo',
        sets: 3,
        reps: 'cedimento',
        notes: 'Discesa profonda, spinta sull\'avampiede.',
        restSeconds: 60,
        equipment: 'corpo_libero',
        instructions: 'Avampiede su uno scalino o base stabile. Scendi allungando bene il polpaccio, poi sollevati sull\'alluce contraendo al massimo per 1 secondo.',
        commonMistakes: ['Rimbalzare frettolosamente', 'Range di movimento ridotto']
      },
      {
        id: 'lg-a-6',
        name: 'Plank',
        targetMuscles: 'Core, trasverso addominale, stabilità lombare',
        sets: 2,
        reps: '20-40 s',
        notes: 'Addome e glutei contratti al massimo. Non fare inarcare il bacino.',
        restSeconds: 60,
        equipment: 'corpo_libero',
        instructions: 'Avambracci a terra, gomiti sotto le spalle. Bacino in retroversione neutra. Respira regolarmente senza trattenere il fiato.',
        commonMistakes: ['Bacino che affonda verso il basso', 'Bacino troppo alto a tenda']
      }
    ]
  },
  {
    id: 'push-b',
    day: 'giovedi',
    dayLabel: 'Giovedì',
    title: 'Push B',
    category: 'Push B',
    focus: 'Petto, Spalle, Tricipiti (Variazione stimolo)',
    cardio: '30-45 min di camminata dopo i pesi (o 25-35 min cyclette)',
    recoveryRules: 'Recuperi: 90-120 s sui composti, 60-90 s sull\'isolamento. Cedimento tecnico su croci, piegamenti ed elastici.',
    exercises: [
      {
        id: 'p-b-1',
        name: 'Spinte manubri su panca piana',
        targetMuscles: 'Pettorale intero, deltoidi anteriori, tricipiti',
        sets: 4,
        reps: 'cedimento, 12-20',
        notes: 'Pausa di 1 s sul petto per eliminare il rimbalzo elastico e massimizzare la tensione con 10 kg.',
        restSeconds: 90,
        equipment: 'manubri',
        instructions: 'Sdraiato su panca orizzontale. Piedi piantati a terra, scapole retratte. Scendi controllando fino a toccare leggermente l\'esterno del petto, fai 1 secondo di stop e spingi su.',
        commonMistakes: ['Rimbalzare sul torace', 'Gomiti a 90° svasati verso la gola']
      },
      {
        id: 'p-b-2',
        name: 'Aperture (Croci) con elastico',
        targetMuscles: 'Pettorali in massimo allungamento e contrazione',
        sets: 3,
        reps: '12-20',
        notes: 'Ancora dietro, abbraccia un albero immaginario.',
        restSeconds: 60,
        equipment: 'elastico',
        instructions: 'Con l\'elastico ancorato dietro, braccia semiflesse, chiudi le mani davanti allo sterno strizzando i pettorali.',
        commonMistakes: ['Piegare troppo i gomiti trasformandolo in una spinta', 'Spalle alzate']
      },
      {
        id: 'p-b-3',
        name: 'Piegamenti normali a terra (Push-ups)',
        targetMuscles: 'Petto, tricipiti, stabilità scapolo-omerale',
        sets: 3,
        reps: 'cedimento',
        notes: 'Mani a larghezza spalle. Corpo d\'acciaio.',
        restSeconds: 75,
        equipment: 'corpo_libero',
        instructions: 'Piegamenti classici sul pavimento. Scendi col petto a terra e spingi con forza.',
        commonMistakes: ['Gomiti all\'infuori a 90°', 'Addome rilassato che cede']
      },
      {
        id: 'p-b-4',
        name: 'Alzate laterali con elastico',
        targetMuscles: 'Deltoidi laterali (tensione progressiva)',
        sets: 3,
        reps: '15-25',
        notes: 'Cedimento tecnico. L\'elastico aumenta la resistenza proprio in cima!',
        restSeconds: 60,
        equipment: 'elastico',
        instructions: 'Calpesta l\'elastico da 10 kg con i piedi. Solleva lateralmente fino alla spalla.',
        commonMistakes: ['Slanciarsi con la schiena', 'Polso che piega prima del gomito']
      },
      {
        id: 'p-b-5',
        name: 'Tricipiti alla carrucola, presa diversa',
        targetMuscles: 'Tricipiti (variazione angolare)',
        sets: 3,
        reps: 'cedimento',
        notes: 'Usa barra dritta o presa inversa/corda rispetto alla seduta A.',
        restSeconds: 60,
        equipment: 'carrucola',
        instructions: 'Varia l\'impugnatura (corda o barra prona) per stimolare diversamente i capi del tricipite. Mantieni i gomiti bloccati ai fianchi.',
        commonMistakes: ['Perdere l\'isolamento del gomito']
      },
      {
        id: 'p-b-6',
        name: 'Estensioni tricipiti con manubrio',
        targetMuscles: 'Tricipiti',
        sets: 2,
        reps: '12-20',
        notes: 'Facoltativo. Esegui solo se l\'articolazione del gomito è fresca e senza fastidi.',
        restSeconds: 60,
        equipment: 'manubri',
        instructions: 'Sdraiato o seduto, estensioni dietro la nuca (french press o kickback). Concentrati sul controllo.',
        commonMistakes: ['Aprire eccessivamente i gomiti']
      }
    ]
  },
  {
    id: 'pull-b',
    day: 'venerdi',
    dayLabel: 'Venerdì',
    title: 'Pull B',
    category: 'Pull B',
    focus: 'Dorso, Bicipiti (Variazione stimolo)',
    cardio: '30-45 min di camminata (o cyclette)',
    recoveryRules: 'Recuperi: 90-120 s sui composti dorsali, 60-90 s sull\'isolamento.',
    exercises: [
      {
        id: 'pl-b-1',
        name: 'Trazioni carrucola presa stretta (Close grip lat pulldown)',
        targetMuscles: 'Gran dorsale inferiore, bicipiti, romboidi',
        sets: 4,
        reps: 'cedimento, 10-15',
        notes: 'Tira la maniglia stretta al petto mantenendo la schiena dritta.',
        restSeconds: 90,
        equipment: 'carrucola',
        instructions: 'Usa una presa neutra o stretta a triangolo. Tira portando il petto verso l\'alto.',
        commonMistakes: ['Incurvare le spalle in avanti al punto di massima trazione']
      },
      {
        id: 'pl-b-2',
        name: 'Pulldown a braccia tese',
        targetMuscles: 'Isolamento gran dorsale, grande rotondo',
        sets: 3,
        reps: '12-20',
        notes: 'Spalle ferme. Errore comune: usare tutto il corpo dondolando.',
        restSeconds: 60,
        equipment: 'carrucola',
        instructions: 'Alla carrucola alta, braccia quasi tese (gomiti appena sbloccati). Spingi la sbarra verso le cosce attivando solo il dorsale.',
        commonMistakes: ['Flettere le braccia come un pushdown per tricipiti', 'Dondolare col tronco']
      },
      {
        id: 'pl-b-3',
        name: 'Rematore con elastico 30 kg',
        targetMuscles: 'Spessore dorsale, romboidi, trapezio medio',
        sets: 3,
        reps: '12-20',
        notes: 'Ancoraggio basso o sotto i piedi. Schiena solida e petto aperto.',
        restSeconds: 75,
        equipment: 'elastico',
        instructions: 'Elastico ancorato in basso o attorno ai piedi se seduto a terra a gambe distese. Tira i gomiti indietro strizzando le scapole.',
        commonMistakes: ['Spalle chiuse in avanti', 'Schiena lombare flessa']
      },
      {
        id: 'pl-b-4',
        name: 'Curl con elastico 30 kg',
        targetMuscles: 'Bicipiti (massima tensione in chiusura)',
        sets: 3,
        reps: 'cedimento',
        notes: 'Resistenza maggiore in alto. Mantieni gomiti saldi.',
        restSeconds: 60,
        equipment: 'elastico',
        instructions: 'Piedi sull\'elastico da 30 kg. Fletti i gomiti. In cima la resistenza elastica è massima.',
        commonMistakes: ['Dondolare con le spalle per avviare il movimento']
      },
      {
        id: 'pl-b-5',
        name: 'Curl concentrato con manubrio',
        targetMuscles: 'Picco del bicipite',
        sets: 2,
        reps: 'cedimento',
        notes: 'Seduto sulla panca, gomito appoggiato all\'interno coscia.',
        restSeconds: 60,
        equipment: 'manubri',
        instructions: 'Seduto, gomito saldo contro l\'interno della coscia. Esegui la flessione dell\'avambraccio isolando totalmente il bicipite.',
        commonMistakes: ['Spostare il gomito dalla coscia']
      },
      {
        id: 'pl-b-6',
        name: 'Alzata posteriore con manubri',
        targetMuscles: 'Deltoidi posteriori',
        sets: 2,
        reps: '15-25',
        notes: 'Peso leggero (manubri da 10 kg usati con controllo o elastico).',
        restSeconds: 60,
        equipment: 'manubri',
        instructions: 'Busto inclinato a 45° o petto su panca. Apri le braccia verso l\'esterno e indietro.',
        commonMistakes: ['Tirare con i trapezi superiori']
      }
    ]
  },
  {
    id: 'legs-b',
    day: 'sabato',
    dayLabel: 'Sabato',
    title: 'Gambe B',
    category: 'Gambe B',
    focus: 'Gambe, Glutei (Unilaterale & Ipertrofia)',
    cardio: '20-30 min facili di camminata (non stancarsi troppo)',
    recoveryRules: 'Recuperi: 90-120 s sui composti, 60-90 s sull\'isolamento. Usa sempre un appoggio stabile nei movimenti unilaterali.',
    exercises: [
      {
        id: 'lg-b-1',
        name: 'Step-up sulla panca stabile',
        targetMuscles: 'Quadricipiti, glutei',
        sets: 3,
        reps: '10-15/lato',
        notes: 'Piede intero sulla panca stabile. Sali spingendo SOLO con la gamba davanti (non spingere con quella dietro).',
        restSeconds: 90,
        equipment: 'panca',
        instructions: 'Metti tutto il piede sulla panca. Spingi attraverso il tallone anteriore per salire. Scendi in 2-3 secondi sfiorando il pavimento.',
        commonMistakes: ['Saltare con il piede a terra', 'Panca traballante non controllata']
      },
      {
        id: 'lg-b-2',
        name: 'Split squat con appoggio',
        targetMuscles: 'Quadricipiti, glutei',
        sets: 3,
        reps: '10-15/lato, 1 RIR',
        notes: 'Tieniti a un supporto con una mano per equilibrio totale.',
        restSeconds: 75,
        equipment: 'corpo_libero',
        instructions: 'Piedi divaricati avanti-indietro. Scendi in verticale fino a pochi centimetri da terra col ginocchio dietro. Spingi col tallone davanti.',
        commonMistakes: ['Perdere l\'equilibrio per non usare l\'appoggio', 'Peso tutto sull\'avampiede']
      },
      {
        id: 'lg-b-3',
        name: 'Squat con elastico 30 kg sotto i piedi',
        targetMuscles: 'Quadricipiti, glutei',
        sets: 3,
        reps: '12-20',
        notes: 'Elastico sotto i piedi, tieni le estremità alle spalle.',
        restSeconds: 75,
        equipment: 'elastico',
        instructions: 'Piedi sopra l\'elastico da 30 kg, impugna l\'elastico all\'altezza delle spalle. Esegui squat scendendo parallelo e risali.',
        commonMistakes: ['Perdere la postura del petto', 'Ginocchia che si chiudono']
      },
      {
        id: 'lg-b-4',
        name: 'Stacco rumeno a una gamba leggero',
        targetMuscles: 'Catena posteriore, stabilità pelvica',
        sets: 2,
        reps: '10-15/lato',
        notes: 'Solo se stabile! Fermati se la schiena perde la posizione neutra.',
        restSeconds: 60,
        equipment: 'corpo_libero',
        instructions: 'In appoggio su un piede, l\'altra gamba sale indietro allineata al busto. Bacino livellato, non ruotare l\'anca.',
        commonMistakes: ['Ruotare il bacino all\'esterno', 'Incurvare la colonna lombare']
      },
      {
        id: 'lg-b-5',
        name: 'Hip thrust a una gamba',
        targetMuscles: 'Glutei (isolamento potente a corpo libero)',
        sets: 3,
        reps: 'cedimento',
        notes: 'Spalle su panca, spingi forte con il gluteo singolo.',
        restSeconds: 60,
        equipment: 'panca',
        instructions: 'Spalle alla panca. Una gamba piegata a 90°, l\'altra sollevata. Spingi il bacino in alto contraendo il gluteo della gamba a terra.',
        commonMistakes: ['Iperestendere la zona lombare']
      },
      {
        id: 'lg-b-6',
        name: 'Polpacci a una gamba',
        targetMuscles: 'Polpacci (intensità raddoppiata col peso corporeo)',
        sets: 3,
        reps: 'cedimento',
        notes: 'Usa una mano per l\'equilibrio e fai massima escursione.',
        restSeconds: 45,
        equipment: 'corpo_libero',
        instructions: 'Su un solo piede, scendi lentamente e sali sull\'avampiede fermandoti 1 secondo in cima.',
        commonMistakes: ['Movimenti a scatti']
      }
    ]
  },
  {
    id: 'rest-sunday',
    day: 'domenica',
    dayLabel: 'Domenica',
    title: 'Core leggero & Mobilità',
    category: 'Domenica Leggera',
    focus: 'Recupero attivo, decompressione spinale, mobilità',
    cardio: '45-60 min di camminata tranquilla all\'aperto (o cyclette se piove)',
    recoveryRules: 'Nessun carico pesante. Obiettivo: stimolare circolazione, allungare i muscoli e ripristinare il sistema nervoso.',
    exercises: [
      {
        id: 'sun-1',
        name: 'Dead bug controllato',
        targetMuscles: 'Core profondo, stabilizzazione lombare',
        sets: 3,
        reps: '10/lato',
        notes: 'Schiena lombare sempre adesa al suolo, controllo del respiro.',
        restSeconds: 45,
        equipment: 'corpo_libero',
        instructions: 'Sdraiato supino, braccia verso il soffitto e ginocchia a 90°. Distendi braccio destro e gamba sinistra mantenendo la zona lombare a terra.',
        commonMistakes: ['Inarcare la schiena lombare']
      },
      {
        id: 'sun-2',
        name: 'Bird-dog per la stabilità spinale',
        targetMuscles: 'Erettori spinali, glutei, stabilità crociata',
        sets: 3,
        reps: '10/lato',
        notes: 'Ideale per la scoliosi pregressa: rinforza senza carichi verticali.',
        restSeconds: 45,
        equipment: 'corpo_libero',
        instructions: 'A quattro zampe. Distendi braccio avanti e gamba opposta indietro fino all\'orizzontale. Pausa 2 secondi e torna.',
        commonMistakes: ['Ruotare il bacino o inarcare']
      },
      {
        id: 'sun-3',
        name: 'Allungamento flessori anca & Mobilità toracica',
        targetMuscles: 'Ileo-psoas, apertura gabbia toracica',
        sets: 3,
        reps: '45 s/lato',
        notes: 'Respirazione profonda diaframmatica.',
        restSeconds: 30,
        equipment: 'corpo_libero',
        instructions: 'In ginocchio affondo a terra, spingi leggermente il bacino in avanti per allungare il flessore della coscia posteriore, con braccio sollevato.',
        commonMistakes: ['Forzare con dolore']
      }
    ]
  }
];

export const GROCERY_ITEMS: FoodItem[] = [
  // Proteine
  { id: 'f-1', name: 'Petto di pollo', category: 'Proteine', calories: 120, protein: 31, carbs: 0, fats: 2.5, portion: '150g' },
  { id: 'f-2', name: 'Filetto di tacchino', category: 'Proteine', calories: 110, protein: 29, carbs: 0, fats: 1.5, portion: '150g' },
  { id: 'f-3', name: 'Yogurt Greco 0% o Skyr', category: 'Proteine', calories: 115, protein: 20, carbs: 8, fats: 0.2, portion: '200g' },
  { id: 'f-4', name: 'Fiocchi di latte magri', category: 'Proteine', calories: 160, protein: 24, carbs: 6, fats: 4, portion: '200g' },
  { id: 'f-5', name: 'Uova intere fresche', category: 'Proteine', calories: 140, protein: 12, carbs: 1, fats: 10, portion: '2 uova medie' },
  { id: 'f-6', name: 'Tonno al naturale', category: 'Proteine', calories: 125, protein: 28, carbs: 0, fats: 1, portion: '1 scatola (112g)' },
  { id: 'f-7', name: 'Filetto di salmone o pesce bianco', category: 'Proteine', calories: 220, protein: 26, carbs: 0, fats: 12, portion: '150g' },
  { id: 'f-8', name: 'Tofu compatto naturale', category: 'Proteine', calories: 140, protein: 16, carbs: 3, fats: 8, portion: '150g' },
  { id: 'f-9', name: 'Proteine del siero (Whey isolate/concentrate)', category: 'Proteine', calories: 120, protein: 24, carbs: 2, fats: 1.5, portion: '1 misurino (30g)' },

  // Carboidrati
  { id: 'f-10', name: 'Riso basmati / riso integrale', category: 'Carboidrati', calories: 280, protein: 6, carbs: 62, fats: 1, portion: '80g a crudo' },
  { id: 'f-11', name: 'Pasta integrale o di grano duro', category: 'Carboidrati', calories: 285, protein: 10, carbs: 58, fats: 1.5, portion: '80g a crudo' },
  { id: 'f-12', name: 'Patate lesse o al vapore', category: 'Carboidrati', calories: 170, protein: 4, carbs: 38, fats: 0.2, portion: '220g' },
  { id: 'f-13', name: 'Fiocchi di avena integrale', category: 'Carboidrati', calories: 230, protein: 8, carbs: 40, fats: 4, portion: '60g' },
  { id: 'f-14', name: 'Pane di segale o integrale', category: 'Carboidrati', calories: 150, protein: 5, carbs: 28, fats: 1.5, portion: '60g (2 fette)' },
  { id: 'f-15', name: 'Mela o frutti di bosco', category: 'Carboidrati', calories: 85, protein: 0.5, carbs: 20, fats: 0.2, portion: '1 frutto medio (160g)' },
  { id: 'f-16', name: 'Banana', category: 'Carboidrati', calories: 105, protein: 1.2, carbs: 27, fats: 0.3, portion: '1 frutto (120g)' },

  // Verdure
  { id: 'f-17', name: 'Spinaci freschi o surgelati', category: 'Verdure', calories: 45, protein: 5, carbs: 3, fats: 0.5, portion: '200g' },
  { id: 'f-18', name: 'Broccoli al vapore', category: 'Verdure', calories: 65, protein: 6, carbs: 9, fats: 0.8, portion: '200g' },
  { id: 'f-19', name: 'Zucchine trifolate o alla griglia', category: 'Verdure', calories: 35, protein: 2.5, carbs: 5, fats: 0.4, portion: '200g' },
  { id: 'f-20', name: 'Insalata mista & Pomodori', category: 'Verdure', calories: 40, protein: 2, carbs: 7, fats: 0.4, portion: '250g' },

  // Grassi
  { id: 'f-21', name: 'Olio extravergine di oliva', category: 'Grassi', calories: 90, protein: 0, carbs: 0, fats: 10, portion: '1 cucchiaio (10g)' },
  { id: 'f-22', name: 'Mandorle o noci naturali', category: 'Grassi', calories: 120, protein: 4, carbs: 3, fats: 10, portion: '20g' },
  { id: 'f-23', name: 'Avocado fresco', category: 'Grassi', calories: 80, protein: 1, carbs: 4, fats: 7, portion: '50g (1/4 frutto)' },

  // Comodità
  { id: 'f-24', name: 'Lenticchie / Ceci in scatola sciacquati', category: 'Comodita', calories: 160, protein: 11, carbs: 24, fats: 1.8, portion: '1 barattolo sgocciolato (160g)' },
  { id: 'f-25', name: 'Verdure miste surgelate (senza condimento)', category: 'Comodita', calories: 50, protein: 3, carbs: 8, fats: 0.4, portion: '200g' }
];

export const SUPPLEMENTS_INFO = [
  {
    name: 'Creatina Monoidrato',
    status: 'Consigliata con supporto scientifico',
    evidence: 'Supportata da solidi studi (NIH, ISSN 2025) per aumento forza e sforzi ripetuti.',
    dosage: '3-5 grammi al giorno tutti i giorni, senza bisogno di fase di carico.',
    notes: 'Può causare un leggero aumento di peso (1-2 kg) per ritenzione idrica intramuscolare benefica. Bevi molta acqua. In caso di problemi renali consulta il medico.'
  },
  {
    name: 'Proteine in polvere (Whey)',
    status: 'Utile comodità',
    evidence: 'Nessun potere magico rispetto al cibo solido, ma comoda per raggiungere il target di 160-190g.',
    dosage: '25-30g post-allenamento o negli spuntini.',
    notes: 'Scegli marche con certificazione di qualità e senza zuccheri aggiunti eccessivi.'
  },
  {
    name: 'Caffeina (Caffè)',
    status: 'Efficace pre-workout',
    evidence: 'Aumenta concentrazione e percezione ridotta dello sforzo (NIH). Fino a 400 mg/die.',
    dosage: '1 espresso o 100-200 mg 30-45 min prima dell\'allenamento.',
    notes: 'Evita nelle 6-8 ore prima di dormire per proteggere la finestra di 8 ore di sonno.'
  },
  {
    name: 'Testo-booster (Tribulus, DHEA, ecc.)',
    status: 'Non raccomandati / Inefficaci',
    evidence: 'Revisione sistematica 2023-2024 su 52 studi: la maggior parte non aumenta il testosterone.',
    dosage: 'Evitare.',
    notes: 'Il calo di testosterone nell\'obesità/sovrappeso è legato alla SHBG bassa e si inverte con il dimagrimento (+2,87 a +8,73 nmol/L).'
  },
  {
    name: 'SARMs e steroidi anabolizzanti',
    status: 'Pericolosi ed Evitare',
    evidence: 'Avvisi formali FDA: gravi rischi per fegato, cuore, sistema ormonale e fertilità.',
    dosage: 'Mai assumere.',
    notes: 'Costruisci massa pulita e solida col metodo progressivo descritto nella guida.'
  }
];

export const TWELVE_WEEK_PERIODIZATION = [
  { phase: 'Settimane 1-2', rule: 'Adattamento anatomico: Cedimento solo su esercizi di isolamento; 1 serie in meno sui grandi multiarticolari per abituare tendini e sistema nervoso.' },
  { phase: 'Settimane 3-6', rule: 'Programma completo al 100%: Applica la doppia progressione puntando al tetto delle ripetizioni prima di aumentare carichi o difficoltà.' },
  { phase: 'Settimana 7', rule: 'Settimana di controllo / Deload parziale: Togli 1 serie sugli esercizi più tassanti per dissipare fatica sistemica.' },
  { phase: 'Settimane 8-11', rule: 'Sovraccarico progressivo avanzato: Incrementa difficoltà con tempo più lento (3-4s eccentrica), varianti unilaterali o elastico più teso.' },
  { phase: 'Settimana 12', rule: 'Revisione finale: Verifica misure corporee, peso, foto comparative e ripetizione test massimale sui bicipiti e push-up.' }
];
