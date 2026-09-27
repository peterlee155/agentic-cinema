"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, CreditCard, Settings, Plus, Edit2, Play, ChevronDown, Check } from "lucide-react";

import { ProjectBibleData } from "../types/project";

interface HeaderProps {
  currentProject: ProjectBibleData | null;
  activeModel?: string;
  onModelChange?: (model: string) => void;
  onRenameProject?: () => void;
  onOpenRevenueCat?: () => void;
  onOpenNewMovie?: () => void;
  onOpenConfig?: () => void;
  onRunSwarm?: () => void;
  isSwarmRunning?: boolean;
  onOpenSwarmProgress?: () => void;
  credits?: number;
  plan?: string;
  onBackToLibrary?: () => void;
}

interface ModelOption {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.7-flash",
    name: "Google Gemini 3.7 Flash",
    subtitle: "Flagship Hybrid Reasoning & Multimodal",
    badge: "Recommended",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/50",
  },
  {
    id: "gemini-3.8-flash",
    name: "Google Gemini 3.8 Flash",
    subtitle: "Next-Gen 3.8 Cinematic Intelligence",
    badge: "3.8 Active",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  },
  {
    id: "gemini-3.6-flash",
    name: "Google Gemini 3.6 Flash",
    subtitle: "Ultra-Fast Studio Lot Assistant",
    badge: "Ultra-Fast",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/50",
  },
  {
    id: "gemini-3.5-flash",
    name: "Google Gemini 3.5 Flash",
    subtitle: "Global Vertex AI Direction Engine",
    badge: "3.5 Verified",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  },
  {
    id: "gemini-3.5-pro",
    name: "Google Gemini 3.5 Pro",
    subtitle: "Deep Cinematic Staging & Scripting",
    badge: "3.5 Pro",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  activeModel = "gemini-3.7-flash",
  onModelChange,
  onRenameProject,
  onOpenRevenueCat,
  onOpenNewMovie,
  onOpenConfig,
  onRunSwarm,
  isSwarmRunning,
  onOpenSwarmProgress,
  credits,
  plan,
  onBackToLibrary,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    if (isModelDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isModelDropdownOpen]);

  const currentModelObj =
    AVAILABLE_MODELS.find((m) => m.id === activeModel) ||
    AVAILABLE_MODELS[0];

  const projectTitle = currentProject?.project?.title || currentProject?.title || "NO FILM SELECTED";

  return (
    <header className="h-16 border-b border-[#1c263c] bg-[#090d1a]/95 backdrop-blur sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-3 overflow-visible">
      {/* Brand & Active Project */}
      <div className="flex items-center gap-3.5 shrink-0">
        {onBackToLibrary && (
          <button
            onClick={onBackToLibrary}
            className="px-3.5 py-1.5 rounded-xl bg-[#131b2e] hover:bg-[#1c2742] border border-[#253354] hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm transform hover:-translate-x-0.5"
            title="Return to Project History / Library"
          >
            <span>← Project History</span>
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
        {/* Sleek Custom Dark Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 bg-[#101729] hover:bg-[#16213a] border border-[#233355] hover:border-indigo-500/60 rounded-xl px-3 py-1.5 transition cursor-pointer shadow-md group"
            title="Switch Gemini 3.5+ reasoning model"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-slate-100 text-xs font-bold whitespace-nowrap">
              {currentModelObj.name}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isModelDropdownOpen ? "rotate-180 text-amber-400" : ""
              }`}
            />
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono hidden xl:inline border border-emerald-500/40">
              3.5+ Verified
            </span>
          </button>

          {/* Floating Dark Popover */}
          {isModelDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0c1222] border border-[#243454] rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 mb-1.5 flex items-center justify-between border-b border-[#1c263c]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-slate-300">
                    Google Gemini 3.5+ Suite
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  ALL ACTIVE
                </span>
              </div>

              <div className="space-y-1">
                {AVAILABLE_MODELS.map((m) => {
                  const isSelected = activeModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onModelChange?.(m.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/30 border border-indigo-500/60 text-white shadow-sm"
                          : "hover:bg-[#16223b] border border-transparent text-slate-200 hover:text-white"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-100"}`}>
                            {m.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate leading-snug">
                          {m.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold border ${m.badgeColor}`}>
                          {m.badge}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-[#1c263c] px-3 py-1 text-[9px] font-mono text-slate-400 flex items-center justify-between">
                <span>Cascading Resilience</span>
                <span className="text-emerald-400 font-bold">100% Guaranteed Uptime</span>
              </div>
            </div>
          )}
        </div>

        {/* Run Swarm */}
        {isSwarmRunning ? (
          <button
            onClick={onOpenSwarmProgress}
            className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-lg flex items-center gap-1.5 animate-pulse cursor-pointer border border-amber-400/40"
            title="Click to view live 21-agent swarm progress"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-200" />
            <span>⚡ Swarm Active (View Live)</span>
          </button>
        ) : (
          <button
            onClick={onRunSwarm}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 transform hover:-translate-y-0.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>🎬 Run Movie Team</span>
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
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1 transform hover:-translate-y-0.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NEW MOVIE</span>
        </button>
      </div>
    </header>
  );
};
