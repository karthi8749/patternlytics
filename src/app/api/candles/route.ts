import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol');

    if (!rawSymbol) {
      return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 });
    }

    const cleanSymbol = rawSymbol.replace(/^(NSE:|BSE:)/i, '').trim().toUpperCase();

    // Check NSE first (.NS), then BSE (.BO)
    const suffixes = ['.NS', '.BO'];
    let fetchedCandles: any[] = [];

    for (const suffix of suffixes) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cleanSymbol + suffix)}?range=3mo&interval=1d`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const res0 = data.chart?.result?.[0];
        if (!res0 || !res0.timestamp || !res0.indicators?.quote?.[0]) continue;

        const ts = res0.timestamp;
        const quote = res0.indicators.quote[0];

        const list: any[] = [];
        for (let i = 0; i < ts.length; i++) {
          if (quote.open?.[i] != null && quote.close?.[i] != null && quote.high?.[i] != null && quote.low?.[i] != null) {
            list.push({
              time: new Date(ts[i] * 1000).toISOString().split('T')[0],
              open: Math.round(quote.open[i] * 100) / 100,
              high: Math.round(quote.high[i] * 100) / 100,
              low: Math.round(quote.low[i] * 100) / 100,
              close: Math.round(quote.close[i] * 100) / 100,
              volume: quote.volume?.[i] || 0,
            });
          }
        }

        if (list.length >= 10) {
          fetchedCandles = list;
          break;
        }
      } catch (err) {
        console.warn(`Failed fetching ${cleanSymbol}${suffix}:`, err);
      }
    }

    if (fetchedCandles.length === 0) {
      return NextResponse.json(
        { error: `Could not fetch candle data for "${cleanSymbol}". Please verify the stock ticker symbol.` },
        { status: 404 }
      );
    }

    // Strictly return the last 48-50 trading bars (2 Full Months of daily candles)
    const last2Months = fetchedCandles.slice(-48);

    return NextResponse.json({
      success: true,
      symbol: cleanSymbol,
      candleCount: last2Months.length,
      candles: last2Months,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stock candles' },
      { status: 500 }
    );
  }
}
