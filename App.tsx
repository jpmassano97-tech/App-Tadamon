
import React, { useState, useEffect, useRef } from 'react';
import { Player, MatchState, MatchInfo, TeamData, Competition, Opponent, MatchEvent, Language } from './types';
import { getSubstitutionAdvice, analyzeIntelligenceSource } from './services/geminiService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  UserPlus, 
  Users, 
  ArrowRightLeft, 
  Trophy,
  Activity,
  BrainCircuit,
  X,
  Search,
  Globe,
  Camera,
  FileText,
  Calendar,
  LayoutDashboard,
  Home,
  Youtube,
  MapPin,
  Lock,
  Unlock,
  ChevronRight,
  CircleDot,
  Shield,
  ShieldAlert,
  Plus,
  Trash2,
  MoreVertical,
  Minus,
  History,
  Target,
  Languages
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Alex', totalPlayTime: 0, isActive: true, lastSubbedAt: null, role: 'goalkeeper' },
  { id: '2', name: 'Jordan', totalPlayTime: 0, isActive: true, lastSubbedAt: null, role: 'field' },
  { id: '3', name: 'Taylor', totalPlayTime: 0, isActive: true, lastSubbedAt: null, role: 'field' },
  { id: '4', name: 'Morgan', totalPlayTime: 0, isActive: true, lastSubbedAt: null, role: 'field' },
  { id: '5', name: 'Casey', totalPlayTime: 0, isActive: true, lastSubbedAt: null, role: 'field' },
  { id: '6', name: 'Riley', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'goalkeeper' },
  { id: '7', name: 'Skyler', totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: 'field' },
];

const TEAM_DATA: TeamData = {
  name: "Emerald Falcons FC",
  logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=emerald-falcons",
  classification: "1st Place - Premier Division"
};

const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: '1',
    name: 'National Futsal League',
    opponents: [
      { id: 'opp1', name: 'Thunder FC', strength: 'high', notes: 'Very physical team' },
      { id: 'opp2', name: 'Red Devils', strength: 'medium', notes: 'Quick wingers' }
    ]
  }
];

const LAST_MATCH: MatchInfo = {
  opponent: "Thunder FC",
  scoreOur: 3,
  scoreTheir: 1,
  date: "October 24, 2023",
  youtubeId: "dQw4w9WgXcQ",
  venue: "Central Futsal Arena",
  description: "Dominant second half performance with quick transitions."
};

const NEXT_MATCH: MatchInfo = {
  opponent: "Starlight City",
  scoreOur: 0,
  scoreTheir: 0,
  date: "November 2, 2023 - 19:30",
  venue: "Grand Park Sports Complex",
  description: "Key match for securing the top spot in the league."
};

