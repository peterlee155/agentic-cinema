"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ScrollText, 
  Copy, 
  Check, 
  Printer, 
  Sparkles, 
  ExternalLink,
  ArrowRight
} from "lucide-react";

import { ProjectBibleData, CharacterItem, ScriptScene } from "../types/project";

interface SummaryGuy extends CharacterItem {
  avatarUrl?: string;
  performer?: string;
  scenes_present?: number[];
  dialogue_count?: number;
  scene_count?: number;
  [key: string]: unknown;
}

interface SummaryProject {
  title?: string;
  genre?: string;
  targetDuration?: string;
  tone?: string;
  logline?: string;
  [key: string]: unknown;
}

interface ProjectSummaryViewProps {
  currentProject: ProjectBibleData | null;
  onSelectScene?: (idx: number) => void;
  onOpenNewMovie?: () => void;
  onOpenRevenueCat?: () => void;
}

export const ProjectSummaryView: React.FC<ProjectSummaryViewProps> = ({ 
  currentProject, 
  onSelectScene 
}) => {
  const [summaryData, setSummaryData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGuyFilter, setSelectedGuyFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  const projectId = currentProject?.project_id || currentProject?.project?.id || currentProject?.id || "";

  useEffect(() => {
    if (!projectId) return;
    const timer = setTimeout(() => {
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
    }, 0);
    return () => clearTimeout(timer);
  }, [projectId]);

  const p = (summaryData?.project || currentProject?.project || {}) as SummaryProject;
  
  // All Guys Included (Cast & Characters)
  const rawGuys: CharacterItem[] = (summaryData?.characters || summaryData?.allGuys || currentProject?.characters || []) as CharacterItem[];
  const scenes: ScriptScene[] = (summaryData?.scenes || currentProject?.scenes || []) as ScriptScene[];

  const allGuys: SummaryGuy[] = rawGuys.map((guy: CharacterItem) => {
    const guyName = guy.name || "Character";
    // Calculate scenes present
    const presentScenes: number[] = [];
    scenes.forEach((sc: ScriptScene) => {
      const chars = (sc.characters || []).map((c: unknown) => String(c).toLowerCase());
      if (chars.some((c: string) => c.includes(guyName.toLowerCase()))) {
        presentScenes.push(sc.sceneNumber || 1);
      }
    });

    const extendedGuy = guy as SummaryGuy;
    return {
      ...guy,
      avatarUrl: extendedGuy.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(guyName)}`,
      performer: extendedGuy.performer || "Lead Actor Assigned",
      scenes_present: extendedGuy.scenes_present && extendedGuy.scenes_present.length > 0 ? extendedGuy.scenes_present : presentScenes,
      dialogue_count: extendedGuy.dialogue_count || 4
    };
  });

  // Filter scenes by selected character if filter active
  const filteredScenes: ScriptScene[] = selectedGuyFilter === "ALL"
    ? scenes
    : scenes.filter((sc: ScriptScene) => {
        const chars = (sc.characters || []).map((c: unknown) => String(c).toLowerCase());
        return chars.some((c: string) => c.includes(selectedGuyFilter.toLowerCase()));
      });

  const handleCopyScript = () => {
    const scriptText = scenes.map((s: ScriptScene) => `
SCENE ${s.sceneNumber}: ${s.heading || ''} (${"DAY"})
GUYS IN THIS SCENE: ${(s.characters || []).join(", ")}

ACTION:
${s.action || ""}

DIALOGUE:
${s.dialogue || ""}
--------------------------------------------------
`).join("\n");
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPdf = () => {
    if (!projectId) return;
    window.open(`/api/projects/${projectId}/export/pdf`, "_blank");
  };

  // Helper to format dialogue string into standard screenplay blocks
  const renderFormattedDialogue = (rawDialogue: string) => {
    if (!rawDialogue) return null;
    const blocks = rawDialogue.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

    return (
      <div className="space-y-4 max-w-xl mx-auto py-2 font-mono">
        {blocks.map((b, i) => {
          const lines = b.split("\n").map(l => l.trim()).filter(Boolean);
          if (lines.length === 0) return null;
          const charCue = lines[0];
          let paren = "";
          let speechLines = lines.slice(1);

          if (speechLines.length > 0 && speechLines[0].startsWith("(") && speechLines[0].endsWith(")")) {
            paren = speechLines[0];
            speechLines = speechLines.slice(1);
          }

          return (
            <div key={i} className="text-center space-y-1">
              <div className="font-bold text-amber-300 text-xs md:text-sm tracking-wider uppercase">
                {charCue}
              </div>
              {paren && (
                <div className="text-[11px] text-slate-400 italic">
                  {paren}
                </div>
              )}
              {speechLines.length > 0 && (
                <div className="text-left text-xs md:text-sm text-slate-200 leading-relaxed max-w-md mx-auto px-4">
                  {speechLines.join(" ")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 font-sans">
      {/* 1. PROJECT TITLE & ESSENTIAL BRIEF */}
      <div className="cinema-card bg-gradient-to-r from-amber-950/30 via-[#0a0f24] to-indigo-950/30 border border-amber-500/30 p-6 md:p-8 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>PROJECT MASTER SUMMARY</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {p.genre || "Feature Film"} • {p.targetDuration || "115 Minutes"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {p.title || "UNTITLED FILM"}
            </h1>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic border-l-2 border-amber-500/60 pl-3">
              &ldquo;{(p.logline as string) || "No premise specified."}&rdquo;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenPdf}
              className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              title="Print or export the full verified 90-page Hollywood Master Production Bible & Screenplay"
            >
              <Printer className="w-4 h-4" />
              <span>📄 PRINT / EXPORT 90-PAGE MASTER PDF</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={handleCopyScript}
              className="bg-[#11182c] hover:bg-[#1c2847] border border-[#233359] text-slate-200 text-xs font-bold px-4 py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? "Copied Script" : "Copy Screenplay"}</span>
            </button>
          </div>
        </div>

        {/* Quick Essential Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-amber-500/20 font-mono">
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Total Characters</div>
            <div className="text-xl font-black text-white">{allGuys.length} Guys Included</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Total Scenes</div>
            <div className="text-xl font-black text-amber-300">{scenes.length} Scenes Written</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Dramatic Tone</div>
            <div className="text-xs font-bold text-indigo-300 truncate">{p.tone || "Visceral, Gritty"}</div>
          </div>
          <div className="bg-[#080d1e]/80 p-3 rounded-xl border border-[#1c2847]">
            <div className="text-[9px] text-slate-400 uppercase font-bold">Screenplay Standard</div>
            <div className="text-xs font-bold text-emerald-400">Courier Prime 12pt</div>
          </div>
        </div>
      </div>

      {/* 2. ALL WHO GONNA INCLUDE IN THAT MOVIE (CAST & CHARACTERS) */}
      <div className="cinema-card bg-[#080d1c] border-[#1c263c] p-6 md:p-8 rounded-3xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#18233e] pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>ALL WHO GONNA INCLUDE IN THIS MOVIE (CAST & CHARACTERS)</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Roster of all actors, performers, and character profiles who appear and speak in the film
            </p>
          </div>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
            {allGuys.length} Characters Registered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allGuys.map((guy: SummaryGuy, idx: number) => {
            const isSelected = selectedGuyFilter.toLowerCase() === (guy.name || "").toLowerCase();
            return (
              <div
                key={idx}
                onClick={() => setSelectedGuyFilter(isSelected ? "ALL" : guy.name)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 relative overflow-hidden group ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 shadow-xl ring-2 ring-amber-500/50"
                    : "bg-[#0c1224] hover:bg-[#121a33] border-[#1e2a47]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={guy.avatarUrl}
                    alt={guy.name}
                    className="w-12 h-12 rounded-xl bg-[#141e38] border border-[#23335a] p-1 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-white group-hover:text-amber-300 transition truncate">
                      {guy.name}
                    </h3>
                    <div className="text-[10px] text-amber-400 font-bold truncate">
                      {guy.role}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">
                      🎭 {guy.performer}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-[10px] text-slate-300 font-mono pt-2 border-t border-[#1a2542]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Scene Presence:</span>
                    <span className="text-amber-300 font-bold">
                      {guy.scenes_present && guy.scenes_present.length > 0
                        ? `Scenes ${guy.scenes_present.join(", ")}`
                        : `${guy.scene_count || 1} Scenes`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Spoken Lines:</span>
                    <span className="text-emerald-400 font-bold">{guy.dialogue_count || 4} lines</span>
                  </div>
                </div>

                {guy.appearance && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed italic">
                    &ldquo;{guy.appearance}&rdquo;
                  </p>
                )}

                <div className="text-center pt-1">
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider group-hover:underline">
                    {isSelected ? "✓ Filtering Script (Click to Reset)" : "Filter Script by Guy"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedGuyFilter !== "ALL" && (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs">
            <span className="text-amber-300 font-bold font-mono">
              Currently Filtering Screenplay by: <span className="underline">{selectedGuyFilter}</span>
            </span>
            <button
              onClick={() => setSelectedGuyFilter("ALL")}
              className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer font-bold"
            >
              Show All Characters
            </button>
          </div>
        )}
      </div>

      {/* 3. THEIR SCRIPT IN DETAILS */}
      <div className="cinema-card bg-[#070913] border-[#1c263c] p-6 md:p-8 rounded-3xl space-y-6 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c263c] pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-amber-400" />
              <span>THEIR SCRIPT IN DETAILS ({filteredScenes.length} SCENES)</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Scene headings, all characters present, visual action instructions, and verbatim screenplay dialogue
            </p>
          </div>
          <button
            onClick={handleOpenPdf}
            className="text-xs text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1 font-bold font-sans cursor-pointer"
          >
            <span>View Printable Hollywood Layout</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-8">
          {filteredScenes.map((sc: ScriptScene, idx: number) => {
            const sceneCharacters = sc.characters || [];
            return (
              <div
                key={idx}
                className="p-6 md:p-8 rounded-2xl bg-[#090e1f] border border-[#16213a] space-y-6 shadow-xl hover:border-amber-500/40 transition"
              >
                {/* Scene Heading */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-700/80 pb-3">
                  <div className="font-extrabold text-amber-400 text-sm md:text-base tracking-wider">
                    {sc.slugline || `SCENE ${sc.sceneNumber || idx + 1}: ${sc.location || "LOCATION"}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {sc.time || "DAY"}
                    </span>
                    {onSelectScene && (
                      <button
                        onClick={() => onSelectScene(sc.sceneNumber ? sc.sceneNumber - 1 : idx)}
                        className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold hover:bg-indigo-500/40 transition flex items-center gap-1 font-sans cursor-pointer"
                      >
                        <span>Edit Scene</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* All Guys In This Scene Badge */}
                <div className="bg-[#050814] p-3.5 rounded-xl border border-[#141b30] flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>GUYS IN THIS SCENE:</span>
                  </span>
                  {sceneCharacters.length > 0 ? (
                    sceneCharacters.map((cName: string, cIdx: number) => (
                      <span
                        key={cIdx}
                        onClick={() => setSelectedGuyFilter(cName)}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold hover:bg-indigo-500/40 cursor-pointer transition"
                      >
                        👤 {cName}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic font-sans">Ensemble Cast</span>
                  )}
                </div>

                {/* Detailed Show Don't Tell Action */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Visual Action:
                  </div>
                  <div className="bg-[#050812] p-4 rounded-xl border border-[#141b30] text-slate-200 text-xs md:text-sm leading-relaxed font-sans text-justify">
                    {sc.action || "Characters proceed through the scene."}
                  </div>
                </div>

                {/* Formatted Detailed Screenplay Dialogue */}
                {sc.dialogue && (
                  <div className="space-y-2 pt-2 border-t border-[#131b2e]">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Dialogue in Detail:
                    </div>
                    <div className="bg-[#03050b] p-6 rounded-xl border border-[#141d33]">
                      {renderFormattedDialogue(sc.dialogue)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};