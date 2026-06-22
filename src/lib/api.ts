const RAPID_API_HOST = 'api-football-v1.p.rapidapi.com';

async function fetchFootballData(endpoint: string, apiKey: string, params: Record<string, string> = {}) {
  const url = new URL(`https://${RAPID_API_HOST}/v3/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': RAPID_API_HOST,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('API Key error: Please ensure you are subscribed to the FREE tier of API-Football on RapidAPI.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded: You have reached the 100 requests/day limit on the free tier.');
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

export async function searchTeam(name: string, apiKey: string) {
  const teams = await fetchFootballData('teams', apiKey, { search: name });
  return teams;
}

export async function getFixtures(homeId: number, awayId: number, apiKey: string) {
  // Try to find upcoming fixture
  const fixtures = await fetchFootballData('fixtures', apiKey, {
    next: '5',
    team: homeId.toString(),
  });

  // Filter for matches where the other team is the awayId
  return fixtures.filter((f: any) =>
    (f.teams.home.id === homeId && f.teams.away.id === awayId) ||
    (f.teams.home.id === awayId && f.teams.away.id === homeId)
  );
}

export async function getTeamLeagues(teamId: number, apiKey: string) {
  return await fetchFootballData('leagues', apiKey, { team: teamId.toString(), current: 'true' });
}

export async function getStandings(leagueId: number, season: number, apiKey: string) {
  return await fetchFootballData('standings', apiKey, { league: leagueId.toString(), season: season.toString() });
}

export async function getH2H(homeId: number, awayId: number, apiKey: string) {
  return await fetchFootballData('fixtures/headtohead', apiKey, { h2h: `${homeId}-${awayId}` });
}

export async function getInjuries(fixtureId: number, apiKey: string) {
  return await fetchFootballData('injuries', apiKey, { fixture: fixtureId.toString() });
}

export async function getTeamInjuries(teamId: number, leagueId: number, season: number, apiKey: string) {
    // API Football injuries endpoint can be used with team and league/season
    return await fetchFootballData('injuries', apiKey, { team: teamId.toString(), league: leagueId.toString(), season: season.toString() });
}
