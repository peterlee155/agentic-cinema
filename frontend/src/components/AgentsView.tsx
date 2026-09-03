"use client";

import React, { useState } from "react";
import { Bot, RefreshCw, CheckCircle2, Sparkles, Cpu } from "lucide-react";

interface AgentsViewProps {
  currentProject?: any;
  activeModel?: string;
  onRunSwarm?: () => void;
  isSwarmRunning?: boolean;
}

export const AgentsView: React.FC<AgentsViewProps> = ({ currentProject, activeModel }) => {
  const [retryingAgent, setRetryingAgent] = useState<string | null>(null);

  const agents = [
    { name: "Executive Producer", icon: "🎬", role: "High-concept pitch, 3-act structure & commercial brief", status: "COMPLETED" },
    { name: "Screenwriter", icon: "📜", role: "60-Scene Show-Don't-Tell screenplay & dialogue", status: "COMPLETED" },
    { name: "Film Director", icon: "🎥", role: "Dramatic objectives, subtext & optical staging", status: "COMPLETED" },
    { name: "Cinematographer (DP)", icon: "📹", role: "24mm Anamorphic lens package & rim lighting", status: "COMPLETED" },
    { name: "Sound & Music", icon: "🔊", role: "432 Hz sub-bass pulse & 3s strategic silence", status: "COMPLETED" },
    { name: "Film Editor", icon: "✂️", role: "Accelerating tempo curves & cut timing", status: "COMPLETED" },
    { name: "Art Director", icon: "🎨", role: "Wardrobe evolution, stone texture & color palette", status: "COMPLETED" },
    { name: "Social & Viral", icon: "📱", role: "TikTok / Shorts mystery hooks & vertical teasers", status: "COMPLETED" },
    { name: "Visual Storyboard", icon: "🖼️", role: "Generative 8K keyframe prompts & camera angles", status: "COMPLETED" },
    { name: "Dance & Movement", icon: "💃", role: "Physical rhythm & 135 BPM choreography", status: "COMPLETED" },
  ];

  const handleRetry = async (agentName: string) => {
    setRetryingAgent(agentName);
    try {
      const res = await fetch("/api/pipeline/retry-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id || "",
          agent_name: agentName,
        }),
      });
      const data = await res.json();
      setRetryingAgent(null);
      if (data.success) {
        alert(`✨ ${agentName} Agent completed successfully!`);
      } else {
        alert(`Agent retry alert: ${data.error || "Execution timeout"}`);
      }
    } catch (err) {
      setRetryingAgent(null);
      alert(`Error retrying agent: ${err}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">10-Agent Autonomous Film Swarm</h2>
            <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
              10/10 AGENTS ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-agent pipeline powered by Google Gemini ({activeModel}) and ClickHouse MCP telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((ag, idx) => (
          <div key={idx} className="cinema-card p-5 flex flex-col justify-between space-y-4 bg-[#090e1d] border-[#1c263c]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ag.icon}</span>
                  <h3 className="font-extrabold text-white text-sm">{ag.name}</h3>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                  {ag.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ag.role}</p>
            </div>

            <div className="pt-3 border-t border-[#1c263c] flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-400" /> Gemini 3.5+ Certified
              </span>
              <button
                disabled={retryingAgent === ag.name}
                onClick={() => handleRetry(ag.name)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retryingAgent === ag.name ? "animate-spin" : ""}`} />
                <span>{retryingAgent === ag.name ? "Running..." : "Run Agent"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
