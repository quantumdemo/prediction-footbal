import { NextResponse } from 'next/server';

const RAPID_API_HOST = 'sofascore.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPIDAPI_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const userApiKey = request.headers.get('x-rapidapi-key');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
  }

  // Build the RapidAPI URL
  const url = new URL(`https://${RAPID_API_HOST}/${endpoint}`);
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      url.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY || userApiKey || '',
        'x-rapidapi-host': RAPID_API_HOST,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
