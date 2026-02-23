
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Player, MatchEvent, MatchState, TeamData, Competition, Opponent, Language, Fixture, StandingEntry, MatchResult, SyncState, AppState, CompetitionType, Squad, MatchDurationMode } from './types';
import { getSubstitutionAdvice } from './services/geminiService';
import { pushToCloud, pullFromCloud, generateSyncId } from './services/syncService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Trophy,
  Activity,
  X,
  Home,
  Shield,
  Plus,
  Trash2,
  Check,
  UsersRound,
  ChevronRight,
  Lock,
  Unlock,
  Medal,
  LogIn,
  Sparkles,
  History,
  AlertCircle,
  Calendar as CalendarIcon,
  Cloud,
  RefreshCw,
  Copy,
  Clock,
  Flag,
  ArrowRightLeft,
  ChevronLeft,
  BarChart3,
  TrendingUp,
  Search,
  User,
  MapPin,
  PlusCircle,
  Layers,
  History as HistoryIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Dumbbell,
  Languages,
  GitBranch
} from 'lucide-react';

const STORAGE_KEYS = {
  TEAM_DATA: 'pitchtime_v2_team_data',
  PLAYERS: 'pitchtime_v2_players',
  COMPETITIONS: 'pitchtime_v2_competitions',
  FIXTURES: 'pitchtime_v2_fixtures',
  LANGUAGE: 'pitchtime_v2_language',
  AUTH_SESSION: 'pitchtime_admin_session',
  CURRENT_MATCH: 'pitchtime_v2_active_match',
  SYNC_ID: 'pitchtime_v2_sync_id',
  SQUADS: 'pitchtime_v2_squads'
};

const AUTHORIZED_EMAIL = "jpmassano97@gmail.com";

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Alex', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'goalkeeper', totalGoals: 0, totalAssists: 0 },
  { id: '2', name: 'Jordan', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'field', totalGoals: 0, totalAssists: 0 },
  { id: '3', name: 'Taylor', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'field', totalGoals: 0, totalAssists: 0 },
  { id: '4', name: 'Morgan', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'field', totalGoals: 0, totalAssists: 0 },
  { id: '5', name: 'Casey', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'field', totalGoals: 0, totalAssists: 0 },
];

const INITIAL_TEAM_DATA: TeamData = {
  name: "Emerald Falcons FC",
  logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=emerald-falcons",
  classification: "Premier Division",
  ownerName: "Coach",
  ownerEmail: AUTHORIZED_EMAIL
};

const TRANSLATIONS: Record<Language, any> = {
  en: {
    dashboard: 'Home',
    matchTimer: 'Match',
    roster: 'Roster',
    stats: 'Stats',
    calendar: 'Calendar',
    club: 'Club',
    stint: 'Stint',
    total: 'Total',
    aiCoach: 'AI Coach',
    recentEvents: 'Match Events',
    subIn: 'Sub In',
    login: 'Log In',
    competitions: 'Competitions',
    onPitch: 'On Pitch',
    bench: 'Bench',
    clearData: 'Reset System',
    team: 'Team',
    points: 'Pts',
    topScorers: 'Top Scorers',
    mostMinutes: 'Most Minutes',
    leaders: 'Leaders',
    welcome: 'Welcome',
    nextGame: 'Next Match',
    selectScorer: 'Who scored?',
    opponentGoal: 'Opponent Goal',
    played: 'P',
    won: 'W',
    standings: 'Standings',
    fixtures: 'Fixtures',
    results: 'Results',
    addResult: 'Add Result',
    addPlayer: 'Add Player',
    playerName: 'Player Name',
    goalkeeper: 'Goalkeeper',
    fieldPlayer: 'Field Player',
    selectOpponent: 'Select Opponent',
    cloudSync: 'Cloud Sync',
    syncStatus: 'Sync Status',
    syncId: 'Sync ID',
    generateId: 'Generate ID',
    enterId: 'Enter ID',
    lastSynced: 'Last Synced',
    syncNow: 'Sync Now',
    offline: 'Offline',
    online: 'Online',
    syncError: 'Sync Error',
    copyLink: 'Copy Share Link',
    linkCopied: 'Link Copied!',
    pullCloud: 'Pull from Cloud',
    startMatch: 'Start Match',
    half: 'Half',
    finishMatch: 'Finish Match',
    min: 'min',
    saveToComp: 'Record Result',
    matchSetup: 'Match Setup',
    deleteEvent: 'Delete Event',
    assists: 'Assists',
    addGame: 'Schedule Game',
    date: 'Date',
    time: 'Time',
    createComp: 'New Competition',
    back: 'Back',
    addManualResult: 'Add Manual Result',
    gkLimitError: 'Only 1 goalkeeper allowed on pitch!',
    gf: 'GF',
    ga: 'GA',
    gd: 'GD',
    venue: 'Venue',
    training: 'Training',
    compType: 'Type',
    league: 'League',
    tournament: 'Knockout Stage',
    knockoutPhase: 'Knockout Phase',
    stage: 'Stage',
    squads: 'Squads',
    selectSquad: 'Select Squad',
    createSquad: 'New Squad',
    squadName: 'Squad Name',
    durationMode: 'Duration',
    fixedTime: '40 min (2x20)',
    indefiniteTime: 'Indefinite',
    startSecondHalf: 'Start 2nd Half',
    playerLimitError: 'Match requires 5 to 11 players!',
    assistant: 'Assistant',
    noAssistant: 'No Assistant',
    scheduleGame: 'Schedule Game'
  },
  pt: {
    dashboard: 'Início',
    matchTimer: 'Jogo',
    roster: 'Plantel',
    stats: 'Estatísticas',
    calendar: 'Calendário',
    club: 'Clube',
    stint: 'Turno',
    total: 'Total',
    aiCoach: 'Treinador AI',
    recentEvents: 'Eventos',
    subIn: 'Entrar',
    login: 'Entrar',
    competitions: 'Competições',
    onPitch: 'Em Campo',
    bench: 'Suplentes',
    clearData: 'Limpar Tudo',
    team: 'Equipa',
    points: 'Pts',
    topScorers: 'Marcadores',
    mostMinutes: 'Minutos',
    leaders: 'Líderes',
    welcome: 'Bem-vindo',
    nextGame: 'Próximo Jogo',
    selectScorer: 'Quem marcou?',
    opponentGoal: 'Golo Adversário',
    played: 'J',
    won: 'V',
    standings: 'Classificação',
    fixtures: 'Calendário',
    results: 'Resultados',
    addResult: 'Adicionar Resultado',
    addPlayer: 'Adicionar Jogador',
    playerName: 'Nome',
    goalkeeper: 'Guarda-redes',
    fieldPlayer: 'Campo',
    selectOpponent: 'Selecionar Adversário',
    cloudSync: 'Sincronização',
    syncStatus: 'Estado de Sincronização',
    syncId: 'ID de Sincronização',
    generateId: 'Gerar ID',
    enterId: 'Inserir ID',
    lastSynced: 'Última Sincronização',
    syncNow: 'Sincronizar Agora',
    offline: 'Offline',
    online: 'Online',
    syncError: 'Erro de Sincronização',
    copyLink: 'Copiar Link de Partilha',
    linkCopied: 'Link Copiado!',
    pullCloud: 'Carregar da Nuvem',
    startMatch: 'Começar Jogo',
    half: 'Parte',
    finishMatch: 'Finalizar',
    min: 'min',
    saveToComp: 'Gravar Resultado',
    matchSetup: 'Configurar',
    deleteEvent: 'Eliminar',
    assists: 'Assistências',
    addGame: 'Novo Jogo',
    date: 'Data',
    time: 'Hora',
    createComp: 'Nova Competição',
    back: 'Voltar',
    addManualResult: 'Registar Resultado Manual',
    gkLimitError: 'Apenas 1 guarda-redes permitido!',
    gf: 'GM',
    ga: 'GS',
    gd: 'DG',
    venue: 'Local',
    training: 'Treino',
    compType: 'Tipo',
    league: 'Liga',
    tournament: 'Fase Eliminatória',
    knockoutPhase: 'Fase Eliminatória',
    stage: 'Fase',
    squads: 'Plantéis',
    selectSquad: 'Selecionar Plantel',
    createSquad: 'Novo Plantel',
    squadName: 'Nome do Plantel',
    durationMode: 'Duração',
    fixedTime: '40 min (2x20)',
    indefiniteTime: 'Indefinido',
    startSecondHalf: 'Iniciar 2ª Parte',
    playerLimitError: 'O jogo requer entre 5 a 11 jogadores!',
    assistant: 'Assistente',
    noAssistant: 'Sem Assistente',
    scheduleGame: 'Agendar Jogo'
  },
  es: {
    dashboard: 'Inicio',
    matchTimer: 'Partido',
    roster: 'Plantilla',
    stats: 'Estadísticas',
    calendar: 'Calendario',
    club: 'Club',
    stint: 'Turno',
    total: 'Total',
    aiCoach: 'Entrenador IA',
    recentEvents: 'Eventos',
    subIn: 'Entrar',
    login: 'Acceder',
    competitions: 'Competiciones',
    onPitch: 'En Campo',
    bench: 'Banquillo',
    clearData: 'Reiniciar',
    team: 'Equipo',
    points: 'Pts',
    topScorers: 'Goleadores',
    mostMinutes: 'Minutos',
    leaders: 'Líderes',
    welcome: 'Bienvenido',
    nextGame: 'Próximo Partido',
    selectScorer: '¿Quién marcó?',
    opponentGoal: 'Gol Rival',
    played: 'PJ',
    won: 'G',
    standings: 'Clasificación',
    fixtures: 'Calendario',
    results: 'Resultados',
    addResult: 'Añadir Resultado',
    addPlayer: 'Añadir Jogador',
    playerName: 'Nombre',
    goalkeeper: 'Portero',
    fieldPlayer: 'Campo',
    selectOpponent: 'Rival',
    cloudSync: 'Sincronización',
    syncStatus: 'Estado de Sincronización',
    syncId: 'ID de Sincronización',
    generateId: 'Generar ID',
    enterId: 'Insertar ID',
    lastSynced: 'Última Sincronización',
    syncNow: 'Sincronizar Ahora',
    offline: 'Offline',
    online: 'Online',
    syncError: 'Error de Sincronización',
    copyLink: 'Copiar Link de Compartir',
    linkCopied: '¡Link Copiado!',
    pullCloud: 'Cargar de la Nube',
    startMatch: 'Empezar',
    half: 'Parte',
    finishMatch: 'Finalizar',
    min: 'min',
    saveToComp: 'Guardar Resultado',
    matchSetup: 'Configuración',
    deleteEvent: 'Borrar',
    assists: 'Asistencias',
    addGame: 'Programar',
    date: 'Fecha',
    time: 'Hora',
    createComp: 'Nueva Competición',
    back: 'Volver',
    addManualResult: 'Resultado Manual',
    gkLimitError: '¡Solo 1 portero!',
    gf: 'GF',
    ga: 'GC',
    gd: 'DG',
    venue: 'Sede',
    training: 'Entreno',
    compType: 'Tipo',
    league: 'Liga',
    tournament: 'Eliminatoria',
    knockoutPhase: 'Fase de Eliminatorias',
    stage: 'Etapa'
  },
  ar: {
    dashboard: 'الرئيسية',
    matchTimer: 'المباراة',
    roster: 'القائمة',
    stats: 'الإحصائيات',
    calendar: 'التقويم',
    club: 'النادي',
    stint: 'فترة',
    total: 'المجموع',
    aiCoach: 'مدرب ذكي',
    recentEvents: 'أحداث المباراة',
    subIn: 'تبديل دخول',
    login: 'تسجيل الدخول',
    competitions: 'المسابقات',
    onPitch: 'في الملعب',
    bench: 'الاحتياط',
    clearData: 'مسح البيانات',
    team: 'الفريق',
    points: 'نقاط',
    topScorers: 'الهدافين',
    mostMinutes: 'الأكثر مشاركة',
    leaders: 'القادة',
    welcome: 'أهلاً بك',
    nextGame: 'المباراة القادمة',
    selectScorer: 'من سجل؟',
    opponentGoal: 'هدف الخصم',
    played: 'لعب',
    won: 'فوز',
    standings: 'الترتيب',
    fixtures: 'المباريات',
    results: 'النتائج',
    addResult: 'إضافة نتيجة',
    addPlayer: 'إضافة لاعب',
    playerName: 'اسم اللاعب',
    goalkeeper: 'حارس مرمى',
    fieldPlayer: 'لاعب ميدان',
    selectOpponent: 'اختر الخصم',
    cloudSync: 'مزامنة',
    startMatch: 'بدء المباراة',
    half: 'الشوط',
    finishMatch: 'إنهاء المباراة',
    min: 'دقيقة',
    saveToComp: 'حفظ النتيجة',
    matchSetup: 'إعداد المباراة',
    deleteEvent: 'حذف الحدث',
    assists: 'التمريرات الحاسمة',
    addGame: 'جدولة مباراة',
    date: 'التاريخ',
    time: 'الوقت',
    createComp: 'مسابقة جديدة',
    back: 'رجوع',
    addManualResult: 'إضافة نتيجة يدوية',
    gkLimitError: 'يُسمح بحارس مرمى واحد فقط!',
    gf: 'له',
    ga: 'عليه',
    gd: 'الفرق',
    venue: 'المكان',
    training: 'تدريب',
    compType: 'النوع',
    league: 'دوري',
    tournament: 'خروج المغلوب',
    knockoutPhase: 'مرحلة خروج المغلوب',
    stage: 'المرحلة'
  }
};

