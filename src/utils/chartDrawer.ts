/**
 * Renders a full 2-month daily candlestick chart with volume and RSI 14 onto an HTML5 canvas.
 * Returns base64 image PNG.
 */
export function draw2MonthChartToPng(candles: any[], symbol: string): string {
  if (!candles || candles.length === 0) return '';

  const width = 850;
  const height = 580;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, width, height);

  // Layout bounds
  const chartH = 390;
  const subH = 150;
  const padTop = 38;
  const padBottom = 20;
  const padRight = 70;
  const padLeft = 20;

  const plotW = width - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  // Calculate Price Range
  let minP = Infinity;
  let maxP = -Infinity;
  let maxV = 0;
  for (const c of candles) {
    if (c.low < minP) minP = c.low;
    if (c.high > maxP) maxP = c.high;
    if (c.volume > maxV) maxV = c.volume;
  }
  const rangeP = maxP - minP || 1;
  const pPad = rangeP * 0.08;
  const highBound = maxP + pPad;
  const lowBound = minP - pPad;
  const totalRange = highBound - lowBound;

  const n = candles.length;
  const stepX = plotW / n;
  const barW = Math.max(4, stepX * 0.72);

  // Top Title Bar
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`NSE:${symbol.toUpperCase()} • Daily Candlesticks (Last 2 Months)`, padLeft, 22);

  const last = candles[candles.length - 1];
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`O: ₹${last.open}  H: ₹${last.high}  L: ₹${last.low}  C: ₹${last.close}`, width - padRight, 22);
  ctx.textAlign = 'left';

  // Price Grid Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();

    const priceLabel = (highBound - (totalRange / 4) * i).toFixed(1);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('₹' + priceLabel, width - padRight + 6, y + 3);
  }

  // Draw Candlesticks & Volume
  for (let i = 0; i < n; i++) {
    const c = candles[i];
    const x = padLeft + i * stepX + (stepX - barW) / 2;
    const centerX = x + barW / 2;

    const yOpen = padTop + ((highBound - c.open) / totalRange) * plotH;
    const yClose = padTop + ((highBound - c.close) / totalRange) * plotH;
    const yHigh = padTop + ((highBound - c.high) / totalRange) * plotH;
    const yLow = padTop + ((highBound - c.low) / totalRange) * plotH;

    const isBull = c.close >= c.open;
    const color = isBull ? '#089981' : '#f23645';

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX, yHigh);
    ctx.lineTo(centerX, yLow);
    ctx.stroke();

    // Body
    ctx.fillStyle = color;
    const topY = Math.min(yOpen, yClose);
    const bodyH = Math.max(2, Math.abs(yClose - yOpen));
    ctx.fillRect(x, topY, barW, bodyH);

    // Volume bar
    if (maxV > 0) {
      const volH = (c.volume / maxV) * 58;
      const volY = chartH - volH - 4;
      ctx.fillStyle = isBull ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)';
      ctx.fillRect(x, volY, barW, volH);
    }
  }

  // Subchart: RSI 14
  const subTop = chartH + 12;
  const subPlotH = subH - 30;
  ctx.fillStyle = '#090d1a';
  ctx.fillRect(padLeft, subTop, plotW, subPlotH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(padLeft, subTop, plotW, subPlotH);

  // 70 & 30 bands
  const y70 = subTop + subPlotH * 0.3;
  const y30 = subTop + subPlotH * 0.7;
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.beginPath();
  ctx.moveTo(padLeft, y70); ctx.lineTo(width - padRight, y70);
  ctx.moveTo(padLeft, y30); ctx.lineTo(width - padRight, y30);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('70', width - padRight + 6, y70 + 3);
  ctx.fillText('30', width - padRight + 6, y30 + 3);
  ctx.fillStyle = '#b39ddb';
  ctx.fillText('RSI 14', padLeft + 8, subTop + 14);

  // Simple RSI 14
  const rsiValues: number[] = [];
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= 14 && i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / 14;
  let avgLoss = losses / 14;
  for (let i = 14; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    avgGain = (avgGain * 13 + (diff > 0 ? diff : 0)) / 14;
    avgLoss = (avgLoss * 13 + (diff < 0 ? -diff : 0)) / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }

  if (rsiValues.length > 1) {
    ctx.strokeStyle = '#b39ddb';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const startIndex = candles.length - rsiValues.length;
    for (let j = 0; j < rsiValues.length; j++) {
      const idx = startIndex + j;
      const x = padLeft + idx * stepX + stepX / 2;
      const y = subTop + subPlotH * (1 - rsiValues[j] / 100);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}
