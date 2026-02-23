
export interface Player {
  id: string;
  name: string;
  totalPlayTime: number; // in seconds
  isActive: boolean;
  lastSubbedAt: number | null; // Match elapsedTime when they entered the pitch
  role: 'field' | 'goalkeeper';
  totalGoals: number;
  totalAssists: number;
}

export interface Squad {
  id: string;
  name: string;
  playerIds: string[];
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'substitution';
  minute: number;
  description: string;
  playerInId?: string;
  playerOutId?: string;
  scorerId?: string;
  assistantId?: string;
  isOpponent?: boolean;
}

export type Language = 'en' | 'es' | 'pt' | 'ar';
export type CompetitionType = 'league' | 'tournament';
export type MatchDurationMode = 'fixed' | 'indefinite';

export interface Fixture {
  id: string;
  competitionId: string;
  opponentId: string;
  date: string;
  time: string;
  venue: string;
  isCompleted: boolean;
}

export interface StandingEntry {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; 
  ga: number; 
  gd: number; 
  points: number;
}

export interface ScorerEntry {
  name: string;
  goals: number;
  playerId?: string;
}

export interface MatchResult {
  id: string;
  fixtureId?: string;
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  date: string;
  stage?: string; // e.g., 'Final', 'Semi-Final', 'Quarter-Final'
  scorersA?: ScorerEntry[];
  scorersB?: ScorerEntry[];
  events?: MatchEvent[];
}

export interface MatchState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  halfDuration: number; // in seconds
  currentHalf: 1 | 2;
  durationMode: MatchDurationMode;
  startTime: number | null; 
  scoreOur: number;
  scoreTheir: number;
  events: MatchEvent[];
  language: Language;
  currentOpponentName: string;
  currentFixtureId?: string;
  selectedSquadId?: string;
  isFinished: boolean;
}

export interface TeamData {
  name: string;
  logoUrl: string;
  classification: string;
  ownerName: string;
  ownerEmail: string;
}

export interface Opponent {
  id: string;
  name: string;
  logoUrl?: string;
  strength: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  opponents: Opponent[];
  results: MatchResult[];
  hasPlayoffs?: boolean;
}

export interface SyncState {
  syncId: string | null;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  status: 'offline' | 'online' | 'error';
}

export interface AppState {
  teamData: TeamData;
  players: Player[];
  squads: Squad[];
  competitions: Competition[];
  fixtures: Fixture[];
  match: MatchState;
}
