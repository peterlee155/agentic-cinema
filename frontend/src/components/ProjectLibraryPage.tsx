"use client";

import React, { useState } from "react";
import { Film, Plus, Edit2, Trash2, Search, Sparkles, Clapperboard, Clock, Shield, Flame, Compass, Play } from "lucide-react";

import { ProjectMetadata } from "../types/project";

interface ProjectLibraryPageProps {
  projects: ProjectMetadata[];
  onSelectProject: (projectId: string) => void;
  onOpenNewMovie: (preset?: Record<string, unknown>) => void;
  onDeleteProject?: (id: string, title: string) => void;
  onRenameProject?: (id: string, currentTitle: string) => void;
  onDirectCreate?: (idea: string, title?: string) => void;
  isCreatingAndRunning?: boolean;
  onOpenRevenueCat?: () => void;
  credits?: number;
  plan?: string;
}

export const ProjectLibraryPage: React.FC<ProjectLibraryPageProps> = ({
  projects = [],
  onSelectProject,
  onOpenNewMovie,
  onDeleteProject,
  onRenameProject,
  onDirectCreate,
  isCreatingAndRunning = false,
  onOpenRevenueCat,
  credits,
  plan,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [directIdea, setDirectIdea] = useState("");
  const [directTitle, setDirectTitle] = useState("");

  const filteredProjects = projects.filter((p: ProjectMetadata) => {
    if (!p || !p.id || p.id === "undefined" || p.id === "null") return false;
    const title = (p.title || "").toLowerCase();
    const genre = (p.genre || "").toLowerCase();
    const logline = (p.logline || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || genre.includes(q) || logline.includes(q);
  });

  const quickStarters = [
    {
      title: "BLACK PINK: NEON REIGN",
      genre: "Cyberpunk Action Thriller",
      tone: "Stylized, High-Octane, Cinematic",
      logline: "In 2088 Seoul, an elite underground performance unit discovers a rogue AI orchestrating holographic reality distortions across the metropolis.",
      visual_style: "Neon Anamorphic, Wet Asphalt Reflections, Hyper-Vibrant Lighting",
      target_duration: "115 Minutes"
    },
    {
      title: "CHRONO DRIFT",
      genre: "Time Loop Heist Thriller",
      tone: "High-Octane, Cerebral, Visceral",
      logline: "In an underground neon casino, a rogue temporal hacker gets caught in an accelerating 15-minute loop while attempting an impossible vault heist.",
      visual_style: "35mm Anamorphic, Emerald and Amber Rim Lighting, Shutter Streak Glitches",
      target_duration: "110 Minutes"
    },
    {
      title: "ECLIPSE HORIZON",
      genre: "Hard Sci-Fi Psychological Mystery",
      tone: "Eerie, Cerebral, Atmospheric",
      logline: "A deep-space salvage crew discovers an abandoned research vessel stationed in the gravitational shadow of a black hole where temporal causality has inverted.",
      visual_style: "Monochromatic Minimalist, Cold Industrial Steel, Desaturated IMAX 70mm",
      target_duration: "130 Minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Studio Top Navigation */}
      <header className="h-16 border-b border-[#1c263c]/80 bg-[#080c1b]/90 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/20">
            <div className="w-full h-full bg-[#090d1e] rounded-[14px] flex items-center justify-center text-lg text-indigo-300">
              🎬
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm tracking-wider uppercase text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
                AGENTIC CINEMA
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                STUDIO LOT
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Multi-Agent AI Film Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenRevenueCat && typeof credits === "number" && (
            <button
              onClick={onOpenRevenueCat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111728] border border-[#23314f] hover:border-indigo-500/60 transition cursor-pointer text-xs font-mono font-bold"
              title="Click to manage credits & subscriptions"
            >
              <span className="text-amber-400">🪙</span>
              <span className="text-slate-100">{credits}</span>
              <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Credits</span>
              {plan && (
                <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                  {plan}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => onOpenNewMovie()}
            className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xl shadow-indigo-600/25 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ NEW MOVIE</span>
          </button>
        </div>
      </header>

      {/* 2. Main History Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8 relative z-10">
        {/* DIRECT WRITE & RUN HERO BOX */}
        <div className="bg-gradient-to-r from-indigo-950/90 via-[#0d1630] to-purple-950/90 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                  <span>Write Your Movie & Run Directly</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40 normal-case">
                    Instant Swarm Execution
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Type your idea below and launch all 21 filmmaking agents automatically with one click.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenNewMovie()}
              className="text-xs text-indigo-300 hover:text-white underline font-semibold cursor-pointer shrink-0"
            >
              Or open full style wizard →
            </button>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={directIdea}
              onChange={(e) => setDirectIdea(e.target.value)}
              placeholder="What is your movie about? (e.g. In 2088 Seoul, an elite underground performance team discovers a rogue AI orchestrating holographic reality distortions across the metropolis...)"
              className="w-full bg-[#060914] border border-[#23335a] focus:border-indigo-500 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-inner resize-none"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <input
                type="text"
                value={directTitle}
                onChange={(e) => setDirectTitle(e.target.value)}
                placeholder="Movie Title (optional, will auto-generate if blank)"
                className="w-full sm:w-80 bg-[#060914] border border-[#23335a] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />

              <button
                type="button"
                disabled={!directIdea.trim() || isCreatingAndRunning}
                onClick={() => {
                  if (directIdea.trim() && onDirectCreate) {
                    onDirectCreate(directIdea.trim(), directTitle.trim());
                  }
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm px-7 py-3 rounded-xl shadow-xl shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCreatingAndRunning ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Launching 21-Agent Swarm...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-amber-300" />
                    <span>🎬 Make My Movie & Run Directly</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Banner & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a0f24]/80 backdrop-blur-xl border border-[#1e2a4a]/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Film Project History
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#16203c] text-indigo-300 font-mono font-bold border border-indigo-500/30">
                {projects.length} {projects.length === 1 ? "Film" : "Films"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Select any movie production from history to enter the multi-agent studio, or initialize a new cinematic universe.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, genre, logline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060914] border border-[#1e2b4d] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
          </div>
        </div>

        {/* Empty State with Creative Quick Starters */}
        {filteredProjects.length === 0 ? (
          <div className="space-y-8">
            <div className="cinema-card bg-[#0a0f24]/90 backdrop-blur-xl border border-[#1e2a4a] p-10 sm:p-14 text-center space-y-6 rounded-3xl shadow-2xl">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 mx-auto flex items-center justify-center text-4xl shadow-xl">
                🎬
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-2xl font-black text-white">Your Film Library is Ready</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {searchQuery
                    ? `No films matching "${searchQuery}". Clear your search query or start a new project.`
                    : "Create your first film production to start collaborating with the 21-Agent Autonomous Swarm."}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onOpenNewMovie()}
                  className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-2xl transition shadow-xl shadow-indigo-600/25 inline-flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ CREATE YOUR FIRST MOVIE</span>
                </button>
              </div>
            </div>

            {/* Quick Starters */}
            {!searchQuery && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Or Start Instantly with a Cinematic Premise:
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickStarters.map((qs, idx) => (
                    <div
                      key={idx}
                      onClick={() => onOpenNewMovie(qs)}
                      className="bg-[#090e21] border border-[#1b2644] hover:border-indigo-500/60 p-5 rounded-2xl space-y-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                          {qs.genre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{qs.target_duration}</span>
                      </div>

                      <h5 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition">
                        {qs.title}
                      </h5>

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {qs.logline}
                      </p>

                      <div className="pt-2 text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                        <span>Use Premise & Customize →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Film Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((pr: ProjectMetadata) => (
              <div
                key={pr.id}
                className="cinema-card p-6 flex flex-col justify-between space-y-5 bg-[#0a0f24]/90 backdrop-blur-xl border border-[#1e2a4a] hover:border-indigo-500/60 transition-all duration-200 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-indigo-600/15 group"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Stage & Scenes */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40">
                      {pr.stage || "IN_PRODUCTION"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Film className="w-3 h-3 text-slate-500" />
                      <span>{pr.scene_count || 0} Scenes</span>
                    </span>
                  </div>

                  {/* Title & Quick Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-white truncate group-hover:text-indigo-300 transition">
                      {pr.title || "Untitled Film"}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {onRenameProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRenameProject(pr.id, pr.title);
                          }}
                          className="p-1.5 rounded-xl bg-[#141d38] hover:bg-[#1d2a4f] border border-[#273863] text-slate-300 hover:text-white text-xs transition cursor-pointer"
                          title="Rename Film"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(pr.id, pr.title);
                          }}
                          className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-red-100 text-xs transition cursor-pointer"
                          title="Delete Film"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logline */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed min-h-[3.6rem]">
                    {pr.logline || "No premise or logline provided."}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {pr.genre && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#131b33] text-slate-300 font-mono border border-[#1f2b4e]">
                        🎭 {pr.genre}
                      </span>
                    )}
                    {pr.tone && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#131b33] text-slate-400 font-mono border border-[#1f2b4e] truncate max-w-[150px]">
                        ⚡ {pr.tone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Enter Studio Action */}
                <div className="pt-4 border-t border-[#1c263c]">
                  <button
                    onClick={() => onSelectProject(pr.id || pr.project_id || "")}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-2xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>🎬 ENTER STUDIO</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

