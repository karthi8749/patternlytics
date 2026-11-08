export interface TechnicalAnalysis {
  stockSymbol?: string;
  timeframe?: string;
  trend: 'Bullish' | 'Bearish' | 'Sideways / Neutral';
  overallScore: number; // 1 to 10
  
  targetProbability: {
    target1Probability: number; // e.g. 78 (%)
    target2Probability: number; // e.g. 52 (%)
    confidenceSummary: string;
    confluenceFactors: {
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      weight: string; // e.g. "+20%", "-10%"
    }[];
  };

  candlestickPatterns: {
    name: string;
    type: 'Bullish' | 'Bearish' | 'Neutral';
    significance: 'High' | 'Medium' | 'Low';
    description: string;
  }[];

  chartPatterns: {
    name: string; // e.g. "Double Bottom", "Bull Flag Breakout"
    status: 'Confirmed Breakout' | 'Forming' | 'Failed / Broken';
    necklineOrBoundary?: string;
    description: string;
  }[];

  tradeLevels: {
    recommendedAction: 'Strong Buy' | 'Buy on Dip' | 'Sell / Short' | 'Avoid / Wait';
    entryRange: string;
    stopLoss: string;
    target1: string;
    target2: string;
    riskRewardRatio: string; // e.g. "1:2.4"
    invalidationReason: string;
  };

  fakeoutRisk: {
    riskLevel: 'Low' | 'Moderate' | 'High';
    warningNotes: string;
    volumeConfirmation: 'Strong Volume' | 'Average Volume' | 'Weak / Divergent Volume';
  };

  timeHorizon: {
    holdingPeriod: string; // e.g. "3 to 7 trading days"
    category: 'Intraday' | 'Short Swing' | 'Positional';
  };

  // --- NEW PRO QUANT METRICS ---
  setupGrade: {
    grade: 'A+' | 'A' | 'B' | 'C (Avoid)';
    summary: string;
    suggestedPositionAllocation: 'Full Size (100%)' | 'Standard (75%)' | 'Half Size (50%)' | 'Skip / 0%';
  };

  volumeFootprint: {
    relativeVolume: string; // e.g. "3.5x Above Average"
    institutionalActivity: 'Heavy Accumulation' | 'Absorption' | 'Retail Trap / Exhaustion' | 'Normal / Low Volume';
    description: string;
  };

  volatilityATR: {
    volatilityLevel: 'Low (Calm)' | 'Optimal (Trending)' | 'High (Erratic)';
    estimatedDailyMove: string; // e.g. "±2.4% (₹12 - ₹15)"
    slSafetyCheck: 'Well Protected' | 'Slightly Tight (Risk of Wick Out)' | 'Too Wide';
  };

  keyMagnets: {
    strongestSupportFloor: string; // e.g. "₹435 (Congestion + 50 EMA)"
    immediateHurdle: string; // e.g. "₹462 (Previous Swing High)"
    majorResistanceCeiling: string; // e.g. "₹480 (All-time high)"
  };

  timeStopRule: {
    maxDurationBeforeExit: string; // e.g. "Exit if no momentum within 4-5 trading sessions"
    condition: string; // e.g. "If stock remains rangebound under ₹455 for 3 days, cut to prevent capital blockage"
  };

  aiAdviceTamil: string; // Actionable advice in Tanglish / Tamil for instant clarity!
  aiAdviceEnglish: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  imagePreview: string; // base64 or object URL
  chartinkFilterName?: string;
  stockSymbol?: string;
  analysis: TechnicalAnalysis;
  status: 'PENDING' | 'TARGET_HIT' | 'SL_HIT' | 'BREAKEVEN' | 'SKIPPED';
  notes?: string;
}
