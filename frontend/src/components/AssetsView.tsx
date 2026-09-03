"use client";

import React from "react";
import { Sparkles, Users, MapPin, Palette } from "lucide-react";

interface AssetsViewProps {
  currentProject: any;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ currentProject }) => {
  const characters = [
    {
      name: "Kaelen Vance",
      role: "Protagonist / Rune-Bearer",
      visual: "Left forearm inscribed with glowing violet runic chronometer. Sodium rain-stained trench coat.",
    },
    {
      name: "Sister Mara",
      role: "High Priestess of St. Jude's",
      visual: "Monastic bone-stylus ritualist. Heavy silver woven robes and shielding runes.",
    },
    {
      name: "Elias (The Mimic)",
      role: "Antagonist / Shape-Shifter",
      visual: "Shifting reflection, acoustic voice mimickry, obsidian bone crown.",
    },
    {
      name: "Dr. Locke",
      role: "Sanctuary Archivist",
      visual: "Keystone brass goggles, leather-bound chronicle harness.",
    },
  ];

  const locations = [
    {
      name: "EXT. ST. JUDE'S INNER SANCTUARY",
      type: "Exterior / Dome",
      description: "Shimmering violet dome holding back toxic sodium rain and supernatural decay.",
    },
    {
      name: "EXT. RAILWAY BRIDGE CHOKEPOINT",
      type: "Exterior / Blast Zone",
      description: "Pre-dawn sodium haze over rusted iron girders. Critical tactical chokepoint.",
    },
    {
      name: "INT. ANCIENT ARCHIVE VAULT",
      type: "Interior / Vault",
      description: "Dust motes suspended in amber light. Thousands of rune-engraved stone tablets.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Production Visual Bible & Dossiers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Character appearance evolutions, color palettes, and location architecture.
          </p>
        </div>
      </div>

      {/* Characters */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4" /> Principal Character Dossiers & Wardrobe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((c, idx) => (
            <div key={idx} className="cinema-card p-5 bg-[#090e1d] border-[#1c263c] space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-sm">{c.name}</h4>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  {c.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{c.visual}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location Atlas & Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((loc, idx) => (
            <div key={idx} className="cinema-card p-5 bg-[#090e1d] border-[#1c263c] space-y-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                {loc.type}
              </span>
              <h4 className="font-extrabold text-white text-xs">{loc.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{loc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
