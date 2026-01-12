
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Player, MatchState, TeamData, Competition, Opponent, Language, Fixture, StandingEntry, MatchResult } from './types';
import { getSubstitutionAdvice } from './services/geminiService';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  ArrowRightLeft, 
  Trophy,
  Activity,
  X,
  Home,
  Shield,
  Plus,
  Trash2,
  Minus,
  History,
  Languages,
  Settings,
  Save,
  Check,
  UsersRound,
  CalendarDays,
  ChevronRight,
  ListOrdered,
  FileClock,
  Lock,
  Unlock,
  AlertCircle,
  UserCircle,
  Clock,
  Target,
  Medal,
  Link as LinkIcon
} from 'lucide-react';

const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Alex', totalPlayTime: 1200, isActive: true, lastSubbedAt: null, role: 'goalkeeper', totalGoals: 0, totalAssists: 1 },
  { id: '2', name: 'Jordan', totalPlayTime: 3400, isActive: true, lastSubbedAt: null, role: 'field', totalGoals: 12, totalAssists: 4 },
  { id: '3', name: 'Taylor', totalPlayTime: 2800, isActive: true, lastSubbedAt: null, role: 'field', totalGoals: 8, totalAssists: 9 },
  { id: '4', name: 'Morgan', totalPlayTime: 3100, isActive: true, lastSubbedAt: null, role: 'field', totalGoals: 3, totalAssists: 11 },
  { id: '5', name: 'Casey', totalPlayTime: 2500, isActive: true, lastSubbedAt: null, role: 'field', totalGoals: 5, totalAssists: 3 },
  { id: '6', name: 'Riley', totalPlayTime: 900, isActive: false, lastSubbedAt: null, role: 'goalkeeper', totalGoals: 0, totalAssists: 0 },
  { id: '7', name: 'Skyler', totalPlayTime: 1500, isActive: false, lastSubbedAt: null, role: 'field', totalGoals: 1, totalAssists: 2 },
];

const INITIAL_TEAM_DATA: TeamData = {
  name: "Emerald Falcons FC",
  logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=emerald-falcons",
  classification: "1st Place - Premier Division"
};

