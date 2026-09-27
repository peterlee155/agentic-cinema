"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, FastForward, X } from "lucide-react";

interface SwarmProgressModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isSwarmRunning?: boolean;
  projectId?: string | null;
  onSkip?: () => void;
  projectTitle?: string;
  onComplete?: () => void;
}

export const SwarmProgressModal: React.FC<SwarmProgressModalProps> = ({
  isOpen,
  onClose,
  isSwarmRunning,
  projectId,
  onSkip,
  projectTitle,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [liveData, setLiveData] = useState<{
    current_agent?: string | null;
    percent?: number;
    message?: string;
    completed_agents?: string[];
    is_running?: boolean;
  } | null>(null);

  const agents = [
    { name: "Executive Producer", icon: "🎬", task: "Formulating 3-Act Structure & World Cosmology" },
    { name: "Screenwriter", icon: "📜", task: "Drafting 60 Show-Don't-Tell Screenplay Scenes" },
    { name: "Script Analyst", icon: "📋", task: "Breaking Down Pre-Production Props, Mood & Pacing" },
    { name: "Film Director", icon: "🎥", task: "Engineering Camera Packages & Staging Shots" },
    { name: "Art Director", icon: "🎨", task: "Building Visual Bible & Character Dossiers" },
    { name: "Casting Director", icon: "👥", task: "Architecting Character Psychology & Roster" },
    { name: "Cinematographer (DP)", icon: "📷", task: "Mapping Optical Lighting & Lens Specs" },
    { name: "Visual Storyboard", icon: "🖼️", task: "Designing 8K Visual Keyframes" },
    { name: "Concept Art Illustrator", icon: "🖌️", task: "Generating Photorealistic Imagen 3 Keyframes" },
    { name: "Sound & Music", icon: "🎵", task: "Scoring Acoustic Frequencies & Sound Cues" },
    { name: "Soundtrack Songwriter", icon: "🎶", task: "Composing Original Theme & Vocal Melody" },
    { name: "Voice & Table Read Director", icon: "🎙️", task: "Directing Multi-Speaker Audio Table Read" },
    { name: "Lead Actor Performance", icon: "🎭", task: "Executing Male Lead Subtext & Dramatic Cadence" },
    { name: "Lead Actress Performance", icon: "✨", task: "Executing Female Lead Subtext & High Stakes" },
    { name: "Film Editor", icon: "✂️", task: "Compiling Pacing & Edit Timeline" },
    { name: "Continuity Supervisor", icon: "🔍", task: "Verifying Lore, Logic & Cross-Scene Continuity" },
    { name: "Line Producer & Budget", icon: "💰", task: "Optimizing Scene Costs & Production Tiers" },
    { name: "Production & Studio Ops", icon: "📊", task: "Scheduling Logistics & Studio Telemetry" },
    { name: "Dance & Movement", icon: "💃", task: "Choreographing Spatial Sequences & 135 BPM" },
    { name: "Social & Viral", icon: "📱", task: "Generating Viral Campaign Assets & Hooks" },
  ];

  // Poll real-time backend swarm status
  useEffect(() => {
    if (!isOpen && !isSwarmRunning) return;
    const pid = projectId;
    if (!pid) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/projects/${pid}/pipeline-status`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success) {
            setLiveData(data);
            if (data.current_agent) {
              const matchedIdx = agents.findIndex(
                (a) =>
                  a.name.toLowerCase().includes(data.current_agent.toLowerCase().split(" ")[0]) ||
                  data.current_agent.toLowerCase().includes(a.name.toLowerCase().split(" ")[0])
              );
              if (matchedIdx !== -1) {
                setCurrentStep(matchedIdx);
              }
            }
            if (data.is_running === false && data.percent >= 100) {
              setIsFinished(true);
              setCurrentStep(agents.length);
            }
          }
        }
      } catch (err) {
        console.warn("Error checking pipeline status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 900);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, isSwarmRunning, projectId, agents]);

  // Smooth fallback step incrementer while swarm is running if backend polling is silent
  useEffect(() => {
    if (isOpen && isSwarmRunning && !isFinished) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev < agents.length - 1 ? prev + 1 : prev));
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [isOpen, isSwarmRunning, isFinished, agents.length]);

  const handleSkip = () => {
    setCurrentStep(agents.length);
    setIsFinished(true);
    if (onSkip) {
      onSkip();
    } else {
      onComplete?.();
    }
  };

  if (!isOpen) return null;

  const isWorking = isSwarmRunning ?? (!isFinished);
  const progressPercent = liveData?.percent !== undefined
    ? liveData.percent
    : Math.min(100, Math.round((currentStep / agents.length) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080d1b] border border-indigo-500/50 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1c263c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xl">
              {isWorking ? "✨" : "🎬"}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Movie Team Hard at Work</h3>
              <p className="text-xs text-slate-400">
                Production: <strong className="text-indigo-300">&ldquo;{projectTitle || "Film Project"}&rdquo;</strong>
              </p>
              {liveData?.message && (
                <p className="text-[11px] text-amber-300 font-mono mt-0.5 animate-pulse">
                  ⚡ {liveData.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && (
              <button
                onClick={handleSkip}
                className="bg-[#162038] hover:bg-[#202c4b] border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Skip to results immediately"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            )}
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {progressPercent}% COMPLETE
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="px-2.5 py-1.5 rounded-xl bg-[#162038] hover:bg-[#223154] border border-[#2a3c66] text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1"
                title="Minimize to background (agents will continue running)"
              >
                <span>Minimize</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-[#1d2b4a]">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>Step {Math.min(currentStep + 1, agents.length)} of {agents.length}</span>
            <span>Gemini 3.5+ Swarm Active</span>
          </div>
        </div>

        {/* Live Agents Progress List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {agents.map((ag, idx) => {
            const isDone = isFinished || (liveData?.completed_agents && liveData.completed_agents.some((ca: string) =>
              ca.toLowerCase().includes(ag.name.toLowerCase().split(" ")[0]) ||
              ag.name.toLowerCase().includes(ca.toLowerCase())
            )) || idx < currentStep;

            const isCurrent = !isFinished && (
              (liveData?.current_agent && (
                ag.name.toLowerCase().includes(liveData.current_agent.toLowerCase().split(" ")[0]) ||
                liveData.current_agent.toLowerCase().includes(ag.name.toLowerCase().split(" ")[0])
              )) || (idx === currentStep && isWorking)
            );

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between text-xs ${
                  isDone
                    ? "bg-[#091322] border-emerald-500/40 text-slate-200"
                    : isCurrent
                    ? "bg-indigo-950/70 border-amber-500/80 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40 animate-pulse"
                    : "bg-[#060914] border-[#162138] text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{ag.icon}</span>
                  <div>
                    <strong className="block font-bold text-xs flex items-center gap-2">
                      <span>{ag.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                          ACTIVE
                        </span>
                      )}
                    </strong>
                    <span className="text-[10px] text-slate-400">{ag.task}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">STANDBY</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion & Skip Footer Actions */}
        <div className="pt-2 flex gap-3">
          {!isFinished ? (
            <button
              onClick={handleSkip}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>⏩ Skip Remaining Steps & View Screenplay</span>
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ Swarm Execution Complete — View Production Screenplay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
