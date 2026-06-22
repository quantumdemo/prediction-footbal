'use client';

import { useState, useEffect } from 'react';
import MatchSearch from '@/components/MatchSearch';
import PredictionLoading from '@/components/PredictionLoading';
import PredictionResults from '@/components/PredictionResults';
import ApiKeyModal from '@/components/ApiKeyModal';
import { searchTeam, getFixtures, getStandings, getH2H, getTeamInjuries, getTeamLeagues } from '@/lib/api';
import { calculatePrediction } from '@/lib/predictor';
import { MatchData, PredictionResult } from '@/types/football';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('rapidapi_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!apiKey) return;

    setIsLoading(true);
    setLoadingStep(0);
    setError(null);
    setMatchData(null);
    setPrediction(null);

    try {
      // 1. Resolve teams
      const [teamAQuery, teamBQuery] = query.split(/ vs | VS | vs. | v /i);
      if (!teamAQuery || !teamBQuery) {
        throw new Error('Please enter matches in "Team A vs Team B" format.');
      }

      const teamAResults = await searchTeam(teamAQuery.trim(), apiKey);
      setLoadingStep(1);
      const teamBResults = await searchTeam(teamBQuery.trim(), apiKey);

      if (teamAResults.length === 0 || teamBResults.length === 0) {
        throw new Error('One or both teams could not be found.');
      }

      const homeTeam = teamAResults[0].team;
      const awayTeam = teamBResults[0].team;

      // 2. Get Fixtures & League
      setLoadingStep(2);
      const [fixtures, leagues] = await Promise.all([
        getFixtures(homeTeam.id, awayTeam.id, apiKey),
        getTeamLeagues(homeTeam.id, apiKey)
      ]);

      const fixture = fixtures[0] || {
        id: 0,
        date: new Date().toISOString(),
        league: leagues[0]?.league || { id: 39, name: 'Premier League', logo: '' },
        teams: { home: homeTeam, away: awayTeam }
      };

      const leagueId = fixture.league?.id || leagues[0]?.league?.id || 39;
      const season = leagues[0]?.seasons?.[0]?.year || new Date().getFullYear() - 1;

      // 3. Get Standings
      setLoadingStep(3);
      const standingsData = await getStandings(leagueId, season, apiKey);
      const leagueStandings = standingsData[0]?.league?.standings[0] || [];

      const homeStanding = leagueStandings.find((s: any) => s.team.id === homeTeam.id) || {
        rank: 10, points: 0, form: 'DDDDD', all: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } }
      };
      const awayStanding = leagueStandings.find((s: any) => s.team.id === awayTeam.id) || {
        rank: 11, points: 0, form: 'DDDDD', all: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } }
      };

      // 4. Form & H2H
      setLoadingStep(4);
      const h2hData = await getH2H(homeTeam.id, awayTeam.id, apiKey);

      // 5. Injuries
      setLoadingStep(5);
      const homeInjuries = await getTeamInjuries(homeTeam.id, leagueId, season, apiKey);
      const awayInjuries = await getTeamInjuries(awayTeam.id, leagueId, season, apiKey);

      // 6. Calculate
      setLoadingStep(6);
      const fullMatchData: MatchData = {
        homeTeam,
        awayTeam,
        fixture,
        homeStanding,
        awayStanding,
        h2h: h2hData,
        homeInjuries,
        awayInjuries
      };

      const result = calculatePrediction(fullMatchData);

      // Artificial delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 800));

      setMatchData(fullMatchData);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <ApiKeyModal onKeySubmit={setApiKey} />

      {/* Header */}
      <header className="text-center mb-16 space-y-4">
        <div className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
          <span className="text-accent text-xs font-bold tracking-widest uppercase">PredictIQ v1.0</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
          Predict<span className="text-accent">IQ</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-medium">
          Real-time football intelligence. One prediction at a time.
        </p>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        <MatchSearch onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-center text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <PredictionLoading step={loadingStep} />
        ) : (
          prediction && matchData && (
            <PredictionResults data={matchData} prediction={prediction} />
          )
        )}
      </div>

      {/* Decorative elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
    </main>
  );
}
