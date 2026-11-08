'use client';

import React from 'react';
import { CandlestickChart, Shapes, AlertOctagon, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { TechnicalAnalysis } from '@/types/analysis';

interface Props {
  candlestickPatterns: TechnicalAnalysis['candlestickPatterns'];
  chartPatterns: TechnicalAnalysis['chartPatterns'];
  fakeoutRisk: TechnicalAnalysis['fakeoutRisk'];
}

export default function PatternsBreakdown({ candlestickPatterns, chartPatterns, fakeoutRisk }: Props) {
  const isHighRisk = fakeoutRisk.riskLevel === 'High';
  const isModerateRisk = fakeoutRisk.riskLevel === 'Moderate';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Fakeout / Trap Detector Banner */}
      <div
        className={`rounded-2xl p-3.5 sm:p-4 border transition-all ${
          isHighRisk
            ? 'bg-rose-950/30 border-rose-600/40 text-rose-200'
            : isModerateRisk
            ? 'bg-amber-950/30 border-amber-600/40 text-amber-200'
            : 'bg-emerald-950/20 border-emerald-600/30 text-emerald-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <AlertOctagon
              className={`w-4 sm:w-5 h-4 sm:h-5 shrink-0 ${
                isHighRisk ? 'text-rose-400' : isModerateRisk ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
            <h4 className="font-semibold text-xs sm:text-sm">
              Fakeout / Bull Trap Risk:{' '}
              <span
                className={`uppercase tracking-wide font-bold ${
                  isHighRisk ? 'text-rose-400' : isModerateRisk ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {fakeoutRisk.riskLevel} Risk
              </span>
            </h4>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-1.5 text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/50">
            <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
            <span>{fakeoutRisk.volumeConfirmation}</span>
          </div>
        </div>
        <p className="text-[11px] sm:text-xs leading-relaxed text-slate-300 opacity-90 pl-6 sm:pl-7">
          {fakeoutRisk.warningNotes}
        </p>
      </div>

      {/* Candlestick & Chart Patterns Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Candlestick Patterns */}
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-3.5">
            <CandlestickChart className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-slate-100">Candlestick Formations</h4>
            <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {candlestickPatterns?.length || 0} Detected
            </span>
          </div>

          <div className="space-y-2.5">
            {candlestickPatterns && candlestickPatterns.length > 0 ? (
              candlestickPatterns.map((candle, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{candle.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        candle.type === 'Bullish'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : candle.type === 'Bearish'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-700/30 text-slate-300'
                      }`}
                    >
                      {candle.type} ({candle.significance})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{candle.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No distinct single candle pattern identified</p>
            )}
          </div>
        </div>

        {/* Chart Patterns */}
        <div className="bg-[#121824] border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-3.5">
            <Shapes className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-100">Structural Chart Patterns</h4>
            <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {chartPatterns?.length || 0} Detected
            </span>
          </div>

          <div className="space-y-2.5">
            {chartPatterns && chartPatterns.length > 0 ? (
              chartPatterns.map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{pattern.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {pattern.status}
                    </span>
                  </div>
                  {pattern.necklineOrBoundary && (
                    <div className="text-[11px] font-mono text-cyan-300/80 mb-1">
                      Key Level: {pattern.necklineOrBoundary}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 leading-normal">{pattern.description}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No large structural pattern detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
