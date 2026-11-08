'use client';

import React from 'react';
import { JournalEntry } from '@/types/analysis';
import { History, CheckCircle, XCircle, MinusCircle, Clock, Trash2, ArrowUpRight } from 'lucide-react';

interface Props {
  journal: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onUpdateStatus: (id: string, status: JournalEntry['status']) => void;
  onDeleteEntry: (id: string) => void;
}

export default function JournalHistory({ journal, onSelectEntry, onUpdateStatus, onDeleteEntry }: Props) {
  if (journal.length === 0) {
    return (
      <div className="bg-[#121824] border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No analyzed charts in your journal yet.</p>
        <p className="text-xs text-slate-600 mt-1">Upload or paste a chart screenshot to see it tracked here!</p>
      </div>
    );
  }

  // Calculate stats
  const total = journal.length;
  const wins = journal.filter((j) => j.status === 'TARGET_HIT').length;
  const losses = journal.filter((j) => j.status === 'SL_HIT').length;
  const resolved = wins + losses;
  const winRate = resolved > 0 ? Math.round((wins / resolved) * 100) : 0;

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Trade Journal & Outcome Tracker</h3>
            <p className="text-xs text-slate-400">Track which setups hit target and measure your edge</p>
          </div>
        </div>

        {/* Win Rate Stats Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Journal Win Rate</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{resolved > 0 ? `${winRate}%` : 'N/A'}</span>
          </div>
          <div className="text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span className="text-emerald-400 font-bold">{wins} Wins</span> / <span className="text-rose-400 font-bold">{losses} Losses</span>
          </div>
        </div>
      </div>

      {/* Entry Cards List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {journal.map((item) => (
          <div
            key={item.id}
            className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            {/* Left: Thumbnail & Details */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group w-full sm:w-auto"
              onClick={() => onSelectEntry(item)}
            >
              <img
                src={item.imagePreview}
                alt="Chart"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-slate-700 shrink-0 group-hover:border-cyan-500 transition-colors"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                    {item.analysis.stockSymbol || 'Chart Trade'}
                  </span>
                  {item.chartinkFilterName && (
                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono border border-indigo-500/20 truncate max-w-[150px]">
                      {item.chartinkFilterName}
                    </span>
                  )}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                  <span className="text-slate-300 font-medium">T1: {item.analysis.tradeLevels.target1}</span>
                  <span>•</span>
                  <span>SL: {item.analysis.tradeLevels.stopLoss}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {item.analysis.targetProbability.target1Probability}%
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5">
                  {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Right: Outcome Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <button
                onClick={() => onUpdateStatus(item.id, 'TARGET_HIT')}
                title="Mark Target Hit"
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
                  item.status === 'TARGET_HIT'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/40'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Target Hit
              </button>

              <button
                onClick={() => onUpdateStatus(item.id, 'SL_HIT')}
                title="Mark Stop Loss Hit"
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
                  item.status === 'SL_HIT'
                    ? 'bg-rose-500 text-slate-950 shadow-md font-bold'
                    : 'bg-rose-950/30 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                SL Hit
              </button>

              <button
                onClick={() => onUpdateStatus(item.id, 'BREAKEVEN')}
                title="Mark Breakeven"
                className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                  item.status === 'BREAKEVEN'
                    ? 'bg-slate-300 text-slate-950 font-bold'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                Cost
              </button>

              <button
                onClick={() => onDeleteEntry(item.id)}
                title="Delete from journal"
                className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors ml-0.5"
              >
                <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
