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
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API error: ${JSON.stringify(data.errors)}`);
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
    last: '10', // Get some previous fixtures too just in case
    next: '10',
    team: homeId.toString(),
  });

  // Filter for matches where the other team is the awayId
  return fixtures.filter((f: any) =>
    (f.teams.home.id === homeId && f.teams.away.id === awayId) ||
    (f.teams.home.id === awayId && f.teams.away.id === homeId)
  );
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
