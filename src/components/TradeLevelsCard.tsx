'use client';

import React from 'react';
import { Compass, Flame, ShieldAlert, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { TechnicalAnalysis } from '@/types/analysis';

interface Props {
  levels: TechnicalAnalysis['tradeLevels'];
  trend: TechnicalAnalysis['trend'];
  timeHorizon: TechnicalAnalysis['timeHorizon'];
}

export default function TradeLevelsCard({ levels, trend, timeHorizon }: Props) {
  const isBuy = levels.recommendedAction.toLowerCase().includes('buy');
  const isAvoid = levels.recommendedAction.toLowerCase().includes('avoid');

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-100">Trade Execution Blueprint</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Precision entry, invalidation & R:R ratio</p>
          </div>
        </div>

        {/* Action Badge */}
        <div
          className={`self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
            isBuy
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : isAvoid
              ? 'bg-slate-700/30 text-slate-300 border-slate-600/40'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          }`}
        >
          {isBuy ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {levels.recommendedAction}
        </div>
      </div>

      {/* Visual Level Ladder */}
      <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
        {/* Target 2 */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-blue-950/20 border border-blue-800/30">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-blue-300">Target 2 (Runner)</div>
              <div className="text-[10px] text-slate-400">Trail SL when T1 hits</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-mono font-bold text-blue-200">{levels.target2}</div>
            <div className="text-[9px] sm:text-[10px] text-blue-400 font-mono">Runner Target</div>
          </div>
        </div>

        {/* Target 1 */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-emerald-300">Target 1 (Primary)</div>
              <div className="text-[10px] text-slate-400">Book 50-70% quantity</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-mono font-bold text-emerald-200">{levels.target1}</div>
            <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">High Probability</div>
          </div>
        </div>

        {/* Entry Range */}
        <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-900 border-2 border-slate-700 shadow-md">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-bold text-slate-200 flex items-center gap-1.5">
                Buy Trigger / Entry Zone
              </div>
              <div className="text-[10px] text-slate-400">Wait for candle close</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-mono font-extrabold text-amber-300">{levels.entryRange}</div>
            <div className="text-[9px] sm:text-[10px] text-amber-400/80 font-mono">Planned Entry</div>
          </div>
        </div>

        {/* Stop Loss */}
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-rose-950/20 border border-rose-800/40">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)] shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-rose-300">Strict Stop-Loss</div>
              <div className="text-[10px] text-slate-400">Strict exit if broken</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm sm:text-base font-mono font-bold text-rose-300">{levels.stopLoss}</div>
            <div className="text-[9px] sm:text-[10px] text-rose-400 font-mono">Invalidation</div>
          </div>
        </div>
      </div>

      {/* Meta Specs: R:R & Time Horizon */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-3.5 sm:pt-4 border-t border-slate-800/80 text-xs">
        <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Risk-to-Reward (R:R)</span>
          <span className="text-xs sm:text-sm font-mono font-black text-emerald-400 mt-0.5">{levels.riskRewardRatio}</span>
        </div>
        <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">Holding Period</span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-200 mt-0.5 truncate">
            {timeHorizon?.holdingPeriod || '3 - 5 Days'} ({timeHorizon?.category})
          </span>
        </div>
      </div>

      {/* Invalidation note */}
      {levels.invalidationReason && (
        <div className="mt-2.5 sm:mt-3 p-2 sm:p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-[11px] sm:text-xs text-rose-300/90 flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-tight sm:leading-normal">
            <strong className="font-semibold text-rose-300">Invalidation Rule: </strong>
            {levels.invalidationReason}
          </span>
        </div>
      )}
    </div>
  );
}
