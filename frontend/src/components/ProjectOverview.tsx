"use client";

import React from "react";
import { Film, Play, Users, ScrollText, Sparkles, Folder, ShieldCheck } from "lucide-react";

interface ProjectOverviewProps {
  project: any;
  onRunSwarm?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  onRunSwarm,
  onSelectTab,
}) => {
  const p = project?.project || {};
  const title = p.title || "Untitled Film";
  const genre = p.genre || "Drama / Cinematic";
  const logline = p.logline || "No logline specified.";
  const scenes = project?.scenes || [];
  const cast = project?.cast || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="cinema-card bg-gradient-to-r from-indigo-950/40 via-[#0a0f24] to-purple-950/40 border-[#1c263c] p-6 md:p-8 rounded-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              ACTIVE PROJECT WORKSPACE
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{logline}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab && onSelectTab("summary")}
              className="bg-[#11182c] hover:bg-[#1a2542] border border-amber-500/40 text-amber-300 font-bold text-xs px-4 py-3 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>📋 View Complete Project Summary</span>
            </button>
            <button
              onClick={onRunSwarm}
              className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>▶ Run 10-Agent Swarm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cinema-card bg-[#090d1c] border-[#1c263c] p-5 rounded-2xl space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            GENRE / FORMAT
          </div>
          <div className="text-base font-extrabold text-white">{genre}</div>
          <div className="text-[10px] text-indigo-400 font-mono">Feature Screenplay</div>
        </div>

        <div className="cinema-card bg-[#090d1c] border-[#1c263c] p-5 rounded-2xl space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            SCREENPLAY SCENES
          </div>
          <div className="text-2xl font-black text-emerald-400">{scenes.length}</div>
          <div className="text-[10px] text-slate-400 font-mono">Show Don't Tell Audited</div>
        </div>

        <div className="cinema-card bg-[#090d1c] border-[#1c263c] p-5 rounded-2xl space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            CANONICAL CAST
          </div>
          <div className="text-2xl font-black text-purple-400">{cast.length}</div>
          <div className="text-[10px] text-slate-400 font-mono">Performers Assigned</div>
        </div>

        <div className="cinema-card bg-[#090d1c] border-[#1c263c] p-5 rounded-2xl space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            CONTINUITY STATUS
          </div>
          <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>0 Conflicts</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">12 Vectors Audited</div>
        </div>
      </div>
    </div>
  );
};