const TRANSLATIONS: Record<Language, any> = {
  en: {
    dashboard: 'Dashboard',
    matchTimer: 'Match Timer',
    league: 'League',
    intelHub: 'Intel Hub',
    admin: 'Admin',
    welcome: 'Welcome Back',
    coach: 'Coach',
    nextGame: 'Next Game',
    teamRating: 'Team Rating',
    startMatch: 'Start Match',
    recordGoal: 'Record Goal',
    scorer: 'Scorer',
    assistant: 'Assistant',
    onTarget: 'On Target',
    offTarget: 'Off Target',
    possession: 'Possession',
    onPitch: 'On the Pitch',
    bench: 'The Bench',
    tacticalAI: 'Tactical AI',
    matchFeed: 'Match Feed',
    shootingStats: 'Shooting Stats',
    subOut: 'Sub Out',
    subIn: 'Sub In',
    noActive: 'No active players',
    playtime: 'Playtime (Mins)',
    ownBall: 'Own Ball',
    oppBall: 'Opp Ball'
  },
  es: {
    dashboard: 'Panel',
    matchTimer: 'Temporizador',
    league: 'Liga',
    intelHub: 'Centro de Inteligencia',
    admin: 'Admin',
    welcome: 'Bienvenido de nuevo',
    coach: 'Entrenador',
    nextGame: 'Siguiente Partido',
    teamRating: 'Calificación del Equipo',
    startMatch: 'Empezar Partido',
    recordGoal: 'Registrar Gol',
    scorer: 'Goleador',
    assistant: 'Asistente',
    onTarget: 'Al Arco',
    offTarget: 'Fuera',
    possession: 'Posesión',
    onPitch: 'En la Cancha',
    bench: 'Banca',
    tacticalAI: 'IA Táctica',
    matchFeed: 'Resumen del Partido',
    shootingStats: 'Estadísticas de Tiro',
    subOut: 'Cambio Salida',
    subIn: 'Cambio Entrada',
    noActive: 'Sin jugadores activos',
    playtime: 'Tiempo de Juego (Min)',
    ownBall: 'Balón Propio',
    oppBall: 'Balón Rival'
  },
  pt: {
    dashboard: 'Painel',
    matchTimer: 'Cronómetro',
    league: 'Liga',
    intelHub: 'Centro de Inteligência',
    admin: 'Admin',
    welcome: 'Bem-vindo de volta',
    coach: 'Treinador',
    nextGame: 'Próximo Jogo',
    teamRating: 'Classificação da Equipa',
    startMatch: 'Iniciar Jogo',
    recordGoal: 'Registar Golo',
    scorer: 'Marcador',
    assistant: 'Assistente',
    onTarget: 'À Baliza',
    offTarget: 'Fora',
    possession: 'Posse de Bola',
    onPitch: 'No Campo',
    bench: 'Suplentes',
    tacticalAI: 'IA Tática',
    matchFeed: 'Eventos do Jogo',
    shootingStats: 'Estatísticas de Remate',
    subOut: 'Subst. Saída',
    subIn: 'Subst. Entrada',
    noActive: 'Sem jogadores ativos',
    playtime: 'Tempo de Jogo (Min)',
    ownBall: 'Bola Própria',
    oppBall: 'Bola Rival'
  },
  ar: {
    dashboard: 'لوحة القيادة',
    matchTimer: 'مؤقت المباراة',
    league: 'الدوري',
    intelHub: 'مركز المعلومات',
    admin: 'المسؤول',
    welcome: 'مرحباً بعودتك',
    coach: 'المدرب',
    nextGame: 'المباراة القادمة',
    teamRating: 'تقييم الفريق',
    startMatch: 'بدء المباراة',
    recordGoal: 'تسجيل هدف',
    scorer: 'الهداف',
    assistant: 'صانع الهدف',
    onTarget: 'على المرمى',
    offTarget: 'خارج المرمى',
    possession: 'الاستحواذ',
    onPitch: 'في الملعب',
    bench: 'دكة البدلاء',
    tacticalAI: 'الذكاء الاصطناعي التكتيكي',
    matchFeed: 'أحداث المباراة',
    shootingStats: 'إحصائيات التسديد',
    subOut: 'تبديل للخروج',
    subIn: 'تبديل للدخول',
    noActive: 'لا يوجد لاعبين نشطين',
    playtime: 'وقت اللعب (دقائق)',
    ownBall: 'كرتنا',
    oppBall: 'كرة الخصم'
  }
};

