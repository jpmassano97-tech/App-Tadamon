
export interface Player {
  id: string;
  name: string;
  totalPlayTime: number; // in seconds
  isActive: boolean;
  lastSubbedAt: number | null; // timestamp in ms
  role: 'field' | 'goalkeeper';
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
}

export interface MatchInfo {
  opponent: string;
  scoreOur: number;
  scoreTheir: number;
  date: string;
  youtubeId?: string;
  venue: string;
  description?: string;
}

export interface TeamData {
  name: string;
  logoUrl: string;
  classification: string;
}

export interface Opponent {
  id: string;
  name: string;
  strength: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface Competition {
  id: string;
  name: string;
  opponents: Opponent[];
}
