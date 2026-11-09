import { TechnicalAnalysis } from '@/types/analysis';

const PROMPT_TEMPLATE = `
You are an expert Chief Technical Analyst and Quant Trader specializing in Indian Stock Market (NSE/BSE), Price Action, Candlestick Formations, Chart Patterns, and Chartink screeners.
Analyze the provided stock chart image thoroughly.

Examine:
1. Candlestick patterns (Doji, Hammer, Engulfing, Morning/Evening Star, Marubozu, Pinbars, etc.)
2. Chart patterns (Double Bottom/Top, Head and Shoulders, Bull/Bear Flag, Triangles, Channels, Cup & Handle, Range Breakouts)
3. Key levels (Support, Resistance, Breakout line, Trendlines visible in the chart)
4. Indicators visible in the chart (Moving averages, RSI, MACD, Volume bars - if present)
5. False Breakout / Trap detection (Fakeout risk based on volume divergence or wicks)
6. Calculate realistic mathematical probabilities (%) for reaching Target 1 and Target 2 based on setup quality, confluence factors, and trend strength.
7. Clear actionable trade plan with Entry range, Stop-loss, Target 1, Target 2, and R:R ratio.
8. Provide a punchy, trader-friendly explanation in Tamil/Tanglish (e.g. "50 EMA-la bounce aagi Bullish Engulfing vanthuruku, volume nalla support pannuthu...").

Respond ONLY with a valid JSON object matching the following structure without any markdown backticks around it:
{
  "stockSymbol": "string (Detected stock ticker or 'Chart Analysis' if not visible)",
  "timeframe": "string (e.g. '15 Min', '1 Hour', 'Daily', 'Unknown')",
  "trend": "Bullish" | "Bearish" | "Sideways / Neutral",
  "overallScore": number (1 to 10 rating),
  "targetProbability": {
    "target1Probability": number (e.g. 78),
    "target2Probability": number (e.g. 54),
    "confidenceSummary": "string explanation of probability calculation",
    "confluenceFactors": [
      {
        "factor": "string (e.g. Clean 20 EMA bounce)",
        "impact": "positive" | "negative" | "neutral",
        "weight": "string (e.g. '+20%')"
      }
    ]
  },
  "candlestickPatterns": [
    {
      "name": "string (e.g. Bullish Engulfing)",
      "type": "Bullish" | "Bearish" | "Neutral",
      "significance": "High" | "Medium" | "Low",
      "description": "string"
    }
  ],
  "chartPatterns": [
    {
      "name": "string (e.g. Ascending Triangle Breakout)",
      "status": "Confirmed Breakout" | "Forming" | "Failed / Broken",
      "necklineOrBoundary": "string or price level",
      "description": "string"
    }
  ],
  "tradeLevels": {
    "recommendedAction": "Strong Buy" | "Buy on Dip" | "Sell / Short" | "Avoid / Wait",
    "entryRange": "string price level (e.g. ₹450 - ₹453)",
    "stopLoss": "string price level (e.g. ₹438)",
    "target1": "string price level (e.g. ₹468)",
    "target2": "string price level (e.g. ₹485)",
    "riskRewardRatio": "string (e.g. 1:2.3)",
    "invalidationReason": "string (e.g. If daily candle closes below ₹438, setup is invalid)"
  },
  "fakeoutRisk": {
    "riskLevel": "Low" | "Moderate" | "High",
    "warningNotes": "string (e.g. Volume is slightly dry, watch out for pullback before entry)",
    "volumeConfirmation": "Strong Volume" | "Average Volume" | "Weak / Divergent Volume"
  },
  "setupGrade": {
    "grade": "A+" | "A" | "B" | "C (Avoid)",
    "summary": "string reason for this grade",
    "suggestedPositionAllocation": "Full Size (100%)" | "Standard (75%)" | "Half Size (50%)" | "Skip / 0%"
  },
  "volumeFootprint": {
    "relativeVolume": "string (e.g. 3.2x Above Average)",
    "institutionalActivity": "Heavy Accumulation" | "Absorption" | "Retail Trap / Exhaustion" | "Normal / Low Volume",
    "description": "string (VSA volume spread analysis insight)"
  },
  "volatilityATR": {
    "volatilityLevel": "Low (Calm)" | "Optimal (Trending)" | "High (Erratic)",
    "estimatedDailyMove": "string (e.g. ±2.5% / ₹14)",
    "slSafetyCheck": "Well Protected" | "Slightly Tight (Risk of Wick Out)" | "Too Wide"
  },
  "keyMagnets": {
    "strongestSupportFloor": "string (e.g. ₹435 at 50 EMA cluster)",
    "immediateHurdle": "string (e.g. ₹462 swing high speedbreaker)",
    "majorResistanceCeiling": "string (e.g. ₹480 ATH ceiling)"
  },
  "timeStopRule": {
    "maxDurationBeforeExit": "string (e.g. 4-5 trading sessions)",
    "condition": "string (Dead money rule to exit if price fails to expand)"
  },
  "timeHorizon": {
    "holdingPeriod": "string (e.g. 2 to 5 Trading Days)",
    "category": "Intraday" | "Short Swing" | "Positional"
  },
  "aiAdviceTamil": "string (Direct, honest Tanglish advice for Indian traders)",
  "aiAdviceEnglish": "string (Professional summary)"
}
`;

export async function analyzeChartDirectClient(
  imageBase64: string,
  apiKey: string,
  chartinkQuery?: string
): Promise<TechnicalAnalysis> {
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '').trim();
  const cleanKey = apiKey.trim();

  if (!cleanKey) {
    throw new Error('Gemini API key is required. Please set your free API key.');
  }

  // Active production multimodal models in Google Gemini API
  const candidateModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  const fullPrompt = `${PROMPT_TEMPLATE}\n\n${chartinkQuery ? `Context: "${chartinkQuery}"` : ''}`;

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: fullPrompt },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `Model ${modelName} returned HTTP ${res.status}`;
        
        // If API key is invalid or unauthorized, fail immediately without trying other models
        if (errMsg.toLowerCase().includes('api key') || errMsg.includes('API_KEY') || res.status === 400 || res.status === 403) {
          throw new Error(`Google Gemini Error: ${errMsg}`);
        }
        throw new Error(errMsg);
      }

      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No analysis text generated by Gemini.');

      // Extract JSON substring reliably even if model wrapped with markdown or extra text
      let cleanJson = rawText.trim();
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
      }

      const parsed: TechnicalAnalysis = JSON.parse(cleanJson);
      return parsed;
    } catch (err: any) {
      lastError = err;
      // If it's an API key error, propagate immediately
      if (err.message && (err.message.toLowerCase().includes('api key') || err.message.includes('API_KEY'))) {
        throw err;
      }
      console.warn(`Model ${modelName} attempt failed (${err.message}), trying next candidate...`);
    }
  }

  throw lastError || new Error('All Gemini models are currently busy. Please retry in a few moments.');
}
