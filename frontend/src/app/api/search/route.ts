import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ data: [] });
  }

  try {
    const [yahooRes, mfRes] = await Promise.allSettled([
      fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=4&newsCount=0`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }),
      fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(q)}`)
    ]);

    let suggestions: any[] = [];

    if (yahooRes.status === 'fulfilled' && yahooRes.value.ok) {
        const yahooData = await yahooRes.value.json();
        const yahooQuotes = (yahooData.quotes || [])
            .filter((quote: any) => quote.quoteType !== 'MUTUALFUND')
            .map((quote: any) => ({
                symbol: quote.symbol,
                shortname: quote.shortname || quote.longname || quote.symbol,
                exchDisp: quote.exchDisp || quote.exchange,
                quoteType: quote.quoteType || 'EQUITY'
            }));
        suggestions.push(...yahooQuotes);
    }

    if (mfRes.status === 'fulfilled' && mfRes.value.ok) {
        try {
            const mfData = await mfRes.value.json();
            const mfQuotes = (mfData || []).slice(0, 4).map((mf: any) => ({
                symbol: mf.schemeCode.toString(),
                shortname: mf.schemeName,
                exchDisp: 'MFAPI',
                quoteType: 'MUTUALFUND'
            }));
            suggestions.push(...mfQuotes);
        } catch (e) {
            console.error('Failed to parse MF API JSON:', e);
        }
    }

    return NextResponse.json({ data: suggestions });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ data: [], error: error.message, stack: error.stack }, { status: 500 });
  }
}
