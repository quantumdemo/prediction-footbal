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
      throw new Error('API Key error: Please ensure you are subscribed to the FREE tier of API-Football on RapidAPI.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded: The application has reached its daily limit.');
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const errorMsg = typeof data.errors === 'string' ? data.errors : JSON.stringify(data.errors);
    if (errorMsg.includes('token') || errorMsg.includes('key')) {
      throw new Error('Invalid API Key: Please check your RapidAPI key in settings.');
    }
    throw new Error(`API error: ${errorMsg}`);
  }

  return data.response;
}

export async function searchTeam(name: string, apiKey?: string) {
  return await fetchFootballData('teams', apiKey, { search: name });
}

export async function getFixtures(homeId: number, awayId: number, apiKey?: string) {
  const fixtures = await fetchFootballData('fixtures', apiKey, {
    next: '5',
    team: homeId.toString(),
  });

  return fixtures.filter((f: any) =>
    (f.teams.home.id === homeId && f.teams.away.id === awayId) ||
    (f.teams.home.id === awayId && f.teams.away.id === homeId)
  );
}

export async function getTeamLeagues(teamId: number, apiKey?: string) {
  return await fetchFootballData('leagues', apiKey, { team: teamId.toString(), current: 'true' });
}

export async function getStandings(leagueId: number, season: number, apiKey?: string) {
  return await fetchFootballData('standings', apiKey, { league: leagueId.toString(), season: season.toString() });
}

export async function getH2H(homeId: number, awayId: number, apiKey?: string) {
  return await fetchFootballData('fixtures/headtohead', apiKey, { h2h: `${homeId}-${awayId}` });
}

export async function getInjuries(fixtureId: number, apiKey?: string) {
  return await fetchFootballData('injuries', apiKey, { fixture: fixtureId.toString() });
}

export async function getTeamInjuries(teamId: number, leagueId: number, season: number, apiKey?: string) {
    return await fetchFootballData('injuries', apiKey, { team: teamId.toString(), league: leagueId.toString(), season: season.toString() });
}
