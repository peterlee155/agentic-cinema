"use client";

import React from "react";
import { Sparkles, CreditCard, Settings, Plus, Edit2, Play } from "lucide-react";

interface HeaderProps {
  currentProject: any;
  activeModel?: string;
  onModelChange?: (model: string) => void;
  onRenameProject?: () => void;
  onOpenRevenueCat?: () => void;
  onOpenNewMovie?: () => void;
  onOpenConfig?: () => void;
  onRunSwarm?: () => void;
  isSwarmRunning?: boolean;
  credits?: number;
  plan?: string;
  onBackToLibrary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  activeModel,
  onModelChange,
  onRenameProject,
  onOpenRevenueCat,
  onOpenNewMovie,
  onOpenConfig,
  onRunSwarm,
  isSwarmRunning,
  credits,
  plan,
  onBackToLibrary,
}) => {
  const projectTitle = currentProject?.project?.title || currentProject?.title || "NO FILM SELECTED";

  return (
    <header className="h-16 border-b border-[#1c263c] bg-[#090d1a]/95 backdrop-blur sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
      {/* Brand & Active Project */}
      <div className="flex items-center gap-3.5 shrink-0">
        {onBackToLibrary && (
          <button
            onClick={onBackToLibrary}
            className="px-3 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#1c2742] border border-[#253354] text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📁 Project Library</span>
          </button>
        )}
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400 shrink-0">
          🎬
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">AGENTIC CINEMA</h1>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">STUDIO LOT</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">Autonomous Multi-Agent Film Swarm</p>
        </div>
      </div>

      {/* Active Project Title with Quick Rename */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111728] border border-[#22304d] text-xs shrink-0">
        <span className="text-slate-400">Project:</span>
        <span className="font-extrabold text-indigo-300">{projectTitle}</span>
        <button
          onClick={onRenameProject}
          title="Rename Project Title"
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-300 transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Badges & Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Model Selector Dropdown Pill */}
        <div className="relative flex items-center gap-1.5 bg-[#111728] border border-[#23314f] hover:border-indigo-500/60 rounded-xl px-3 py-1.5 transition">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={activeModel}
            onChange={(e) => onModelChange?.(e.target.value)}
            className="bg-transparent text-slate-100 text-xs font-bold focus:outline-none cursor-pointer pr-6"
          >
            <option value="gemini-3.6-flash">Google Gemini 3.6 Flash</option>
            <option value="gemini-3.7-flash">Google Gemini 3.7 Flash</option>
            <option value="gemini-3.5-flash">Google Gemini 3.5 Flash</option>
            <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro</option>
          </select>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono hidden xl:inline border border-emerald-500/40">3.5+ Verified</span>
        </div>

        {/* Run Swarm */}
        {isSwarmRunning ? (
          <button
            disabled
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-lg flex items-center gap-1.5 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-200" />
            <span>Swarm Running...</span>
          </button>
        ) : (
          <button
            onClick={onRunSwarm}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Swarm</span>
          </button>
        )}

        {/* Credit Badge */}
        <button
          onClick={onOpenRevenueCat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111728] hover:bg-[#162038] border border-amber-500/40 text-xs text-amber-300 transition cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="font-mono font-bold">{credits} CR</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 font-mono text-amber-300 font-bold hidden sm:inline">{plan}</span>
        </button>

        {/* Config */}
        <button
          onClick={onOpenConfig}
          title="Configure Format, Episodes, Scale"
          className="bg-[#162038] hover:bg-[#202c4b] border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden md:inline">CONFIG</span>
        </button>

        {/* Green + NEW MOVIE button */}
        <button
          onClick={onOpenNewMovie}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NEW MOVIE</span>
        </button>
      </div>
    </header>
  );
};
