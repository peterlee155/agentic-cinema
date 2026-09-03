"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Hammer, Sparkles, CreditCard, ScrollText, Play, CheckCircle2, ChevronDown } from "lucide-react";

interface ChatViewProps {
  currentProject: any;
  activeModel: string;
  onRunSwarm: () => void;
  onOpenRevenueCat: () => void;
  onNavigateToScene: (sceneNum: number) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentProject,
  activeModel,
  onRunSwarm,
  onOpenRevenueCat,
  onNavigateToScene,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWorking]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isWorking) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsWorking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          model: activeModel,
          project_id: currentProject?.project_id || "",
        }),
      });

      const data = await res.json();
      setIsWorking(false);

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            model: data.model,
            matchedScene: data.matched_scene,
            isSubQuery: data.is_subscription_query,
            subData: data.subscription_data,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ **Notice:** ${data.message || data.error || "Unable to complete request."}`,
            model: activeModel,
          },
        ]);
      }
    } catch (err: any) {
      setIsWorking(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Connection Alert:** ${err.message}. Verify local studio backend is running on port 8000.`,
          model: activeModel,
        },
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col cinema-card bg-[#070913] border-[#1c263c] overflow-hidden">
      {/* Top Header */}
      <div className="h-14 border-b border-[#1c263c] px-6 flex items-center justify-between bg-[#090d1a]/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-sm">✨</span>
          <span className="text-xs font-extrabold text-white">AI Studio Copilot Command Center</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
            {activeModel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunSwarm}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Swarm</span>
          </button>
          <button
            onClick={() => setMessages([])}
            className="p-2 rounded-xl bg-[#111728] hover:bg-[#162038] border border-[#22304d] text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Reset Chat"
          >
            🧹
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-amber-500/20 border border-indigo-500/40 mx-auto flex items-center justify-center text-3xl text-indigo-300 shadow-2xl">
              🎬
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Agentic Cinema Studio Command Center
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                Direct your autonomous film swarm, write scenes, audit continuity, calibrate optical packages, or check RevenueCat credits.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
              <button
                onClick={() =>
                  handleSend("Write a tense dialogue between Kaelen and Elias in Scene 09 regarding Rule 03 (Cognitive Disguise).")
                }
                className="p-4 rounded-2xl bg-[#0e1424] hover:bg-[#141d34] border border-[#1d2944] hover:border-indigo-500/50 text-xs text-slate-300 transition cursor-pointer shadow-lg group"
              >
                <div className="font-bold text-white mb-1 group-hover:text-indigo-300 transition flex items-center gap-1.5 text-sm">
                  <span>🎭 Scene 09 Confrontation</span>
                </div>
                <div className="text-[11px] text-slate-400">Write dialogue between Kaelen & Elias on Rule 03</div>
              </button>

              <button
                onClick={() =>
                  handleSend("Explain how the 12-vector continuity engine audits the 4-hour countdown timer across all 60 scenes.")
                }
                className="p-4 rounded-2xl bg-[#0e1424] hover:bg-[#141d34] border border-[#1d2944] hover:border-indigo-500/50 text-xs text-slate-300 transition cursor-pointer shadow-lg group"
              >
                <div className="font-bold text-white mb-1 group-hover:text-indigo-300 transition flex items-center gap-1.5 text-sm">
                  <span>🛡️ 12-Vector Continuity Audit</span>
                </div>
                <div className="text-[11px] text-slate-400">Run diagnostic audit on the 4-hour countdown timeline</div>
              </button>

              <button
                onClick={() =>
                  handleSend("Generate a motivated camera and lighting package for Scene 45 (Railway Bridge Chokepoint Detonation).")
                }
                className="p-4 rounded-2xl bg-[#0e1424] hover:bg-[#141d34] border border-[#1d2944] hover:border-indigo-500/50 text-xs text-slate-300 transition cursor-pointer shadow-lg group"
              >
                <div className="font-bold text-white mb-1 group-hover:text-indigo-300 transition flex items-center gap-1.5 text-sm">
                  <span>🎥 Scene 45 Optical Setup</span>
                </div>
                <div className="text-[11px] text-slate-400">Design camera rig, lenses, and lighting for bridge blast</div>
              </button>

              <button
                onClick={() => handleSend("Check my revenuecat subscription and credit balance.")}
                className="p-4 rounded-2xl bg-[#0e1424] hover:bg-[#141d34] border border-[#1d2944] hover:border-amber-500/50 text-xs text-slate-300 transition cursor-pointer shadow-lg group"
              >
                <div className="font-bold text-amber-300 mb-1 group-hover:text-amber-200 transition flex items-center gap-1.5 text-sm">
                  <span>💳 Check RevenueCat Subscription</span>
                </div>
                <div className="text-[11px] text-slate-400">Verify active PRO entitlements, total credits, & upgrade options</div>
              </button>
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 max-w-3xl ${m.role === "user" ? "ml-auto justify-end max-w-2xl" : ""}`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center text-sm text-amber-300 shrink-0 shadow-md">
                🎬
              </div>
            )}

            <div
              className={`p-4 rounded-2xl leading-relaxed space-y-3 ${
                m.role === "user"
                  ? "bg-indigo-600/90 text-white text-xs md:text-sm rounded-tr-none border border-indigo-400/30 shadow-lg"
                  : "bg-[#0d1324] text-slate-200 text-xs md:text-sm rounded-tl-none border border-[#1d2a45] shadow-lg flex-1 min-w-0"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex items-center justify-between pb-2 border-b border-[#1c2842] text-[10px] text-slate-400">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>Google Gemini Studio Copilot</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      {m.model || activeModel}
                    </span>
                  </span>
                  <span className="font-mono text-emerald-400">-2 CR</span>
                </div>
              )}

              {/* Collapsible reasoning badge */}
              {m.role === "assistant" && (
                <details className="group cursor-pointer">
                  <summary className="text-[11px] font-mono text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 bg-[#080d1a] border border-[#1b263e] px-2.5 py-1 rounded-lg w-fit list-none">
                    <span>🔨 Built with 5 Agent Steps & {m.model || activeModel}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500 group-open:rotate-180 transition" />
                  </summary>
                  <div className="mt-2 p-2.5 bg-[#060a14] rounded-lg border border-[#141e30] text-[10px] font-mono text-slate-400 space-y-1">
                    <div>✓ Step 1: Narrative & World Law Foundation</div>
                    <div>✓ Step 2: 35mm Anamorphic Optical Framing</div>
                    <div>✓ Step 3: Acoustic Frequency Tuning (432 Hz)</div>
                    <div>✓ Step 4: 12-Vector Continuity Verification</div>
                    <div>✓ Step 5: Directorial Synthesis via {m.model || activeModel}</div>
                  </div>
                </details>
              )}

              {/* Subscription Card Widget */}
              {m.isSubQuery && m.subData && (
                <div className="my-3 p-3.5 rounded-xl bg-gradient-to-r from-[#0c1428] via-[#0f1934] to-[#0c1428] border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      💳 REVENUECAT ACTIVE SUBSCRIPTION
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                      {m.subData.plan || "PRO"} TIER
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-2 rounded-lg bg-[#131d38] border border-[#1d2b4e]">
                      <div className="text-[10px] text-slate-400">Available Balance</div>
                      <div className="text-base font-bold font-mono text-emerald-400">
                        {m.subData.credits_available ?? 200} CR
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#131d38] border border-[#1d2b4e]">
                      <div className="text-[10px] text-slate-400">Plan Allocation</div>
                      <div className="text-base font-bold font-mono text-slate-200">
                        {m.subData.credits_total ?? 250} CR
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={onOpenRevenueCat}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition text-center cursor-pointer"
                    >
                      Manage Subscription
                    </button>
                  </div>
                </div>
              )}

              {/* Content Body */}
              <div className="whitespace-pre-wrap text-slate-200">{m.content}</div>

              {/* Assistant Actions */}
              {m.role === "assistant" && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#1c2842]">
                  {m.matchedScene && (
                    <button
                      onClick={() => onNavigateToScene(m.matchedScene)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition cursor-pointer"
                    >
                      <ScrollText className="w-3.5 h-3.5" />
                      <span>Open Scene {m.matchedScene} in Screenplay</span>
                    </button>
                  )}
                  <button
                    onClick={onRunSwarm}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111728] hover:bg-[#162038] border border-[#23314f] text-slate-300 hover:text-white text-xs transition cursor-pointer"
                  >
                    <span>🎬 Run Swarm Pipeline</span>
                  </button>
                  <button
                    onClick={onOpenRevenueCat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#111728] hover:bg-[#162038] border border-[#23314f] text-slate-300 hover:text-white text-xs transition cursor-pointer"
                  >
                    <span>💳 Check Subscription</span>
                  </button>
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                PRO
              </div>
            )}
          </div>
        ))}

        {/* Working Animation */}
        {isWorking && (
          <div className="flex items-start gap-3.5 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center text-sm text-amber-300 shrink-0 shadow-md">
              🎬
            </div>
            <div className="p-4 rounded-2xl bg-[#0d1324] border border-amber-500/40 shadow-xl space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="animate-spin text-amber-400">🔨</span>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    AGENT SWARM CONSTRUCTING...
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Step 3 of 5</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-indigo-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="p-4 border-t border-[#1c263c] bg-[#090d1a] shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-end bg-[#111728] border border-[#23314f] focus-within:border-indigo-500 rounded-2xl p-3 transition shadow-2xl"
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Direct your film swarm or ask anything about your film project..."
              className="w-full bg-transparent text-slate-100 text-xs md:text-sm px-3 py-1.5 focus:outline-none resize-none max-h-36 placeholder-slate-500 leading-relaxed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isWorking}
              className="bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
