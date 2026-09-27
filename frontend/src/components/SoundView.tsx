"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Radio,
  Sliders,
  Disc,
  Activity,
  Waves,
  MessageSquare
} from "lucide-react";

import { ProjectBibleData, SoundscapeItem } from "../types/project";

interface SoundViewProps {
  currentProject: ProjectBibleData | null;
  onDirectInChat?: (sceneNum: number) => void;
  onRunSwarm?: () => void;
  onOpenNewMovie?: () => void;
}

export const SoundView: React.FC<SoundViewProps> = ({
  currentProject,
  onDirectInChat,
  onRunSwarm,
  onOpenNewMovie,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const projectTitle = currentProject?.project?.title || currentProject?.title || "NO FILM SELECTED";

  // Calibrated soundscapes: uses real AI soundscapes if present, otherwise dynamically derives from scenes
  const audioList: SoundscapeItem[] = React.useMemo(() => {
    if (currentProject?.audio && currentProject.audio.length > 0) {
      return currentProject.audio;
    }
    const scenes = currentProject?.scenes || [];
    const projTitle = currentProject?.project?.title || currentProject?.title || "Cinematic Feature";
    const genre = currentProject?.project?.genre || "Drama / Thriller";
    const tone = currentProject?.project?.tone || "Atmospheric, High-Stakes";

    if (scenes.length === 0) {
      return [
        {
          scene: "Scene 1 - Opening Horizon Atmosphere",
          dialogue: "Close-mic intimate dialogue with natural acoustic environment.",
          ambience: `Expansive atmospheric room tone, subtle wind reflections and natural decay in ${projTitle}.`,
          foley: "Footsteps across textured flooring, mechanical and fabric rustle.",
          soundEffects: "Dynamic low-frequency 38Hz sub-bass tension drone.",
          music: `Original orchestral theme reflecting ${genre}, sparse cello building into harmonic crescendo.`,
          silence: "STRATEGIC SILENCE: 2.5-second total blackout preceding dramatic turning point.",
          emotionalCue: "Heightens visceral emotional immersion.",
          transition: "J-Cut into incoming sequence."
        }
      ];
    }

    return scenes.map((sc, i) => {
      const scNum = sc.sceneNumber || i + 1;
      const loc = sc.location || sc.slugline?.replace("INT.", "").replace("EXT.", "").split("-")[0]?.trim() || `Scene ${scNum}`;
      const isInt = (sc.slugline || "").toUpperCase().includes("INT");
      const soundCueStr = typeof sc.soundCue === "string" ? sc.soundCue : "";
      return {
        scene: `Scene ${scNum} - ${loc}`,
        dialogue: "Direct close-mic dialogue capture with natural acoustic spatial decay.",
        ambience: soundCueStr || `${isInt ? "Confined interior room tone with natural acoustic reverberation" : "Expansive exterior atmospheric wind and environmental textures"} in ${loc}.`,
        foley: `Footsteps and surface friction across ${loc.toLowerCase()}, deliberate mechanical gear clicks.`,
        soundEffects: `Sub-bass 38Hz tension drone pulsing with dramatic tempo of Scene ${scNum}.`,
        music: `Orchestral motif reflecting scene emotional beat (${typeof sc.emotionalBeat === "string" ? sc.emotionalBeat : "Dramatic tension"}).`,
        silence: "STRATEGIC SILENCE: 2.0-second audio drop at the moment of highest dramatic conflict.",
        emotionalCue: `Acoustically underscores character conflict and story progression in ${projTitle}.`,
        transition: `${scNum % 2 === 1 ? "J-Cut" : "L-Cut"}: Audio bleeds 1.5 seconds across the scene boundary.`
      } as SoundscapeItem;
    });
  }, [currentProject]);

  const currentSound = audioList[activeIdx] || audioList[0] || ({} as SoundscapeItem);

  const handleRegenerateSoundscapes = async () => {
    const pid = currentProject?.id || currentProject?.project_id || currentProject?.project?.id;
    if (!pid) return;
    setIsGenerating(true);
    setGenerationNotice(null);
    try {
      const res = await fetch("/api/pipeline/retry-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: pid,
          agent_name: "Sound & Music",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerationNotice("✨ Soundscapes synthesized and updated in Project Bible!");
      } else {
        setGenerationNotice(`⚠️ Soundscape notice: ${data.error || "Completed with standard defaults"}`);
      }
    } catch (e) {
      setGenerationNotice("⚠️ Error connecting to sound agent. Displaying calibrated blueprint.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Web Audio API ambient room tone & sub-bass generator
  const toggleAudition = () => {
    if (isPlayingAudition) {
      stopAudition();
    } else {
      startAudition();
    }
  };

  const startAudition = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Sub-bass drone (40 Hz)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(40, ctx.currentTime);

      // Subtle atmospheric modulation
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(4, ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      osc.connect(masterGain);
      osc.start();
      oscRef.current = osc;

      setIsPlayingAudition(true);
    } catch (e) {
      console.warn("Web Audio audition error:", e);
    }
  };

  const stopAudition = () => {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    } catch (e) {
      console.warn("Web Audio stop error:", e);
    } finally {
      setIsPlayingAudition(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAudition();
    };
  }, []);

  if (!currentProject) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          🎵
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">No Film Project Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create or select a film project to design its immersive acoustic soundscapes and strategic silence.
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

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-4 overflow-hidden">
      {/* Top Header Control */}
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-5 py-3 shadow-xl shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl text-purple-400">
            🎵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white tracking-wide">{projectTitle} — Sound & Music Studio</h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40 font-bold">
                {audioList.length} SCENE SOUNDSCAPES
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Acoustic spaces, room tone RT60 decay, sub-bass 38Hz drones, and strategic silence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Regenerate Soundscapes */}
          <button
            onClick={handleRegenerateSoundscapes}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-run Google Gemini Sound & Music agent for this project"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-amber-400" : "text-purple-300"}`} />
            <span>{isGenerating ? "Scoring Blueprints..." : "Regenerate AI Sound"}</span>
          </button>

          {/* Ambient Audition Button */}
          <button
            onClick={toggleAudition}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2 border ${
              isPlayingAudition
                ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse"
                : "bg-[#141c30] hover:bg-[#1e2945] text-amber-300 border-amber-500/40"
            }`}
          >
            {isPlayingAudition ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop 40Hz Drone</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>▶ Audition 40Hz Drone</span>
              </>
            )}
          </button>

          {onDirectInChat && (
            <button
              onClick={() => onDirectInChat(activeIdx + 1)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Sound in Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification banner if active */}
      {generationNotice && (
        <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-purple-200 animate-in fade-in">
          <span>{generationNotice}</span>
          <button
            onClick={() => setGenerationNotice(null)}
            className="text-slate-400 hover:text-white text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Sound Architecture Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Navigator (3 Cols) */}
        <div className="col-span-12 md:col-span-4 cinema-card p-3.5 flex flex-col overflow-hidden bg-[#090d1a] border-[#1c263c]">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c263c] mb-2 px-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Scene Sound Cues
            </span>
            <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/30 font-bold">
              {audioList.length} Tracks
            </span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 text-xs">
            {audioList.map((aud: SoundscapeItem, idx: number) => {
              const isActive = idx === activeIdx;
              const sceneLabel = String(aud.scene || `Scene ${idx + 1}`);
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition flex flex-col gap-1 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/60 text-white font-bold shadow-md"
                      : "hover:bg-[#111728] text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate">
                      {sceneLabel.split(":")[0] || `Scene ${idx + 1}`}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                      {aud.silence ? "SILENCE AUDITED" : "ACTIVE"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {aud.music || aud.ambience || "Acoustic soundscape"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Studio Canvas (8 Cols) */}
        <div className="col-span-12 md:col-span-8 cinema-card p-5 md:p-6 flex flex-col overflow-y-auto bg-[#070913] border-[#1c263c] space-y-5">
          {/* Active Scene Header */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1c263c] gap-2">
            <div>
              <span className="font-extrabold text-white text-base tracking-wide">
                {currentSound.scene || `Scene ${activeIdx + 1}`}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                  SURROUND 7.1.4 ATMOS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  38-45Hz SUB-BASS ALIGNED
                </span>
              </div>
            </div>

            {isPlayingAudition && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono animate-pulse">
                <Radio className="w-3 h-3 text-amber-400" />
                <span>MONITORING 40Hz SUB-BASS DRONE</span>
              </div>
            )}
          </div>

          {/* Strategic Silence Spotlight (Crucial Rule) */}
          <div className="p-4 rounded-2xl bg-[#0e1628] border border-amber-500/40 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                STRATEGIC SILENCE & DRAMATIC IMPACT
              </h4>
            </div>
            <div className="text-xs text-slate-200 font-mono leading-relaxed bg-[#070b15] p-3 rounded-xl border border-amber-500/20">
              {currentSound.silence || "STRATEGIC SILENCE: 2 full seconds of dead audio drop right before the decisive beat to amplify physiological shock."}
            </div>
            {currentSound.emotionalCue && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                <span><strong>Psychological Cue:</strong> {currentSound.emotionalCue}</span>
              </div>
            )}
          </div>

          {/* 2x2 Grid of Detailed Layers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Acoustic Room Tone & Dialogue */}
            <div className="p-4 rounded-2xl bg-[#090e1d] border border-[#1c263c] space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Radio className="w-3.5 h-3.5" />
                <span>VOCAL & ACOUSTIC PRESENCE</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentSound.dialogue || "Crisp, dry, close-mic vocal presence with subtle stone boundary room reverb."}
              </p>
            </div>

            {/* 2. Environmental Ambience */}
            <div className="p-4 rounded-2xl bg-[#090e1d] border border-[#1c263c] space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Waves className="w-3.5 h-3.5" />
                <span>ENVIRONMENTAL AMBIENCE</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentSound.ambience || "Atmospheric background winds, distant precipitation, and low-frequency resonance."}
              </p>
            </div>

            {/* 3. Granular Foley Details */}
            <div className="p-4 rounded-2xl bg-[#090e1d] border border-[#1c263c] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Sliders className="w-3.5 h-3.5" />
                <span>TACTILE FOLEY PROPS & CLOTH</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentSound.foley || "Wet boot sloshes, fabric friction on leather duster, mechanical gear clicks."}
              </p>
            </div>

            {/* 4. Special Sound Effects (SFX) */}
            <div className="p-4 rounded-2xl bg-[#090e1d] border border-[#1c263c] space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>SFX & SUB-BASS DRONES</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentSound.soundEffects || "Deep 38Hz sub-bass drone pulsing continuously; high-frequency electrostatic ionization."}
              </p>
            </div>
          </div>

          {/* Music Score & Orchestration Blueprint */}
          <div className="p-4 rounded-2xl bg-[#090e1d] border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                <Disc className="w-3.5 h-3.5" />
                <span>MUSICAL SCORE & ORCHESTRAL MOTIFS</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                SCENE COMPOSITION
              </span>
            </div>
            <p className="text-xs text-slate-200 font-mono leading-relaxed bg-[#050813] p-3 rounded-xl border border-[#1b2640]">
              {currentSound.music || "Sparse, mournful solo cello over low drone synthesizers, rising into dissonant harmonic tension."}
            </p>
          </div>

          {/* Scene Transition Audio */}
          {currentSound.transition && (
            <div className="p-3.5 rounded-xl bg-[#090e1d] border border-[#1c263c] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔀</span>
                <span className="font-bold text-slate-300">Audio Transition:</span>
                <span className="text-slate-400 font-mono">{currentSound.transition}</span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                J-CUT / L-CUT SYNC
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
