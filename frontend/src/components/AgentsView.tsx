"use client";

import React, { useState, useMemo } from "react";
import { RefreshCw, Cpu, Search, CheckCircle2, Play } from "lucide-react";

import { ProjectBibleData } from "../types/project";

interface AgentsViewProps {
  currentProject?: ProjectBibleData | null;
  activeModel?: string;
  onRunSwarm?: () => void;
  isSwarmRunning?: boolean;
  onOpenSwarmProgress?: () => void;
}

type Department =
  | "All"
  | "Directing & Story"
  | "Visuals & Sound"
  | "Cast & Performance"
  | "Production & Lore"
  | "Audience & Viral";

interface TeamAgent {
  name: string;
  icon: string;
  department: Exclude<Department, "All">;
  role: string;
  modelBadge: string;
  status: string;
}

const AGENTS: TeamAgent[] = [
    // Directing & Story
    {
      name: "Executive Producer",
      icon: "🎬",
      department: "Directing & Story",
      role: "High-concept pitch, 3-act structure & commercial brief",
      modelBadge: "Gemini 3.5 Pro",
      status: "COMPLETED",
    },
    {
      name: "Screenwriter",
      icon: "📜",
      department: "Directing & Story",
      role: "60-Scene Show-Don't-Tell screenplay & dialogue",
      modelBadge: "Gemini 3.5 Pro",
      status: "COMPLETED",
    },
    {
      name: "Film Director",
      icon: "🎥",
      department: "Directing & Story",
      role: "Dramatic objectives, subtext & optical staging",
      modelBadge: "Gemini 3.5 Pro",
      status: "COMPLETED",
    },
    {
      name: "Script Analyst",
      icon: "📋",
      department: "Directing & Story",
      role: "Pre-production breakdown, props, mood & pacing analysis",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },

    // Visuals & Sound
    {
      name: "Art Director",
      icon: "🎨",
      department: "Visuals & Sound",
      role: "Wardrobe evolution, stone texture & color palette",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Cinematographer (DP)",
      icon: "📹",
      department: "Visuals & Sound",
      role: "24mm Anamorphic lens package & rim lighting",
      modelBadge: "Gemini 3.5 Pro",
      status: "COMPLETED",
    },
    {
      name: "Visual Storyboard",
      icon: "🖼️",
      department: "Visuals & Sound",
      role: "Generative 8K keyframe prompts & camera angles",
      modelBadge: "Gemini 3.1 Flash Image",
      status: "COMPLETED",
    },
    {
      name: "Concept Art & Keyframe Illustrator",
      icon: "🖌️",
      department: "Visuals & Sound",
      role: "Photorealistic Imagen 3 concept art & visual anchors",
      modelBadge: "Google Imagen 3",
      status: "COMPLETED",
    },
    {
      name: "Sound & Music",
      icon: "🔊",
      department: "Visuals & Sound",
      role: "432 Hz sub-bass pulse & 3s strategic silence",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Soundtrack & Theme Songwriter",
      icon: "🎵",
      department: "Visuals & Sound",
      role: "Original film theme, emotional chord progression & lyrics",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },

    // Cast & Performance
    {
      name: "Casting Director",
      icon: "👥",
      department: "Cast & Performance",
      role: "Psychological want/fear/need architecture & cast roster",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Lead Actor Performance",
      icon: "🎭",
      department: "Cast & Performance",
      role: "Male lead (Leo Thorne) tactical cadence & dialogue delivery",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Lead Actress Performance",
      icon: "✨",
      department: "Cast & Performance",
      role: "Female lead (Lyra Sterling) subtext & emotional range",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Voice & Table Read Director",
      icon: "🎙️",
      department: "Cast & Performance",
      role: "Multi-speaker audio table read & dialogue cadence",
      modelBadge: "Gemini 3.1 Flash TTS",
      status: "COMPLETED",
    },

    // Production & Lore
    {
      name: "Film Editor",
      icon: "✂️",
      department: "Production & Lore",
      role: "Accelerating tempo curves & cut timing",
      modelBadge: "Gemini 3.5 Pro",
      status: "COMPLETED",
    },
    {
      name: "Continuity Supervisor",
      icon: "🔍",
      department: "Production & Lore",
      role: "Cross-scene logic, fact-checking & lore verification",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Line Producer & Budget Optimizer",
      icon: "💰",
      department: "Production & Lore",
      role: "Scene cost breakdown, budget tiers & resource efficiency",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Production & Studio Ops",
      icon: "📊",
      department: "Production & Lore",
      role: "Production logistics, shoot schedules & studio telemetry",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },

    // Audience & Viral
    {
      name: "Dance & Movement",
      icon: "💃",
      department: "Audience & Viral",
      role: "Physical rhythm & 135 BPM viral choreography",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
    {
      name: "Social & Viral",
      icon: "📱",
      department: "Audience & Viral",
      role: "TikTok / Shorts mystery hooks & vertical teasers",
      modelBadge: "Gemini 3.5 Flash",
      status: "COMPLETED",
    },
];

const DEPARTMENTS: Department[] = [
  "All",
  "Directing & Story",
  "Visuals & Sound",
  "Cast & Performance",
  "Production & Lore",
  "Audience & Viral",
];

export const AgentsView: React.FC<AgentsViewProps> = ({
  currentProject,
  activeModel,
  onRunSwarm,
  isSwarmRunning,
  onOpenSwarmProgress,
}) => {
  const [retryingAgent, setRetryingAgent] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [retryNotification, setRetryNotification] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<{
    is_running?: boolean;
    current_agent?: string | null;
    percent?: number;
    message?: string;
    completed_agents?: string[];
  } | null>(null);

  const projectId = currentProject?.id || currentProject?.project_id;

  // Poll live pipeline status
  React.useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/pipeline-status`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success) {
            setLiveStatus(data);
          }
        }
      } catch (err) {
        // silent fallback
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 900);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [projectId, isSwarmRunning]);

  const filteredAgents = useMemo(() => {
    return AGENTS.filter((ag) => {
      const matchesDept = selectedDept === "All" || ag.department === selectedDept;
      const matchesSearch =
        !searchQuery.trim() ||
        ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ag.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [selectedDept, searchQuery]);

  const handleRetry = async (agentName: string) => {
    setRetryingAgent(agentName);
    setRetryNotification(null);
    try {
      const res = await fetch("/api/pipeline/retry-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId || "",
          agent_name: agentName,
        }),
      });
      const data = await res.json();
      setRetryingAgent(null);
      if (data.success) {
        setRetryNotification(`✨ ${agentName} step refreshed successfully!`);
      } else {
        setRetryNotification(`⚠️ ${agentName} alert: ${data.error || "Execution timeout"}`);
      }
    } catch (err) {
      setRetryingAgent(null);
      setRetryNotification(`❌ Error refreshing step: ${err}`);
    }
  };

  const isSwarmActive = Boolean(isSwarmRunning || liveStatus?.is_running);

  const isAgentActive = (agentName: string) => {
    if (!isSwarmActive || !liveStatus?.current_agent) return false;
    const cur = liveStatus.current_agent.toLowerCase();
    const target = agentName.toLowerCase();
    const curWord = cur.split(" ")[0];
    const targetWord = target.split(" ")[0];
    return (
      cur.includes(target) ||
      target.includes(cur) ||
      (curWord.length > 3 && target.includes(curWord)) ||
      (targetWord.length > 3 && cur.includes(targetWord))
    );
  };

  const isAgentCompleted = (agentName: string) => {
    if (!isSwarmActive) return true; // Default ready state when idle
    if (!liveStatus?.completed_agents || liveStatus.completed_agents.length === 0) {
      return false;
    }
    const target = agentName.toLowerCase();
    const targetWord = target.split(" ")[0];
    return liveStatus.completed_agents.some((ca: string) => {
      const c = ca.toLowerCase();
      const cWord = c.split(" ")[0];
      return (
        c.includes(target) ||
        target.includes(c) ||
        (cWord.length > 3 && target.includes(cWord)) ||
        (targetWord.length > 3 && c.includes(targetWord))
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Autonomous Movie Team</h2>
            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
              isSwarmActive
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}>
              {isSwarmActive
                ? `⚡ SWARM ACTIVE (${liveStatus?.percent ?? 0}%)`
                : `${AGENTS.length}/${AGENTS.length} TEAM MEMBERS READY`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-spectrum 20-agent filmmaking swarm powered by Google Gemini ({activeModel || "Gemini 3.5 Pro"}) and ClickHouse MCP telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSwarmActive && onOpenSwarmProgress && (
            <button
              onClick={onOpenSwarmProgress}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>View Swarm Dialog</span>
            </button>
          )}

          {onRunSwarm && (
            <button
              onClick={onRunSwarm}
              disabled={isSwarmActive}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSwarmActive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isSwarmActive ? "Swarm Running..." : "Run Full Team"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Swarm Telemetry Progress Bar */}
      {isSwarmActive && (
        <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-indigo-950/40 border border-amber-500/50 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="font-extrabold text-white text-sm">
                Production Swarm Live Status:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40 animate-pulse">
                {liveStatus?.current_agent ? `⚡ Executing: ${liveStatus.current_agent}` : "Initializing Next Agent..."}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-amber-300">
                {liveStatus?.percent ?? 0}% Finished
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-amber-500/30">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, liveStatus?.percent ?? 0)}%` }}
            />
          </div>

          {liveStatus?.message && (
            <p className="text-xs text-amber-200/90 font-mono flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
              <span>{liveStatus.message}</span>
            </p>
          )}
        </div>
      )}

      {/* Notification Banner if active */}
      {retryNotification && (
        <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{retryNotification}</span>
          </div>
          <button
            onClick={() => setRetryNotification(null)}
            className="text-slate-400 hover:text-white text-xs ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Department Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Department Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#090e1d] p-1.5 rounded-2xl border border-[#1c263c]">
          {DEPARTMENTS.map((dept) => {
            const count =
              dept === "All"
                ? AGENTS.length
                : AGENTS.filter((a) => a.department === dept).length;
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#162038]"
                }`}
              >
                <span>{dept}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#1c263c] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team member or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090e1d] border border-[#1c263c] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((ag) => {
          const isCurrent = isAgentActive(ag.name);
          const isDone = isAgentCompleted(ag.name);
          const isQueued = isSwarmActive && !isCurrent && !isDone;

          let badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
          let badgeText = "✓ READY";

          if (isCurrent) {
            badgeClass = "bg-amber-500/25 text-amber-300 border-amber-500/70 animate-pulse shadow-sm";
            badgeText = "⚡ RUNNING";
          } else if (isDone) {
            badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
            badgeText = "✓ COMPLETED";
          } else if (isQueued) {
            badgeClass = "bg-slate-800/80 text-slate-400 border-slate-700";
            badgeText = "⏳ QUEUED";
          }

          const cardBorderClass = isCurrent
            ? "border-amber-500/90 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/40 bg-[#0e1628]"
            : "border-[#1c263c] hover:border-indigo-500/40 bg-[#090e1d]";

          return (
            <div
              key={ag.name}
              className={`cinema-card p-5 flex flex-col justify-between space-y-4 transition ${cardBorderClass}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${isCurrent ? "animate-bounce" : ""}`}>{ag.icon}</span>
                    <div>
                      <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <span>{ag.name}</span>
                        {isCurrent && (
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {ag.department}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ag.role}</p>
              </div>

              <div className="pt-3 border-t border-[#1c263c] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-400" /> {ag.modelBadge}
                </span>
                <button
                  disabled={retryingAgent === ag.name || isCurrent}
                  onClick={() => handleRetry(ag.name)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      retryingAgent === ag.name || isCurrent ? "animate-spin text-amber-400" : ""
                    }`}
                  />
                  <span>
                    {retryingAgent === ag.name || isCurrent
                      ? "Running..."
                      : "Try step again"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
