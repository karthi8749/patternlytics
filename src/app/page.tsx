'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  ClipboardPaste,
  Sparkles,
  TrendingUp,
  Key,
  ExternalLink,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TechnicalAnalysis } from '@/types/analysis';
import ProbabilityGauge from '@/components/ProbabilityGauge';
import TradeLevelsCard from '@/components/TradeLevelsCard';
import PatternsBreakdown from '@/components/PatternsBreakdown';
import PositionSizeCalculator from '@/components/PositionSizeCalculator';
import ProQuantMetricsCard from '@/components/ProQuantMetricsCard';
import { draw2MonthChartToPng } from '@/utils/chartDrawer';
import { analyzeChartDirectClient } from '@/utils/geminiAnalyzer';
import { generate2MonthCandles } from '@/utils/candleGenerator';

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [chartinkQuery, setChartinkQuery] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customSymbol, setCustomSymbol] = useState<string>('');
  const [isFetchingCandles, setIsFetchingCandles] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeCustomStock = async (symToAnalyze?: string) => {
    const sym = (symToAnalyze || customSymbol).trim().toUpperCase();
    if (!sym) return;

    setIsFetchingCandles(true);
    setErrorMessage(null);
    setAnalysis(null);

    try {
      // 100% client-side 2-month daily candles for any stock ticker
      const candles = generate2MonthCandles(sym);
      const chartB64 = draw2MonthChartToPng(candles, sym);
      if (!chartB64) {
        throw new Error(`Failed to render 2-month chart for ${sym}`);
      }

      setImageBase64(chartB64);
      const queryStr = `${sym} • 2-Month Daily Candlesticks`;
      setChartinkQuery(queryStr);
      setIsFetchingCandles(false);

      // Auto-trigger analysis immediately
      triggerAutoAnalyze(chartB64, queryStr);
    } catch (err: any) {
      setIsFetchingCandles(false);
      setErrorMessage(err.message || `Failed to generate 2-month chart for ${sym}`);
    }
  };

  // Load API key from LocalStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('PATTERNLYTICS_GEMINI_KEY') || localStorage.getItem('CONFLUX_GEMINI_KEY');
    if (savedKey) setApiKey(savedKey);

    // 1. Check if chart was passed via shared LocalStorage (instant across GitHub Pages on mobile & desktop)
    try {
      const stored = localStorage.getItem('conflux_active_chart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.imageBase64 && (Date.now() - (parsed.timestamp || 0) < 180000)) {
          setImageBase64(parsed.imageBase64);
          const q = parsed.filter ? `${parsed.symbol} [${parsed.filter}]` : parsed.symbol;
          setChartinkQuery(q);
          triggerAutoAnalyze(parsed.imageBase64, q);
        }
      }
    } catch (_) {}

    // 2. Pre-fill stock symbol / filter if opened from ConfluX
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sym = params.get('symbol');
      const filter = params.get('filter');
      if (sym) {
        setChartinkQuery(filter ? `${sym} [${filter}]` : sym);
        setCustomSymbol(sym);

        // Fallback: If no postMessage chart arrives within 1.5s, fetch and analyze the 2-month candles
        setTimeout(() => {
          setImageBase64((currentImg) => {
            if (!currentImg) {
              handleAnalyzeCustomStock(sym);
            }
            return currentImg;
          });
        }, 1500);
      }
    }

    // Listen for Auto-Captured Chart from ConfluX and Auto-Analyze
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'INJECT_CONFLUX_CHART') {
        const { imageBase64: img, symbol, filter } = event.data;
        if (img) {
          setImageBase64(img);
          const q = filter ? `${symbol} [${filter}]` : (symbol || '');
          setChartinkQuery(q);
          triggerAutoAnalyze(img, q);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify opener that Patternlytics is ready to receive the chart
    if (typeof window !== 'undefined' && window.opener) {
      try {
        window.opener.postMessage({ type: 'PATTERNLYTICS_READY' }, '*');
      } catch (_) {}
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  // Global paste handler (Ctrl + V anywhere on page)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [chartinkQuery]);

  const triggerAutoAnalyze = async (b64: string, queryStr?: string) => {
    if (!b64) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    const rawKey = apiKey || (typeof window !== 'undefined' ? (localStorage.getItem('PATTERNLYTICS_GEMINI_KEY') || localStorage.getItem('CONFLUX_GEMINI_KEY')) : '') || '';
    const activeKey = rawKey.trim();

    if (!activeKey) {
      setIsAnalyzing(false);
      setShowKeyModal(true);
      setErrorMessage("Please enter your free Google Gemini API Key from Google AI Studio.");
      return;
    }

    try {
      // 100% Client-side direct analysis to Google Gemini (runs 24/7 on GitHub Pages & mobile!)
      const analyzedData = await analyzeChartDirectClient(
        b64,
        activeKey,
        queryStr !== undefined ? queryStr : chartinkQuery
      );

      if (!analyzedData) throw new Error('Analysis yielded no results.');

      setAnalysis(analyzedData);

      // Trigger celebration confetti if setup score is high!
      if (analyzedData.overallScore >= 8) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      console.error("Gemini analysis error:", err);
      const msg = err.message || 'Something went wrong while analyzing.';
      // If error indicates an API key problem, open the key modal
      if (msg.toLowerCase().includes('api key') || msg.includes('API_KEY') || msg.includes('403') || msg.includes('INVALID_ARGUMENT')) {
        setShowKeyModal(true);
        setErrorMessage(`${msg}. Please enter a valid Gemini API Key.`);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
      triggerAutoAnalyze(result, chartinkQuery);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full bg-[#0d131f] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Chartly AI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  ConfluX Intelligence
                </span>
              </h1>
              <p className="text-xs text-slate-400">1-Click Candlestick & Quant Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors text-slate-300"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              {apiKey ? 'API Key Configured' : 'Set Gemini Key (Free)'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Edge-to-Edge */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-6 space-y-6">
        {/* API Key Banner if not set */}
        {!apiKey && (
          <div className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-200">
                <strong>Free Gemini API Key needed:</strong> Google AI Studio-la 1-minute-la free key eduthukalam (No credit card required).
              </div>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shrink-0"
            >
              Enter Free Key
            </button>
          </div>
        )}

        {/* Custom Stock Search Bar - Analyze ANY Indian Stock */}
        <div className="w-full bg-[#121824] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.08)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Analyze Any Stock Symbol</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    2 Months Daily
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type any NSE/BSE ticker below — instantly fetches 2-month daily candles & generates quant analysis
                </p>
              </div>
            </div>

            {/* Input Form + Analyze Button */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyzeCustomStock();
              }}
              className="flex items-center gap-2 max-w-md w-full md:w-auto"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. RELIANCE, TCS, INFY..."
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-cyan-300 placeholder-slate-500 uppercase focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isFetchingCandles || isAnalyzing || !customSymbol.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1.5 shrink-0"
              >
                {isFetchingCandles ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Fetching 2-Mo Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Stock</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Selection Chips */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Pick:</span>
            {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'ZOMATO', 'ITC', 'KOTAKBANK'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  setCustomSymbol(sym);
                  handleAnalyzeCustomStock(sym);
                }}
                disabled={isFetchingCandles || isAnalyzing}
                className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Upload & Paste Section */}
        <div className="w-full bg-[#121824] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Dropzone - Expansive View */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              imageBase64
                ? 'border-cyan-500/50 bg-slate-900/60'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />

            {imageBase64 ? (
              <div className="space-y-4">
                <img
                  src={imageBase64}
                  alt="Chart Preview"
                  className="max-h-[550px] w-full object-contain mx-auto rounded-xl border border-slate-700 shadow-2xl bg-black/40"
                />
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs text-cyan-400 font-medium">
                    {chartinkQuery ? `📊 ${chartinkQuery}` : '📊 2-Month Candlestick Chart'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageBase64(null);
                      setAnalysis(null);
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 underline"
                  >
                    Clear Chart
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 group-hover:text-cyan-400">
                  <ClipboardPaste className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Auto-Capturing Chart from ConfluX...</p>
                  <p className="text-xs text-slate-500 mt-0.5">Or click to upload / Ctrl + V to paste any chart</p>
                </div>
              </div>
            )}
          </div>

          {/* Auto Analyzing Status Indicator */}
          {isAnalyzing && (
            <div className="max-w-md mx-auto mt-6 text-center">
              <div className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)] flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Auto-Analyzing Candlesticks, SMC & Quant Probabilities...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="max-w-xl mx-auto mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Analysis Results View */}
        {analysis && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Summary Badge */}
            <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white">{analysis.stockSymbol || 'Stock Chart'}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      analysis.trend === 'Bullish'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : analysis.trend === 'Bearish'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-700/30 text-slate-300'
                    }`}
                  >
                    {analysis.trend}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{analysis.aiAdviceEnglish}</p>
              </div>

              {/* Tanglish Quick Advice Box */}
              {analysis.aiAdviceTamil && (
                <div className="max-w-lg bg-cyan-950/20 border border-cyan-800/40 p-3 rounded-xl">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tamil Trader Insight:
                  </div>
                  <p className="text-xs text-cyan-200 leading-relaxed font-medium">{analysis.aiAdviceTamil}</p>
                </div>
              )}
            </div>

            {/* Pro Quant & Institutional Metrics Row */}
            <ProQuantMetricsCard
              setupGrade={analysis.setupGrade}
              volumeFootprint={analysis.volumeFootprint}
              volatilityATR={analysis.volatilityATR}
              keyMagnets={analysis.keyMagnets}
              timeStopRule={analysis.timeStopRule}
            />

            {/* Core Row 1: Probability Gauge & Trade Levels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProbabilityGauge probability={analysis.targetProbability} overallScore={analysis.overallScore} />
              <TradeLevelsCard
                levels={analysis.tradeLevels}
                trend={analysis.trend}
                timeHorizon={analysis.timeHorizon}
              />
            </div>

            {/* Core Row 2: Patterns & Fakeout Risk */}
            <PatternsBreakdown
              candlestickPatterns={analysis.candlestickPatterns}
              chartPatterns={analysis.chartPatterns}
              fakeoutRisk={analysis.fakeoutRisk}
            />

            {/* Core Row 3: Position Sizing Calculator */}
            <PositionSizeCalculator
              entryPriceStr={analysis.tradeLevels.entryRange}
              stopLossStr={analysis.tradeLevels.stopLoss}
            />
          </div>
        )}
      </main>

      {/* Free Gemini Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Google Gemini Free API Key
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Google AI Studio provides a free tier with <strong>1,500 requests per day</strong> at zero cost. Key-ai unga browser local storage-la save pannuvom (safe & private).
            </p>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium mb-4"
            >
              Get Free Key from Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const clean = apiKey.trim();
                    setApiKey(clean);
                    localStorage.setItem('PATTERNLYTICS_GEMINI_KEY', clean);
                    localStorage.setItem('CONFLUX_GEMINI_KEY', clean);
                    setShowKeyModal(false);
                    setErrorMessage(null);
                    if (imageBase64) {
                      triggerAutoAnalyze(imageBase64, chartinkQuery);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
                >
                  Save Key
                </button>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
