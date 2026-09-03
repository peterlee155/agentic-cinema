"use client";

import React from "react";
import { Edit2, Trash2, CheckCircle, Film } from "lucide-react";

interface ProjectsViewProps {
  projects?: any[];
  onSelectProject?: (proj: any) => void;
  onOpenProject?: (id: string) => void;
  onSwitchProject?: (id: string) => void;
  onDeleteProject?: (id: string, title: string) => void;
  onRenameProject?: (id: string, title: string) => void;
  onOpenNewMovie?: () => void;
  currentProjectId?: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects = [],
  onSelectProject,
  onOpenProject,
  onSwitchProject,
  onDeleteProject,
  onRenameProject,
  onOpenNewMovie,
  currentProjectId,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Project Library</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage, switch, rename, or delete cinematic film projects.</p>
        </div>
        {onOpenNewMovie && (
          <button
            onClick={onOpenNewMovie}
            className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ NEW MOVIE</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="text-center py-16 space-y-4 cinema-card bg-[#090e1d] border-[#1c263c] col-span-full">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
              🎬
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-white">Your Project Library is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first film production to begin using the Agentic Cinema Studio!
              </p>
              {onOpenNewMovie && (
                <button
                  onClick={onOpenNewMovie}
                  className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+ CREATE YOUR FIRST MOVIE</span>
                </button>
              )}
            </div>
          </div>
        )}

        {projects.map((pr: any) => {
          const isActive = pr.id === currentProjectId;
          return (
            <div
              key={pr.id}
              className={`cinema-card p-5 flex flex-col justify-between space-y-4 bg-[#090e1d] ${
                isActive ? "border-indigo-500/80 shadow-2xl bg-[#0c1428]" : "border-[#1c263c]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40">
                    {pr.stage || "PRODUCTION_READY"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{pr.scene_count} Scenes</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-white truncate">{pr.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onRenameProject && onRenameProject(pr.id, pr.title)}
                      className="p-1.5 rounded-lg bg-[#162035] hover:bg-[#202d4b] border border-[#2d3d63] text-slate-300 text-xs transition cursor-pointer"
                      title="Rename Title"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject && onDeleteProject(pr.id, pr.title)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs transition cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{pr.logline}</p>
              </div>

              <div className="pt-3 border-t border-[#1c263c] flex items-center justify-between">
                <button
                  onClick={() => onSelectProject ? onSelectProject(pr) : (onSwitchProject && onSwitchProject(pr.id))}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {isActive ? "Active Movie ✓" : "Switch Project"}
                </button>
                <span className="text-[10px] text-slate-400 font-semibold">{pr.genre || "Sci-Fi"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
