"use client";

import React from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewMovie?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onOpenNewMovie }) => {
  const items = [
    { id: "storyForMe", label: "Story For Me", icon: "📖" },
    { id: "script", label: "Script & Story", icon: "📜" },
    { id: "storyboard", label: "Movie Pictures", icon: "🖼️" },
    { id: "sound", label: "Music & Sounds", icon: "🎵" },
    { id: "cast", label: "Actors & Voices", icon: "🎭" },
    { id: "summary", label: "Project Summary & PDF", icon: "📋" },
    { id: "agents", label: "Movie Team", icon: "🎬" },
    { id: "assets", label: "Story Bible & Rules", icon: "💎" },
    { id: "chat", label: "Studio Assistant", icon: "💬" },
    { id: "settings", label: "Studio Controls", icon: "⚙️" },
  ];

  return (
    <aside className="w-16 md:w-64 border-r border-[#1c263c] bg-[#090d1a] p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        {/* Return to Project History */}
        <button
          onClick={() => onTabChange("history")}
          className="w-full mb-2 bg-[#12182c] hover:bg-[#1b2542] border border-[#223154] hover:border-indigo-500/50 text-indigo-300 hover:text-white font-bold text-xs px-3 py-2.5 rounded-xl transition flex items-center gap-2.5 cursor-pointer shadow-sm transform hover:-translate-x-0.5"
          title="Return to Project History / Library"
        >
          <span className="text-base shrink-0">📂</span>
          <span className="hidden md:inline font-bold">← Project History</span>
        </button>

        {/* Prominent New Movie Button at top of Sidebar */}
        {onOpenNewMovie && (
          <button
            onClick={onOpenNewMovie}
            className="w-full mb-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:via-teal-500 hover:to-indigo-500 text-white font-extrabold text-xs px-3 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            title="Create a New Movie"
          >
            <span className="text-sm">✨</span>
            <span className="hidden md:inline font-black tracking-wide uppercase">+ NEW MOVIE</span>
          </button>
        )}

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
