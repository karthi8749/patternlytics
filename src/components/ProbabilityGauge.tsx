'use client';

import React from 'react';
import { Target, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { TechnicalAnalysis } from '@/types/analysis';

interface Props {
  probability: TechnicalAnalysis['targetProbability'];
  overallScore: number;
}

export default function ProbabilityGauge({ probability, overallScore }: Props) {
  const t1 = probability.target1Probability || 0;
  const t2 = probability.target2Probability || 0;

  const getGaugeColor = (val: number) => {
    if (val >= 75) return 'from-emerald-500 to-green-400 text-emerald-400 border-emerald-500/30';
    if (val >= 55) return 'from-amber-500 to-yellow-400 text-amber-400 border-amber-500/30';
    return 'from-rose-500 to-red-400 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
              Target Hit Probability
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                AI Quant Score
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Mathematical confluence & historical setup odds</p>
          </div>
        </div>

        {/* Quality Score badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-900/60 sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
          <div className="text-xs text-slate-400">Setup Quality</div>
          <div className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-baseline gap-1">
            <span className={overallScore >= 7 ? 'text-emerald-400' : overallScore >= 5 ? 'text-amber-400' : 'text-rose-400'}>
              {overallScore}
            </span>
            <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
        </div>
      </div>

      {/* Probability Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
        {/* Target 1 Box */}
        <div className={`relative p-3.5 sm:p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm ${getGaugeColor(t1).split(' ')[2]}`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Target 1 Probability
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Conservative</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">{t1}%</span>
            <span className="text-[11px] sm:text-xs text-slate-400">Likelihood</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 sm:h-2.5 rounded-full mt-2.5 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getGaugeColor(t1).split(' ')[0]} ${getGaugeColor(t1).split(' ')[1]}`}
              style={{ width: `${t1}%` }}
            />
          </div>
        </div>

        {/* Target 2 Box */}
        <div className={`relative p-3.5 sm:p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm ${getGaugeColor(t2).split(' ')[2]}`}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Target 2 Probability
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Extended Runner</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight font-mono">{t2}%</span>
            <span className="text-[11px] sm:text-xs text-slate-400">Likelihood</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 sm:h-2.5 rounded-full mt-2.5 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getGaugeColor(t2).split(' ')[0]} ${getGaugeColor(t2).split(' ')[1]}`}
              style={{ width: `${t2}%` }}
            />
          </div>
        </div>
      </div>

      {/* Confluence Factor Breakdown */}
      <div>
        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          Confluence Checklist (Why this score?)
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          {probability.confluenceFactors?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-2 px-2.5 sm:px-3 rounded-lg bg-slate-900/40 border border-slate-800/60 gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.impact === 'positive' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : item.impact === 'negative' ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="text-slate-200 text-[11px] sm:text-xs truncate">{item.factor}</span>
              </div>
              <span
                className={`font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] shrink-0 ${
                  item.impact === 'positive'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : item.impact === 'negative'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-slate-700/30 text-slate-300'
                }`}
              >
                {item.weight}
              </span>
            </div>
          ))}
        </div>

        {probability.confidenceSummary && (
          <p className="mt-2.5 text-[11px] sm:text-xs text-slate-400 leading-relaxed italic bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/40">
            "{probability.confidenceSummary}"
          </p>
        )}
      </div>
    </div>
  );
}