type AppTab = 'home' | 'rotation' | 'intelligence' | 'last-match' | 'next-match' | 'competitions';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [match, setMatch] = useState<MatchState>({ 
    isRunning: false, 
    elapsedTime: 0, 
    startTime: null,
    possessionOur: 0,
    possessionTheir: 0,
    currentPossession: null,
    timeWithoutGK: 0,
    scoreOur: 0,
    scoreTheir: 0,
    shotsOnGoalOur: 0,
    shotsOffGoalOur: 0,
    shotsOnGoalTheir: 0,
    shotsOffGoalTheir: 0,
    events: [],
    language: 'en'
  });
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalType, setGoalType] = useState<'our' | 'their'>('our');
  const [selectedScorer, setSelectedScorer] = useState<string>('');
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'field' | 'goalkeeper'>('field');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [newCompName, setNewCompName] = useState('');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [newOppName, setNewOppName] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = TRANSLATIONS[match.language];
  const isRtl = match.language === 'ar';

  useEffect(() => {
    if (match.isRunning) {
      timerRef.current = setInterval(() => {
        setMatch(prev => {
          const nextOur = prev.currentPossession === 'our' ? prev.possessionOur + 1 : prev.possessionOur;
          const nextTheir = prev.currentPossession === 'their' ? prev.possessionTheir + 1 : prev.possessionTheir;
          const hasGK = players.some(p => p.isActive && p.role === 'goalkeeper');
          const nextNoGKTime = !hasGK ? prev.timeWithoutGK + 1 : prev.timeWithoutGK;

          return { 
            ...prev, 
            elapsedTime: prev.elapsedTime + 1,
            possessionOur: nextOur,
            possessionTheir: nextTheir,
            timeWithoutGK: nextNoGKTime
          };
        });
        setPlayers(prevPlayers => prevPlayers.map(p => {
          if (p.isActive) {
            return { ...p, totalPlayTime: p.totalPlayTime + 1 };
          }
          return p;
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match.isRunning, players]);

  const toggleMatch = () => {
    setMatch(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      startTime: !prev.isRunning ? Date.now() : prev.startTime
    }));
  };

  const recordGoal = () => {
    if (goalType === 'our') {
      const newEvent: MatchEvent = {
        id: Date.now().toString(),
        type: 'goal',
        minute: Math.floor(match.elapsedTime / 60),
        scorerId: selectedScorer,
        assistantId: selectedAssistant || undefined,
        isOpponent: false
      };
      setMatch(prev => ({
        ...prev,
        scoreOur: prev.scoreOur + 1,
        shotsOnGoalOur: prev.shotsOnGoalOur + 1, // A goal is always a shot on target
        events: [newEvent, ...prev.events]
      }));
    } else {
      setMatch(prev => ({
        ...prev,
        scoreTheir: prev.scoreTheir + 1,
        shotsOnGoalTheir: prev.shotsOnGoalTheir + 1,
        events: [{
          id: Date.now().toString(),
          type: 'goal',
          minute: Math.floor(match.elapsedTime / 60),
          scorerId: 'opponent',
          isOpponent: true
        }, ...prev.events]
      }));
    }
    setIsGoalModalOpen(false);
    setSelectedScorer('');
    setSelectedAssistant('');
  };

  const resetMatch = () => {
    if (confirm("Reset match stats?")) {
      setMatch(prev => ({ 
        ...prev,
        isRunning: false, elapsedTime: 0, startTime: null, possessionOur: 0, 
        possessionTheir: 0, currentPossession: null, timeWithoutGK: 0, scoreOur: 0, scoreTheir: 0, 
        shotsOnGoalOur: 0, shotsOffGoalOur: 0, shotsOnGoalTheir: 0, shotsOffGoalTheir: 0, events: [] 
      }));
      setPlayers(prev => prev.map(p => ({ ...p, totalPlayTime: 0, lastSubbedAt: null })));
    }
  };

  const getAiCoaching = async () => {
    setIsAiLoading(true);
    setAiAdvice(null);
    try {
      const advice = await getSubstitutionAdvice(players, match.elapsedTime);
      setAiAdvice(advice);
    } catch (error) {
      console.error("Coaching Advice Error:", error);
      setAiAdvice("Check back in a minute!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setPlayers([...players, {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
      totalPlayTime: 0,
      isActive: players.filter(p => p.isActive).length < 5,
      lastSubbedAt: null,
      role: newPlayerRole
    }]);
    setNewPlayerName('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const posStats = (() => {
    const total = match.possessionOur + match.possessionTheir;
    if (total === 0) return { our: 50, their: 50 };
    return {
      our: Math.round((match.possessionOur / total) * 100),
      their: Math.round((match.possessionTheir / total) * 100)
    };
  })();

  const activePlayers = players.filter(p => p.isActive);
  const isGKActive = activePlayers.some(p => p.role === 'goalkeeper');

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0 transition-all ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Sidebar - Desktop */}
      <nav className={`hidden md:flex w-20 lg:w-64 bg-slate-900 border-slate-800 flex-col items-center py-4 px-4 sticky top-0 h-screen z-50 ${isRtl ? 'border-l' : 'border-r'}`}>
        <div className="hidden lg:flex items-center gap-3 mb-6 w-full">
          <img src={TEAM_DATA.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg bg-emerald-500/20 p-1" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">{TEAM_DATA.name.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">Management</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label={t.dashboard} isRtl={isRtl} />
          <NavItem active={activeTab === 'rotation'} onClick={() => setActiveTab('rotation')} icon={<LayoutDashboard size={22} />} label={t.matchTimer} isRtl={isRtl} />
          <NavItem active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} icon={<Trophy size={22} />} label={t.league} isRtl={isRtl} />
          {isAdmin && <NavItem active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={<Search size={22} />} label={t.intelHub} isRtl={isRtl} />}
        </div>

        <div className="mt-auto w-full border-t border-slate-800 pt-4 flex flex-col gap-4">
          <div className="flex items-center justify-center lg:justify-start gap-2 px-2 overflow-x-auto">
             {(['en', 'es', 'pt', 'ar'] as Language[]).map(lang => (
               <button 
                key={lang}
                onClick={() => setMatch(prev => ({...prev, language: lang}))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${match.language === lang ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               >
                 {lang.toUpperCase()}
               </button>
             ))}
          </div>
          <button onClick={() => setIsAdmin(!isAdmin)} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isAdmin ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500'}`}>
            {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            <span className="hidden lg:inline text-sm font-bold">{t.admin}</span>
          </button>
        </div>
      </nav>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center py-3 z-50 px-2 h-18">
        <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label={t.dashboard} />
        <MobileNavItem active={activeTab === 'rotation'} onClick={() => setActiveTab('rotation')} icon={<Activity size={20} />} label={t.matchTimer} />
        <MobileNavItem active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} icon={<Trophy size={20} />} label={t.league} />
        <MobileNavItem active={isAdmin && activeTab === 'intelligence'} onClick={() => isAdmin ? setActiveTab('intelligence') : setIsAdmin(true)} icon={isAdmin ? <Search size={20} /> : <Lock size={20} />} label={isAdmin ? t.intelHub : t.admin} />
      </nav>

      <div className="flex-1 flex flex-col overflow-y-auto w-full">
        <main className="max-w-6xl mx-auto w-full p-4 lg:p-8">
          
          {activeTab === 'home' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center mb-4">
                 <h1 className="text-3xl font-black">{t.welcome}, <span className="text-emerald-400">{t.coach}</span></h1>
                 <div className="flex gap-2">
                    <img src={TEAM_DATA.logoUrl} className="w-10 h-10 md:hidden rounded-lg bg-emerald-500/10 p-1" />
                    <button className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-400">
                      <Languages size={20} />
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                 <div className="md:col-span-8 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2rem] p-6 relative overflow-hidden shadow-xl" onClick={() => setActiveTab('next-match')}>
                    <Calendar className={`absolute -bottom-8 opacity-10 w-48 h-48 ${isRtl ? '-left-8' : '-right-8'}`} />
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{t.nextGame}</span>
                    <h2 className="text-3xl font-black mt-4">Vs. {NEXT_MATCH.opponent}</h2>
                    <p className="text-white/60 text-sm mt-1">{NEXT_MATCH.date} • {NEXT_MATCH.venue}</p>
                    <div className="mt-8 flex items-center gap-2 font-bold group cursor-pointer">
                      View Plan <ChevronRight size={18} className={`${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
                    </div>
                 </div>

                 <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex flex-col shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t.teamRating}</span>
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">8.4 / 10</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                       <img src={TEAM_DATA.logoUrl} className="w-16 h-16 mb-4" />
                       <h3 className="font-black text-xl">{TEAM_DATA.name}</h3>
                       <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-tighter">{TEAM_DATA.classification}</p>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'rotation' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              
              {/* Score & Timer Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl relative">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className={`flex items-center gap-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'} order-2 md:order-1`}>
                       <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{TEAM_DATA.name.split(' ')[0]}</p>
                          <div className="flex items-center gap-3">
                             <button onClick={() => setMatch(p=>({...p, scoreOur: Math.max(0, p.scoreOur-1)}))} className="p-1 text-slate-500 hover:text-white"><Minus size={16}/></button>
                             <span className="text-5xl font-black">{match.scoreOur}</span>
                             <button onClick={() => {setGoalType('our'); setIsGoalModalOpen(true);}} className="p-1 text-emerald-400 hover:scale-110"><Plus size={20}/></button>
                          </div>
                       </div>
                       <div className="text-4xl font-light text-slate-700">:</div>
                       <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Opponent</p>
                          <div className="flex items-center gap-3">
                             <button onClick={() => {setGoalType('their'); recordGoal();}} className="p-1 text-indigo-400 hover:scale-110"><Plus size={20}/></button>
                             <span className="text-5xl font-black">{match.scoreTheir}</span>
                             <button onClick={() => setMatch(p=>({...p, scoreTheir: Math.max(0, p.scoreTheir-1)}))} className="p-1 text-slate-500 hover:text-white"><Minus size={16}/></button>
                          </div>
                       </div>
                    </div>

                    <div className="text-center order-1 md:order-2">
                       <div className="text-5xl md:text-6xl font-mono font-bold tracking-tighter tabular-nums text-emerald-400 mb-1">
                         {formatTime(match.elapsedTime)}
                       </div>
                       <div className="flex items-center justify-center gap-2">
                         <button onClick={toggleMatch} className={`p-3 rounded-full shadow-lg ${match.isRunning ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500 text-slate-900'}`}>
                           {match.isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                         </button>
                         <button onClick={resetMatch} className="p-3 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
                           <RotateCcw size={20} />
                         </button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Shot Statistics & Possession */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Shot Statistics */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                      <Target size={18} className="text-amber-500" /> {t.shootingStats}
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-center text-emerald-500 uppercase tracking-widest">{TEAM_DATA.name.split(' ')[0]}</p>
                          <div className="grid grid-cols-2 gap-2">
                             <ShotControl 
                                label={t.onTarget} 
                                value={match.shotsOnGoalOur} 
                                onPlus={() => setMatch(p=>({...p, shotsOnGoalOur: p.shotsOnGoalOur + 1}))} 
                                onMinus={() => setMatch(p=>({...p, shotsOnGoalOur: Math.max(0, p.shotsOnGoalOur - 1)}))} 
                             />
                             <ShotControl 
                                label={t.offTarget} 
                                value={match.shotsOffGoalOur} 
                                onPlus={() => setMatch(p=>({...p, shotsOffGoalOur: p.shotsOffGoalOur + 1}))} 
                                onMinus={() => setMatch(p=>({...p, shotsOffGoalOur: Math.max(0, p.shotsOffGoalOur - 1)}))} 
                             />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-center text-indigo-400 uppercase tracking-widest">Opponent</p>
                          <div className="grid grid-cols-2 gap-2">
                             <ShotControl 
                                label={t.onTarget} 
                                value={match.shotsOnGoalTheir} 
                                onPlus={() => setMatch(p=>({...p, shotsOnGoalTheir: p.shotsOnGoalTheir + 1}))} 
                                onMinus={() => setMatch(p=>({...p, shotsOnGoalTheir: Math.max(0, p.shotsOnGoalTheir - 1)}))} 
                             />
                             <ShotControl 
                                label={t.offTarget} 
                                value={match.shotsOffGoalTheir} 
                                onPlus={() => setMatch(p=>({...p, shotsOffGoalTheir: p.shotsOffGoalTheir + 1}))} 
                                onMinus={() => setMatch(p=>({...p, shotsOffGoalTheir: Math.max(0, p.shotsOffGoalTheir - 1)}))} 
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Possession Tracker */}
                 <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">{t.possession} %</h3>
                    <div className={`flex items-center gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                       <span className="text-lg font-black text-emerald-400">{posStats.our}%</span>
                       <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                          <div className="bg-emerald-500 h-full transition-all duration-700" style={{width:`${posStats.our}%`}} />
                          <div className="bg-indigo-500 h-full transition-all duration-700" style={{width:`${posStats.their}%`}} />
                       </div>
                       <span className="text-lg font-black text-indigo-400">{posStats.their}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={()=>match.isRunning && setMatch(p=>({...p, currentPossession:'our'}))} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${match.currentPossession==='our' ? 'bg-emerald-500 text-slate-950 scale-95' : 'bg-slate-800 text-emerald-500'}`}>{t.ownBall}</button>
                       <button onClick={()=>match.isRunning && setMatch(p=>({...p, currentPossession:'their'}))} className={`py-3 rounded-xl text-xs font-black uppercase transition-all ${match.currentPossession==='their' ? 'bg-indigo-500 text-white scale-95' : 'bg-slate-800 text-indigo-400'}`}>{t.oppBall}</button>
                    </div>
                 </div>
              </div>

              {/* Match Feed & Stats Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                      <History size={16} /> {t.matchFeed}
                    </h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                       {match.events.map(ev => (
                         <div key={ev.id} className={`flex items-center justify-between text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-800 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] ${ev.isOpponent ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                 GOAL
                               </div>
                               <div className={isRtl ? 'text-right' : 'text-left'}>
                                  <p className="font-bold">{ev.isOpponent ? "Opponent" : players.find(p => p.id === ev.scorerId)?.name}</p>
                                  {!ev.isOpponent && ev.assistantId && <p className="text-[9px] text-slate-500">{t.assistant}: {players.find(p => p.id === ev.assistantId)?.name}</p>}
                               </div>
                            </div>
                            <span className="font-mono text-xs text-slate-500">{ev.minute}'</span>
                         </div>
                       ))}
                       {match.events.length === 0 && <p className="text-center py-6 text-slate-600 text-xs italic">No match events yet</p>}
                    </div>
                 </div>

                 <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">{t.playtime}</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={players.map(p => ({name: p.name, time: Math.floor(p.totalPlayTime/60), active: p.isActive})).sort((a,b)=>b.time-a.time).slice(0, 6)}>
                           <XAxis dataKey="name" hide />
                           <YAxis hide />
                           <Tooltip contentStyle={{background:'#0f172a', border:'none', borderRadius:'12px', textAlign: isRtl ? 'right' : 'left'}} />
                           <Bar dataKey="time" radius={[4,4,4,4]}>
                             {players.map((e,i) => <Cell key={i} fill={e.active ? '#10b981' : '#6366f1'} />)}
                           </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Pitch & Bench */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                 <div className="lg:col-span-8 space-y-4">
                    <h2 className={`text-xl font-bold flex items-center justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                       <span className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}><Users className="text-emerald-400" /> {t.onPitch}</span>
                       <span className="text-xs font-bold text-slate-500">({activePlayers.length}/5)</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {activePlayers.map(p => (
                         <PlayerCard key={p.id} player={p} formatTime={formatTime} t={t} isRtl={isRtl} onSwap={() => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, isActive: false, lastSubbedAt: Date.now()} : x))} />
                       ))}
                    </div>

                    <h2 className={`text-xl font-bold pt-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}><Activity className="text-amber-400" /> {t.bench}</h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-4 space-y-2 shadow-xl">
                       {players.filter(p => !p.isActive).map(p => (
                         <div key={p.id} className={`flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-800 group ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                           <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${p.role==='goalkeeper' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                {p.role==='goalkeeper' ? <Shield size={18} /> : p.name[0]}
                              </div>
                              <div className={isRtl ? 'text-right' : 'text-left'}>
                                 <p className="font-bold text-sm">{p.name}</p>
                                 <p className="text-[9px] text-slate-500 uppercase font-black">Played: {formatTime(p.totalPlayTime)}</p>
                              </div>
                           </div>
                           <button onClick={() => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, isActive: true, lastSubbedAt: Date.now()} : x))} className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-all">{t.subIn}</button>
                         </div>
                       ))}
                       <form onSubmit={addPlayer} className={`flex gap-2 p-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                          <input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)} placeholder="Player Name" className={`flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500 ${isRtl ? 'text-right' : 'text-left'}`} />
                          <button type="submit" className="p-2 bg-emerald-500 text-slate-950 rounded-xl transition-transform hover:scale-110"><Plus size={18}/></button>
                       </form>
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2rem] p-6 shadow-2xl">
                       <h3 className={`text-lg font-black text-indigo-400 flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}><BrainCircuit /> {t.tacticalAI}</h3>
                       <div className={`text-xs text-slate-300 leading-relaxed mb-6 font-medium ${isRtl ? 'text-right' : 'text-left'}`}>
                          {isAiLoading ? (
                             <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]" />
                                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]" />
                             </div>
                          ) : (
                             aiAdvice || "Ask coach for advice."
                          )}
                       </div>
                       <button onClick={getAiCoaching} disabled={isAiLoading} className="w-full py-4 bg-indigo-500 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-400 transition-all">
                         <ArrowRightLeft size={16}/> Analyze Rotation
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Goal Modal */}
          {isGoalModalOpen && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
               <div className={`bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className={`flex justify-between items-center mb-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                     <h2 className="text-2xl font-black">{goalType === 'our' ? t.recordGoal : 'Opponent Goal'}</h2>
                     <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-500 hover:text-white"><X /></button>
                  </div>

                  {goalType === 'our' ? (
                    <div className="space-y-6">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{t.scorer}</label>
                          <select value={selectedScorer} onChange={e=>setSelectedScorer(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                             <option value="">Select Scorer...</option>
                             {activePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">{t.assistant} (Optional)</label>
                          <select value={selectedAssistant} onChange={e=>setSelectedAssistant(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                             <option value="">Select Assistant...</option>
                             {activePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       </div>
                       <button onClick={recordGoal} disabled={!selectedScorer} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl hover:bg-emerald-400 disabled:opacity-50">Record Goal</button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                       <p className="text-slate-300 font-medium mb-8">Confirm opponent score update?</p>
                       <button onClick={recordGoal} className="w-full py-4 bg-indigo-500 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-400">Record Opponent Goal</button>
                    </div>
                  )}
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

const ShotControl: React.FC<{ label: string; value: number; onPlus: () => void; onMinus: () => void }> = ({ label, value, onPlus, onMinus }) => (
  <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl flex flex-col items-center gap-1 shadow-inner">
     <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{label}</span>
     <div className="flex items-center gap-2">
        <button onClick={onMinus} className="p-1 text-slate-600 hover:text-white transition-colors"><Minus size={12}/></button>
        <span className="text-lg font-black tabular-nums">{value}</span>
        <button onClick={onPlus} className="p-1 text-emerald-500 hover:text-emerald-400 transition-transform active:scale-125"><Plus size={12}/></button>
     </div>
  </div>
);

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isRtl: boolean }> = ({ active, onClick, icon, label, isRtl }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all ${isRtl ? 'flex-row-reverse' : 'flex-row'} ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:bg-slate-800/50'}`}
  >
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <span className="hidden lg:inline font-bold text-sm">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-tighter truncate w-14 text-center">{label}</span>
  </button>
);

const PlayerCard: React.FC<{ player: Player; formatTime: (s: number) => string; t: any; isRtl: boolean; onSwap: () => void }> = ({ player, formatTime, t, isRtl, onSwap }) => (
  <div className={`bg-slate-900 border rounded-[2rem] p-5 transition-all shadow-lg group ${player.role === 'goalkeeper' ? 'border-amber-500/20' : 'border-slate-800'}`}>
    <div className={`flex items-center gap-4 mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${player.role === 'goalkeeper' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
        {player.role === 'goalkeeper' ? <Shield size={24} /> : player.name[0]}
      </div>
      <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h3 className="text-lg font-black truncate">{player.name}</h3>
        <p className={`text-[9px] font-black uppercase tracking-widest ${player.role === 'goalkeeper' ? 'text-amber-500' : 'text-emerald-500'}`}>Playing Now</p>
      </div>
    </div>
    <div className={`flex items-end justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={isRtl ? 'text-right' : 'text-left'}>
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Time</p>
        <div className="text-2xl font-mono font-bold tabular-nums text-white">{formatTime(player.totalPlayTime)}</div>
      </div>
      <button onClick={onSwap} className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all">
        <ArrowRightLeft size={18} />
      </button>
    </div>
  </div>
);

export default App;
