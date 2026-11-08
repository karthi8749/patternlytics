'use client';

import React from 'react';
import { Award, BarChart3, Activity, Magnet, Hourglass, ShieldCheck, AlertCircle } from 'lucide-react';
import { TechnicalAnalysis } from '@/types/analysis';

interface Props {
  setupGrade?: TechnicalAnalysis['setupGrade'];
  volumeFootprint?: TechnicalAnalysis['volumeFootprint'];
  volatilityATR?: TechnicalAnalysis['volatilityATR'];
  keyMagnets?: TechnicalAnalysis['keyMagnets'];
  timeStopRule?: TechnicalAnalysis['timeStopRule'];
}

export default function ProQuantMetricsCard({
  setupGrade,
  volumeFootprint,
  volatilityATR,
  keyMagnets,
  timeStopRule,
}: Props) {
  if (!setupGrade && !volumeFootprint) return null;

  const getGradeColor = (g?: string) => {
    switch (g) {
      case 'A+':
        return 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
      case 'A':
        return 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]';
      case 'B':
        return 'text-amber-300 bg-amber-500/20 border-amber-500/40';
      default:
        return 'text-rose-300 bg-rose-500/20 border-rose-500/40';
    }
  };

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
              Pro Quant & VSA Metrics
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                Advanced Edge
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Institutional footprints, volatility safety & magnets</p>
          </div>
        </div>

        {/* Setup Grade Large Pill */}
        {setupGrade && (
          <div className="flex items-center justify-between sm:justify-end gap-2.5 bg-slate-900/60 sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-800">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Setup Grade</span>
              <span className="text-[11px] font-mono text-slate-300">{setupGrade.suggestedPositionAllocation}</span>
            </div>
            <div
              className={`px-3.5 py-1.5 rounded-xl border text-xl font-black font-mono tracking-tight ${getGradeColor(
                setupGrade.grade
              )}`}
            >
              {setupGrade.grade}
            </div>
          </div>
        )}
      </div>

      {/* Grid of 4 Core Pro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Volume & Institutional Footprint */}
        {volumeFootprint && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  Volume Spread (VSA)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
                  {volumeFootprint.relativeVolume}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">{volumeFootprint.institutionalActivity}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{volumeFootprint.description}</p>
            </div>
          </div>
        )}

        {/* 2. Volatility ATR & SL Safety */}
        {volatilityATR && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Volatility & ATR Move
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {volatilityATR.volatilityLevel}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">{volatilityATR.estimatedDailyMove}</div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SL Guard: {volatilityATR.slSafetyCheck}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Key Magnet Zones */}
        {keyMagnets && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                <Magnet className="w-3.5 h-3.5 text-purple-400" />
                Price Magnet Levels
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ceiling:</span>
                  <span className="font-mono text-rose-300 font-semibold">{keyMagnets.majorResistanceCeiling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Speedbreaker:</span>
                  <span className="font-mono text-amber-300 font-semibold">{keyMagnets.immediateHurdle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Support Floor:</span>
                  <span className="font-mono text-emerald-300 font-semibold">{keyMagnets.strongestSupportFloor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Dead Money / Time Stop Rule */}
        {timeStopRule && (
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                  Time Stop (Capital Guard)
                </span>
              </div>
              <div className="text-xs font-bold text-amber-300 font-mono">{timeStopRule.maxDurationBeforeExit}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{timeStopRule.condition}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
