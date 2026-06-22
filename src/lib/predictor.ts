import { MatchData, PredictionOutcome, PredictionResult } from '../types/football';

export function calculatePrediction(data: MatchData): PredictionResult {
  let homeScore = 0;
  let awayScore = 0;

  const reasoning: string[] = [];

  // 1. Contextual League Standing (Home vs Away performance) - 15%
  const homeHomePointsPerMatch = data.homeStandingHome.points / (data.homeStandingHome.all.played || 1);
  const awayAwayPointsPerMatch = data.awayStandingAway.points / (data.awayStandingAway.all.played || 1);

  homeScore += homeHomePointsPerMatch * 10;
  awayScore += awayAwayPointsPerMatch * 10;

  if (homeHomePointsPerMatch > awayAwayPointsPerMatch + 0.5) {
    reasoning.push(`${data.homeTeam.name} has a significantly stronger home record than ${data.awayTeam.name}'s away form.`);
  } else if (awayAwayPointsPerMatch > homeHomePointsPerMatch + 0.5) {
    reasoning.push(`${data.awayTeam.name} is exceptionally dangerous on the road.`);
  }

  // 2. Recent Form (Momentum) - 25%
  const calculateFormPoints = (form: string) => {
    let points = 0;
    const last5 = form.slice(-5).split('');
    last5.forEach((char, index) => {
      const recencyMultiplier = (index + 1) / 5;
      if (char === 'W') points += 5 * recencyMultiplier;
      if (char === 'D') points += 2 * recencyMultiplier;
    });
    return points;
  };

  const homeFormPoints = calculateFormPoints(data.homeStanding.form || 'DDDDD');
  const awayFormPoints = calculateFormPoints(data.awayStanding.form || 'DDDDD');

  homeScore += (homeFormPoints / 9) * 25;
  awayScore += (awayFormPoints / 9) * 25;

  if (homeFormPoints > awayFormPoints + 2) {
    reasoning.push(`${data.homeTeam.name} enters this match with superior momentum.`);
  }

  // 3. Head-to-Head (Psychological edge) - 15%
  let homeH2HWins = 0;
  let awayH2HWins = 0;

  data.h2h.slice(0, 5).forEach((match, index) => {
    const recencyWeight = (5 - index) / 5;
    const homeWon = match.goals.home > match.goals.away;
    const awayWon = match.goals.away > match.goals.home;

    if (homeWon) {
        if (match.teams.home.id === data.homeTeam.id) homeH2HWins += 3 * recencyWeight;
        else if (match.teams.home.id === data.awayTeam.id) awayH2HWins += 3 * recencyWeight;
    } else if (awayWon) {
        if (match.teams.away.id === data.homeTeam.id) homeH2HWins += 3 * recencyWeight;
        else if (match.teams.away.id === data.awayTeam.id) awayH2HWins += 3 * recencyWeight;
    }
  });

  homeScore += (homeH2HWins / 15) * 15;
  awayScore += (awayH2HWins / 15) * 15;

  // 4. Efficiency Stats (xG, Big Chances, Defensive Solidity) - 30%
  if (data.homeStats && data.awayStats) {
    const homeEfficiency = (data.homeStats.bigChancesCreated / (data.homeStanding.all.played || 1)) * 5;
    const awayEfficiency = (data.awayStats.bigChancesCreated / (data.awayStanding.all.played || 1)) * 5;

    const homeDefensive = (1 - (data.homeStats.goalsConceded / (data.homeStats.goalsScored + data.homeStats.goalsConceded || 1))) * 15;
    const awayDefensive = (1 - (data.awayStats.goalsConceded / (data.awayStats.goalsScored + data.awayStats.goalsConceded || 1))) * 15;

    homeScore += homeEfficiency + homeDefensive;
    awayScore += awayEfficiency + awayDefensive;

    if (homeEfficiency > awayEfficiency + 2) {
      reasoning.push(`${data.homeTeam.name} is creating higher quality scoring opportunities.`);
    }
  }

  // 5. Availability & Injuries - 15%
  const homeAvailability = Math.max(0, 15 - (data.homeInjuries.length * 3));
  const awayAvailability = Math.max(0, 15 - (data.awayInjuries.length * 3));
  homeScore += homeAvailability;
  awayScore += awayAvailability;

  // Final outcome logic
  let outcome: PredictionOutcome;
  const diff = homeScore - awayScore;

  if (diff > 12) outcome = 'Home Win';
  else if (diff < -12) outcome = 'Away Win';
  else if (diff > 4) outcome = 'Home or Draw (1X)';
  else if (diff < -4) outcome = 'Draw or Away (X2)';
  else outcome = 'Draw';

  const baseConfidence = 50;
  const spread = Math.abs(diff);
  const confidence = Math.min(92, Math.max(45, baseConfidence + spread * 2));

  return {
    outcome,
    confidence: Math.round(confidence),
    reasoning: reasoning.length > 0 ? reasoning.join(' ') : "A closely contested match with balanced statistical indicators.",
    scores: {
      home: Math.round(homeScore),
      away: Math.round(awayScore)
    }
  };
}
