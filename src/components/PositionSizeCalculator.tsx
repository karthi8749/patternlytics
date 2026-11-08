'use client';

import React, { useState } from 'react';
import { Calculator, Shield, Coins, AlertCircle } from 'lucide-react';

interface Props {
  entryPriceStr?: string;
  stopLossStr?: string;
}

export default function PositionSizeCalculator({ entryPriceStr = '0', stopLossStr = '0' }: Props) {
  // Extract first numeric value found in the string (e.g. "₹450 - ₹453" -> 450)
  const parseNum = (str: string) => {
    const match = str.replace(/[^\d.]/g, ' ').trim().split(/\s+/)[0];
    return match ? parseFloat(match) : 0;
  };

  const defaultEntry = parseNum(entryPriceStr) || 100;
  const defaultSL = parseNum(stopLossStr) || 95;

  const [capital, setCapital] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(2); // 2% risk
  const [customEntry, setCustomEntry] = useState<number>(defaultEntry);
  const [customSL, setCustomSL] = useState<number>(defaultSL);

  // Calculations
  const maxRiskAmount = (capital * riskPercent) / 100;
  const perShareRisk = Math.abs(customEntry - customSL);
  const quantity = perShareRisk > 0 ? Math.floor(maxRiskAmount / perShareRisk) : 0;
  const totalTradeValue = quantity * customEntry;
  const isOverLeveraged = totalTradeValue > capital;

  return (
    <div className="bg-[#121824] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-100">Position Sizing & Risk Guard</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Exact share quantity to safeguard your loss budget</p>
          </div>
        </div>
        <div className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
          <Shield className="w-3.5 h-3.5" />
          Max Loss: ₹{maxRiskAmount.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Capital (₹)
          </label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Risk % per trade
          </label>
          <input
            type="number"
            step="0.5"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Entry Price (₹)
          </label>
          <input
            type="number"
            step="0.1"
            value={customEntry}
            onChange={(e) => setCustomEntry(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Stop Loss (₹)
          </label>
          <input
            type="number"
            step="0.1"
            value={customSL}
            onChange={(e) => setCustomSL(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm font-mono text-rose-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Output Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-700/30">
          <div className="text-[11px] text-slate-400">Buy Quantity</div>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-0.5">{quantity} Shares</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Based on ₹{perShareRisk.toFixed(2)} risk/share</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Capital Required</div>
          <div className="text-2xl font-black text-slate-200 font-mono mt-0.5">
            ₹{totalTradeValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Without leverage</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">If Stop-Loss Hits</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
            -₹{(quantity * perShareRisk).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Exactly matches your risk budget</div>
        </div>
      </div>

      {isOverLeveraged && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Note: Capital required exceeds your total capital. Consider swing margin or reduce risk %.</span>
        </div>
      )}
    </div>
  );
}
