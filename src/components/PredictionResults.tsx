'use client';

import { MatchData, PredictionResult } from '../types/football';

interface PredictionResultsProps {
  data: MatchData;
  prediction: PredictionResult;
}

export default function PredictionResults({ data, prediction }: PredictionResultsProps) {
  const renderForm = (form: string) => {
    return form.split('').map((res, i) => {
      let color = 'bg-gray-500';
      if (res === 'W') color = 'bg-green-500';
      if (res === 'L') color = 'bg-red-500';
      if (res === 'D') color = 'bg-yellow-500';
      return (
        <span key={i} className={`w-3 h-3 rounded-full ${color}`} title={res}></span>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Prediction Card */}
      <div className="bg-card-bg border-2 border-accent/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,255,135,0.1)]">
        <div className="p-8 md:p-12 text-center bg-gradient-to-b from-accent/5 to-transparent">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 bg-white/5 rounded-2xl p-4 flex items-center justify-center">
                {data.homeTeam.logo && (
                  <img src={data.homeTeam.logo} alt={data.homeTeam.name} className="max-w-full max-h-full object-contain" />
                )}
              </div>
              <h3 className="text-xl font-bold">{data.homeTeam.name}</h3>
            </div>

            <div className="px-4 text-gray-500 font-black text-2xl italic">VS</div>

            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 bg-white/5 rounded-2xl p-4 flex items-center justify-center">
                {data.awayTeam.logo && (
                  <img src={data.awayTeam.logo} alt={data.awayTeam.name} className="max-w-full max-h-full object-contain" />
                )}
              </div>
              <h3 className="text-xl font-bold">{data.awayTeam.name}</h3>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <p className="text-accent font-bold tracking-widest uppercase text-sm">Recommended Prediction</p>
            <h2 className="text-5xl md:text-6xl font-black text-white">{prediction.outcome}</h2>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm mb-2 px-1">
              <span className="text-gray-400 font-medium">Confidence Level</span>
              <span className="text-accent font-bold">{prediction.confidence}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,255,135,0.5)]"
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto italic">
            "{prediction.reasoning}"
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Form */}
        <div className="bg-card-bg border border-border-custom rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-4 border-b border-border-custom pb-2">Recent Form</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{data.homeTeam.name}</span>
              <div className="flex gap-2">
                {renderForm(data.homeStanding.form || 'DDDDD')}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{data.awayTeam.name}</span>
              <div className="flex gap-2">
                {renderForm(data.awayStanding.form || 'DDDDD')}
              </div>
            </div>
          </div>
        </div>

        {/* Standings */}
        <div className="bg-card-bg border border-border-custom rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-4 border-b border-border-custom pb-2">League Standing</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{data.homeTeam.name}</span>
              <span className="font-bold">Pos: {data.homeStanding.rank} ({data.homeStanding.points} pts)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{data.awayTeam.name}</span>
              <span className="font-bold">Pos: {data.awayStanding.rank} ({data.awayStanding.points} pts)</span>
            </div>
          </div>
        </div>

        {/* Head-to-Head */}
        <div className="bg-card-bg border border-border-custom rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-4 border-b border-border-custom pb-2">Head-to-Head (Last {data.h2h.length})</h4>
          <div className="space-y-3">
            {data.h2h.slice(0, 3).map((match, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                <span className="text-gray-400">{new Date(match.fixture.date).toLocaleDateString()}</span>
                <span className="font-medium">
                  {match.goals.home} - {match.goals.away}
                </span>
              </div>
            ))}
            {data.h2h.length === 0 && <p className="text-sm text-gray-500 italic">No recent matchups found.</p>}
          </div>
        </div>

        {/* Injuries */}
        <div className="bg-card-bg border border-border-custom rounded-2xl p-6">
          <h4 className="text-lg font-bold mb-4 border-b border-border-custom pb-2">Availability</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">{data.homeTeam.name}</p>
              <p className="text-sm">
                {data.homeInjuries.length > 0
                  ? `${data.homeInjuries.length} players sidelined`
                  : 'Full squad available'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">{data.awayTeam.name}</p>
              <p className="text-sm">
                {data.awayInjuries.length > 0
                  ? `${data.awayInjuries.length} players sidelined`
                  : 'Full squad available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
