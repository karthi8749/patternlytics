/**
 * Generates 48-52 daily candles (~2 months) for any custom Indian stock symbol.
 * Uses realistic price action variations for technical analysis.
 */
export function generate2MonthCandles(symbol: string): any[] {
  const candles: any[] = [];
  const today = new Date();
  
  // Deterministic seed based on symbol name
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed = (seed * 31 + symbol.charCodeAt(i)) % 10000;
  }
  
  const basePrice = 100 + (seed % 1500);
  let currentPrice = basePrice;
  const spread = basePrice * 0.018; // 1.8% daily volatility

  // 52 trading days (~2.5 calendar months)
  const tradingDays: Date[] = [];
  let d = new Date(today);
  while (tradingDays.length < 52) {
    d.setDate(d.getDate() - 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      tradingDays.unshift(new Date(d));
    }
  }

  for (let i = 0; i < tradingDays.length; i++) {
    const day = tradingDays[i];
    const trendCycle = Math.sin(i * 0.28) * (spread * 0.85);
    const noise = ((Math.sin(seed + i * 17) + 1) / 2 - 0.48) * spread;
    const delta = trendCycle + noise;

    const open = Math.round((currentPrice + (noise * 0.3)) * 100) / 100;
    const close = Math.round((currentPrice + delta) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.abs(noise * 0.8)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.abs(noise * 0.8)) * 100) / 100;
    const volume = Math.floor(200000 + ((Math.cos(i * 0.4) + 1) / 2) * 2500000);

    candles.push({
      time: day.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}
