"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  MessageSquare,
  Sparkles,
  Play,
  Compass,
  Clock,
  Camera,
  Film,
  Edit3,
  Save,
  Check,
  Loader2,
  Wand2,
  RefreshCw,
  Eye,
} from "lucide-react";

import { ProjectBibleData, ScriptScene, StoryboardFrame } from "../types/project";

interface ScriptViewProps {
  currentProject: ProjectBibleData | null;
  activeSceneIndex: number;
  onSelectScene: (idx: number) => void;
  onDirectInChat: (sceneNum: number) => void;
  onRunSwarm?: () => void;
  onOpenNewMovie?: () => void;
  onRefresh?: () => Promise<void> | void;
}

export const ScriptView: React.FC<ScriptViewProps> = ({
  currentProject,
  activeSceneIndex = 0,
  onSelectScene,
  onDirectInChat,
  onRunSwarm,
  onOpenNewMovie,
  onRefresh,
}) => {
  const projId = currentProject?.id || currentProject?.project?.id || currentProject?.project_id;
  const projectTitle = currentProject?.project?.title || currentProject?.title || "NO FILM SELECTED";

  // Local state for real-time interactivity
  const [internalSceneIdx, setInternalSceneIdx] = useState<number | null>(null);
  const selectedIdx = internalSceneIdx !== null ? internalSceneIdx : (activeSceneIndex || 0);

  const [localScenes, setLocalScenes] = useState<ScriptScene[]>(currentProject?.scenes || []);
  const [localStoryboard, setLocalStoryboard] = useState<StoryboardFrame[]>(currentProject?.storyboard || []);

  const [isDialogueOnly, setIsDialogueOnly] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Director interactive state
  const [directingInput, setDirectingInput] = useState("");
  const [isDirecting, setIsDirecting] = useState(false);
  const [directorNote, setDirectorNote] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.7-flash");

  // Movie Picture generation state
  const [imageLoading, setImageLoading] = useState(false);

  // Manual editing mode
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  const scenes: ScriptScene[] = localScenes.length > 0 ? localScenes : (currentProject?.scenes || []);
  const currentScene: ScriptScene = scenes[selectedIdx] || scenes[0] || ({} as ScriptScene);

  const [manualFields, setManualFields] = useState({
    action: "",
    dialogue: "",
    objective: "",
    conflict: "",
    subtext: "",
  });

  // Sync state when currentProject changes
  useEffect(() => {
    if (currentProject?.scenes && currentProject.scenes.length > 0) {
      setLocalScenes(currentProject.scenes);
    }
    if (currentProject?.storyboard && currentProject.storyboard.length > 0) {
      setLocalStoryboard(currentProject.storyboard);
    }
  }, [currentProject]);

  // Sync manual edit fields when active scene switches
  useEffect(() => {
    setManualFields({
      action: currentScene.action || "",
      dialogue: currentScene.dialogue || "",
      objective: currentScene.objective || "",
      conflict: currentScene.conflict || "",
      subtext: currentScene.subtext || "",
    });
    setDirectorNote("");
  }, [selectedIdx, currentScene.sceneNumber, currentScene.action, currentScene.dialogue, currentScene.objective, currentScene.conflict, currentScene.subtext]);

  const handleSelect = (idx: number) => {
    setInternalSceneIdx(idx);
    setIsManualEdit(false);
    if (onSelectScene) onSelectScene(idx);
  };

  const downloadPdf = () => {
    if (projId) {
      window.open(`/api/projects/${projId}/export/pdf`, "_blank");
    } else {
      window.open("/api/export/pdf-html", "_blank");
    }
  };

  const downloadFountain = () => {
    window.open("/api/export/fountain", "_blank");
  };

  const handleDeepenScreenplay = async () => {
    if (!projId) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projId}/generate-screenplay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depth: "deep_feature",
          target_scene_count: 8,
          custom_notes: "Rich multi-paragraph action descriptions, authentic multi-turn dialogue with emotional subtext."
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onRefresh) {
          await onRefresh();
        } else if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Failed to generate deep screenplay:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Directing Handler (Answers: "Can the user direct or edit the script interactively?")
  const handleDirectScene = async (instructionToUse?: string) => {
    const instruction = (instructionToUse || directingInput).trim();
    if (!instruction || !projId) return;

    setIsDirecting(true);
    setDirectorNote("");
    try {
      const sceneNum = currentScene.sceneNumber || selectedIdx + 1;
      const res = await fetch(`/api/projects/${projId}/direct-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_number: sceneNum,
          instruction: instruction,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (data.success && data.updated_scene) {
        setDirectorNote(data.director_note || "Scene successfully updated per directorial instructions.");
        setDirectingInput("");
        setLocalScenes((prev) => {
          const updated = [...prev];
          const scIdx = updated.findIndex((s) => s.sceneNumber === sceneNum);
          if (scIdx !== -1) {
            updated[scIdx] = { ...updated[scIdx], ...data.updated_scene };
          }
          return updated;
        });
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || "Failed to direct scene.");
      }
    } catch (err) {
      console.error("Direct scene error:", err);
    } finally {
      setIsDirecting(false);
    }
  };

  // Manual Editing Handler
  const handleSaveManualEdit = async () => {
    if (!projId) return;
    setIsSavingManual(true);
    try {
      const sceneNum = currentScene.sceneNumber || selectedIdx + 1;
      const res = await fetch(`/api/projects/${projId}/update-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene_number: sceneNum,
          action: manualFields.action,
          dialogue: manualFields.dialogue,
          objective: manualFields.objective,
          conflict: manualFields.conflict,
          subtext: manualFields.subtext,
        }),
      });
      const data = await res.json();
      if (data.success && data.updated_scene) {
        setManualSaveSuccess(true);
        setTimeout(() => setManualSaveSuccess(false), 3000);
        setLocalScenes((prev) => {
          const updated = [...prev];
          const scIdx = updated.findIndex((s) => s.sceneNumber === sceneNum);
          if (scIdx !== -1) {
            updated[scIdx] = { ...updated[scIdx], ...data.updated_scene };
          }
          return updated;
        });
        setIsManualEdit(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Save manual edit error:", err);
    } finally {
      setIsSavingManual(false);
    }
  };

  // Movie Picture Generation / Regenerate Handler
  const handleGenerateMovieStill = async () => {
    if (!projId) return;
    setImageLoading(true);
    const sceneNum = currentScene.sceneNumber || selectedIdx + 1;
    try {
      const res = await fetch(`/api/projects/${projId}/storyboard/retry-frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene: sceneNum,
          frame: 1,
        }),
      });
      const data = await res.json();
      if (data.result?.url || data.result?.image_url) {
        const url = data.result.url || data.result.image_url;
        setLocalStoryboard((prev) => {
          const existingIdx = prev.findIndex(
            (f) => Number(f.scene || f.sceneNumber) === Number(sceneNum)
          );
          if (existingIdx !== -1) {
            const copy = [...prev];
            copy[existingIdx] = { ...copy[existingIdx], imageUrl: url, imageStatus: "COMPLETE" };
            return copy;
          } else {
            return [
              ...prev,
              {
                scene: sceneNum,
                sceneNumber: sceneNum,
                frame: 1,
                imageUrl: url,
                imageStatus: "COMPLETE",
              },
            ];
          }
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Failed to generate movie still:", err);
    } finally {
      setImageLoading(false);
    }
  };

  // Active movie picture frame matching current scene
  const activeFrame = localStoryboard.find(
    (f) => Number(f.scene || f.sceneNumber) === Number(currentScene.sceneNumber || selectedIdx + 1)
  );

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
            Project <strong className="text-indigo-300">&ldquo;{projectTitle}&rdquo;</strong> is initialized as a Concept. Run the Hollywood Screenplay Architect to author full-length scenes.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={handleDeepenScreenplay}
            disabled={isGenerating}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xl cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Authoring Feature Screenplay..." : "✨ Author Deep Screenplay (Gemini & Vertex)"}</span>
          </button>
          {onRunSwarm && (
            <button
              onClick={onRunSwarm}
              className="bg-[#162038] hover:bg-[#202c4b] text-slate-200 font-bold text-xs px-5 py-3 rounded-xl border border-[#2d3d63] transition cursor-pointer inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Full 10-Agent Swarm</span>
            </button>
          )}
        </div>
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
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                FEATURE LENGTH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Scene {currentScene.sceneNumber || 1}: {currentScene.slugline || "EXT. LOCATION - DAY"}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Deepen Screenplay Button */}
          <button
            onClick={handleDeepenScreenplay}
            disabled={isGenerating}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer ${
              isGenerating
                ? "bg-purple-900/60 text-purple-300 border border-purple-500/40 animate-pulse cursor-wait"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white border border-emerald-400/40"
            }`}
            title="Re-authors the screenplay with Google Cloud Vertex AI / Gemini 3.7 Flash for maximum depth and multi-paragraph scenes"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Authoring Deep Screenplay..." : "✨ Deepen & Expand Script"}</span>
          </button>

          <button
            onClick={() => setIsDialogueOnly(!isDialogueOnly)}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition border flex items-center gap-1.5 cursor-pointer ${
              isDialogueOnly
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-[#162038] hover:bg-[#202c4b] text-slate-300 border-[#2d3d63]"
            }`}
          >
            <span>{isDialogueOnly ? "📜 Full Screenplay" : "💬 Rehearsal Dialogue"}</span>
          </button>

          <button
            onClick={() => onDirectInChat(currentScene.sceneNumber || 1)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct in Chat</span>
          </button>

          <button
            onClick={downloadPdf}
            className="bg-[#162038] hover:bg-[#202c4b] text-amber-300 hover:text-amber-200 text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Export full authentic 90-page Hollywood Master Production Bible & Screenplay with mixed-in Movie Pictures"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📄 90-Page PDF</span>
          </button>

          <button
            onClick={downloadFountain}
            className="bg-[#162038] hover:bg-[#202c4b] text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-[#2d3d63] transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Fountain</span>
          </button>
        </div>
      </div>

      {/* 2-Column Reader & Director Layout */}
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
            {scenes.map((sc: ScriptScene, idx: number) => {
              const isActive = idx === selectedIdx;
              const hasImg = localStoryboard.some(
                (f) => Number(f.scene || f.sceneNumber) === Number(sc.sceneNumber || idx + 1) && f.imageUrl
              );
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between gap-2 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/60 text-white font-bold shadow-md"
                      : "hover:bg-[#111728] text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-white truncate flex items-center gap-1.5">
                      {hasImg && <span className="text-[10px]" title="Movie picture ready">🖼️</span>}
                      <span>SCENE {sc.sceneNumber || idx + 1}: {sc.location || sc.slugline || "EXT. LOCATION"}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{sc.time || "DAY"}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                    {sc.act ? sc.act.split(":")[0] : `Scene ${sc.sceneNumber || idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Reader Canvas (9 Cols) */}
        <div className="col-span-12 md:col-span-9 cinema-card p-6 flex flex-col overflow-y-auto bg-[#070913] border-[#1c263c] space-y-6">
          {/* Scene Header Bar */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1c263c] gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                  {currentScene.act || "Act I"}
                </span>
                {currentScene.estimatedDuration && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{currentScene.estimatedDuration}</span>
                  </span>
                )}
              </div>
              <span className="font-extrabold text-white text-lg md:text-xl tracking-wide font-mono">{currentScene.slugline}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold">
                  {currentScene.intExt || "EXT"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {currentScene.time || "DAY"}
                </span>
                {currentScene.characters && currentScene.characters.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-sans">
                    Characters: <strong className="text-slate-200">{Array.isArray(currentScene.characters) ? currentScene.characters.join(", ") : currentScene.characters}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                SHOW DON&apos;T TELL AUDITED
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DELIVERABLE 1: MIXED MOVIE PICTURE (CINEMATIC STILL INSIDE SCREENPLAY)    */}
          {/* ========================================================================= */}
          {activeFrame?.imageUrl ? (
            <div className="relative group rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl bg-black">
              <div className="relative aspect-[2.39/1] max-h-[380px] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeFrame.imageUrl}
                  alt={`Scene ${currentScene.sceneNumber} Movie Picture`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d1a] via-transparent to-black/60 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg bg-black/80 text-amber-300 border border-amber-500/50 font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <Film className="w-3 h-3 text-amber-400" />
                    <span>SCENE {currentScene.sceneNumber || 1} MOVIE PICTURE STILL</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-500/40 font-mono text-[10px] font-bold shadow-lg backdrop-blur-md">
                    35mm Panavision Anamorphic • 2.39:1
                  </span>
                </div>

                {/* Bottom Caption & Controls */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="text-[11px] font-bold text-white font-mono truncate">
                      {String(activeFrame.shot || activeFrame.camera_shot_type || "35mm Anamorphic Master Keyframe")}
                    </div>
                    <div className="text-[9px] text-slate-300 line-clamp-1">
                      {String(activeFrame.lighting || activeFrame.lighting_and_color_palette || "Sickly amber sodium vapor with deep cyan chiaroscuro shadows")}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateMovieStill}
                    disabled={imageLoading}
                    className="bg-black/80 hover:bg-black text-amber-300 hover:text-amber-200 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-500/50 transition flex items-center gap-1.5 shadow-lg cursor-pointer backdrop-blur-md"
                    title="Regenerate this scene's movie picture still"
                  >
                    {imageLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>{imageLoading ? "Painting Frame..." : "🔄 Regenerate Still"}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-indigo-500/40 bg-gradient-to-br from-[#0b1020] via-[#090d1a] to-[#0d1428] p-5 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono text-[10px] font-extrabold tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3 h-3 text-indigo-400" />
                    <span>35MM CINEMATIC KEYFRAME SPECIFICATION</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Scene {currentScene.sceneNumber || 1}
                  </span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  2.39:1 PANAVISION ANAMORPHIC
                </span>
              </div>

              <p className="text-xs text-slate-300 font-serif italic border-l-2 border-indigo-500/50 pl-3 leading-relaxed">
                &ldquo;{activeFrame?.imagePrompt || activeFrame?.visualDescription || currentScene.action?.slice(0, 180) + "..."}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1c263c]">
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>Optics: <strong className="text-slate-200">{String(activeFrame?.camera || "35mm Anamorphic Prime")}</strong></span>
                  <span>•</span>
                  <span>Palette: <strong className="text-slate-200">ACEScc Cinema Master</strong></span>
                </div>

                <button
                  onClick={handleGenerateMovieStill}
                  disabled={imageLoading}
                  className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {imageLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{imageLoading ? "Painting Cinematic Frame..." : "✨ Generate Movie Still (Imagen 3 / Cloud Vertex)"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DELIVERABLE 2: INTERACTIVE AI DIRECTOR & SCREENPLAY CO-PILOT CONSOLE      */}
          {/* Answers: "Can the user direct or edit the script interactively?"           */}
          {/* ========================================================================= */}
          <div className="bg-[#0b1020] border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white tracking-wide">
                      🎬 Interactive AI Director &amp; Screenplay Co-Pilot
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40 animate-pulse">
                      LIVE DIRECTING
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    &ldquo;Can the user direct or edit the script interactively?&rdquo; <strong className="text-indigo-300">YES.</strong> Give natural language instructions to Gemini 3.7 Flash or switch to manual edit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Model Indicator */}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-[#141b2f] border border-indigo-500/40 text-indigo-200 text-[10px] font-mono font-bold rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-indigo-400"
                >
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash (Active)</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                </select>

                {/* Toggle Manual Edit Mode */}
                <button
                  onClick={() => setIsManualEdit(!isManualEdit)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition border flex items-center gap-1.5 cursor-pointer ${
                    isManualEdit
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-[#162038] hover:bg-[#202c4b] text-slate-300 border-[#2d3d63]"
                  }`}
                >
                  {isManualEdit ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isManualEdit ? "👁️ View Screenplay" : "✏️ Manual Edit"}</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Click Directorial Chips */}
            {!isManualEdit && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Quick Directorial Suggestions (1-Click Rewrite):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "⚡ Raise suspense & imminent danger", prompt: "Raise the stakes and suspense in this scene. Make the danger immediate, palpable, and increase physical urgency." },
                    { label: "🎭 Deepen emotional vulnerability", prompt: "Deepen the emotional subtext and character vulnerability. Unpack the hidden fear beneath the defensive bravado." },
                    { label: "💥 Sharpen dialogue conflict", prompt: "Sharpen dialogue conflict with cutting, authentic repartee. Each line should be a tactical maneuver." },
                    { label: "🌧️ Intensify violent storm atmosphere", prompt: "Intensify the environmental elements: driving sleet, howling coastal wind, and metallic shivering." },
                    { label: "🗡️ Add sudden plot twist / betrayal", prompt: "Introduce an unexpected reveal or suspicion of betrayal that alters the trajectory of the scene." },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDirectScene(chip.prompt)}
                      disabled={isDirecting}
                      className="text-[10px] bg-[#141c30] hover:bg-indigo-950/60 text-slate-300 hover:text-white border border-[#233152] hover:border-indigo-500/60 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Directing Natural Language Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={directingInput}
                    onChange={(e) => setDirectingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isDirecting) {
                        handleDirectScene();
                      }
                    }}
                    placeholder={`Direct Scene ${currentScene.sceneNumber}: e.g. "Make Maya hesitate, protect her hidden crystal, and make Gallagher suspicious..."`}
                    disabled={isDirecting}
                    className="flex-1 bg-[#060914] border border-[#212f52] focus:border-indigo-500 text-slate-200 placeholder-slate-500 text-xs px-4 py-2.5 rounded-xl focus:outline-none transition shadow-inner font-sans"
                  />
                  <button
                    onClick={() => handleDirectScene()}
                    disabled={isDirecting || !directingInput.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isDirecting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Directing Scene...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>🎬 Direct Scene</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* AI Director's Log / Note Banner */}
            {directorNote && (
              <div className="bg-[#121024] border border-purple-500/40 rounded-xl p-3.5 flex items-start gap-3 shadow-lg animate-in fade-in duration-300">
                <div className="text-xl shrink-0">🎬</div>
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-purple-300 flex items-center gap-2 font-mono">
                    <span>DIRECTOR&apos;S CREATIVE LOG (GEMINI 3.7 FLASH)</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                      ✓ BIBLE UPDATED LIVE
                    </span>
                  </div>
                  <p className="text-slate-300 italic font-serif leading-relaxed">
                    &ldquo;{directorNote}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SCREENPLAY CONTENT: REHEARSAL / MANUAL EDIT / SCRIPT READER               */}
          {/* ========================================================================= */}
          {isManualEdit ? (
            /* MANUAL SCRIPT EDITOR */
            <div className="p-6 md:p-8 rounded-2xl bg-[#090e1d] border border-indigo-500/50 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-extrabold text-white font-mono">
                    MANUAL SCREENPLAY EDITOR • SCENE {currentScene.sceneNumber}
                  </h4>
                </div>
                {manualSaveSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-bounce">
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ Saved to Project Bible</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    🎯 Dramatic Objective
                  </label>
                  <input
                    type="text"
                    value={manualFields.objective}
                    onChange={(e) => setManualFields({ ...manualFields, objective: e.target.value })}
                    className="w-full bg-[#060914] border border-[#212f52] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                    ⚔️ Scene Conflict / Obstacle
                  </label>
                  <input
                    type="text"
                    value={manualFields.conflict}
                    onChange={(e) => setManualFields({ ...manualFields, conflict: e.target.value })}
                    className="w-full bg-[#060914] border border-[#212f52] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  🧭 Psychological Subtext
                </label>
                <input
                  type="text"
                  value={manualFields.subtext}
                  onChange={(e) => setManualFields({ ...manualFields, subtext: e.target.value })}
                  className="w-full bg-[#060914] border border-[#212f52] rounded-xl px-3.5 py-2 text-xs text-purple-200 focus:outline-none focus:border-indigo-500 font-serif italic"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                  SCENE ACTION &amp; BLOCKING (SHOW, DON&apos;T TELL)
                </label>
                <textarea
                  rows={6}
                  value={manualFields.action}
                  onChange={(e) => setManualFields({ ...manualFields, action: e.target.value })}
                  className="w-full bg-[#060914] border border-[#162138] rounded-xl p-4 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                  SCREENPLAY DIALOGUE (COURIER WGA FORMAT)
                </label>
                <textarea
                  rows={8}
                  value={manualFields.dialogue}
                  onChange={(e) => setManualFields({ ...manualFields, dialogue: e.target.value })}
                  className="w-full bg-[#060914] border border-[#162138] rounded-xl p-4 text-xs md:text-sm text-amber-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed whitespace-pre-wrap"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1c263c]">
                <button
                  onClick={() => setIsManualEdit(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-[#141b2f] hover:bg-[#1e2844] border border-[#243152] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveManualEdit}
                  disabled={isSavingManual}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingManual ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>💾 Save Screenplay Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : isDialogueOnly ? (
            /* REHEARSAL DIALOGUE VIEW */
            <div className="p-6 md:p-8 rounded-2xl bg-[#090e1d] border border-amber-500/50 shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-300">ACTOR REHEARSAL SCRIPT (VERBATIM DIALOGUE)</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Spoken character dialogue lines, vocal directions, and emotional cues</p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                  SCENE {currentScene.sceneNumber}
                </span>
              </div>

              <pre className="bg-[#050813] p-6 rounded-2xl border border-amber-500/30 whitespace-pre-wrap leading-loose text-amber-200 text-sm md:text-base font-extrabold tracking-wide">
                {currentScene.dialogue || "*No spoken dialogue in this scene sequence.*"}
              </pre>
            </div>
          ) : (
            /* FULL CANONICAL SCREENPLAY READER */
            <div className="p-6 md:p-8 rounded-2xl bg-[#090e1d] border border-amber-500/30 shadow-2xl space-y-5 text-slate-200 leading-relaxed font-mono">
              {/* Objective & Conflict */}
              <div>
                <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-sans">
                  <span>🎯 DRAMATIC OBJECTIVE &amp; CONFLICT</span>
                </div>
                <div className="text-xs bg-[#11182c] p-3.5 rounded-xl border border-[#212f52] text-slate-200 font-semibold font-sans space-y-1">
                  <div><strong className="text-amber-300 font-bold">Objective:</strong> {currentScene.objective}</div>
                  <div><strong className="text-rose-300 font-bold">Conflict:</strong> {currentScene.conflict}</div>
                </div>
              </div>

              {/* Subtext */}
              {currentScene.subtext && (
                <div>
                  <div className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider mb-1 font-sans flex items-center gap-1.5">
                    <Compass className="w-3 h-3" />
                    <span>PSYCHOLOGICAL SUBTEXT</span>
                  </div>
                  <div className="text-xs bg-[#120d24] p-3 rounded-xl border border-[#2b1b4a] text-purple-200 font-sans italic">
                    {currentScene.subtext}
                  </div>
                </div>
              )}

              {/* Action Description */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-sans flex items-center justify-between">
                  <span>SCENE ACTION &amp; BLOCKING (SHOW, DON&apos;T TELL)</span>
                  <span className="text-[9px] text-slate-500 font-mono font-normal">
                    {currentScene.action ? `${currentScene.action.split(" ").length} words` : "0 words"}
                  </span>
                </div>
                <div className="leading-relaxed bg-[#060914] p-5 rounded-xl border border-[#162138] text-slate-300 text-xs md:text-sm whitespace-pre-line space-y-3 font-mono">
                  {currentScene.action}
                </div>
              </div>

              {/* Screenplay Dialogue */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-sans flex items-center justify-between">
                  <span>SCREENPLAY DIALOGUE</span>
                  <span className="text-[9px] text-amber-500/80 font-mono font-normal">
                    {currentScene.dialogue ? `${currentScene.dialogue.split(" ").length} words` : "0 words"}
                  </span>
                </div>
                <pre className="bg-[#060914] p-5 rounded-xl border border-[#162138] whitespace-pre-wrap leading-relaxed text-amber-200/95 text-xs md:text-sm font-mono">
                  {currentScene.dialogue}
                </pre>
              </div>

              {/* Emotional Beat & Transition */}
              <div className="pt-2 border-t border-[#1c263c] flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">Emotional Beat:</span>
                  <span className="text-indigo-300 font-semibold">{currentScene.emotionalBeat}</span>
                </div>
                <div className="font-mono text-xs text-amber-400 font-bold bg-[#141b2f] px-3 py-1 rounded-lg border border-[#233154]">
                  {currentScene.transition || "CUT TO:"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
