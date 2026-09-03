"use client";

import React from "react";
import { Download, FileText, MessageSquare, Camera, Volume2, Scissors, ShieldCheck, Play, Sparkles } from "lucide-react";

interface ScriptViewProps {
  currentProject: any;
  activeSceneIndex: number;
  onSelectScene: (idx: number) => void;
  onDirectInChat: (sceneNum: number) => void;
  onRunSwarm?: () => void;
  onOpenNewMovie?: () => void;
}

export const ScriptView: React.FC<ScriptViewProps> = ({
  currentProject,
  activeSceneIndex,
  onSelectScene,
  onDirectInChat,
  onRunSwarm,
  onOpenNewMovie,
}) => {
  const scenes = currentProject?.scenes || [];
  const currentScene = scenes[activeSceneIndex] || scenes[0] || {};
  const projectTitle = currentProject?.project?.title || "NO FILM SELECTED";
  const [isDialogueOnly, setIsDialogueOnly] = React.useState(false);

  const downloadPdf = () => {
    window.open("/api/export/pdf-html", "_blank");
  };

  const downloadFountain = () => {
    window.open("/api/export/fountain", "_blank");
  };

  if (!currentProject) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          📜
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">No Film Project Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create or select a film project to view and direct its screenplay.
          </p>
        </div>
        <button
          onClick={onOpenNewMovie}
          className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg cursor-pointer inline-flex items-center gap-2"
        >
          <span>+ Create New Movie</span>
        </button>
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          📜
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">Screenplay Not Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Project <strong className="text-indigo-300">"{projectTitle}"</strong> is initialized as a Concept. Run the 10-Agent Swarm to construct the screenplay.
          </p>
        </div>
        <button
          onClick={onRunSwarm}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xl cursor-pointer inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run 10-Agent Swarm to Generate Screenplay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4 overflow-hidden">
      {/* Top Header Control */}
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-5 py-3 shadow-xl shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-lg text-indigo-400">
            📜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-wide">{projectTitle}</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
                {scenes.length} CANONICAL SCENES
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Scene {currentScene.sceneNumber || 1}: {currentScene.slugline || "EXT. LOCATION - DAY"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDirectInChat(currentScene.sceneNumber || 1)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Scene in Chat</span>
          </button>
          <button
            onClick={downloadPdf}
            className="bg-[#162038] hover:bg-[#202c4b] text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-[#2d3d63] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={downloadFountain}
            className="bg-[#162038] hover:bg-[#202c4b] text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl border border-[#2d3d63] transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fountain Script</span>
          </button>
        </div>
      </div>

      {/* 2-Column Reader Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Navigator (3 Cols) */}
        <div className="col-span-12 md:col-span-3 cinema-card p-3.5 flex flex-col overflow-hidden bg-[#090d1a] border-[#1c263c]">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c263c] mb-2 px-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Screenplay Breakdown</span>
            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/30">
              {scenes.length} Scenes
            </span>
          </div>
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 text-xs">
            {scenes.map((sc: any, idx: number) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectScene(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/60 text-white font-bold shadow-md"
                      : "hover:bg-[#111728] text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-white truncate">
                      SCENE {sc.sceneNumber}: {sc.location || "EXT. LOCATION"}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{sc.time || "DAY"}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                    {sc.act || "Act I"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Reader Canvas (9 Cols) */}
        <div className="col-span-12 md:col-span-9 cinema-card p-6 flex flex-col overflow-y-auto bg-[#070913] border-[#1c263c] space-y-6">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1c263c] gap-2">
            <div>
              <span className="font-extrabold text-white text-lg tracking-wide">{currentScene.slugline}</span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                  {currentScene.intExt || "EXT"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {currentScene.time || "DAY"}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
              SHOW DON'T TELL AUDITED
            </span>
          </div>

                    {isDialogueOnly ? (
            <div className="p-6 md:p-8 rounded-2xl bg-[#090e1d] border border-amber-500/50 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-300">ACTOR REHEARSAL SCRIPT (TALKING DIALOGUE ONLY)</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Filtered exclusively for character dialogue lines and spoken cues</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                  SCENE {currentScene.sceneNumber} DIALOGUE ONLY
                </span>
              </div>

              <pre className="bg-[#050813] p-6 rounded-2xl border border-amber-500/30 whitespace-pre-wrap leading-loose text-amber-200 text-sm md:text-base font-extrabold tracking-wide">
                {currentScene.dialogue || "*No spoken dialogue in this scene sequence.*"}
              </pre>
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-2xl bg-[#090e1d] border border-amber-500/30 shadow-2xl space-y-5 text-slate-200 leading-relaxed font-mono">
              <div>
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-sans">
                  <span>🎯 DRAMATIC OBJECTIVE & CONFLICT</span>
                </div>
                <div className="text-xs bg-[#11182c] p-3 rounded-xl border border-[#212f52] text-slate-200 font-semibold font-sans">
                  {currentScene.objective} | Conflict: {currentScene.conflict}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                  SCENE ACTION
                </div>
                <div className="leading-relaxed bg-[#060914] p-4 rounded-xl border border-[#162138] text-slate-300 text-xs md:text-sm">
                  {currentScene.action}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                  SCREENPLAY DIALOGUE
                </div>
                <pre className="bg-[#060914] p-5 rounded-xl border border-[#162138] whitespace-pre-wrap leading-relaxed text-amber-200/90 text-xs md:text-sm">
                  {currentScene.dialogue}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
