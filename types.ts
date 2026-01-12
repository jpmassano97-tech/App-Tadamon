
export interface Player {
  id: string;
  name: string;
  totalPlayTime: number; // in seconds
  isActive: boolean;
  lastSubbedAt: number | null; // timestamp in ms
  role: 'field' | 'goalkeeper';
  totalGoals: number;
  totalAssists: number;
}

export interface MatchEvent {
  id: string;
  type: 'goal';
  minute: number;
  scorerId: string;
  assistantId?: string;
  isOpponent: boolean;
}

export type Language = 'en' | 'es' | 'pt' | 'ar';

export interface Fixture {
  id: string;
  opponentId: string;
  date: string;
  venue: string;
}

export interface StandingEntry {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
}

export interface MatchResult {
  id: string;
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  date: string;
}

export interface MatchState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  startTime: number | null; // timestamp in ms
  possessionOur: number; // in seconds
  possessionTheir: number; // in seconds
  currentPossession: 'our' | 'their' | null;
  timeWithoutGK: number; // in seconds
  scoreOur: number;
  scoreTheir: number;
  shotsOnGoalOur: number;
  shotsOffGoalOur: number;
  shotsOnGoalTheir: number;
  shotsOffGoalTheir: number;
  events: MatchEvent[];
  language: Language;
  currentOpponentName: string;
}

export interface TeamData {
  name: string;
  logoUrl: string;
  classification: string;
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
  opponents: Opponent[];
  calendar: Fixture[];
  results: MatchResult[];
}
