"use client";

import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Volume2,
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Play,
  Send,
  RefreshCw,
  ExternalLink,
  Layers,
  Camera,
  Film,
  DollarSign,
  Calendar,
  Cpu,
  Users
} from "lucide-react";

import { ProjectBibleData } from "../types/project";

interface DevpostScriptScene {
  scene_number?: number;
  location?: string;
  time_of_day?: string;
  setting_and_time?: string;
  scene_summary?: string;
  characters_present?: Array<{ name: string; emotional_state?: string; objective?: string; emotion_tone?: string; [key: string]: unknown }>;
  vfx_elements?: string[];
  visual_details?: string;
  props_and_vfx?: string[];
  dialogue_lines?: Array<{ character: string; line: string }>;
  [key: string]: unknown;
}

interface DevpostStoryboardData {
  imagen3_prompt: string;
  veo_video_prompt?: string;
  camera_shot_type?: string;
  lighting_and_color_palette?: string;
  subject_action?: string;
  artistic_style_and_textures?: string;
  lens_and_lighting?: {
    lens?: string;
    lighting?: string;
    focal_length?: string;
  };
  negative_prompt?: string;
  anti_buzzword_audit?: string;
  technical_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface DevpostAudioData {
  full_multi_speaker_ssml?: string;
  table_read_lines?: Array<{
    character: string;
    speaker?: string;
    raw_text: string;
    ssml: string;
    director_cue?: string;
    emotional_tone?: string;
    pause_after_ms?: number;
    [key: string]: unknown;
  }>;
  voice_casting?: Array<{
    character: string;
    voice_persona?: string;
    vocal_timber?: string;
    voice_profile?: string;
    base_pitch?: string;
    base_rate?: string;
    [key: string]: unknown;
  }>;
  soundscape_cues?: Array<{
    cue_type: string;
    description: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface DevpostOpsData {
  user_query: string;
  query?: string;
  answer?: string;
  reasoning?: string;
  safety_check?: string;
  alert?: string;
  details?: string;
  action_required?: string;
  mcp_function_called?: {
    tool: string;
    server: string;
    arguments?: Record<string, unknown>;
  };
  visual_metrics?: {
    headline_metric?: string;
    runway_status?: string;
    ascii_table?: string;
    [key: string]: unknown;
  };
  actionable_next_steps?: string[];
  grafana_observability?: {
    dashboard_url?: string;
    [key: string]: unknown;
  };
  telemetry_summary?: Record<string, unknown>;
  [key: string]: unknown;
}

interface DevpostFocusViewProps {
  currentProject?: ProjectBibleData | null;
  activeModel?: string;
}

export const DevpostFocusView: React.FC<DevpostFocusViewProps> = ({
  currentProject,
  activeModel = "gemini-3.6-flash"
}) => {
  const [selectedAgent, setSelectedAgent] = useState<"script" | "storyboard" | "audio" | "ops">("script");
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Agent 1: Script Analysis State
  const [scriptInput, setScriptInput] = useState("");
  const [scriptResult, setScriptResult] = useState<DevpostScriptScene[] | null>(null);

  // Agent 2: Storyboard & Visual State
  const defaultScene = currentProject?.scenes?.[0]
    ? `${currentProject.scenes[0].header || "SCENE 1"}\n${currentProject.scenes[0].description || ""}`
    : "EXT. CITY METROPOLIS - DUSK\nRain glazes the elevated mag-rail tracks. Neon atmospheric lighting cuts through the haze as our protagonist surveys the bustling urban canyons below.";
  const [sceneInput, setSceneInput] = useState(defaultScene);
  const [storyboardResult, setStoryboardResult] = useState<DevpostStoryboardData | null>(null);

  // Agent 3: Audio & Voice State
  const [dialogueInput, setDialogueInput] = useState("");
  const [audioResult, setAudioResult] = useState<DevpostAudioData | null>(null);

  // Agent 4: Production & Ops State
  const [opsQuery, setOpsQuery] = useState("What is our current departmental budget allocation and burn rate?");
  const [opsResult, setOpsResult] = useState<DevpostOpsData | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Run Agent 1: Script Analysis
  const handleRunScriptAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/script-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id || "proj_last_spell",
          script_text: scriptInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScriptResult(data.breakdown);
      } else {
        alert(`Script Analysis failed: ${data.error}`);
      }
    } catch (e) {
      alert(`Error calling Script Analysis Agent: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  // Run Agent 2: Storyboard Visual
  const handleRunStoryboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/storyboard-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id || "proj_last_spell",
          scene_description: sceneInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStoryboardResult(data.concept_frame);
      } else {
        alert(`Storyboard generation failed: ${data.error}`);
      }
    } catch (e) {
      alert(`Error calling Storyboard Agent: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  // Run Agent 3: Audio & Voice Table Read
  const handleRunAudio = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/audio-table-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id || "proj_last_spell",
          dialogue_text: dialogueInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAudioResult(data.table_read);
      } else {
        alert(`Audio table read generation failed: ${data.error}`);
      }
    } catch (e) {
      alert(`Error calling Audio & Voice Agent: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  // Run Agent 4: Production & Ops MCP
  const handleRunOps = async (queryText?: string, confirmMutation: boolean = false) => {
    const q = queryText || opsQuery;
    setLoading(true);
    try {
      const res = await fetch("/api/agents/production-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id || "proj_last_spell",
          query: q,
          confirmed_by_producer: confirmMutation,
        }),
      });
      const data = await res.json();
      setOpsResult(data);
    } catch (e) {
      alert(`Error calling Production & Ops Agent: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0d1322] via-[#101935] to-[#0d1322] border border-[#1f2c4a] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Google Devpost Hackathon: 4 Core Agents Studio
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                OFFICIAL HACKATHON FOCUS
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl">
              Specialized AI film production crew tailored directly to the Google Devpost guidelines:
              Script Breakdown, Imagen 3 Optics, Gemini 3.1 Flash TTS Multi-Speaker Synthesis, and ClickHouse MCP Analytics.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] bg-[#070b16] px-3.5 py-2 rounded-xl border border-[#1d2945] text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Engine:</span>
            <span className="text-indigo-300 font-bold">{activeModel}</span>
          </div>
        </div>

        {/* 4 Agent Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-6">
          <button
            onClick={() => setSelectedAgent("script")}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedAgent === "script"
                ? "bg-indigo-600/30 border-indigo-500/60 text-white shadow-lg"
                : "bg-[#080d1a] border-[#18233c] text-slate-400 hover:text-slate-200 hover:bg-[#0d152a]"
            }`}
          >
            <span className="text-2xl p-2 rounded-lg bg-indigo-500/10 text-indigo-400">📜</span>
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">၁။ Script Analysis</div>
              <div className="text-xs font-bold text-slate-200 truncate">Pre-Production Breakdown</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedAgent("storyboard")}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedAgent === "storyboard"
                ? "bg-purple-600/30 border-purple-500/60 text-white shadow-lg"
                : "bg-[#080d1a] border-[#18233c] text-slate-400 hover:text-slate-200 hover:bg-[#0d152a]"
            }`}
          >
            <span className="text-2xl p-2 rounded-lg bg-purple-500/10 text-purple-400">🖼️</span>
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-purple-400 uppercase font-bold">၂။ Storyboard & Visual</div>
              <div className="text-xs font-bold text-slate-200 truncate">Google Imagen 3 Optics</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedAgent("audio")}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedAgent === "audio"
                ? "bg-sky-600/30 border-sky-500/60 text-white shadow-lg"
                : "bg-[#080d1a] border-[#18233c] text-slate-400 hover:text-slate-200 hover:bg-[#0d152a]"
            }`}
          >
            <span className="text-2xl p-2 rounded-lg bg-sky-500/10 text-sky-400">🎙️</span>
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-sky-400 uppercase font-bold">၃။ Audio & Voice</div>
              <div className="text-xs font-bold text-slate-200 truncate">Gemini TTS Table Read</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedAgent("ops")}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
              selectedAgent === "ops"
                ? "bg-emerald-600/30 border-emerald-500/60 text-white shadow-lg"
                : "bg-[#080d1a] border-[#18233c] text-slate-400 hover:text-slate-200 hover:bg-[#0d152a]"
            }`}
          >
            <span className="text-2xl p-2 rounded-lg bg-emerald-500/10 text-emerald-400">⚡</span>
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">၄။ Production & Ops</div>
              <div className="text-xs font-bold text-slate-200 truncate">ClickHouse MCP & Safety</div>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SCRIPT ANALYSIS AGENT VIEW */}
      {/* ========================================================================= */}
      {selectedAgent === "script" && (
        <div className="space-y-6">
          <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c263c] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Script Analysis Agent — Pre-Production Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="font-bold text-slate-300">Role:</span> Expert Script Analyst & Pre-Production Coordinator
                  &nbsp;|&nbsp; <span className="font-bold text-slate-300">Requirement:</span> Structured JSON breakdown of{" "}
                  <code className="text-indigo-300">scene_summary</code>,{" "}
                  <code className="text-indigo-300">characters_present</code>,{" "}
                  <code className="text-indigo-300">props_and_vfx</code>, and{" "}
                  <code className="text-indigo-300">setting_and_time</code> without hallucination.
                </p>
              </div>
              <button
                onClick={handleRunScriptAnalysis}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Analyze Movie Script</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Screenplay Text / Scenes (leave empty to analyze active project &ldquo;{currentProject?.project?.title || currentProject?.title || "Active Film"}&rdquo;):
              </label>
              <textarea
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
                placeholder="Paste movie screenplay scene text here, or click 'Analyze Movie Script' to process canonical scenes directly..."
                className="w-full h-24 bg-[#050813] border border-[#1c263c] rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Results Display */}
          {scriptResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pre-Production Scene Breakdown ({scriptResult.length} Scenes Extracted)
                </h4>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(scriptResult, null, 2), "script_json")}
                  className="px-3 py-1.5 rounded-lg bg-[#11192e] hover:bg-[#182442] border border-[#1e2e50] text-[11px] font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedText === "script_json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy JSON Breakdown</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scriptResult.map((sc, idx) => (
                  <div key={idx} className="bg-[#090e1d] border border-[#1c263c] rounded-xl p-5 space-y-3.5">
                    <div className="flex items-center justify-between gap-2 border-b border-[#1c263c] pb-2.5">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        SCENE {sc.scene_number || idx + 1}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30 truncate">
                        {sc.setting_and_time}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Scene Summary:</div>
                      <p className="text-xs text-slate-200 leading-relaxed">{sc.scene_summary}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Characters Present:</div>
                      <div className="space-y-1">
                        {(sc.characters_present || []).map((ch, cidx: number) => (
                          <div key={cidx} className="text-xs bg-[#060914] px-2.5 py-1.5 rounded-lg border border-[#18233c] flex items-start gap-2">
                            <span className="font-bold text-indigo-300 shrink-0">{ch.name}:</span>
                            <span className="text-slate-300">{ch.emotion_tone}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Props & VFX:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(sc.props_and_vfx || []).map((prop: string, pidx: number) => (
                          <span key={pidx} className="text-[10px] bg-[#121b33] text-slate-300 px-2 py-0.5 rounded-md border border-[#203055]">
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STORYBOARD & VISUAL AGENT VIEW */}
      {/* ========================================================================= */}
      {selectedAgent === "storyboard" && (
        <div className="space-y-6">
          <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c263c] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Storyboard & Visual Agent — Google Imagen 3 Prompt Generator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="font-bold text-slate-300">Role:</span> Concept Artist & Cinematographer
                  &nbsp;|&nbsp; <span className="font-bold text-slate-300">Anti-Buzzword Rule:</span> Does not use &quot;photorealistic&quot; in isolation;
                  details textures, optical lens depth, and lighting dynamics.
                </p>
              </div>
              <button
                onClick={handleRunStoryboard}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Imagen 3 Concept Frame</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Quick Scene Presets:</div>
              <div className="flex flex-wrap gap-2">
                {((currentProject?.scenes && currentProject.scenes.length > 0)
                  ? currentProject.scenes.slice(0, 4).map((sc, sidx) => ({
                      name: `Scene ${sc.sceneNumber || sidx + 1}: ${sc.slugline || sc.header || "Scene"}`,
                      desc: `${sc.header || sc.slugline || `SCENE ${sidx + 1}`}\n${sc.description || ""}`,
                    }))
                  : [
                      {
                        name: "Scene 1: Sanctuary Perimeter (Dusk)",
                        desc: "EXT. SANCTUARY PERIMETER - DUSK\nTorrential atmospheric rain beats heavily against the translucent forcefield dome as emergency alarms pulse in rhythmic amber sequences.",
                      },
                      {
                        name: "Scene 2: Subterranean Bazaar (Night)",
                        desc: "EXT. SUBTERRANEAN BAZAAR - NIGHT\nCrowded underground market made of repurposed transit shipping modules under dripping condensation pipelines.",
                      },
                      {
                        name: "Scene 3: Archive Vault (Subterranean)",
                        desc: "INT. SECURE ARCHIVE VAULT - NIGHT\nWater gathers on the metallic decking as a hydraulic containment hatch is breached, steam billowing outward into the chamber.",
                      },
                      {
                        name: "Scene 4: Bridge Crossing (Dawn)",
                        desc: "EXT. SUSPENSION VIADUCT - DAWN\nA silhouette sprints across the shattered steel railway bridge into the rising orange morning haze.",
                      },
                    ]
                ).map((preset, pidx) => (
                  <button
                    key={pidx}
                    onClick={() => setSceneInput(preset.desc)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-[#0e1424] hover:bg-[#162038] border border-[#1e2a47] text-slate-300 transition cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Scene Description from Film Script:</label>
              <textarea
                value={sceneInput}
                onChange={(e) => setSceneInput(e.target.value)}
                rows={3}
                className="w-full bg-[#050813] border border-[#1c263c] rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Generated Concept Frame Output */}
          {storyboardResult && (
            <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#1c263c] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Google Imagen 3 Concept Frame Specification
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/40">
                    ANTI-BUZZWORD VERIFIED
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40">
                    ASPECT RATIO 16:9
                  </span>
                </div>
              </div>

              {/* Optical Attributes Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#060914] p-4 rounded-xl border border-[#18233c] space-y-1">
                  <div className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" /> Camera Shot Type
                  </div>
                  <div className="text-xs text-slate-200 font-medium">{storyboardResult.camera_shot_type}</div>
                </div>

                <div className="bg-[#060914] p-4 rounded-xl border border-[#18233c] space-y-1">
                  <div className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Lighting & Color Palette
                  </div>
                  <div className="text-xs text-slate-200 font-medium">{storyboardResult.lighting_and_color_palette}</div>
                </div>

                <div className="bg-[#060914] p-4 rounded-xl border border-[#18233c] space-y-1">
                  <div className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" /> Subject Action
                  </div>
                  <div className="text-xs text-slate-200 font-medium">{storyboardResult.subject_action}</div>
                </div>

                <div className="bg-[#060914] p-4 rounded-xl border border-[#18233c] space-y-1">
                  <div className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Textures & Optical Dynamics
                  </div>
                  <div className="text-xs text-slate-200 font-medium">{storyboardResult.artistic_style_and_textures}</div>
                </div>
              </div>

              {/* Final Imagen 3 Prompt Box */}
              <div className="bg-[#060a17] border border-purple-500/40 rounded-xl p-4.5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    🎨 Final Google Imagen 3 Prompt:
                  </span>
                  <button
                    onClick={() => copyToClipboard(storyboardResult.imagen3_prompt, "imagen3_prompt")}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-xs font-bold text-purple-200 flex items-center gap-1.5 cursor-pointer transition"
                  >
                    {copiedText === "imagen3_prompt" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === "imagen3_prompt" ? "Copied!" : "Copy Imagen 3 Prompt"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-100 font-mono leading-relaxed bg-[#04060e] p-3.5 rounded-lg border border-[#19223a]">
                  &ldquo;{storyboardResult.imagen3_prompt}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. AUDIO & VOICE AGENT VIEW */}
      {/* ========================================================================= */}
      {selectedAgent === "audio" && (
        <div className="space-y-6">
          <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c263c] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-sky-400" />
                  Audio & Voice Agent — Gemini 3.1 Flash TTS Table Read
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="font-bold text-slate-300">Role:</span> Voice Director & Table Read Assistant
                  &nbsp;|&nbsp; <span className="font-bold text-slate-300">Output:</span> Identifies emotional tone per line,
                  annotates SSML markers (<code className="text-sky-300">&lt;prosody&gt;</code>, <code className="text-sky-300">&lt;break&gt;</code>),
                  and ensures seamless multi-speaker theatrical transitions.
                </p>
              </div>
              <button
                onClick={handleRunAudio}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-600/30 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Generate Multi-Speaker Table Read</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Dialogue Text (leave blank to synthesize active film scene dialogues):
              </label>
              <textarea
                value={dialogueInput}
                onChange={(e) => setDialogueInput(e.target.value)}
                placeholder={`Paste character dialogue lines here, or leave blank to format canonical dialogue for ${currentProject?.project?.title || currentProject?.title || "this film"}...`}
                className="w-full h-20 bg-[#050813] border border-[#1c263c] rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Table Read Output */}
          {audioResult && (
            <div className="space-y-5">
              {/* Voice Casting Profiles */}
              <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1c263c] pb-3">
                  <Users className="w-4 h-4 text-sky-400" />
                  Gemini 3.1 Flash TTS Voice Casting & Profiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {(audioResult.voice_casting || []).map((v, vidx: number) => (
                    <div key={vidx} className="bg-[#060914] p-4 rounded-xl border border-[#18233c] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{v.character}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
                          {v.voice_profile?.split(" ")[0] || "Voice"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">{v.voice_profile}</p>
                      <div className="flex items-center gap-3 pt-1 border-t border-[#18233c] text-[10px] font-mono text-slate-400">
                        <span>Pitch: <strong className="text-slate-200">{v.base_pitch}</strong></span>
                        <span>Rate: <strong className="text-slate-200">{v.base_rate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line-by-Line Table Read Script */}
              <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1c263c] pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-sky-400" />
                    Theatrical Multi-Speaker Table Read Lines
                  </h4>
                  <button
                    onClick={() => copyToClipboard(audioResult.full_multi_speaker_ssml || "", "full_ssml")}
                    className="px-3 py-1.5 rounded-lg bg-[#11192e] hover:bg-[#182442] border border-[#1e2e50] text-[11px] font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedText === "full_ssml" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Full SSML Script</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(audioResult.table_read_lines || []).map((line, lidx: number) => (
                    <div key={lidx} className="bg-[#060914] border border-[#18233c] rounded-xl p-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">[{line.speaker}]</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-semibold border border-sky-500/30">
                            {line.emotional_tone}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          Pause After: {line.pause_after_ms}ms
                        </span>
                      </div>

                      <p className="text-xs text-slate-100 font-serif italic pl-3 border-l-2 border-sky-500/50">
                        &ldquo;{line.raw_text}&rdquo;
                      </p>

                      <div className="bg-[#03050a] p-2.5 rounded-lg border border-[#141b2c] font-mono text-[11px] text-sky-200/90 overflow-x-auto">
                        <code>{line.ssml}</code>
                      </div>

                      {line.director_cue && (
                        <div className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5">
                          <span className="text-amber-400 font-bold">🎬 Director Cue:</span> {line.director_cue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PRODUCTION & OPS AGENT VIEW */}
      {/* ========================================================================= */}
      {selectedAgent === "ops" && (
        <div className="space-y-6">
          <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-4">
            <div className="border-b border-[#1c263c] pb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Production & Ops Agent — Model Context Protocol (MCP) & ClickHouse
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                <span className="font-bold text-slate-300">Role:</span> Studio Resource & Budget Logistics Manager
                &nbsp;|&nbsp; <span className="font-bold text-slate-300">Connected:</span> ClickHouse MergeTree Database & Grafana Labs
                &nbsp;|&nbsp; <span className="font-bold text-slate-300">Safety Check:</span> Automatic mutation guard against modifying production logs.
              </p>
            </div>

            {/* Quick Query Selector Buttons */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Preset Studio Queries:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    label: "💰 Departmental Budget & Burn Rate",
                    query: "What is our current departmental budget allocation and burn rate?",
                    danger: false,
                  },
                  {
                    label: "📅 Shoot Schedules & Overtime Risk",
                    query: "Show the shoot schedule calendar, daily hours, and location risks.",
                    danger: false,
                  },
                  {
                    label: "🎬 Scene Costs & Savings Opportunities",
                    query: "Break down scene costs and suggest actionable cost optimizations.",
                    danger: false,
                  },
                  {
                    label: "⚠️ Test Safety Check (Mutation Guard)",
                    query: "DELETE FROM cinema.budget_allocation WHERE department = 'VFX';",
                    danger: true,
                  },
                ].map((item, qidx) => (
                  <button
                    key={qidx}
                    onClick={() => {
                      setOpsQuery(item.query);
                      handleRunOps(item.query);
                    }}
                    className={`text-left p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      item.danger
                        ? "bg-rose-950/20 border-rose-800/40 text-rose-300 hover:bg-rose-900/30"
                        : "bg-[#060914] border-[#18233c] text-slate-300 hover:bg-[#0c1224] hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    <Send className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Query Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={opsQuery}
                onChange={(e) => setOpsQuery(e.target.value)}
                placeholder="Ask about budget, schedule, scene costs, or type ClickHouse SQL..."
                className="flex-1 bg-[#050813] border border-[#1c263c] rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={() => handleRunOps()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Execute MCP</span>
              </button>
            </div>
          </div>

          {/* MCP Query Output */}
          {opsResult && (
            <div className="bg-[#090e1d] border border-[#1c263c] rounded-2xl p-6 space-y-5">
              {/* Header with Safety Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c263c] pb-3.5">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono text-slate-400">
                    Query: <strong className="text-white font-sans">&ldquo;{opsResult.user_query}&rdquo;</strong>
                  </div>
                  {opsResult.mcp_function_called && (
                    <div className="text-[11px] font-mono text-emerald-400">
                      MCP Tool: <strong>{opsResult.mcp_function_called.tool}</strong> &nbsp;|&nbsp;
                      Server: {opsResult.mcp_function_called.server}
                    </div>
                  )}
                </div>

                {/* Safety Check Badge */}
                <div>
                  {opsResult.safety_check?.includes("BLOCKED") || opsResult.safety_check?.includes("FAILED") ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      MUTATION GUARD BLOCKED
                    </span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      SAFETY CHECK PASSED
                    </span>
                  )}
                </div>
              </div>

              {/* Blocked Mutation Alert */}
              {opsResult.safety_check?.includes("BLOCKED") && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {opsResult.alert || "Destructive Operation Intercepted"}
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">{opsResult.details}</p>
                  <div className="text-[11px] font-mono text-slate-300 pt-1">
                    Action: {opsResult.action_required}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => handleRunOps(opsResult.query || opsQuery, true)}
                      className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Override with Producer Confirmation
                    </button>
                  </div>
                </div>
              )}

              {/* Successful Visual Metrics */}
              {opsResult.visual_metrics && (
                <div className="space-y-4">
                  {opsResult.visual_metrics.headline_metric && (
                    <div className="bg-[#060914] p-4 rounded-xl border border-[#18233c] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase">Executive Headline:</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {opsResult.visual_metrics.headline_metric}
                        </div>
                      </div>
                      {opsResult.visual_metrics.runway_status && (
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                          RUNWAY: {opsResult.visual_metrics.runway_status}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ASCII Formatted Analytical Table */}
                  {opsResult.visual_metrics.ascii_table && (
                    <div className="bg-[#04060f] border border-[#162038] rounded-xl p-4 overflow-x-auto">
                      <pre className="font-mono text-xs text-emerald-300 leading-relaxed">
                        {opsResult.visual_metrics.ascii_table}
                      </pre>
                    </div>
                  )}

                  {/* Actionable Cost Optimization Next Steps */}
                  {opsResult.actionable_next_steps && opsResult.actionable_next_steps.length > 0 && (
                    <div className="bg-[#060914] border border-[#18233c] rounded-xl p-4.5 space-y-2.5">
                      <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Actionable Next Steps for Cost Optimization:
                      </h5>
                      <div className="space-y-1.5">
                        {opsResult.actionable_next_steps.map((step: string, sidx: number) => (
                          <div key={sidx} className="text-xs text-slate-200 leading-relaxed pl-2 border-l border-amber-400/40">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grafana Observability Dashboard Link */}
                  {opsResult.grafana_observability && (
                    <div className="p-3.5 rounded-xl bg-[#091122] border border-[#1a2846] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-amber-400 font-bold">📊 Grafana Labs Live Observability:</span>
                        <span className="text-slate-400">Panels configured for real-time burn rates & telemetry.</span>
                      </div>
                      <a
                        href={opsResult.grafana_observability.dashboard_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-mono font-bold underline"
                      >
                        <span>Open Grafana Studio Dashboard</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
