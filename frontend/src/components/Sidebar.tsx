"use client";

import React from "react";
import { MessageSquare, ScrollText, Palette, Folder, Users, ShieldCheck, Settings } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: "chat", label: "Studio Chat (Copilot)", icon: "💬" },
    { id: "script", label: "Screenplay Studio", icon: "📜" },
    { id: "cast", label: "Cast & Actor Scripts", icon: "🎭" },
    { id: "summary", label: "Project Summary", icon: "📋" },
    { id: "agents", label: "10-Agent Swarm", icon: "🤖" },
    { id: "assets", label: "Visual Bible", icon: "💎" },
    { id: "settings", label: "Integrations & MCP", icon: "⚙️" },
  ];

  return (
    <aside className="w-16 md:w-64 border-r border-[#1c263c] bg-[#090d1a] p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 mb-2 hidden md:block">
          Studio Workspaces
        </div>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-xs font-bold cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/50 text-white shadow-md"
                  : "hover:bg-[#111728] text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <span className="truncate hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Footer policy badge */}
      <div className="p-3 rounded-xl bg-[#0c1224] border border-[#1b2742] text-[10px] font-mono text-slate-400 hidden md:block">
        <div className="text-amber-400 font-bold mb-0.5">Gemini 3.5+ Enforced</div>
        <div>Continuous continuity & 12-vector auditing active.</div>
      </div>
    </aside>
  );
};
