"use client";

import React, { useState } from "react";
import { Film, Plus, Edit2, Trash2, Search, LogOut, Sparkles, Clapperboard } from "lucide-react";

interface ProjectLibraryPageProps {
  projects: any[];
  onSelectProject: (projectId: string) => void;
  onOpenNewMovie: () => void;
  onDeleteProject?: (id: string, title: string) => void;
  onRenameProject?: (id: string, currentTitle: string) => void;
  onLogout?: () => void;
  user?: any;
}

export const ProjectLibraryPage: React.FC<ProjectLibraryPageProps> = ({
  projects = [],
  onSelectProject,
  onOpenNewMovie,
  onDeleteProject,
  onRenameProject,
  onLogout,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((p: any) => {
    if (!p || !p.id || p.id === "undefined" || p.id === "null" || p.title === "UNTITLED FILM") return false;
    const title = (p.title || "").toLowerCase();
    const genre = (p.genre || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || genre.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans">
      {/* 1. Top Navigation Bar */}
      <header className="h-16 border-b border-[#1c263c] bg-[#090d1a]/95 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400">
            🎬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-wider uppercase text-white">AGENTIC CINEMA</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                PROJECT LIBRARY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Select a film production to enter the studio lot</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewMovie}
            className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ NEW MOVIE</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-[#11182c] hover:bg-[#1a2544] border border-[#202e52] text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Library Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Banner & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1322] border border-[#1c263c] rounded-2xl p-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-indigo-400" />
              <span>Your Film Productions ({projects.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Pick a movie project to direct with the 10-Agent Swarm, write scenes, or assign actors.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070a14] border border-[#1e2a47] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Film Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full cinema-card bg-[#090e1d] border-[#1c263c] p-12 text-center space-y-4 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
                🎬
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Film Projects Found</h3>
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? `No films matching "${searchQuery}". Clear your search or create a new movie.`
                    : "Your film library is currently empty. Click below to create your first movie production!"}
                </p>
              </div>
              <button
                onClick={onOpenNewMovie}
                className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ CREATE YOUR FIRST MOVIE</span>
              </button>
            </div>
          ) : (
            filteredProjects.map((pr: any) => (
              <div
                key={pr.id}
                className="cinema-card p-6 flex flex-col justify-between space-y-5 bg-[#090e1d] border border-[#1c263c] hover:border-indigo-500/50 transition-all duration-200 rounded-2xl shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Card Header: Stage & Scenes */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40">
                      {pr.stage || "PRODUCTION_READY"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {pr.scene_count || 0} Scenes
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
                          onClick={() => onRenameProject(pr.id, pr.title)}
                          className="p-1.5 rounded-lg bg-[#162035] hover:bg-[#202d4b] border border-[#2d3d63] text-slate-300 text-xs transition cursor-pointer"
                          title="Rename Film"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteProject && (
                        <button
                          onClick={() => onDeleteProject(pr.id, pr.title)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs transition cursor-pointer"
                          title="Delete Film"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logline */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {pr.logline || "No premise or logline provided."}
                  </p>

                  {/* Genre */}
                  {pr.genre && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      🎭 <span className="text-slate-300">{pr.genre}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Enter Studio Action */}
                <div className="pt-3 border-t border-[#1c263c]">
                  <button
                    onClick={() => onSelectProject(pr.id || pr.project_id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🎬 ENTER STUDIO</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