const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: '1',
    name: 'National Futsal League',
    opponents: [
      { id: 'opp1', name: 'Thunder FC', logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=thunder", strength: 'high' },
      { id: 'opp2', name: 'Red Devils', logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=red-devils", strength: 'medium' },
      { id: 'opp3', name: 'Blue Jets', logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=blue-jets", strength: 'low' }
    ],
    calendar: [
      { id: 'f1', opponentId: 'opp1', date: '2025-11-15', venue: 'Falcons Arena' }
    ],
    results: [
      { id: 'r1', teamA: 'Emerald Falcons FC', scoreA: 3, teamB: 'Red Devils', scoreB: 1, date: '2025-10-20' },
      { id: 'r2', teamA: 'Thunder FC', scoreA: 2, teamB: 'Blue Jets', scoreB: 2, date: '2025-10-21' }
    ]
  }
];

// Added missing 'es' and 'ar' keys to TRANSLATIONS to satisfy Record<Language, any> constraint.
const TRANSLATIONS: Record<Language, any> = {
  en: {
    dashboard: 'Home',
    matchTimer: 'Live Match',
    competitions: 'Competitions',
    roster: 'Roster',
    clubSettings: 'Club',
    admin: 'Admin',
    welcome: 'Coach Hub',
    coach: 'Coach',
    nextGame: 'Next Match',
    onPitch: 'Pitch',
    bench: 'Bench',
    subIn: 'Sub In',
    save: 'Save Changes',
    saved: 'Saved!',
    calendar: 'Calendar',
    opponents: 'Opponents',
    classification: 'Classification',
    addFixture: 'Add Fixture',
    team: 'Team',
    points: 'Pts',
    played: 'P',
    wins: 'W',
    draws: 'D',
    losses: 'L',
    resultsHistory: 'Results History',
    startMatch: 'Start Match',
    addResult: 'Add Result',
    teamA: 'Team A',
    teamB: 'Team B',
    score: 'Score',
    goalsFor: 'GF',
    goalsAgainst: 'GA',
    goalDiff: 'GD',
    fieldPlayers: 'Field Players',
    goalkeepers: 'Goalkeepers',
    topScorers: 'Top Scorers',
    topAssists: 'Top Assists',
    mostMinutes: 'Most Minutes',
    logoUrl: 'Logo URL',
    addOpponent: 'Add Opponent',
    editOpponent: 'Edit Opponent'
  },
  pt: {
    dashboard: 'Início',
    matchTimer: 'Ao Vivo',
    competitions: 'Competições',
    roster: 'Plantel',
    clubSettings: 'Clube',
    admin: 'Admin',
    welcome: 'Central do Treinador',
    coach: 'Treinador',
    nextGame: 'Próximo Jogo',
    onPitch: 'Campo',
    bench: 'Suplentes',
    subIn: 'Entrar',
    save: 'Guardar',
    saved: 'Guardado!',
    calendar: 'Calendário',
    opponents: 'Adversários',
    classification: 'Classificação',
    addFixture: 'Adicionar Jogo',
    team: 'Equipa',
    points: 'Pts',
    played: 'J',
    wins: 'V',
    draws: 'E',
    losses: 'D',
    resultsHistory: 'Histórico',
    startMatch: 'Iniciar Jogo',
    addResult: 'Adicionar Resultado',
    teamA: 'Equipa A',
    teamB: 'Equipa B',
    score: 'Resultado',
    goalsFor: 'GM',
    goalsAgainst: 'GS',
    goalDiff: 'DG',
    fieldPlayers: 'Jogadores de Campo',
    goalkeepers: 'Guarda-Redes',
    topScorers: 'Melhores Marcadores',
    topAssists: 'Melhores Assistentes',
    mostMinutes: 'Mais Minutos',
    logoUrl: 'URL do Logótipo',
    addOpponent: 'Adicionar Adversário',
    editOpponent: 'Editar Adversário'
  },
  es: {
    dashboard: 'Inicio',
    matchTimer: 'En Vivo',
    competitions: 'Competiciones',
    roster: 'Plantilla',
    clubSettings: 'Club',
    admin: 'Admin',
    welcome: 'Centro del Entrenador',
    coach: 'Entrenador',
    nextGame: 'Próximo Partido',
    onPitch: 'Campo',
    bench: 'Banquillo',
    subIn: 'Entrar',
    save: 'Guardar Cambios',
    saved: '¡Guardado!',
    calendar: 'Calendario',
    opponents: 'Oponentes',
    classification: 'Clasificación',
    addFixture: 'Añadir Partido',
    team: 'Equipo',
    points: 'Pts',
    played: 'P',
    wins: 'V',
    draws: 'E',
    losses: 'D',
    resultsHistory: 'Historial',
    startMatch: 'Iniciar Partido',
    addResult: 'Añadir Resultado',
    teamA: 'Equipo A',
    teamB: 'Equipo B',
    score: 'Resultado',
    goalsFor: 'GF',
    goalsAgainst: 'GC',
    goalDiff: 'DG',
    fieldPlayers: 'Jugadores de Campo',
    goalkeepers: 'Porteros',
    topScorers: 'Máximos Goleadores',
    topAssists: 'Máximos Asistentes',
    mostMinutes: 'Más Minutos',
    logoUrl: 'URL del Logo',
    addOpponent: 'Añadir Oponente',
    editOpponent: 'Editar Oponente'
  },
  ar: {
    dashboard: 'الرئيسية',
    matchTimer: 'المباراة مباشرة',
    competitions: 'المنافسات',
    roster: 'القائمة',
    clubSettings: 'النادي',
    admin: 'المسؤول',
    welcome: 'مركز المدرب',
    coach: 'المدرب',
    nextGame: 'المباراة القادمة',
    onPitch: 'في الملعب',
    bench: 'الاحتياط',
    subIn: 'تبديل دخول',
    save: 'حفظ التغييرات',
    saved: 'تم الحفظ!',
    calendar: 'الجدول',
    opponents: 'الخصوم',
    classification: 'التصنيف',
    addFixture: 'إضافة مباراة',
    team: 'الفريق',
    points: 'نقاط',
    played: 'لعب',
    wins: 'فوز',
    draws: 'تعادل',
    losses: 'خسارة',
    resultsHistory: 'سجل النتائج',
    startMatch: 'بدء المباراة',
    addResult: 'إضافة نتيجة',
    teamA: 'الفريق أ',
    teamB: 'الفريق ب',
    score: 'النتيجة',
    goalsFor: 'له',
    goalsAgainst: 'عليه',
    goalDiff: 'الفارق',
    fieldPlayers: 'لاعبو الميدان',
    goalkeepers: 'حراس المرمى',
    topScorers: 'الهدافون',
    topAssists: 'صناع الأهداف',
    mostMinutes: 'أكثر الدقائق',
    logoUrl: 'رابط الشعار',
    addOpponent: 'إضافة خصم',
    editOpponent: 'تعديل خصم'
  }
};

type AppTab = 'home' | 'rotation' | 'competitions' | 'roster' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamData, setTeamData] = useState<TeamData>(INITIAL_TEAM_DATA);
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
    language: 'pt',
    currentOpponentName: 'Opponent'
  });
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [compSubTab, setCompSubTab] = useState<'opponents' | 'calendar' | 'classification'>('classification');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(INITIAL_COMPETITIONS[0].id);

  // Form states
  const [newResultTeamA, setNewResultTeamA] = useState('');
  const [newResultTeamB, setNewResultTeamB] = useState('');
  const [newResultScoreA, setNewResultScoreA] = useState(0);
  const [newResultScoreB, setNewResultScoreB] = useState(0);
  const [newResultDate, setNewResultDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'field' | 'goalkeeper'>('field');
  const [newOpponentName, setNewOpponentName] = useState('');
  const [newOpponentLogo, setNewOpponentLogo] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = TRANSLATIONS[match.language] || TRANSLATIONS['en'];
  const isRtl = match.language === 'ar';

  useEffect(() => {
    if (match.isRunning) {
      timerRef.current = setInterval(() => {
        setMatch(prev => ({ 
          ...prev, 
          elapsedTime: prev.elapsedTime + 1,
          possessionOur: prev.currentPossession === 'our' ? prev.possessionOur + 1 : prev.possessionOur,
          possessionTheir: prev.currentPossession === 'their' ? prev.possessionTheir + 1 : prev.possessionTheir,
        }));
        setPlayers(prev => prev.map(p => p.isActive ? { ...p, totalPlayTime: p.totalPlayTime + 1 } : p));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current!);
  }, [match.isRunning]);

  const triggerSaveFeedback = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const togglePlayerRole = (playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, role: p.role === 'goalkeeper' ? 'field' : 'goalkeeper' } : p
    ));
  };

  const startScheduledMatch = (fixture: Fixture) => {
    const comp = competitions.find(c => c.id === selectedCompId);
    const opp = comp?.opponents.find(o => o.id === fixture.opponentId);
    setMatch(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0,
      scoreOur: 0,
      scoreTheir: 0,
      events: [],
      currentOpponentName: opp?.name || 'Opponent'
    }));
    setActiveTab('rotation');
  };

  const resetMatch = () => {
    setMatch(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: 0,
      scoreOur: 0,
      scoreTheir: 0,
      events: []
    }));
  };

  const standings: StandingEntry[] = useMemo(() => {
    const comp = competitions.find(c => c.id === selectedCompId);
    if (!comp) return [];
    const stats: Record<string, StandingEntry> = {};
    const teams = [teamData.name, ...comp.opponents.map(o => o.name)];
    teams.forEach(name => {
      stats[name] = { teamName: name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });
    comp.results.forEach(res => {
      if (!stats[res.teamA] || !stats[res.teamB]) return;
      const teamA = stats[res.teamA];
      const teamB = stats[res.teamB];
      teamA.played += 1;
      teamB.played += 1;
      teamA.gf += res.scoreA;
      teamA.ga += res.scoreB;
      teamB.gf += res.scoreB;
      teamB.ga += res.scoreA;
      if (res.scoreA > res.scoreB) { teamA.won += 1; teamA.points += 3; teamB.lost += 1; }
      else if (res.scoreA < res.scoreB) { teamB.won += 1; teamB.points += 3; teamA.lost += 1; }
      else { teamA.drawn += 1; teamA.points += 1; teamB.drawn += 1; teamB.points += 1; }
    });
    return Object.values(stats).map(s => ({ ...s, gd: s.gf - s.ga }))
      .sort((a, b) => (b.points - a.points) || (b.gd - a.gd) || (b.gf - a.gf));
  }, [competitions, selectedCompId, teamData.name]);

  const addMatchResult = () => {
    if (!newResultTeamA || !newResultTeamB || newResultTeamA === newResultTeamB) return;
    const newResult: MatchResult = {
      id: Date.now().toString(),
      teamA: newResultTeamA,
      scoreA: newResultScoreA,
      teamB: newResultTeamB,
      scoreB: newResultScoreB,
      date: newResultDate
    };
    setCompetitions(prev => prev.map(c => 
      c.id === selectedCompId ? { ...c, results: [newResult, ...c.results] } : c
    ));
    setNewResultTeamA('');
    setNewResultTeamB('');
    setNewResultScoreA(0);
    setNewResultScoreB(0);
  };

  const deleteMatchResult = (id: string) => {
    setCompetitions(prev => prev.map(c => 
      c.id === selectedCompId ? { ...c, results: c.results.filter(r => r.id !== id) } : c
    ));
  };

  // Grouped players for stats
  const topScorers = [...players].sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 3);
  const topAssists = [...players].sort((a, b) => b.totalAssists - a.totalAssists).slice(0, 3);
  const topMinutes = [...players].sort((a, b) => b.totalPlayTime - a.totalPlayTime).slice(0, 3);

  // Grouped players for Roster tab
  const fieldPlayers = players.filter(p => p.role === 'field');
  const goalkeepers = players.filter(p => p.role === 'goalkeeper');

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-24 md:pb-0 transition-all ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Sidebar - Desktop */}
      <nav className={`hidden md:flex w-20 lg:w-64 bg-slate-900 border-slate-800 flex-col items-center py-4 px-4 sticky top-0 h-screen z-50 ${isRtl ? 'border-l' : 'border-r'}`}>
        <div className="lg:flex items-center gap-3 mb-8 w-full px-2 overflow-hidden">
          <img src={teamData.logoUrl} className="w-10 h-10 rounded-xl bg-slate-800 p-1 object-cover border border-slate-700" />
          <div className="hidden lg:flex flex-col truncate">
            <span className="font-black text-lg leading-none truncate">{teamData.name}</span>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest mt-1 uppercase truncate">{teamData.classification}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <NavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label={t.dashboard} isRtl={isRtl} />
          <NavItem active={activeTab === 'rotation'} onClick={() => setActiveTab('rotation')} icon={<Activity size={22} />} label={t.matchTimer} isRtl={isRtl} />
          <NavItem active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} icon={<UsersRound size={22} />} label={t.roster} isRtl={isRtl} />
          <NavItem active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} icon={<Trophy size={22} />} label={t.competitions} isRtl={isRtl} />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={22} />} label={t.clubSettings} isRtl={isRtl} />
        </div>

        <div className="mt-auto w-full border-t border-slate-800 pt-4">
          <button onClick={() => setIsAdmin(!isAdmin)} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isAdmin ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500'}`}>
            {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            <span className="hidden lg:inline text-sm font-bold">{t.admin}</span>
          </button>
        </div>
      </nav>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 flex justify-around items-center py-3 z-[100] px-1 h-20 backdrop-blur-md">
        <MobileNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label={t.dashboard} />
        <MobileNavItem active={activeTab === 'rotation'} onClick={() => setActiveTab('rotation')} icon={<Activity size={22} />} label={t.matchTimer} />
        <MobileNavItem active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} icon={<UsersRound size={22} />} label={t.roster} />
        <MobileNavItem active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')} icon={<Trophy size={22} />} label={t.competitions} />
        <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={22} />} label={t.clubSettings} />
      </nav>

      <div className="flex-1 flex flex-col overflow-y-auto w-full">
        <main className="max-w-6xl mx-auto w-full p-4 lg:p-8">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h1 className="text-4xl font-black">{t.welcome}, <span className="text-emerald-400">{t.coach}</span></h1>
                  <img src={teamData.logoUrl} className="w-12 h-12 md:hidden rounded-xl object-cover border border-slate-700" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Main Banner */}
                 <div className="lg:col-span-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl group flex flex-col justify-between min-h-[320px]">
                    <div className="relative z-10">
                       <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{t.nextGame}</span>
                       <h2 className="text-5xl font-black mt-6 tracking-tight">Próximo Desafio</h2>
                       <p className="text-white/70 text-lg mt-2 font-medium">Prepara a tua rotação estratégica.</p>
                    </div>
                    <div className="relative z-10">
                       <button onClick={() => setActiveTab('competitions')} className="flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-transform">
                         {t.calendar} <ChevronRight size={22} />
                       </button>
                    </div>
                    <CalendarDays className="absolute -bottom-10 -right-10 opacity-10 w-64 h-64 group-hover:scale-110 transition-transform duration-700" />
                 </div>

                 {/* Stats Board */}
                 <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                    <h3 className="font-black text-2xl flex items-center gap-3">
                       <Trophy className="text-amber-500" /> Leaders
                    </h3>
                    
                    {/* Top Scorer */}
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.topScorers}</p>
                       <div className="space-y-2">
                          {topScorers.map((p, i) => (
                             <div key={p.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>{i+1}</span>
                                   <span className="font-bold text-sm">{p.name}</span>
                                </div>
                                <span className="font-black text-emerald-400">{p.totalGoals}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Top Assists */}
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.topAssists}</p>
                       <div className="space-y-2">
                          {topAssists.map((p, i) => (
                             <div key={p.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${i === 0 ? 'bg-indigo-500/20 text-indigo-500' : 'bg-slate-800 text-slate-500'}`}>{i+1}</span>
                                   <span className="font-bold text-sm">{p.name}</span>
                                </div>
                                <span className="font-black text-indigo-400">{p.totalAssists}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Most Minutes */}
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.mostMinutes}</p>
                       <div className="space-y-2">
                          {topMinutes.map((p, i) => (
                             <div key={p.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${i === 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>{i+1}</span>
                                   <span className="font-bold text-sm">{p.name}</span>
                                </div>
                                <span className="font-black text-slate-400">{Math.floor(p.totalPlayTime / 60)}'</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* LIVE MATCH TAB */}
          {activeTab === 'rotation' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-12">
                     <div className="text-center">
                        <img src={teamData.logoUrl} className="w-12 h-12 mx-auto mb-3 rounded-lg object-cover border border-slate-700 opacity-50" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{teamData.name}</p>
                        <div className="flex items-center gap-4">
                           <button onClick={() => setMatch(p=>({...p, scoreOur: Math.max(0, p.scoreOur-1)}))} className="text-slate-600 hover:text-white"><Minus/></button>
                           <span className="text-7xl font-black">{match.scoreOur}</span>
                           <button onClick={() => setMatch(p=>({...p, scoreOur: p.scoreOur+1}))} className="text-emerald-500 hover:scale-110"><Plus/></button>
                        </div>
                     </div>
                     <span className="text-6xl font-thin text-slate-800">:</span>
                     <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                           <Shield className="text-slate-600" size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{match.currentOpponentName}</p>
                        <div className="flex items-center gap-4">
                           <button onClick={() => setMatch(p=>({...p, scoreTheir: p.scoreTheir+1}))} className="text-indigo-400 hover:scale-110"><Plus/></button>
                           <span className="text-7xl font-black">{match.scoreTheir}</span>
                           <button onClick={() => setMatch(p=>({...p, scoreTheir: Math.max(0, p.scoreTheir-1)}))} className="text-slate-600 hover:text-white"><Minus/></button>
                        </div>
                     </div>
                  </div>
                  <div className="text-center">
                     <div className="text-7xl font-mono font-black tabular-nums text-emerald-400 mb-4">
                       {Math.floor(match.elapsedTime / 60).toString().padStart(2, '0')}:{(match.elapsedTime % 60).toString().padStart(2, '0')}
                     </div>
                     <div className="flex justify-center gap-4">
                        <button onClick={() => setMatch(p=>({...p, isRunning: !p.isRunning}))} className={`p-4 rounded-full shadow-2xl transition-all ${match.isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950 hover:scale-105'}`}>
                           {match.isRunning ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor"/>}
                        </button>
                        <button onClick={resetMatch} className="p-4 bg-slate-800 rounded-full text-slate-400 border border-slate-700 hover:bg-slate-700">
                           <RotateCcw size={24}/>
                        </button>
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <h2 className="text-2xl font-black flex items-center gap-3"><Users className="text-emerald-400"/> {t.onPitch}</h2>
                     <div className="grid grid-cols-1 gap-4">
                        {players.filter(p => p.isActive).map(p => (
                           <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
                              <div className="flex items-center gap-4">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${p.role === 'goalkeeper' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'}`}>
                                   {p.role === 'goalkeeper' ? <Shield size={24}/> : p.name[0]}
                                 </div>
                                 <div>
                                   <span className="font-black text-xl block">{p.name}</span>
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${p.role === 'goalkeeper' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                     {p.role === 'goalkeeper' ? 'GK' : 'Field'}
                                   </span>
                                 </div>
                              </div>
                              <button onClick={() => setPlayers(prev => prev.map(pl => pl.id === p.id ? {...pl, isActive: false} : pl))} className="p-4 bg-slate-800 text-amber-500 rounded-2xl"><ArrowRightLeft/></button>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h2 className="text-2xl font-black flex items-center gap-3"><UsersRound className="text-amber-500"/> {t.bench}</h2>
                     <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-3 shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar">
                        {players.filter(p => !p.isActive).map(p => (
                           <div key={p.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${p.role === 'goalkeeper' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                  {p.role === 'goalkeeper' ? 'GK' : 'FLD'}
                                </div>
                                <span className="font-bold text-lg">{p.name}</span>
                              </div>
                              <button onClick={() => setPlayers(prev => prev.map(pl => pl.id === p.id ? {...pl, isActive: true} : pl))} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500">
                                {t.subIn}
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* ROSTER TAB */}
          {activeTab === 'roster' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h1 className="text-4xl font-black">{t.roster}</h1>
                  <button onClick={triggerSaveFeedback} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${saveStatus === 'saved' ? 'bg-emerald-500 text-slate-950 scale-105' : 'bg-slate-800 text-white'}`}>
                    {saveStatus === 'saved' ? <Check/> : <Save/>}
                    {saveStatus === 'saved' ? t.saved : t.save}
                  </button>
               </div>
               
               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-12">
                  {/* Goalkeepers Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-black flex items-center gap-2 text-amber-400">
                      <Shield size={24} /> {t.goalkeepers}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {goalkeepers.map(p => (
                          <div key={p.id} className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl flex flex-col gap-4 group hover:border-amber-500/40 transition-all">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                                      <Shield size={22}/>
                                   </div>
                                   <span className="font-black text-lg">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => togglePlayerRole(p.id)} className="p-2 text-slate-500 hover:text-white" title="Change to Field Player"><UserCircle size={18}/></button>
                                  <button onClick={() => setPlayers(players.filter(pl => pl.id !== p.id))} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <div className="flex-1 bg-slate-900/50 p-2 rounded-xl text-center">
                                   <span className="block text-[8px] uppercase text-slate-500 font-bold">Goals</span>
                                   <span className="font-black text-sm">{p.totalGoals}</span>
                                </div>
                                <div className="flex-1 bg-slate-900/50 p-2 rounded-xl text-center">
                                   <span className="block text-[8px] uppercase text-slate-500 font-bold">Assists</span>
                                   <span className="font-black text-sm">{p.totalAssists}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>

                  {/* Field Players Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-black flex items-center gap-2 text-emerald-400">
                      <Users size={24} /> {t.fieldPlayers}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {fieldPlayers.map(p => (
                          <div key={p.id} className="bg-slate-800/30 border border-slate-800 p-5 rounded-3xl flex flex-col gap-4 group hover:border-slate-600 transition-all">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-300">
                                      {p.name[0]}
                                   </div>
                                   <span className="font-black text-lg">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => togglePlayerRole(p.id)} className="p-2 text-slate-500 hover:text-amber-400" title="Change to Goalkeeper"><Shield size={18}/></button>
                                  <button onClick={() => setPlayers(players.filter(pl => pl.id !== p.id))} className="p-2 text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <div className="flex-1 bg-slate-900/50 p-2 rounded-xl text-center">
                                   <span className="block text-[8px] uppercase text-slate-500 font-bold">Goals</span>
                                   <span className="font-black text-sm">{p.totalGoals}</span>
                                </div>
                                <div className="flex-1 bg-slate-900/50 p-2 rounded-xl text-center">
                                   <span className="block text-[8px] uppercase text-slate-500 font-bold">Assists</span>
                                   <span className="font-black text-sm">{p.totalAssists}</span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>

                  {/* Add Player Control */}
                  <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row gap-4">
                     <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="New Player Name..." className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-base font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                     <select 
                        value={newPlayerRole} 
                        onChange={e => setNewPlayerRole(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-6 font-black uppercase text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                     >
                        <option value="field">Field Player</option>
                        <option value="goalkeeper">Goalkeeper</option>
                     </select>
                     <button onClick={() => { if(newPlayerName) { setPlayers([...players, { id: Date.now().toString(), name: newPlayerName, totalPlayTime: 0, isActive: false, lastSubbedAt: null, role: newPlayerRole, totalGoals: 0, totalAssists: 0 }]); setNewPlayerName(''); } }} className="p-4 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg hover:scale-105 transition-all"><Plus size={28}/></button>
                  </div>
               </div>
            </div>
          )}

          {/* COMPETITIONS TAB */}
          {activeTab === 'competitions' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center flex-wrap gap-4">
                  <h1 className="text-4xl font-black">{t.competitions}</h1>
                  <button onClick={triggerSaveFeedback} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${saveStatus === 'saved' ? 'bg-emerald-500 text-slate-950 scale-105' : 'bg-slate-800 text-white'}`}>
                    {saveStatus === 'saved' ? <Check/> : <Save/>}
                    {saveStatus === 'saved' ? t.saved : t.save}
                  </button>
               </div>

               <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-3xl w-max shadow-lg overflow-x-auto no-scrollbar max-w-full">
                  <button onClick={() => setCompSubTab('opponents')} className={`px-6 py-3 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all ${compSubTab === 'opponents' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>{t.opponents}</button>
                  <button onClick={() => setCompSubTab('calendar')} className={`px-6 py-3 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all ${compSubTab === 'calendar' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>{t.calendar}</button>
                  <button onClick={() => setCompSubTab('classification')} className={`px-6 py-3 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all ${compSubTab === 'classification' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>{t.classification}</button>
               </div>

               {compSubTab === 'opponents' && (
                 <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {competitions[0].opponents.map(opp => (
                         <div key={opp.id} className="bg-slate-800/40 p-6 rounded-3xl flex items-center justify-between border border-slate-800 group hover:border-slate-600 transition-all">
                            <div className="flex items-center gap-4">
                               {opp.logoUrl ? (
                                  <img src={opp.logoUrl} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                               ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-600"><Shield size={20}/></div>
                               )}
                               <span className="font-black text-xl">{opp.name}</span>
                            </div>
                            <button className="text-slate-600 hover:text-red-500" onClick={() => {
                               setCompetitions(prev => prev.map(c => c.id === selectedCompId ? { ...c, opponents: c.opponents.filter(o => o.id !== opp.id) } : c));
                            }}><Trash2 size={18}/></button>
                         </div>
                       ))}
                    </div>
                    <div className="mt-8 p-6 bg-slate-950 rounded-3xl border border-slate-800 space-y-4">
                       <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">{t.addOpponent}</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2"><UserCircle size={12}/> Name</label>
                             <input value={newOpponentName} onChange={e => setNewOpponentName(e.target.value)} placeholder="Team Name..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-500" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2"><LinkIcon size={12}/> Logo URL</label>
                             <input value={newOpponentLogo} onChange={e => setNewOpponentLogo(e.target.value)} placeholder="https://..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-500" />
                          </div>
                       </div>
                       <button onClick={() => {
                          if(newOpponentName) {
                             setCompetitions(prev => prev.map(c => c.id === selectedCompId ? { ...c, opponents: [...c.opponents, { id: Date.now().toString(), name: newOpponentName, logoUrl: newOpponentLogo, strength: 'medium' }] } : c));
                             setNewOpponentName('');
                             setNewOpponentLogo('');
                          }
                       }} className="w-full p-4 bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                          <Plus size={20}/> {t.addOpponent}
                       </button>
                    </div>
                 </div>
               )}

               {compSubTab === 'calendar' && (
                 <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                    <div className="space-y-4">
                       {competitions[0].calendar.map(fixture => {
                         const opp = competitions[0].opponents.find(o => o.id === fixture.opponentId);
                         return (
                           <div key={fixture.id} className="bg-slate-800/40 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 group hover:border-slate-600 transition-all">
                              <div className="flex items-center gap-6">
                                 {opp?.logoUrl ? (
                                    <img src={opp.logoUrl} className="w-14 h-14 rounded-2xl object-cover border border-slate-700" />
                                 ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-500"><Shield size={32}/></div>
                                 )}
                                 <div>
                                    <p className="font-black text-2xl">Vs. {opp?.name}</p>
                                    <p className="text-slate-500 font-bold">{fixture.venue}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <span className="font-mono text-xl font-bold text-white bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">{fixture.date}</span>
                                 <button onClick={() => startScheduledMatch(fixture)} className="p-4 bg-emerald-500 text-slate-950 rounded-xl hover:scale-105 transition-transform"><Play/></button>
                                 <button className="text-slate-600 hover:text-red-500" onClick={() => {
                                    setCompetitions(prev => prev.map(c => c.id === selectedCompId ? { ...c, calendar: c.calendar.filter(f => f.id !== fixture.id) } : c));
                                 }}><Trash2 size={18}/></button>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
               )}

               {compSubTab === 'classification' && (
                 <div className="space-y-8 animate-in zoom-in-95">
                    {/* Standings Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-x-auto">
                       <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><ListOrdered className="text-emerald-400" /> {t.classification}</h2>
                       <table className="w-full text-left">
                          <thead>
                             <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                                <th className="pb-4 pr-4">#</th>
                                <th className="pb-4">{t.team}</th>
                                <th className="pb-4 text-center">{t.played}</th>
                                <th className="pb-4 text-center">{t.wins}</th>
                                <th className="pb-4 text-center">{t.draws}</th>
                                <th className="pb-4 text-center">{t.losses}</th>
                                <th className="pb-4 text-center">{t.goalsFor}</th>
                                <th className="pb-4 text-center">{t.goalsAgainst}</th>
                                <th className="pb-4 text-center">{t.goalDiff}</th>
                                <th className="pb-4 text-center text-emerald-400">{t.points}</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                             {standings.map((row, idx) => {
                                const opp = competitions[0].opponents.find(o => o.name === row.teamName);
                                return (
                                 <tr key={row.teamName} className={`group ${row.teamName === teamData.name ? 'bg-emerald-500/5' : ''}`}>
                                    <td className="py-4 pr-4 font-mono font-bold text-slate-500">{idx+1}</td>
                                    <td className={`py-4 flex items-center gap-3 font-black ${row.teamName === teamData.name ? 'text-emerald-400' : ''}`}>
                                       {row.teamName === teamData.name ? (
                                          <img src={teamData.logoUrl} className="w-8 h-8 rounded-lg object-cover" />
                                       ) : opp?.logoUrl ? (
                                          <img src={opp.logoUrl} className="w-8 h-8 rounded-lg object-cover" />
                                       ) : (
                                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 text-[10px]"><Shield size={14}/></div>
                                       )}
                                       {row.teamName}
                                    </td>
                                    <td className="py-4 text-center font-mono">{row.played}</td>
                                    <td className="py-4 text-center font-mono">{row.won}</td>
                                    <td className="py-4 text-center font-mono">{row.drawn}</td>
                                    <td className="py-4 text-center font-mono">{row.lost}</td>
                                    <td className="py-4 text-center font-mono text-slate-400">{row.gf}</td>
                                    <td className="py-4 text-center font-mono text-slate-400">{row.ga}</td>
                                    <td className={`py-4 text-center font-mono font-bold ${row.gd > 0 ? 'text-emerald-500' : row.gd < 0 ? 'text-red-500' : ''}`}>
                                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                                    </td>
                                    <td className="py-4 text-center font-mono font-black text-emerald-400">{row.points}</td>
                                 </tr>
                               );
                             })}
                          </tbody>
                       </table>
                    </div>

                    {/* Add Match Results Form */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                       <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Plus className="text-indigo-400" /> {t.addResult}</h2>
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          <div className="md:col-span-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">{t.teamA}</label>
                             <select value={newResultTeamA} onChange={e => setNewResultTeamA(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold">
                                <option value="">Select...</option>
                                <option value={teamData.name}>{teamData.name} (Nós)</option>
                                {competitions[0].opponents.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                             </select>
                          </div>
                          <div className="md:col-span-1">
                             <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">{t.score}</label>
                             <input type="number" value={newResultScoreA} onChange={e => setNewResultScoreA(parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-black" />
                          </div>
                          <div className="md:col-span-1 text-center text-slate-700 pb-3 font-black">VS</div>
                          <div className="md:col-span-1">
                             <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">{t.score}</label>
                             <input type="number" value={newResultScoreB} onChange={e => setNewResultScoreB(parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-black" />
                          </div>
                          <div className="md:col-span-3">
                             <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">{t.teamB}</label>
                             <select value={newResultTeamB} onChange={e => setNewResultTeamB(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold">
                                <option value="">Select...</option>
                                <option value={teamData.name}>{teamData.name} (Nós)</option>
                                {competitions[0].opponents.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                             </select>
                          </div>
                          <div className="md:col-span-2">
                             <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Date</label>
                             <input type="date" value={newResultDate} onChange={e => setNewResultDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
                          </div>
                          <div className="md:col-span-1">
                             <button onClick={addMatchResult} className="w-full bg-emerald-500 text-slate-950 rounded-xl p-3 flex items-center justify-center hover:scale-105 transition-transform"><Plus/></button>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <h1 className="text-4xl font-black">{t.clubSettings}</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                     <h2 className="text-xl font-black flex items-center gap-2 mb-4"><Shield className="text-emerald-400" /> Profile Details</h2>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Team Name</label>
                           <input value={teamData.name} onChange={e => setTeamData({...teamData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Division / Status</label>
                           <input value={teamData.classification} onChange={e => setTeamData({...teamData, classification: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-500 ml-1">{t.logoUrl}</label>
                           <div className="flex gap-4">
                              <input value={teamData.logoUrl} onChange={e => setTeamData({...teamData, logoUrl: e.target.value})} className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-500" />
                              <img src={teamData.logoUrl} className="w-14 h-14 rounded-2xl object-cover border border-slate-800" />
                           </div>
                        </div>
                        <button onClick={triggerSaveFeedback} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl mt-4 shadow-lg hover:bg-emerald-400 transition-colors">{t.save}</button>
                     </div>
                  </section>
                  <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                     <h2 className="text-xl font-black flex items-center gap-2 mb-4"><Languages className="text-indigo-400" /> Language</h2>
                     <div className="grid grid-cols-2 gap-3">
                        {(['en', 'pt', 'es', 'ar'] as Language[]).map(lang => (
                           <button key={lang} onClick={() => setMatch(prev => ({...prev, language: lang}))} className={`p-4 rounded-2xl border font-bold text-xs uppercase ${match.language === lang ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                              {lang === 'pt' ? 'Português' : lang === 'es' ? 'Español' : lang === 'ar' ? 'العربية' : 'English'}
                           </button>
                        ))}
                     </div>
                  </section>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isRtl: boolean }> = ({ active, onClick, icon, label, isRtl }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${isRtl ? 'flex-row-reverse' : 'flex-row'} ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-slate-500 hover:bg-slate-800/50'}`}>
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <span className="hidden lg:inline font-black text-xs uppercase tracking-widest truncate">{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
    <div className={`${active ? 'scale-125 -translate-y-1' : 'scale-100'} transition-all duration-300`}>{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{label}</span>
  </button>
);

export default App;