const TOURNAMENT_STAGES = [
  'Final',
  'Semi-Final',
  'Quarter-Final',
  'Round of 16',
  'Group Stage'
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true');
  
  const [teamData, setTeamData] = useState<TeamData>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAM_DATA);
    return saved ? JSON.parse(saved) : INITIAL_TEAM_DATA;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPETITIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [fixtures, setFixtures] = useState<Fixture[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FIXTURES);
    return saved ? JSON.parse(saved) : [];
  });

  const [squads, setSquads] = useState<Squad[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SQUADS);
    return saved ? JSON.parse(saved) : [];
  });

  const [match, setMatch] = useState<MatchState>(() => {
    const savedMatch = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (savedMatch) return JSON.parse(savedMatch);
    return { 
      isRunning: false, elapsedTime: 0, halfDuration: 20 * 60, currentHalf: 1,
      durationMode: 'fixed',
      startTime: null, scoreOur: 0, scoreTheir: 0, events: [],
      language: savedLang || 'en', currentOpponentName: 'Opponent', isFinished: false
    };
  });
  
  const [sync, setSync] = useState<SyncState>(() => {
    const savedSyncId = localStorage.getItem(STORAGE_KEYS.SYNC_ID);
    return { syncId: savedSyncId, lastSyncedAt: null, isSyncing: false, status: savedSyncId ? 'online' : 'offline' };
  });

  // UI States
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'training' | 'fixtures'>('all');
  const [selectedPlayerToSubOut, setSelectedPlayerToSubOut] = useState<string | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isManualResultModalOpen, setIsManualResultModalOpen] = useState(false);
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [selectedDateForFixture, setSelectedDateForFixture] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Creation States
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'field' | 'goalkeeper'>('field');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [authEmailInput, setAuthEmailInput] = useState('');
  const [statsSearch, setStatsSearch] = useState('');

  const [fixtureCompId, setFixtureCompId] = useState('');
  const [fixtureOpponentId, setFixtureOpponentId] = useState('');
  const [fixtureDate, setFixtureDate] = useState('');
  const [fixtureTime, setFixtureTime] = useState('');
  const [fixtureVenue, setFixtureVenue] = useState('');

  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<CompetitionType>('league');
  const [newOpponentName, setNewOpponentName] = useState('');

  const [newSquadName, setNewSquadName] = useState('');
  const [selectedSquadForMatch, setSelectedSquadForMatch] = useState<string | null>(null);
  const [matchDurationMode, setMatchDurationMode] = useState<MatchDurationMode>('fixed');

  const [manualTeamA, setManualTeamA] = useState('');
  const [manualTeamB, setManualTeamB] = useState('');
  const [manualScoreA, setManualScoreA] = useState(0);
  const [manualScoreB, setManualScoreB] = useState(0);
  const [manualStage, setManualStage] = useState(TOURNAMENT_STAGES[0]);

  const [rosterSubTab, setRosterSubTab] = useState<'players' | 'squads'>('players');

  const [syncIdInput, setSyncIdInput] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [selectedScorerId, setSelectedScorerId] = useState<string | null>(null);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = TRANSLATIONS[match.language] || TRANSLATIONS['en'];
  const isRtl = match.language === 'ar';

  const getAppState = useCallback((): AppState => ({ teamData, players, squads, competitions, fixtures, match }), [teamData, players, squads, competitions, fixtures, match]);

  // Cloud Sync Logic
  const syncToCloud = useCallback(async () => {
    if (sync.syncId) {
      setSync(prev => ({ ...prev, isSyncing: true }));
      const success = await pushToCloud(sync.syncId, getAppState());
      setSync(prev => ({ ...prev, isSyncing: false, status: success ? 'online' : 'error', lastSyncedAt: success ? Date.now() : prev.lastSyncedAt }));
    }
  }, [sync.syncId, getAppState]);

  const pullData = useCallback(async () => {
    if (sync.syncId) {
      setSync(prev => ({ ...prev, isSyncing: true }));
      const cloudData = await pullFromCloud(sync.syncId);
      if (cloudData) {
        setTeamData(cloudData.teamData);
        setPlayers(cloudData.players);
        setSquads(cloudData.squads || []);
        setCompetitions(cloudData.competitions);
        setFixtures(cloudData.fixtures);
        setSync(prev => ({ ...prev, isSyncing: false, status: 'online', lastSyncedAt: Date.now() }));
      } else {
        setSync(prev => ({ ...prev, isSyncing: false, status: 'error' }));
      }
    }
  }, [sync.syncId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSyncId = params.get('sync');
    if (urlSyncId && urlSyncId !== sync.syncId) {
      const loadCloudData = async () => {
        setSync(prev => ({ ...prev, syncId: urlSyncId, isSyncing: true }));
        const cloudData = await pullFromCloud(urlSyncId);
        if (cloudData) {
          setTeamData(cloudData.teamData);
          setPlayers(cloudData.players);
          setSquads(cloudData.squads || []);
          setCompetitions(cloudData.competitions);
          setFixtures(cloudData.fixtures);
          setSync(prev => ({ ...prev, isSyncing: false, status: 'online', lastSyncedAt: Date.now() }));
          localStorage.setItem(STORAGE_KEYS.SYNC_ID, urlSyncId);
        } else {
          setSync(prev => ({ ...prev, isSyncing: false, status: 'error' }));
        }
      };
      loadCloudData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && sync.syncId) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        syncToCloud();
      }, 5000); // Debounce sync by 5 seconds
    }
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [teamData, players, competitions, fixtures, match, isAuthenticated, sync.syncId, syncToCloud]);

  const handleGetAiAdvice = async () => {
    setIsAiLoading(true);
    const advice = await getSubstitutionAdvice(players, match.elapsedTime);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  // Handle auto-clearing error/warning messages
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Match Timer Logic
  useEffect(() => {
    if (match.isRunning) {
      timerRef.current = setInterval(() => {
        setMatch(prev => {
          const nextTime = prev.elapsedTime + 1;
          // In fixed mode, stop at halfDuration if it's the end of a half
          if (prev.durationMode === 'fixed' && nextTime >= prev.halfDuration) { 
             if (timerRef.current) clearInterval(timerRef.current);
             return { ...prev, elapsedTime: prev.halfDuration, isRunning: false };
          }
          return { ...prev, elapsedTime: nextTime };
        });
        setPlayers(prev => prev.map(p => p.isActive ? { ...p, totalPlayTime: p.totalPlayTime + 1 } : p));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [match.isRunning, match.durationMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM_DATA, JSON.stringify(teamData));
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    localStorage.setItem(STORAGE_KEYS.COMPETITIONS, JSON.stringify(competitions));
    localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(fixtures));
    localStorage.setItem(STORAGE_KEYS.SQUADS, JSON.stringify(squads));
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, match.language);
    localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(match));
    if (sync.syncId) localStorage.setItem(STORAGE_KEYS.SYNC_ID, sync.syncId);
  }, [teamData, players, competitions, fixtures, match, sync.syncId]);

  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = match.events.find(e => e.id === eventId);
    if (!eventToDelete) return;
    if (window.confirm(t.deleteEvent + "?")) {
      setMatch(prev => {
        let newScoreOur = prev.scoreOur;
        let newScoreTheir = prev.scoreTheir;
        if (eventToDelete.type === 'goal') {
          if (eventToDelete.isOpponent) newScoreTheir = Math.max(0, newScoreTheir - 1);
          else {
            newScoreOur = Math.max(0, newScoreOur - 1);
            if (eventToDelete.scorerId) {
              setPlayers(pPrev => pPrev.map(p => {
                if (p.id === eventToDelete.scorerId) return { ...p, totalGoals: Math.max(0, p.totalGoals - 1) };
                if (eventToDelete.assistantId && p.id === eventToDelete.assistantId) return { ...p, totalAssists: Math.max(0, p.totalAssists - 1) };
                return p;
              }));
            }
          }
        }
        return {
          ...prev,
          scoreOur: newScoreOur,
          scoreTheir: newScoreTheir,
          events: prev.events.filter(e => e.id !== eventId)
        };
      });
    }
  };

  const handleGoal = (scorerId?: string, assistantId?: string) => {
    const isOur = !!scorerId;
    setMatch(p => ({ ...p, scoreOur: isOur ? p.scoreOur + 1 : p.scoreOur, scoreTheir: !isOur ? p.scoreTheir + 1 : p.scoreTheir }));
    if (isOur) {
      setPlayers(prev => prev.map(p => {
        if (p.id === scorerId) return { ...p, totalGoals: p.totalGoals + 1 };
        if (assistantId && p.id === assistantId) return { ...p, totalAssists: p.totalAssists + 1 };
        return p;
      }));
    }
    const scorerName = scorerId ? players.find(p => p.id === scorerId)?.name : null;
    const assistantName = assistantId ? players.find(p => p.id === assistantId)?.name : null;
    
    const event: MatchEvent = {
      id: Date.now().toString(),
      type: 'goal',
      minute: Math.floor(match.elapsedTime / 60) + (match.currentHalf === 2 && match.durationMode === 'fixed' ? 20 : 0),
      description: isOur ? `GOAL by ${scorerName}${assistantName ? ` (Ast: ${assistantName})` : ''}!` : "Goal conceded.",
      isOpponent: !isOur,
      scorerId,
      assistantId
    };
    setMatch(prev => ({ ...prev, events: [event, ...prev.events] }));
    setIsGoalModalOpen(false);
    setSelectedScorerId(null);
    setSelectedAssistantId(null);
  };

  const startSecondHalf = () => {
    if (match.currentHalf === 1 && !match.isRunning) {
      setMatch(prev => ({
        ...prev,
        currentHalf: 2,
        elapsedTime: 0,
        isRunning: true
      }));
      // Reset lastSubbedAt for active players to current (0)
      setPlayers(prev => prev.map(p => p.isActive ? { ...p, lastSubbedAt: 0 } : p));
    }
  };

  const startFixtureMatch = (fixtureId: string) => {
    const fix = fixtures.find(f => f.id === fixtureId);
    if (!fix) return;
    const comp = competitions.find(c => c.id === fix.competitionId);
    const opp = comp?.opponents.find(o => o.id === fix.opponentId);
    setMatch({
      isRunning: false, elapsedTime: 0, halfDuration: 20 * 60, currentHalf: 1,
      durationMode: 'fixed',
      startTime: null, scoreOur: 0, scoreTheir: 0, events: [],
      language: match.language, currentOpponentName: opp?.name || 'Opponent',
      currentFixtureId: fix.id, isFinished: false,
    });
    setPlayers(prev => prev.map(p => ({ ...p, isActive: false, lastSubbedAt: null })));
    setActiveTab('rotation');
  };

  const finishGameAndSave = (compId: string) => {
    const comp = competitions.find(c => c.id === compId);
    const isTournament = comp?.type === 'tournament';
    const tournamentStage = isTournament ? prompt("Competition Stage (e.g. Semi-Final)?", "Final") || "Tournament" : undefined;

    const newRes: MatchResult = {
      id: Date.now().toString(), fixtureId: match.currentFixtureId,
      teamA: teamData.name, scoreA: match.scoreOur, teamB: match.currentOpponentName, scoreB: match.scoreTheir,
      date: new Date().toLocaleDateString(), 
      stage: tournamentStage,
      scorersA: players.filter(p => p.totalGoals > 0).map(p => ({ name: p.name, goals: p.totalGoals, playerId: p.id })),
      events: [...match.events]
    };
    setCompetitions(prev => prev.map(c => c.id === compId ? { ...c, results: [newRes, ...c.results] } : c));
    if (match.currentFixtureId) setFixtures(prev => prev.map(f => f.id === match.currentFixtureId ? { ...f, isCompleted: true } : f));
    setMatch({ 
      isRunning: false, elapsedTime: 0, halfDuration: 20 * 60, currentHalf: 1,
      durationMode: 'fixed',
      startTime: null, scoreOur: 0, scoreTheir: 0, events: [],
      language: match.language, currentOpponentName: 'Opponent', isFinished: false
    });
    setPlayers(prev => prev.map(p => ({ ...p, isActive: false, lastSubbedAt: null })));
    setIsFinishModalOpen(false);
    setActiveTab('competitions');
    setSelectedCompId(compId);
  };

  const createCompetition = () => {
    if (!newCompName.trim()) return;
    const newComp: Competition = { id: Date.now().toString(), name: newCompName, opponents: [], results: [], type: newCompType };
    setCompetitions([...competitions, newComp]);
    setNewCompName(''); setSelectedCompId(newComp.id);
  };

  const performSubstitution = (playerInId: string) => {
    if (!selectedPlayerToSubOut) return;
    const outPlayer = players.find(p => p.id === selectedPlayerToSubOut);
    const inPlayer = players.find(p => p.id === playerInId);
    if (!outPlayer || !inPlayer) return;
    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerToSubOut) return { ...p, isActive: false, lastSubbedAt: null };
      if (p.id === playerInId) return { ...p, isActive: true, lastSubbedAt: match.elapsedTime };
      return p;
    }));
    setMatch(prev => ({
      ...prev,
      events: [{ id: Date.now().toString(), type: 'substitution', minute: Math.floor(match.elapsedTime / 60), description: `${outPlayer.name} ⇆ ${inPlayer.name}` }, ...prev.events]
    }));
    setSelectedPlayerToSubOut(null);
  };

  const toggleStartingLineup = (playerId: string) => {
    if (match.elapsedTime > 0) return;
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isActive: !p.isActive, lastSubbedAt: !p.isActive ? 0 : null } : p));
  };

  const addOpponentToComp = (compId: string) => {
    if (!newOpponentName.trim()) return;
    const newOpp: Opponent = { id: Date.now().toString(), name: newOpponentName, strength: 'medium' };
    setCompetitions(prev => prev.map(c => c.id === compId ? { ...c, opponents: [...c.opponents, newOpp] } : c));
    setNewOpponentName('');
  };

  const addNewPlayer = () => {
    if (!newPlayerName.trim()) return;
    setPlayers([...players, { id: Date.now().toString(), name: newPlayerName, role: newPlayerRole, isActive: false, lastSubbedAt: null, totalPlayTime: 0, totalGoals: 0, totalAssists: 0 }]);
    setNewPlayerName('');
  };

  const createSquad = () => {
    if (!newSquadName.trim()) return;
    const newSquad: Squad = { id: Date.now().toString(), name: newSquadName, playerIds: [] };
    setSquads([...squads, newSquad]);
    setNewSquadName('');
  };

  const togglePlayerInSquad = (squadId: string, playerId: string) => {
    setSquads(prev => prev.map(s => {
      if (s.id === squadId) {
        const playerIds = s.playerIds.includes(playerId) 
          ? s.playerIds.filter(id => id !== playerId)
          : [...s.playerIds, playerId];
        return { ...s, playerIds };
      }
      return s;
    }));
  };

  const startMatchWithSetup = () => {
    const activeCount = players.filter(p => p.isActive).length;
    if (activeCount < 5 || activeCount > 11) {
      setErrorMsg(t.playerLimitError);
      return;
    }
    setMatch(prev => ({ 
      ...prev, 
      isRunning: true, 
      durationMode: matchDurationMode,
      selectedSquadId: selectedSquadForMatch || undefined
    }));
  };

  const addFixture = () => {
    if (!fixtureCompId || !fixtureOpponentId || !fixtureDate || !fixtureTime) return;
    setFixtures([...fixtures, { id: Date.now().toString(), competitionId: fixtureCompId, opponentId: fixtureOpponentId, date: fixtureDate, time: fixtureTime, venue: fixtureVenue, isCompleted: false }]);
    setIsFixtureModalOpen(false);
    setFixtureCompId(''); setFixtureOpponentId(''); setFixtureDate(''); setFixtureTime(''); setFixtureVenue('');
  };

  const clearAllData = () => {
    if (window.confirm("ARE YOU SURE? This will wipe all local match and roster data!")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderProtectedTab = (content: React.ReactNode) => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-slate-800 shadow-2xl"><Lock className="text-slate-600" size={40}/></div>
           <div className="text-center space-y-2">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Admin Access Restricted</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Login required for club & roster management</p>
           </div>
           <div className="w-full max-w-sm space-y-4">
              <input value={authEmailInput} onChange={e=>setAuthEmailInput(e.target.value)} placeholder="Admin Email" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 font-bold outline-none text-center" />
              <button 
                onClick={async () => {
                  if(authEmailInput.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()) {
                    setIsAuthenticated(true);
                    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
                    
                    // Derive syncId from email
                    const derivedSyncId = btoa(authEmailInput.toLowerCase()).substring(0, 12).toUpperCase();
                    setSync(prev => ({ ...prev, syncId: derivedSyncId, isSyncing: true }));
                    
                    const cloudData = await pullFromCloud(derivedSyncId);
                    if (cloudData) {
                      setTeamData(cloudData.teamData);
                      setPlayers(cloudData.players);
                      setSquads(cloudData.squads || []);
                      setCompetitions(cloudData.competitions);
                      setFixtures(cloudData.fixtures);
                      setSync(prev => ({ ...prev, isSyncing: false, status: 'online', lastSyncedAt: Date.now() }));
                    } else {
                      // Push local data if no cloud data exists
                      await pushToCloud(derivedSyncId, getAppState());
                      setSync(prev => ({ ...prev, isSyncing: false, status: 'online', lastSyncedAt: Date.now() }));
                    }
                  } else {
                    setErrorMsg("Unauthorized Email");
                  }
                }} 
                className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3"
              >
                {sync.isSyncing ? <RefreshCw className="animate-spin" size={18}/> : <LogIn size={18}/>}
                {sync.isSyncing ? 'Syncing...' : 'Authenticate'}
              </button>
           </div>
        </div>
      );
    }
    return content;
  };

  const topScorers = useMemo(() => [...players].sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 3), [players]);
  const topMinutes = useMemo(() => [...players].sort((a, b) => b.totalPlayTime - a.totalPlayTime).slice(0, 3), [players]);
  const topAssists = useMemo(() => [...players].sort((a, b) => b.totalAssists - a.totalAssists).slice(0, 3), [players]);

  const selectedCompetition = useMemo(() => competitions.find(c => c.id === (selectedCompId || (competitions.length > 0 ? competitions[0].id : null))), [competitions, selectedCompId]);

  const standings = useMemo(() => {
    if (!selectedCompetition || selectedCompetition.type === 'tournament') return [];
    const stats: Record<string, StandingEntry> = {};
    const initTeam = (name: string) => { if (!stats[name]) stats[name] = { teamName: name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }; };
    initTeam(teamData.name);
    selectedCompetition.opponents.forEach(o => initTeam(o.name));
    selectedCompetition.results.forEach(res => {
      initTeam(res.teamA); initTeam(res.teamB);
      const sA = stats[res.teamA]; const sB = stats[res.teamB];
      if (!sA || !sB) return;
      sA.played++; sB.played++; sA.gf += res.scoreA; sA.ga += res.scoreB; sB.gf += res.scoreB; sB.ga += res.scoreA;
      sA.gd = sA.gf - sA.ga; sB.gd = sB.gf - sB.ga;
      if (res.scoreA > res.scoreB) { sA.won++; sA.points += 3; }
      else if (res.scoreA < res.scoreB) { sB.won++; sB.points += 3; }
      else { sA.drawn++; sA.points += 1; sB.drawn++; sB.points += 1; }
    });
    return Object.values(stats).sort((a, b) => b.points - a.points || b.gd - a.gd);
  }, [selectedCompetition, teamData.name]);

  const knockoutRounds = useMemo(() => {
    if (!selectedCompetition || selectedCompetition.type !== 'tournament') return {};
    const rounds: Record<string, MatchResult[]> = {};
    selectedCompetition.results.forEach(res => {
      const stage = res.stage || 'Group Stage';
      if (!rounds[stage]) rounds[stage] = [];
      rounds[stage].push(res);
    });
    return rounds;
  }, [selectedCompetition]);

  const calendarData = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const padding = (new Date(year, month, 1).getDay() + 6) % 7;
    return { daysInMonth, padding, monthName: calendarViewDate.toLocaleDateString(match.language, { month: 'long', year: 'numeric' }), year, month };
  }, [calendarViewDate, match.language]);

  const changeMonth = (offset: number) => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Sidebar Desktop */}
      <nav className="hidden md:flex w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex-col p-4 lg:p-6 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 mb-10 cursor-pointer lg:justify-start" onClick={() => setActiveTab('home')}>
          <img src={teamData.logoUrl} className="w-10 h-10 rounded-xl" />
          <div className="hidden lg:flex flex-col font-black text-lg truncate">{teamData.name}</div>
        </div>
        <div className="flex flex-col gap-2">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label={t.dashboard} />
          <NavItem active={activeTab === 'rotation'} onClick={() => setActiveTab('rotation')} icon={<Activity />} label={t.matchTimer} />
          <NavItem active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon />} label={t.calendar} />
          <NavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label={t.stats} />
          <NavItem active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} icon={<Trophy />} label={t.competitions} />
          <NavItem active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} icon={<UsersRound />} label={t.roster} />
          <NavItem active={activeTab === 'club'} onClick={() => setActiveTab('club')} icon={<Shield />} label={t.club} />
        </div>

        <div className="mt-auto pt-10">
           {isAuthenticated && (
             <div className="bg-slate-950/50 rounded-3xl p-4 border border-slate-800 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${sync.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{sync.isSyncing ? 'Syncing...' : 'Cloud Active'}</span>
                   {sync.lastSyncedAt && <span className="text-[7px] font-bold text-slate-600 uppercase">{new Date(sync.lastSyncedAt).toLocaleTimeString()}</span>}
                </div>
             </div>
           )}
        </div>
      </nav>

      {/* Main Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full relative overflow-x-hidden">
        
        {/* Floating Play/Pause for Active Match */}
        {activeTab === 'rotation' && (match.elapsedTime > 0 || match.isRunning) && !match.isFinished && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] bg-slate-900/95 backdrop-blur-xl border border-slate-700 px-8 py-3 rounded-full flex items-center gap-8 shadow-2xl animate-in slide-in-from-top-4 ring-2 ring-emerald-500/10">
             <div className="text-2xl font-mono font-black text-emerald-400 tabular-nums">
               {Math.floor(match.elapsedTime/60).toString().padStart(2,'0')}:{(match.elapsedTime%60).toString().padStart(2,'0')}
             </div>
             {isAuthenticated && (
               <button onClick={() => setMatch(p=>({...p, isRunning: !p.isRunning}))} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${match.isRunning ? 'bg-amber-500 text-amber-950' : 'bg-emerald-500 text-emerald-950'}`}>
                 {match.isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
               </button>
             )}
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight">{t.welcome}, <span className="text-emerald-400">{teamData.ownerName}</span></h1>
                
                {/* Language Switcher - Accessible to Anyone */}
                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
                   <Languages size={20} className="text-indigo-400 ml-2" />
                   <div className="flex gap-1">
                      {Object.keys(TRANSLATIONS).map((lang) => (
                        <button 
                          key={lang} 
                          onClick={() => setMatch(p=>({...p, language: lang as Language}))} 
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${match.language === lang ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                        >
                          {lang}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-10 flex flex-col justify-between min-h-[400px] shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Shield size={240} /></div>
                  <div className="space-y-4 relative z-10">
                    <span className="bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20">{teamData.classification}</span>
                    <h2 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none">{teamData.name} Hub</h2>
                  </div>
                  <div className="flex gap-4 relative z-10 mt-8">
                    <button onClick={() => setActiveTab('rotation')} className="bg-emerald-500 text-slate-950 px-8 py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">Active Match</button>
                    <button onClick={() => setActiveTab('calendar')} className="bg-slate-800 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-sm border border-slate-700 hover:bg-slate-700 transition-all">Calendar</button>
                  </div>
               </div>
               <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 flex flex-col justify-center space-y-8 shadow-xl">
                  <h3 className="font-black text-3xl flex items-center gap-4"><Medal className="text-amber-500" /> {t.leaders}</h3>
                  <div className="space-y-4">
                     <p className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{t.topScorers}</p>
                     {topScorers.map(p => (
                       <div key={p.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <span className="font-bold">{p.name}</span>
                        <span className="text-emerald-400 font-black">{p.totalGoals}</span>
                       </div>
                     ))}
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* Competitions View */}
        {activeTab === 'competitions' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tight italic uppercase">{t.competitions}</h1>
                <select value={selectedCompId || ''} onChange={e => setSelectedCompId(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 font-black outline-none shadow-xl cursor-pointer text-lg min-w-[250px]">
                    <option value="">Select Competition</option>
                    {competitions.map(c => <option key={c.id} value={c.id}>{c.name} {c.type === 'tournament' ? '🏆' : ''}</option>)}
                </select>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-8">
                    {selectedCompetition && selectedCompetition.type === 'tournament' ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-10 shadow-2xl relative overflow-hidden">
                           <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 -mx-10 -mt-10 mb-10">
                              <h2 className="text-4xl px-10 font-black flex items-center gap-5 tracking-tighter uppercase italic"><GitBranch className="text-indigo-400" size={36}/> {t.knockoutPhase}</h2>
                              {isAuthenticated && <button onClick={() => setIsManualResultModalOpen(true)} className="mr-10 p-4 bg-emerald-500 text-slate-950 rounded-2xl hover:scale-105 transition-all shadow-xl font-black uppercase text-[10px] tracking-widest">Add Result</button>}
                           </div>
                           
                           <div className="space-y-12">
                              {TOURNAMENT_STAGES.map(stage => knockoutRounds[stage] && (
                                <div key={stage} className="space-y-6">
                                   <h3 className="text-xl font-black uppercase tracking-[0.3em] text-slate-500 border-l-4 border-indigo-500 pl-6">{stage}</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                      {knockoutRounds[stage].map(res => (
                                        <div key={res.id} onClick={() => setSelectedMatchId(res.id)} className="bg-slate-950 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl relative group cursor-pointer hover:border-indigo-500/50 transition-all">
                                           <div className="flex flex-col">
                                              <div className={`flex justify-between items-center p-3 rounded-xl mb-2 ${res.scoreA > res.scoreB ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                                                 <span className={`font-black truncate ${res.scoreA > res.scoreB ? 'text-emerald-400' : 'text-slate-400'}`}>{res.teamA}</span>
                                                 <span className="font-mono font-black text-xl ml-4">{res.scoreA}</span>
                                              </div>
                                              <div className={`flex justify-between items-center p-3 rounded-xl ${res.scoreB > res.scoreA ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                                                 <span className={`font-black truncate ${res.scoreB > res.scoreA ? 'text-emerald-400' : 'text-slate-400'}`}>{res.teamB}</span>
                                                 <span className="font-mono font-black text-xl ml-4">{res.scoreB}</span>
                                              </div>
                                           </div>
                                           <div className="text-[9px] font-black uppercase text-slate-600 tracking-widest text-center mt-4">{res.date}</div>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                              ))}
                              {Object.keys(knockoutRounds).length === 0 && (
                                <div className="py-20 text-center text-slate-700 italic font-black uppercase tracking-[0.4em]">No knockout results recorded</div>
                              )}
                           </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] shadow-2xl overflow-hidden relative">
                                <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                    <h2 className="text-4xl font-black flex items-center gap-5 tracking-tighter uppercase italic"><Trophy className="text-amber-500" size={36}/> {t.standings}</h2>
                                    {selectedCompetition && isAuthenticated && <button onClick={() => setIsManualResultModalOpen(true)} className="p-4 bg-emerald-500 text-slate-950 rounded-2xl hover:scale-105 transition-all shadow-xl font-black uppercase text-[10px] tracking-widest">Add Result</button>}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-950/80 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                                            <tr><th className="px-8 py-8">Pos</th><th className="px-8 py-8">{t.team}</th><th className="px-6 py-8 text-center">{t.played}</th><th className="px-6 py-8 text-center">{t.gf}</th><th className="px-6 py-8 text-center">{t.ga}</th><th className="px-12 py-8 text-right">{t.points}</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {standings.map((entry, idx) => (
                                                <tr key={entry.teamName} className={`transition-all hover:bg-slate-800/20 ${entry.teamName === teamData.name ? 'bg-emerald-500/5' : ''}`}>
                                                    <td className="px-8 py-8 font-black text-slate-600 text-2xl">{idx + 1}</td>
                                                    <td className={`px-8 py-8 font-black text-2xl ${entry.teamName === teamData.name ? 'text-emerald-400' : 'text-slate-200'}`}>{entry.teamName}</td>
                                                    <td className="px-6 py-8 text-center font-mono text-2xl tabular-nums text-slate-400">{entry.played}</td>
                                                    <td className="px-6 py-8 text-center font-mono text-xl tabular-nums text-slate-300">{entry.gf}</td>
                                                    <td className="px-6 py-8 text-center font-mono text-xl tabular-nums text-slate-500">{entry.ga}</td>
                                                    <td className="px-12 py-8 text-right font-black text-4xl text-emerald-400 tabular-nums">{entry.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-10 shadow-2xl">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">{t.results}</h2>
                                <div className="space-y-4">
                                    {selectedCompetition?.results.map(res => (
                                        <div key={res.id} onClick={() => setSelectedMatchId(res.id)} className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-indigo-500/50 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-8 flex-1 justify-center sm:justify-start">
                                                <div className="text-right flex-1 hidden sm:block"><span className="font-black text-xl">{res.teamA}</span></div>
                                                <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 group-hover:border-indigo-500/30 transition-all">
                                                    <span className={`text-3xl font-mono font-black ${res.scoreA > res.scoreB ? 'text-emerald-400' : 'text-slate-400'}`}>{res.scoreA}</span>
                                                    <span className="text-slate-700 font-black">-</span>
                                                    <span className={`text-3xl font-mono font-black ${res.scoreB > res.scoreA ? 'text-emerald-400' : 'text-slate-400'}`}>{res.scoreB}</span>
                                                </div>
                                                <div className="text-left flex-1 hidden sm:block"><span className="font-black text-xl">{res.teamB}</span></div>
                                            </div>
                                            <div className="flex flex-col items-center sm:items-end gap-1">
                                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{res.date}</span>
                                            </div>
                                            <ChevronRight className="text-slate-700 group-hover:text-indigo-400 transition-all" />
                                        </div>
                                    ))}
                                    {selectedCompetition?.results.length === 0 && (
                                        <div className="py-10 text-center text-slate-700 italic font-black uppercase tracking-widest">No results recorded</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-4 space-y-10">
                   {isAuthenticated && (
                    <section className="bg-slate-900 border border-slate-800 rounded-[4rem] p-10 space-y-8 shadow-2xl border-dashed">
                        <h2 className="text-2xl font-black flex items-center gap-4 italic uppercase tracking-tighter"><PlusCircle className="text-emerald-400"/> {t.createComp}</h2>
                        <div className="space-y-6">
                            <input value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. League Title" className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black outline-none shadow-inner" />
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.compType}</label>
                              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-3xl">
                                 <button onClick={() => setNewCompType('league')} className={`py-4 rounded-2xl font-black uppercase text-[10px] transition-all ${newCompType === 'league' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}>{t.league}</button>
                                 <button onClick={() => setNewCompType('tournament')} className={`py-4 rounded-2xl font-black uppercase text-[10px] transition-all ${newCompType === 'tournament' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}>{t.tournament}</button>
                              </div>
                            </div>
                            <button onClick={createCompetition} className="w-full bg-emerald-500 text-slate-950 py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:bg-emerald-400 transition-all">Create Competition</button>
                        </div>
                    </section>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Existing roster/club/stats views Logic - Minimal placeholder for full integration */}
        {activeTab === 'rotation' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
              <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter">{t.matchTimer}</h1>
              <div className="flex gap-2">
                {!match.isRunning && match.elapsedTime === 0 && !match.isFinished && (
                  <div className="flex flex-col sm:flex-row gap-4 bg-slate-900 p-4 rounded-[2rem] border border-slate-800 shadow-xl">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.opponent}</label>
                      <input 
                        value={match.currentOpponentName} 
                        onChange={e => setMatch(p => ({ ...p, currentOpponentName: e.target.value }))}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-bold outline-none text-xs"
                        placeholder="Opponent Name"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.selectSquad}</label>
                      <select value={selectedSquadForMatch || ''} onChange={e => {
                        const squadId = e.target.value;
                        setSelectedSquadForMatch(squadId);
                        if (squadId) {
                          const squad = squads.find(s => s.id === squadId);
                          if (squad) {
                            setPlayers(prev => prev.map(p => ({
                              ...p,
                              isActive: squad.playerIds.includes(p.id),
                              lastSubbedAt: squad.playerIds.includes(p.id) ? 0 : null
                            })));
                          }
                        }
                      }} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-bold outline-none text-xs">
                        <option value="">{t.selectSquad}</option>
                        {squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.durationMode}</label>
                      <div className="flex gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button onClick={() => setMatchDurationMode('fixed')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${matchDurationMode === 'fixed' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t.fixedTime}</button>
                        <button onClick={() => setMatchDurationMode('indefinite')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${matchDurationMode === 'indefinite' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t.indefiniteTime}</button>
                      </div>
                    </div>
                    <button onClick={startMatchWithSetup} className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl self-end">
                      <Play size={18} fill="currentColor"/> {t.startMatch}
                    </button>
                  </div>
                )}
                {!match.isRunning && match.elapsedTime > 0 && match.currentHalf === 1 && match.durationMode === 'fixed' && !match.isFinished && (
                  <button onClick={startSecondHalf} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl">
                    <Play size={18} fill="currentColor"/> {t.startSecondHalf}
                  </button>
                )}
                {match.elapsedTime > 0 && !match.isFinished && (
                  <button onClick={() => setIsFinishModalOpen(true)} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl">
                    <Flag size={18}/> {t.finishMatch}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Pitch View */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-2 border-white rounded-full scale-150"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-10 relative z-10">
                    <h2 className="text-2xl font-black uppercase tracking-widest italic text-emerald-400">{t.onPitch}</h2>
                    <div className="flex items-center gap-4 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800">
                      <span className="text-3xl font-mono font-black tabular-nums">{match.scoreOur}</span>
                      <span className="text-slate-600 font-black">-</span>
                      <span className="text-3xl font-mono font-black tabular-nums text-slate-500">{match.scoreTheir}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10">
                    {players.filter(p => p.isActive).map(p => (
                      <div key={p.id} onClick={() => setSelectedPlayerToSubOut(p.id)} className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col items-center text-center group ${selectedPlayerToSubOut === p.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl scale-105' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mb-4 ${p.role === 'goalkeeper' ? 'bg-amber-500 text-amber-950' : 'bg-slate-800 text-slate-300'}`}>{p.name[0]}</div>
                        <span className="font-black text-lg block truncate w-full">{p.name}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">{Math.floor(p.totalPlayTime / 60)} {t.min}</span>
                      </div>
                    ))}
                    {players.filter(p => p.isActive).length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-600 font-black uppercase tracking-widest italic">No players on pitch</div>
                    )}
                  </div>
                </div>

                {/* Bench View */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 shadow-xl">
                  <h2 className="text-xl font-black uppercase tracking-widest italic text-slate-500 mb-8">{t.bench}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {players.filter(p => !p.isActive).map(p => (
                      <button key={p.id} onClick={() => selectedPlayerToSubOut ? performSubstitution(p.id) : toggleStartingLineup(p.id)} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center text-center hover:bg-slate-800 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-sm mb-2 group-hover:bg-indigo-500 transition-colors">{p.name[0]}</div>
                        <span className="font-bold text-xs truncate w-full">{p.name}</span>
                        {selectedPlayerToSubOut && <span className="text-[8px] font-black text-emerald-400 uppercase mt-1 animate-pulse">{t.subIn}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Events & AI */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3"><Sparkles className="text-amber-400"/> {t.aiCoach}</h2>
                    <button onClick={handleGetAiAdvice} disabled={isAiLoading} className="p-3 bg-indigo-600 text-white rounded-xl hover:scale-110 transition-all shadow-lg disabled:opacity-50">
                      <RefreshCw size={20} className={isAiLoading ? 'animate-spin' : ''}/>
                    </button>
                  </div>
                  {aiAdvice ? (
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-xs leading-relaxed font-medium text-slate-300 animate-in fade-in slide-in-from-bottom-2">
                      {aiAdvice}
                    </div>
                  ) : (
                    <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest text-center py-4">Tap refresh for tactical advice</p>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-xl flex flex-col h-full max-h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">{t.recentEvents}</h2>
                    <button onClick={() => setIsGoalModalOpen(true)} className="p-3 bg-emerald-500 text-slate-950 rounded-xl hover:scale-110 transition-all shadow-lg"><Plus size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {match.events.map(e => (
                      <div key={e.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-black text-emerald-400 text-xs">{e.minute}'</span>
                          <span className="text-xs font-bold text-slate-300">{e.description}</span>
                        </div>
                        <button onClick={() => handleDeleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-500"><X size={14}/></button>
                      </div>
                    ))}
                    {match.events.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4 py-20">
                        <Activity size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No match events yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter">{t.calendar}</h1>
                <button 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setSelectedDateForFixture(today);
                    setIsFixtureModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-500 transition-all flex items-center gap-2"
                >
                  <Plus size={16}/> {t.addGame}
                </button>
              </div>
              <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
                 <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-800 rounded-xl transition-all"><ChevronLeft size={24}/></button>
                 <span className="font-black uppercase text-sm tracking-widest min-w-[150px] text-center">{calendarData.monthName}</span>
                 <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-800 rounded-xl transition-all"><ChevronRight size={24}/></button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-8 sm:p-12 shadow-2xl">
              <div className="grid grid-cols-7 mb-8">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {Array.from({ length: calendarData.padding }).map((_, i) => <div key={`pad-${i}`} />)}
                {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calendarData.year}-${(calendarData.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const dayFixtures = fixtures.filter(f => f.date === dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div key={day} onClick={() => { setSelectedDateForFixture(dateStr); setIsFixtureModalOpen(true); }} className={`aspect-square rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center relative transition-all group cursor-pointer ${dayFixtures.length > 0 ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-600'} ${isToday ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-950' : ''}`}>
                      <span className="font-black text-lg sm:text-2xl">{day}</span>
                      <Plus size={12} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                      {dayFixtures.length > 0 && (
                        <div className="absolute bottom-2 flex gap-1">
                          {dayFixtures.map(f => <div key={f.id} className="w-1.5 h-1.5 rounded-full bg-indigo-400" />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter">{t.stats}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-xl space-y-6">
                <div className="flex items-center gap-4 text-emerald-400"><Trophy size={32}/><h3 className="text-xl font-black uppercase italic">{t.topScorers}</h3></div>
                <div className="space-y-4">
                  {topScorers.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-black text-slate-600">{idx + 1}</span>
                        <span className="font-bold">{p.name}</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400">{p.totalGoals}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-xl space-y-6">
                <div className="flex items-center gap-4 text-indigo-400"><Clock size={32}/><h3 className="text-xl font-black uppercase italic">{t.mostMinutes}</h3></div>
                <div className="space-y-4">
                  {topMinutes.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-black text-slate-600">{idx + 1}</span>
                        <span className="font-bold">{p.name}</span>
                      </div>
                      <span className="text-xl font-black text-indigo-400">{Math.floor(p.totalPlayTime / 60)}'</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-xl space-y-6">
                <div className="flex items-center gap-4 text-amber-400"><Sparkles size={32}/><h3 className="text-xl font-black uppercase italic">{t.assists}</h3></div>
                <div className="space-y-4">
                  {topAssists.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-black text-slate-600">{idx + 1}</span>
                        <span className="font-bold">{p.name}</span>
                      </div>
                      <span className="text-2xl font-black text-amber-400">{p.totalAssists}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-10 shadow-2xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">{t.results}</h2>
              <div className="space-y-4">
                {competitions.flatMap(c => c.results).sort((a, b) => b.id.localeCompare(a.id)).map(res => (
                  <div key={res.id} onClick={() => setSelectedMatchId(res.id)} className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-indigo-500/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-8 flex-1 justify-center sm:justify-start">
                      <div className="text-right flex-1 hidden sm:block"><span className="font-black text-xl">{res.teamA}</span></div>
                      <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 group-hover:border-indigo-500/30 transition-all">
                        <span className={`text-3xl font-mono font-black ${res.scoreA > res.scoreB ? 'text-emerald-400' : 'text-slate-400'}`}>{res.scoreA}</span>
                        <span className="text-slate-700 font-black">-</span>
                        <span className={`text-3xl font-mono font-black ${res.scoreB > res.scoreA ? 'text-emerald-400' : 'text-slate-400'}`}>{res.scoreB}</span>
                      </div>
                      <div className="text-left flex-1 hidden sm:block"><span className="font-black text-xl">{res.teamB}</span></div>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{res.date}</span>
                      {res.stage && <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">{res.stage}</span>}
                    </div>
                    <ChevronRight className="text-slate-700 group-hover:text-indigo-400 transition-all" />
                  </div>
                ))}
                {competitions.every(c => c.results.length === 0) && (
                  <div className="py-20 text-center text-slate-700 italic font-black uppercase tracking-[0.4em]">No results recorded yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Individual Match Details View */}
        {selectedMatchId && (
          <div className="fixed inset-0 bg-slate-950 z-[400] overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="max-w-4xl mx-auto p-6 sm:p-10 space-y-10">
              <button onClick={() => setSelectedMatchId(null)} className="flex items-center gap-3 text-slate-400 hover:text-white transition-all font-black uppercase text-xs tracking-widest">
                <ChevronLeft /> {t.back}
              </button>

              {(() => {
                const res = competitions.flatMap(c => c.results).find(r => r.id === selectedMatchId);
                if (!res) return null;
                return (
                  <div className="space-y-12">
                    <div className="text-center space-y-4">
                      <span className="text-xs font-black uppercase text-indigo-400 tracking-[0.4em]">{res.stage || 'Match Report'}</span>
                      <div className="flex items-center justify-center gap-6 sm:gap-12">
                        <div className="flex-1 text-right"><h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter">{res.teamA}</h2></div>
                        <div className="bg-slate-900 border-2 border-slate-800 p-8 sm:p-12 rounded-[3rem] shadow-2xl">
                          <span className="text-6xl sm:text-8xl font-mono font-black tabular-nums">{res.scoreA} - {res.scoreB}</span>
                        </div>
                        <div className="flex-1 text-left"><h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter">{res.teamB}</h2></div>
                      </div>
                      <p className="text-slate-500 font-black uppercase text-xs tracking-widest">{res.date}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-xl">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-4"><Trophy size={24} className="text-amber-500"/> {t.topScorers}</h3>
                        <div className="space-y-4">
                          {res.scorersA?.map(s => (
                            <div key={s.playerId} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                              <span className="font-bold">{s.name}</span>
                              <div className="flex gap-1">
                                {Array.from({ length: s.goals }).map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-emerald-500" />)}
                              </div>
                            </div>
                          ))}
                          {(!res.scorersA || res.scorersA.length === 0) && <p className="text-slate-600 italic text-sm">No scorers recorded</p>}
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-8 shadow-xl">
                        <h3 className="text-xl font-black uppercase italic flex items-center gap-4"><Activity size={24} className="text-indigo-400"/> {t.recentEvents}</h3>
                        <div className="space-y-4">
                          {res.events?.map(e => (
                            <div key={e.id} className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                              <span className="font-mono font-black text-emerald-400 text-xs w-8">{e.minute}'</span>
                              <span className="text-xs font-bold text-slate-300">{e.description}</span>
                            </div>
                          ))}
                          {(!res.events || res.events.length === 0) && <p className="text-slate-600 italic text-sm">No events recorded</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'roster' && renderProtectedTab(
           <div className="space-y-10">
              <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                <h1 className="text-4xl lg:text-6xl font-black italic uppercase">{t.roster}</h1>
                <div className="flex gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                  <button onClick={() => setRosterSubTab('players')} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${rosterSubTab === 'players' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t.players}</button>
                  <button onClick={() => setRosterSubTab('squads')} className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${rosterSubTab === 'squads' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t.squads}</button>
                </div>
              </div>

              {rosterSubTab === 'players' ? (
                <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-10 space-y-12">
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder={t.playerName} className="xl:col-span-2 bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 font-black outline-none" />
                    <select value={newPlayerRole} onChange={e=>setNewPlayerRole(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 font-black outline-none"><option value="field">{t.fieldPlayer}</option><option value="goalkeeper">{t.goalkeeper}</option></select>
                    <button onClick={addNewPlayer} className="bg-emerald-500 text-slate-950 px-12 py-8 rounded-[2.5rem] font-black uppercase text-sm">{t.addPlayer}</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {players.map(p => (
                      <div key={p.id} className="bg-slate-950 border border-slate-800 p-10 rounded-[4rem] flex flex-col items-center text-center relative group">
                        <button onClick={() => setPlayers(players.filter(pl => pl.id !== p.id))} className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"><Trash2/></button>
                        <div className={`w-28 h-28 rounded-[3rem] flex items-center justify-center font-black text-4xl mb-8 ${p.role === 'goalkeeper' ? 'bg-amber-500' : 'bg-slate-900'}`}>{p.name[0]}</div>
                        <span className="font-black text-3xl block mb-2">{p.name}</span>
                        <span className="text-[11px] uppercase text-slate-500 font-black">{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-10 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input value={newSquadName} onChange={e => setNewSquadName(e.target.value)} placeholder={t.squadName} className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-black outline-none" />
                      <button onClick={createSquad} className="bg-emerald-500 text-slate-950 px-10 py-6 rounded-3xl font-black uppercase text-xs">{t.createSquad}</button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {squads.map(squad => (
                        <div key={squad.id} className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 space-y-6 relative group">
                          <button onClick={() => setSquads(squads.filter(s => s.id !== squad.id))} className="absolute top-8 right-8 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-indigo-400">{squad.name}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {players.map(p => (
                              <button 
                                key={p.id} 
                                onClick={() => togglePlayerInSquad(squad.id, p.id)}
                                className={`p-3 rounded-xl text-[10px] font-bold transition-all border ${squad.playerIds.includes(p.id) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{squad.playerIds.length} {t.players}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </div>
        )}

        {activeTab === 'club' && renderProtectedTab(
           <div className="space-y-10">
              <h1 className="text-4xl lg:text-6xl font-black italic uppercase">{t.club}</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <section className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
                    <h2 className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter"><User className="text-indigo-400"/> Admin Profile</h2>
                    <input value={teamData.ownerName} onChange={e=>setTeamData({...teamData, ownerName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 font-bold outline-none" placeholder="Coach Name" />
                 </section>

                 <section className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-12 space-y-10 shadow-2xl">
                    <h2 className="text-3xl font-black flex items-center gap-4 italic uppercase tracking-tighter"><Cloud className="text-indigo-400"/> {t.cloudSync}</h2>
                    
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black uppercase text-slate-500 tracking-widest">{t.syncStatus}</span>
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${sync.status === 'online' ? 'bg-emerald-500' : sync.status === 'error' ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${sync.status === 'online' ? 'text-emerald-400' : sync.status === 'error' ? 'text-red-400' : 'text-slate-500'}`}>
                                {sync.status === 'online' ? t.online : sync.status === 'error' ? t.syncError : t.offline}
                             </span>
                          </div>
                       </div>

                       {sync.syncId ? (
                          <div className="space-y-4">
                             <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">{t.syncId}</p>
                                <p className="text-2xl font-mono font-black text-indigo-400">{sync.syncId}</p>
                             </div>
                             <div className="flex gap-4">
                                <button onClick={syncToCloud} disabled={sync.isSyncing} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50">
                                   {sync.isSyncing ? <RefreshCw className="animate-spin mx-auto" size={18}/> : t.syncNow}
                                </button>
                                <button onClick={pullData} disabled={sync.isSyncing} className="flex-1 bg-slate-800 text-slate-300 py-4 rounded-2xl font-black uppercase text-xs border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50">
                                   {t.pullCloud}
                                </button>
                                <button onClick={() => { setSync({ ...sync, syncId: null, status: 'offline' }); localStorage.removeItem(STORAGE_KEYS.SYNC_ID); }} className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 transition-all">
                                   <X size={18}/>
                                </button>
                             </div>
                             <button 
                               onClick={() => {
                                 const url = `${window.location.origin}${window.location.pathname}?sync=${sync.syncId}`;
                                 navigator.clipboard.writeText(url);
                                 setShowCopied(true);
                                 setTimeout(() => setShowCopied(false), 2000);
                               }}
                               className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-indigo-500/30 text-indigo-400 font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500/5 transition-all"
                             >
                               {showCopied ? <Check size={14}/> : <Copy size={14}/>}
                               {showCopied ? t.linkCopied : t.copyLink}
                             </button>
                             {sync.lastSyncedAt && (
                                <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest text-center">
                                   {t.lastSynced}: {new Date(sync.lastSyncedAt).toLocaleTimeString()}
                                </p>
                             )}
                          </div>
                       ) : (
                          <div className="space-y-6">
                             <div className="flex gap-2">
                                <input 
                                   value={syncIdInput} 
                                   onChange={e => setSyncIdInput(e.target.value.toUpperCase())} 
                                   placeholder={t.enterId} 
                                   className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono font-black outline-none"
                                />
                                <button 
                                   onClick={() => {
                                      if (syncIdInput.length >= 4) {
                                         setSync({ ...sync, syncId: syncIdInput, status: 'online' });
                                         localStorage.setItem(STORAGE_KEYS.SYNC_ID, syncIdInput);
                                      }
                                   }} 
                                   className="bg-indigo-600 text-white px-6 rounded-2xl font-black uppercase text-[10px]"
                                >
                                   OK
                                </button>
                             </div>
                             <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-700"><span className="bg-slate-900 px-4">OR</span></div>
                             </div>
                             <button 
                                onClick={() => {
                                   const newId = generateSyncId();
                                   setSync({ ...sync, syncId: newId, status: 'online' });
                                   localStorage.setItem(STORAGE_KEYS.SYNC_ID, newId);
                                }} 
                                className="w-full bg-slate-800 text-slate-300 py-4 rounded-2xl font-black uppercase text-xs border border-slate-700 hover:bg-slate-700 transition-all"
                             >
                                {t.generateId}
                             </button>
                          </div>
                       )}
                    </div>
                 </section>

                 <button onClick={clearAllData} className="w-full text-red-500 py-10 rounded-[3.5rem] border-4 border-dashed border-red-500/10 font-black uppercase text-xs hover:bg-red-500/5 transition-all">{t.clearData}</button>
              </div>
           </div>
        )}

        {isGoalModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-center">{t.goal}!</h2>
              
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleGoal()} className="bg-slate-800 hover:bg-slate-700 p-8 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all border border-slate-700">{t.opponent}</button>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-[2.5rem] flex flex-col items-center justify-center">
                    <span className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em] mb-2">{t.ourTeam}</span>
                    <Trophy className="text-emerald-400" size={32}/>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4 mb-2 block">{t.scorer}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {players.filter(p => p.isActive).map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => setSelectedScorerId(p.id)}
                          className={`p-4 rounded-2xl font-bold text-xs transition-all border ${selectedScorerId === p.id ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4 mb-2 block">{t.assistant}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button 
                        onClick={() => setSelectedAssistantId(null)}
                        className={`p-4 rounded-2xl font-bold text-xs transition-all border ${selectedAssistantId === null ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                      >
                        {t.noAssistant}
                      </button>
                      {players.filter(p => p.isActive && p.id !== selectedScorerId).map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => setSelectedAssistantId(p.id)}
                          className={`p-4 rounded-2xl font-bold text-xs transition-all border ${selectedAssistantId === p.id ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => { setIsGoalModalOpen(false); setSelectedScorerId(null); setSelectedAssistantId(null); }} className="flex-1 p-6 rounded-3xl font-black uppercase text-xs text-slate-500 hover:bg-slate-800 transition-all">{t.cancel}</button>
                  <button 
                    disabled={!selectedScorerId}
                    onClick={() => handleGoal(selectedScorerId!, selectedAssistantId || undefined)} 
                    className="flex-1 bg-emerald-500 text-slate-950 p-6 rounded-3xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    Confirm Goal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isFinishModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-center">{t.finishMatch}?</h2>
              <div className="space-y-6">
                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 text-center">
                  <div className="text-5xl font-mono font-black mb-2">
                    {match.scoreOur} - {match.scoreTheir}
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Final Score</div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.competition}</label>
                  <select 
                    value={selectedCompId || ''} 
                    onChange={e => setSelectedCompId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-bold outline-none"
                  >
                    <option value="">Select Competition to save result</option>
                    {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsFinishModalOpen(false)} className="flex-1 p-4 rounded-2xl font-black uppercase text-xs text-slate-500 hover:bg-slate-800 transition-all">{t.cancel}</button>
                  <button 
                    disabled={!selectedCompId}
                    onClick={() => finishGameAndSave(selectedCompId!)} 
                    className="flex-1 bg-red-500 text-white p-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {t.finishMatch}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isFixtureModalOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300 relative">
              <button 
                onClick={() => setIsFixtureModalOpen(false)} 
                className="absolute top-8 right-8 p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
              >
                <X size={20}/>
              </button>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 pr-16">{t.scheduleGame} - {selectedDateForFixture}</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.competition}</label>
                  {competitions.length > 0 ? (
                    <select value={fixtureCompId} onChange={e => setFixtureCompId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-bold outline-none">
                      <option value="">{t.selectComp}</option>
                      {competitions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                      <p className="text-xs text-slate-500 mb-2">No competitions found</p>
                      <button onClick={() => { setIsFixtureModalOpen(false); setActiveTab('competitions'); }} className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">Create one first</button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.opponent}</label>
                  {fixtureCompId ? (
                    competitions.find(c => c.id === fixtureCompId)?.opponents.length ? (
                      <select value={fixtureOpponentId} onChange={e => setFixtureOpponentId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-bold outline-none">
                        <option value="">{t.selectOpponent}</option>
                        {competitions.find(c => c.id === fixtureCompId)?.opponents.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    ) : (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                        <p className="text-xs text-slate-500 mb-2">No opponents in this competition</p>
                        <button onClick={() => { setIsFixtureModalOpen(false); setActiveTab('competitions'); setSelectedCompId(fixtureCompId); }} className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">Add opponents</button>
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center text-slate-600 text-xs italic">Select competition first</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.time}</label>
                    <input type="time" value={fixtureTime} onChange={e => setFixtureTime(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">{t.venue}</label>
                    <input value={fixtureVenue} onChange={e => setFixtureVenue(e.target.value)} placeholder="Venue" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-bold outline-none" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsFixtureModalOpen(false)} className="flex-1 p-4 rounded-2xl font-black uppercase text-xs text-slate-500 hover:bg-slate-800 transition-all">{t.cancel}</button>
                  <button onClick={() => {
                    if (!fixtureCompId || !fixtureOpponentId || !fixtureTime) return;
                    setFixtures([...fixtures, { id: Date.now().toString(), competitionId: fixtureCompId, opponentId: fixtureOpponentId, date: selectedDateForFixture!, time: fixtureTime, venue: fixtureVenue, isCompleted: false }]);
                    setIsFixtureModalOpen(false);
                  }} className="flex-1 bg-indigo-600 text-white p-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">{t.scheduleGame}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Manual Result Modal with Tournament Stage Support */}
      {isManualResultModalOpen && selectedCompetition && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[300] animate-in fade-in duration-300">
           <div className="bg-slate-900 border-2 border-slate-800 rounded-[4rem] p-12 sm:p-20 max-w-2xl w-full space-y-12 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center"><h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.addManualResult}</h2><button onClick={() => setIsManualResultModalOpen(false)} className="p-6 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all"><X/></button></div>
              <div className="space-y-8">
                 {selectedCompetition.type === 'tournament' && (
                   <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">{t.stage}</label>
                      <select value={manualStage} onChange={e=>setManualStage(e.target.value)} className="w-full bg-slate-950 p-6 rounded-2xl font-bold border border-slate-800 outline-none focus:border-indigo-500/50">
                        {TOURNAMENT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                 )}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <select value={manualTeamA} onChange={e=>setManualTeamA(e.target.value)} className="w-full bg-slate-950 p-6 rounded-2xl font-bold border border-slate-800 outline-none focus:border-emerald-500/50">
                        <option value="">Team A</option>
                        <option value={teamData.name}>{teamData.name}</option>
                        {selectedCompetition.opponents.map(o=><option key={o.id} value={o.name}>{o.name}</option>)}
                    </select>
                    <select value={manualTeamB} onChange={e=>setManualTeamB(e.target.value)} className="w-full bg-slate-950 p-6 rounded-2xl font-bold border border-slate-800 outline-none focus:border-emerald-500/50">
                        <option value="">Team B</option>
                        <option value={teamData.name}>{teamData.name}</option>
                        {selectedCompetition.opponents.map(o=><option key={o.id} value={o.name}>{o.name}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <input type="number" value={manualScoreA} onChange={e=>setManualScoreA(parseInt(e.target.value)||0)} className="w-full bg-slate-950 p-6 rounded-2xl font-bold text-center text-3xl border border-slate-800" />
                    <input type="number" value={manualScoreB} onChange={e=>setManualScoreB(parseInt(e.target.value)||0)} className="w-full bg-slate-950 p-6 rounded-2xl font-bold text-center text-3xl border border-slate-800" />
                 </div>
                 <button onClick={() => {
                   if (!manualTeamA || !manualTeamB) return;
                   const res: MatchResult = { 
                     id: Date.now().toString(), 
                     teamA: manualTeamA, 
                     scoreA: manualScoreA, 
                     teamB: manualTeamB, 
                     scoreB: manualScoreB, 
                     date: new Date().toLocaleDateString(),
                     stage: selectedCompetition.type === 'tournament' ? manualStage : undefined
                   };
                   setCompetitions(prev => prev.map(c => c.id === selectedCompetition.id ? { ...c, results: [res, ...c.results] } : c));
                   setIsManualResultModalOpen(false);
                 }} className="w-full bg-emerald-500 text-slate-950 py-8 rounded-3xl font-black uppercase text-lg shadow-xl hover:bg-emerald-400 transition-all">Record Match Result</button>
              </div>
           </div>
        </div>
      )}

      {/* Global Error Pop-up */}
      {errorMsg && (
        <div className="fixed top-8 sm:top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl z-[500] animate-in slide-in-from-top-12 duration-500 flex items-center gap-4">
           <AlertCircle size={28}/> {errorMsg}
        </div>
      )}

      {/* Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 flex justify-around items-center py-3 z-[150] h-20 backdrop-blur-md">
        <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label={t.dashboard} />
        <MobileNavItem active={activeTab === 'rotation'} onClick={() => setActiveTab('rotation')} icon={<Activity />} label={t.matchTimer} />
        <MobileNavItem active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon />} label={t.calendar} />
        <MobileNavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 />} label={t.stats} />
        <MobileNavItem active={activeTab === 'club'} onClick={() => setActiveTab('club')} icon={<Shield />} label={t.club} />
      </nav>
    </div>
  );
};

// Sub-components
const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-5 w-full p-5 lg:p-6 rounded-2xl lg:rounded-3xl transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-600 hover:bg-slate-800/50 hover:text-slate-300'}`}>
    <div className="relative transform transition-all group-hover:scale-110 flex shrink-0 mx-auto lg:mx-0">{icon}</div>
    <span className="hidden lg:inline font-black text-[11px] uppercase tracking-[0.2em] truncate">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${active ? 'text-indigo-400 scale-110' : 'text-slate-600'}`}>
    <div className="relative">{icon}</div>
    <span className="text-[7px] font-black uppercase tracking-widest truncate w-full text-center">{label}</span>
  </button>
);

type AppTab = 'home' | 'rotation' | 'stats' | 'calendar' | 'competitions' | 'roster' | 'club';

export default App;
