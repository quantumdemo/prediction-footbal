async function fetchFootballData(endpoint: string, apiKey?: string, params: Record<string, string> = {}) {
  const url = new URL('/api/football', window.location.origin);
  url.searchParams.append('endpoint', endpoint);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const headers: Record<string, string> = {};
  if (apiKey && apiKey !== 'ENV_KEY') {
    headers['x-rapidapi-key'] = apiKey;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('API Key error: Please ensure you are subscribed to the FREE tier of SofaScore on RapidAPI.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded: The application has reached its daily limit.');
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.message && (data.message.includes('API key') || data.message.includes('not subscribed'))) {
      throw new Error('Invalid API Key: Please check your RapidAPI key and subscription.');
  }

  return data;
}

export async function searchTeam(name: string, apiKey?: string) {
  const data = await fetchFootballData('teams/search', apiKey, { name });
  return (data.teams || []).map((t: any) => ({
    team: {
      id: t.id,
      name: t.name,
      logo: `https://api.sofascore.app/api/v1/team/${t.id}/image`
    }
  }));
}

export async function getFixtures(homeId: number, awayId: number, apiKey?: string) {
  const data = await fetchFootballData('teams/get-next-matches', apiKey, { teamId: homeId.toString() });
  const events = data.events || [];

  return events
    .filter((f: any) =>
      (f.homeTeam.id === homeId && f.awayTeam.id === awayId) ||
      (f.homeTeam.id === awayId && f.awayTeam.id === homeId)
    )
    .map((f: any) => ({
      id: f.id,
      date: new Date(f.startTimestamp * 1000).toISOString(),
      league: {
        id: f.uniqueTournament?.id || 0,
        name: f.uniqueTournament?.name || 'Unknown',
        logo: f.uniqueTournament?.id ? `https://api.sofascore.app/api/v1/unique-tournament/${f.uniqueTournament.id}/image` : ''
      },
      teams: {
        home: {
          id: f.homeTeam.id,
          name: f.homeTeam.name,
          logo: `https://api.sofascore.app/api/v1/team/${f.homeTeam.id}/image`
        },
        away: {
          id: f.awayTeam.id,
          name: f.awayTeam.name,
          logo: `https://api.sofascore.app/api/v1/team/${f.awayTeam.id}/image`
        }
      }
    }));
}

export async function getTeamLeagues(teamId: number, apiKey?: string) {
  const data = await fetchFootballData('teams/get-last-matches', apiKey, { teamId: teamId.toString() });
  const events = data.events || [];

  // Try to find a league match (tournament id 17 is Premier League)
  const match = events.find((e: any) => e.uniqueTournament?.id === 17) || events[0];

  if (!match) return [];

  return [{
    league: {
      id: match.uniqueTournament?.id,
      name: match.uniqueTournament?.name,
      logo: `https://api.sofascore.app/api/v1/unique-tournament/${match.uniqueTournament?.id}/image`
    },
    seasons: [{
      year: match.season?.id, // Passing seasonId as year for compatibility
      name: match.season?.name
    }]
  }];
}

export async function getStandings(leagueId: number, season: number, apiKey?: string) {
  const data = await fetchFootballData('tournaments/get-standings', apiKey, {
    tournamentId: leagueId.toString(),
    seasonId: season.toString()
  });

  const standings = data.standings || [];
  const rows = standings[0]?.rows || [];

  return [{
    league: {
      standings: [
        rows.map((r: any) => ({
          rank: r.position,
          team: {
            id: r.team.id,
            name: r.team.name,
            logo: `https://api.sofascore.app/api/v1/team/${r.team.id}/image`
          },
          points: r.points,
          goalsDiff: parseInt(r.scoreDiffFormatted || '0'),
          all: {
            played: r.matches,
            win: r.wins,
            draw: r.draws,
            lose: r.losses,
            goals: {
              for: r.scoresFor,
              against: r.scoresAgainst
            }
          }
        }))
      ]
    }
  }];
}

export async function getH2H(homeId: number, awayId: number, apiKey?: string) {
  const data = await fetchFootballData('teams/get-last-matches', apiKey, { teamId: homeId.toString() });
  const events = data.events || [];

  return events
    .filter((e: any) =>
      (e.homeTeam.id === homeId && e.awayTeam.id === awayId) ||
      (e.homeTeam.id === awayId && e.awayTeam.id === homeId)
    )
    .map((f: any) => ({
      teams: {
        home: { id: f.homeTeam.id, name: f.homeTeam.name, logo: `https://api.sofascore.app/api/v1/team/${f.homeTeam.id}/image` },
        away: { id: f.awayTeam.id, name: f.awayTeam.name, logo: `https://api.sofascore.app/api/v1/team/${f.awayTeam.id}/image` }
      },
      fixture: {
        id: f.id,
        date: new Date(f.startTimestamp * 1000).toISOString()
      },
      goals: {
        home: f.homeScore?.display || 0,
        away: f.awayScore?.display || 0
      }
    }));
}

export async function getTeamForm(teamId: number, apiKey?: string) {
    const data = await fetchFootballData('teams/get-last-matches', apiKey, { teamId: teamId.toString() });
    const events = (data.events || []).filter((e: any) => e.status?.type === 'finished').slice(0, 5);
    let form = '';
    events.forEach((e: any) => {
        const isHome = e.homeTeam.id === teamId;
        const teamScore = isHome ? (e.homeScore?.display ?? 0) : (e.awayScore?.display ?? 0);
        const opponentScore = isHome ? (e.awayScore?.display ?? 0) : (e.homeScore?.display ?? 0);

        if (teamScore > opponentScore) form = 'W' + form;
        else if (teamScore < opponentScore) form = 'L' + form;
        else form = 'D' + form;
    });
    return form.padEnd(5, 'D');
}

export async function getInjuries(fixtureId: number, apiKey?: string) {
  return [];
}

export async function getTeamInjuries(teamId: number, leagueId: number, season: number, apiKey?: string) {
    return [];
}
