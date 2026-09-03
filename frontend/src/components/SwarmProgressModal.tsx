"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Sparkles, FastForward, Play, Film, ShieldCheck } from "lucide-react";

interface SwarmProgressModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isSwarmRunning?: boolean;
  onSkip?: () => void;
  projectTitle?: string;
  onComplete?: () => void;
}

export const SwarmProgressModal: React.FC<SwarmProgressModalProps> = ({
  isOpen,
  onClose,
  isSwarmRunning,
  onSkip,
  projectTitle,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const agents = [
    { name: "Executive Producer Agent", icon: "🎬", task: "Formulating 3-Act Structure & World Cosmology" },
    { name: "Screenwriter Agent", icon: "📜", task: "Drafting 60 Show-Don't-Tell Screenplay Scenes" },
    { name: "Director Agent", icon: "🎥", task: "Engineering Camera Packages & Staging Shots" },
    { name: "Art Director Agent", icon: "🎨", task: "Building Visual Bible & Character Dossiers" },
    { name: "Cinematographer Agent (DP)", icon: "📷", task: "Mapping Optical Lighting & Lens Specs" },
    { name: "Storyboard Agent", icon: "🖼️", task: "Designing 8K Visual Keyframes" },
    { name: "Sound & Music Agent", icon: "🎵", task: "Scoring Acoustic Frequencies & Sound Cues" },
    { name: "Editor Agent", icon: "✂️", task: "Compiling Pacing & Edit Timeline" },
    { name: "Social & Marketing Agent", icon: "📱", task: "Generating Viral Campaign Assets" },
    { name: "Movement & Dance Agent", icon: "💃", task: "Choreographing Spatial Sequences" },
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsFinished(false);

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < agents.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsFinished(true);
            return agents.length;
          }
        });
      }, 700);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSkip = () => {
    setCurrentStep(agents.length);
    setIsFinished(true);
    onComplete?.();
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((currentStep / agents.length) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#080d1b] border border-indigo-500/50 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1c263c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xl">
              ✨
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">10-Agent Swarm Executing</h3>
              <p className="text-xs text-slate-400">
                Production: <strong className="text-indigo-300">"{projectTitle || "Film Project"}"</strong>
              </p>
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
            const isDone = idx < currentStep || isFinished;
            const isCurrent = idx === currentStep && !isFinished;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between text-xs ${
                  isDone
                    ? "bg-[#091322] border-emerald-500/40 text-slate-200"
                    : isCurrent
                    ? "bg-indigo-950/60 border-indigo-500/80 text-white shadow-lg animate-pulse"
                    : "bg-[#060914] border-[#162138] text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{ag.icon}</span>
                  <div>
                    <strong className="block font-bold text-xs">{ag.name}</strong>
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
