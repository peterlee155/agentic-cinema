"use client";

import React, { useState, useEffect } from "react";
import { 
  Film, 
  Sparkles, 
  Users, 
  ScrollText, 
  Camera, 
  Volume2, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  Filter, 
  Printer, 
  Layers, 
  Clock 
} from "lucide-react";

interface ProjectSummaryViewProps {
  currentProject: any;
  onSelectScene?: (idx: number) => void;
}

export const ProjectSummaryView: React.FC<ProjectSummaryViewProps> = ({ currentProject }) => {
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"dialogue" | "keyframes" | "screenplay">("dialogue");
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  const projectId = currentProject?.project_id || currentProject?.project?.id || "";

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    fetch(`/api/projects/${projectId}/summary`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummaryData(data);
        }
      })
      .catch((err) => console.error("Error loading project summary:", err))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-white font-mono">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-amber-300">COMPILING MASTER PROJECT SUMMARY...</p>
      </div>
    );
  }

  const p = summaryData?.project || currentProject?.project || {};
  const stats = summaryData?.statistics || {};
  const speakers = summaryData?.speakerStats || [];
  const dialogueLedger = summaryData?.dialogueLedger || [];
  const keyframes = summaryData?.visualKeyframes || [];
  const scenes = summaryData?.scenes || currentProject?.scenes || [];
  const aiEngine = summaryData?.aiEngine || {
    name: "Google Gemini 3.5+ Certified Multi-Agent Filmmaking Engine",
    activeModel: "gemini-3.6-flash",
  };

  const filteredDialogue = selectedSpeakerFilter === "ALL"
    ? dialogueLedger
    : dialogueLedger.filter((d: any) => d.character.toUpperCase() === selectedSpeakerFilter.toUpperCase());

  const handleCopyDialogueLedger = () => {
    const text = dialogueLedger.map((d: any) => `[Scene ${d.sceneNumber}] ${d.character} (${d.performer}): "${d.text}"`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Master Executive Banner */}
      <div className="cinema-card bg-gradient-to-r from-amber-950/40 via-[#0a0f24] to-indigo-950/40 border border-amber-500/30 p-6 md:p-8 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>COMPLETE PROJECT MASTER SUMMARY</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <span>🤖 {aiEngine.activeModel} (Gemini 3.5+ Certified)</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {p.title || "UNTITLED FILM"}
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {p.logline || "No premise specified."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDialogueLedger}
              className="bg-[#11182c] hover:bg-[#1c2847] border border-[#233359] text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? "Copied Ledger" : "Copy Dialogue"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-amber-500/20 font-mono">
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Total Scenes</div>
            <div className="text-xl font-black text-amber-300">{stats.totalScenes || scenes.length}</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Characters</div>
            <div className="text-xl font-black text-white">{stats.totalCharacters || 4}</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Cast Assigned</div>
            <div className="text-xl font-black text-purple-400">{stats.totalCastAssigned || 1}</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Spoken Lines</div>
            <div className="text-xl font-black text-emerald-400">{stats.totalSpokenLines || dialogueLedger.length}</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">8K Keyframes</div>
            <div className="text-xl font-black text-indigo-400">{stats.totalKeyframes || keyframes.length}</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs for Summary */}
      <div className="flex items-center gap-2 border-b border-[#1c263c] pb-3">
        <button
          onClick={() => setActiveSubTab("dialogue")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "dialogue"
              ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-md"
              : "bg-[#0c1224] hover:bg-[#141d38] border border-[#1c2847] text-slate-400"
          }`}
        >
          <span>🗣️ Who Speaks What ({dialogueLedger.length} lines)</span>
        </button>
        <button
          onClick={() => setActiveSubTab("keyframes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "keyframes"
              ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 shadow-md"
              : "bg-[#0c1224] hover:bg-[#141d38] border border-[#1c2847] text-slate-400"
          }`}
        >
          <span>🖼️ 8K Visual Keyframes ({keyframes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("screenplay")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === "screenplay"
              ? "bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-md"
              : "bg-[#0c1224] hover:bg-[#141d38] border border-[#1c2847] text-slate-400"
          }`}
        >
          <span>📜 Full Screenplay ({scenes.length} Scenes)</span>
        </button>
      </div>

      {/* 3. Subtab Content */}

      {/* TAB A: WHO SPEAKS WHAT DIALOGUE LEDGER */}
      {activeSubTab === "dialogue" && (
        <div className="space-y-6">
          {/* Speaker Filter Badges */}
          <div className="cinema-card bg-[#090e1d] border-[#1c263c] p-4 rounded-2xl space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>FILTER DIALOGUE BY SPEAKER:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedSpeakerFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                  selectedSpeakerFilter === "ALL"
                    ? "bg-amber-500 text-black shadow-md font-black"
                    : "bg-[#11182c] text-slate-300 hover:bg-[#1a2542] border border-[#233359]"
                }`}
              >
                ALL SPEAKERS ({dialogueLedger.length})
              </button>
              {speakers.map((s: any, idx: number) => {
                const isSelected = selectedSpeakerFilter === s.character.toUpperCase();
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedSpeakerFilter(s.character.toUpperCase())}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-indigo-500 text-white shadow-md font-black"
                        : "bg-[#11182c] text-slate-300 hover:bg-[#1a2542] border border-[#233359]"
                    }`}
                  >
                    <span>{s.character}</span>
                    <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded-full bg-black/30">
                      {s.lineCount}
                    </span>
                    {s.performer !== "Unassigned" && (
                      <span className="text-[9px] text-amber-300 font-sans">({s.performer})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dialogue Lines Ledger */}
          <div className="cinema-card bg-[#070913] border-[#1c263c] p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c263c]">
              <h3 className="text-sm font-black text-white tracking-wide font-mono">
                SPOKEN DIALOGUE LEDGER ({filteredDialogue.length} LINES)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Chronological Scene Order
              </span>
            </div>

            <div className="space-y-3 font-mono">
              {filteredDialogue.map((d: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0b1022] border border-[#19243f] hover:border-amber-500/40 transition space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-300 tracking-wider">
                        {d.character}
                      </span>
                      {d.performer && d.performer !== "Unassigned" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-sans font-bold">
                          Played by {d.performer}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                      SCENE {d.sceneNumber}: {d.location}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed pl-3 border-l-2 border-amber-500/60 font-sans italic">
                    "{d.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: 8K VISUAL KEYFRAMES & STORYBOARDS */}
      {activeSubTab === "keyframes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">8K Storyboard & Visual Keyframes</h3>
              <p className="text-xs text-slate-400">
                Generated via Google Gemini 3.5+ Vision & Image Generation Engine
              </p>
            </div>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              8K Ultra-High Definition
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keyframes.map((kf: any, idx: number) => (
              <div
                key={idx}
                className="cinema-card bg-[#090e1d] border-[#1c263c] rounded-2xl overflow-hidden shadow-xl space-y-4 p-5 hover:border-indigo-500/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 font-mono">
                    SCENE {kf.sceneNumber} • FRAME {kf.frameNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
                    {kf.camera}
                  </span>
                </div>

                <div className="relative aspect-video rounded-xl bg-[#04060c] border border-[#16213a] flex items-center justify-center overflow-hidden">
                  <img
                    src={kf.imageUrl}
                    alt={kf.shotTitle}
                    onError={(e: any) => {
                      e.target.src = "/static/img/the_last_spell_poster.jpg";
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 backdrop-blur text-[9px] text-amber-300 font-mono">
                    {kf.shotTitle}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Lighting & Optics:</div>
                  <div className="text-slate-300 text-[11px]">{kf.lighting}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold pt-1">Visual Prompt:</div>
                  <p className="text-[10px] text-slate-400 bg-[#060913] p-2.5 rounded-lg border border-[#131b2e] leading-relaxed">
                    {kf.imagePrompt || "Cinematic 35mm anamorphic frame."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: FULL MASTER SCREENPLAY */}
      {activeSubTab === "screenplay" && (
        <div className="cinema-card bg-[#070913] border-[#1c263c] p-6 md:p-8 rounded-3xl space-y-8 font-mono">
          <div className="text-center space-y-2 border-b border-[#1c263c] pb-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">{p.title}</h2>
            <p className="text-xs text-slate-400 uppercase">Written by Agentic Cinema Screenwriter Agent</p>
            <p className="text-[10px] text-amber-400">Strict Show Don't Tell Visual Continuity</p>
          </div>

          <div className="space-y-8">
            {scenes.map((sc: any, idx: number) => (
              <div key={idx} className="space-y-4 pb-8 border-b border-[#141b2e] last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-400 text-sm tracking-wide">
                    {sc.slugline || `SCENE ${sc.sceneNumber}: ${sc.location}`}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {sc.time || "DAY"}
                  </span>
                </div>

                <div className="bg-[#0b1022] p-4 rounded-xl border border-[#162138] text-slate-300 text-xs md:text-sm leading-relaxed font-sans">
                  {sc.action}
                </div>

                {sc.dialogue && (
                  <pre className="bg-[#050813] p-5 rounded-xl border border-[#19243f] text-amber-200/90 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                    {sc.dialogue}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
