import { MatchData, PredictionOutcome, PredictionResult } from '../types/football';

export function calculatePrediction(data: MatchData): PredictionResult {
  let homeScore = 0;
  let awayScore = 0;

  const reasoning: string[] = [];

  // 1. Home advantage (10%) - base 10 points
  homeScore += 10;
  reasoning.push(`${data.homeTeam.name} has the home advantage.`);

  // 2. Recent form (25%) - max 25 points
  const homeForm = data.homeStanding.form || 'DDDDD';
  const awayForm = data.awayStanding.form || 'DDDDD';

  const calculateFormPoints = (form: string) => {
    let points = 0;
    const last5 = form.slice(-5).split('');
    last5.forEach(char => {
      if (char === 'W') points += 5;
      if (char === 'D') points += 2;
    });
    return points;
  };

  const homeFormPoints = calculateFormPoints(homeForm);
  const awayFormPoints = calculateFormPoints(awayForm);
  homeScore += homeFormPoints;
  awayScore += awayFormPoints;

  if (homeFormPoints > awayFormPoints) {
    reasoning.push(`${data.homeTeam.name} has better recent form than ${data.awayTeam.name}.`);
  } else if (awayFormPoints > homeFormPoints) {
    reasoning.push(`${data.awayTeam.name} is in better form lately.`);
  }

  // 3. Head-to-head record (20%) - max 20 points
  let homeH2HWins = 0;
  let awayH2HWins = 0;
  data.h2h.slice(0, 5).forEach(match => {
    if (match.goals.home > match.goals.away) homeH2HWins++;
    else if (match.goals.away > match.goals.home) awayH2HWins++;
  });

  homeScore += (homeH2HWins * 4);
  awayScore += (awayH2HWins * 4);

  if (homeH2HWins > awayH2HWins) {
    reasoning.push(`${data.homeTeam.name} has historically performed better in this head-to-head matchup.`);
  }

  // 4. Goals scored/conceded ratio (20%) - max 20 points
  const homeGoalRatio = data.homeStanding.all.goals.for / (data.homeStanding.all.goals.against || 1);
  const awayGoalRatio = data.awayStanding.all.goals.for / (data.awayStanding.all.goals.against || 1);

  const homeGoalPoints = Math.min(20, homeGoalRatio * 5);
  const awayGoalPoints = Math.min(20, awayGoalRatio * 5);
  homeScore += homeGoalPoints;
  awayScore += awayGoalPoints;

  // 5. Injury impact (15%) - max 15 points
  // Start with 15 and subtract for each injury
  let homeInjuryPenalty = Math.min(15, data.homeInjuries.length * 3);
  let awayInjuryPenalty = Math.min(15, data.awayInjuries.length * 3);

  homeScore += (15 - homeInjuryPenalty);
  awayScore += (15 - awayInjuryPenalty);

  if (data.homeInjuries.length > data.awayInjuries.length + 2) {
    reasoning.push(`${data.homeTeam.name} is missing several key players due to injury.`);
  } else if (data.awayInjuries.length > data.homeInjuries.length + 2) {
    reasoning.push(`${data.awayTeam.name} has significant injury concerns.`);
  }

  // 6. League position difference (10%) - max 10 points
  const totalTeams = 20; // Assume 20 for normalization
  const homePosPoints = ((totalTeams - data.homeStanding.rank) / totalTeams) * 10;
  const awayPosPoints = ((totalTeams - data.awayStanding.rank) / totalTeams) * 10;

  homeScore += homePosPoints;
  awayScore += awayPosPoints;

  // Final outcome logic
  let outcome: PredictionOutcome;
  const diff = homeScore - awayScore;

  if (diff > 15) outcome = 'Home Win';
  else if (diff < -15) outcome = 'Away Win';
  else if (diff > 5) outcome = 'Home or Draw (1X)';
  else if (diff < -5) outcome = 'Draw or Away (X2)';
  else if (Math.abs(diff) <= 5) outcome = 'Draw';
  else outcome = 'Home or Away (12)';

  // Confidence calculation (0-100)
  const confidence = Math.min(95, Math.max(50, 50 + Math.abs(diff)));

  return {
    outcome,
    confidence: Math.round(confidence),
    reasoning: reasoning.join(' '),
    scores: {
      home: Math.round(homeScore),
      away: Math.round(awayScore)
    }
  };
}
