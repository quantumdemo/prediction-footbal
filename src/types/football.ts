export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Fixture {
  id: number;
  date: string;
  league: {
    id: number;
    name: string;
    logo: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface H2H {
  teams: {
    home: Team;
    away: Team;
  };
  fixture: {
    id: number;
    date: string;
  };
  goals: {
    home: number;
    away: number;
  };
}

export interface Injury {
  player: {
    id: number;
    name: string;
    photo: string;
    type: string;
    reason: string;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
}

export interface TeamStats {
  goalsScored: number;
  goalsConceded: number;
  bigChances: number;
  bigChancesCreated: number;
  shotsOnTarget: number;
  averageBallPossession: number;
  corners: number;
}

export interface MatchData {
  homeTeam: Team;
  awayTeam: Team;
  fixture: Fixture;
  homeStanding: Standing;
  awayStanding: Standing;
  homeStandingHome: Standing;
  awayStandingAway: Standing;
  h2h: H2H[];
  homeInjuries: Injury[];
  awayInjuries: Injury[];
  homeStats?: TeamStats;
  awayStats?: TeamStats;
}

export type PredictionOutcome = 'Home Win' | 'Away Win' | 'Draw' | 'Home or Draw (1X)' | 'Draw or Away (X2)' | 'Home or Away (12)';

export interface PredictionResult {
  outcome: PredictionOutcome;
  confidence: number;
  reasoning: string;
  scores: {
    home: number;
    away: number;
  };
}
