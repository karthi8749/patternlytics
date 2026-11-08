import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { TechnicalAnalysis } from '@/types/analysis';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, chartinkQuery, apiKey: userProvidedApiKey } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Use user-provided API key from UI settings or process.env
    const apiKey = userProvidedApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Gemini API Key missing. Please provide your free Gemini API key in settings or in .env.local file.',
          missingKey: true,
        },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Clean base64 if it has prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `
You are an expert Chief Technical Analyst and Quant Trader specializing in Indian Stock Market (NSE/BSE), Price Action, Candlestick Formations, Chart Patterns, and Chartink screeners.
Analyze the provided stock chart image thoroughly. 

${chartinkQuery ? `Context from User's Chartink Screener: "${chartinkQuery}"` : ''}

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

    // Models available in current Gemini API (fastest first)
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3-flash',
    ];

    let response = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const genConfig: any = {
          responseMimeType: 'application/json',
          temperature: 0.2,
          thinkingConfig: { thinkingBudget: 0 },
        };

        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType || 'image/png',
                  },
                },
              ],
            },
          ],
          config: genConfig,
        });
        if (response?.text) {
          break; // successfully got response
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} with thinkingBudget:0 failed (${err.message}), trying fallback config...`);
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      data: cleanBase64,
                      mimeType: mimeType || 'image/png',
                    },
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });
          if (response?.text) {
            break;
          }
        } catch (retryErr: any) {
          lastError = retryErr;
          console.warn(`Model ${modelName} failed completely, trying next candidate...`, retryErr.message);
        }
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All model candidates are currently busy. Please retry in a few moments.');
    }

    const responseText = response.text || '';
    const parsedData: TechnicalAnalysis = JSON.parse(responseText);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to analyze chart',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
