"use client";

import React from "react";
import { Database, ShieldCheck, Cpu, CreditCard } from "lucide-react";

interface SettingsViewProps {
  activeModel?: string;
  onModelChange?: (model: string) => void;
  onOpenRevenueCat?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ activeModel }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Partner Integrations & Architecture</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ClickHouse Model Context Protocol (MCP), Google Gemini Model Registry, and RevenueCat accounting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ClickHouse Card */}
        <div className="cinema-card p-6 bg-[#090e1d] border-cyan-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xl">
              📊
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">ClickHouse Cloud MCP</h3>
              <p className="text-[10px] text-slate-400">Partner Model Context Protocol</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300 bg-[#060a14] p-3 rounded-xl border border-[#141f36]">
            <div>Status: <span className="text-emerald-400 font-bold">CONNECTED</span></div>
            <div>Database: cinema_telemetry</div>
            <div>Protocol: MCP 2024-11-05</div>
            <div>Driver: HTTP Telemetry Buffer</div>
          </div>
        </div>

        {/* Gemini Model Registry Card */}
        <div className="cinema-card p-6 bg-[#090e1d] border-indigo-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xl">
              ✨
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Google GenAI SDK</h3>
              <p className="text-[10px] text-slate-400">Gemini 3.5+ Model Registry</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300 bg-[#060a14] p-3 rounded-xl border border-[#141f36]">
            <div>Active Model: <span className="text-amber-300 font-bold">{activeModel}</span></div>
            <div>Policy: <span className="text-emerald-400 font-bold">Gemini &gt;= 3.5 Verified</span></div>
            <div>Context Limit: 1,000,000 Tokens</div>
            <div>Fallback Cascade: Active</div>
          </div>
        </div>

        {/* RevenueCat Card */}
        <div className="cinema-card p-6 bg-[#090e1d] border-amber-500/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xl">
              💳
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">RevenueCat Monetization</h3>
              <p className="text-[10px] text-slate-400">Credit Balance & Subscription</p>
            </div>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300 bg-[#060a14] p-3 rounded-xl border border-[#141f36]">
            <div>Tier: <span className="text-amber-300 font-bold">PRO PLAN</span></div>
            <div>Balance: <span className="text-emerald-400 font-bold">202 / 250 CR</span></div>
            <div>Entitlement: Active</div>
            <div>Mock Adapter: Online</div>
          </div>
        </div>
      </div>
    </div>
  );
};
