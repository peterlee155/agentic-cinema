"use client";

import React from "react";
import { Sparkles, Users, MapPin, Palette, Shield } from "lucide-react";

import { ProjectBibleData, CharacterItem, LocationItem, WorldRuleItem } from "../types/project";

interface AssetsViewProps {
  currentProject: ProjectBibleData | null;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ currentProject }) => {
  const projectTitle = currentProject?.title || currentProject?.project?.title || "Film Project";
  const rawCharacters = currentProject?.characters || [];
  const rawLocations = currentProject?.locations || [];
  const rawRules = currentProject?.worldRules || [];

  const isDemo = currentProject?.id === "proj_demo" || currentProject?.id === "demo";

  const worldRules: WorldRuleItem[] = rawRules.length > 0 ? rawRules : (isDemo ? [
    {
      rule: "The Threshold Boundary",
      description: "Humanity survives behind layered magical barriers shielding the sanctuary from infected ruins.",
      consequence: "Venturing beyond initiates an unforgiving countdown spell."
    },
    {
      rule: "Deceptive Cognitive Mimics",
      description: "Infected entities visually and behaviorally mirror living humans.",
      consequence: "Visual inspection cannot be trusted; only acoustic resonance reveals true nature."
    },
    {
      rule: "The Countdown Mandate",
      description: "All expedition gear operates on a decaying temporal spell.",
      consequence: "Failure to return before time expires causes permanent containment loss."
    }
  ] : []);

  const characters = rawCharacters.length > 0 ? rawCharacters : (isDemo ? [
    {
      name: "Kaelen Vance",
      role: "Lead Protagonist / Resurrected Clone",
      appearance: "Striking, uncanny facial symmetry with glowing subcutaneous amber patent serial number. Lean, dense fast-twitch muscle fiber.",
      clothing: "Charcoal-grey compression shirt beneath distressed olive-drab utility vest and treated black leather duster.",
      props: "Bone Stylus & Kinetic Tonfas with integrated pneumatic pistons.",
      colorPalette: "Matte Black (#0B0C10), Subcutaneous Amber (#FF8C00)",
      visualEvolution: "Phase 1: Pristine clone vat glow. Phase 2: Acid-rain-slicked with flickering amber timer. Phase 3: Decaying skin and exposed marks in final battle."
    },
    {
      name: "Sister Mara",
      role: "Techno-Monastic Priestess of St. Jude's",
      appearance: "Gaunt and weathered with synthetic chrome optic eye casting a cold piercing cyan light. Scarred hands from chemical wards.",
      clothing: "Monastic robes of heavy coarse-woven indigo hemp layered over reflective silver thermal foil.",
      props: "Keystone Wardstone Activator & Heated Anointing Stylus.",
      colorPalette: "Deep Indigo (#1B1B2F), Cybernetic Cyan (#00E5FF)",
      visualEvolution: "Phase 1: Imposing ritualistic presence. Phase 2: Faltering optic eye as the dome weakens."
    },
    {
      name: "Elias (The Mimic)",
      role: "Black-Market Surgeon & Information Broker",
      appearance: "Patchwork of shifting synthetic flesh-plates over whining micro-servos. Sleek chrome multi-tool prosthetic arm.",
      clothing: "Patchwork trench coat of teal and dark grey leather stitched with neon-green monofilament thread.",
      props: "Neural Splicer with fine fiber-optic extraction needles.",
      colorPalette: "Synthetic Flesh (#E6C2B5), Neon Green (#39FF14)",
      visualEvolution: "Phase 1: Polished chameleon. Phase 2: Shattered face-plates exposing raw skull-endoskeleton."
    },
    {
      name: "Nia",
      role: "Rebel Technician & Hacker",
      appearance: "Athletic with glowing sub-dermal fiber-optic tattoos and dual-pupil amber optic lenses. Asymmetrical jagged neon-pink bob hair.",
      clothing: "Waterproof yellow hazard jacket with reflective silver safety strips and heavy combat boots.",
      props: "Customized wrist Cyber-Deck terminal with holographic projector.",
      colorPalette: "Hazard Yellow (#FFD700), Neon Pink (#FF69B4)",
      visualEvolution: "Phase 1: Vibrant, hyper-alert parkour agility. Phase 2: Soot-stained and battered by EMP blasts."
    },
    {
      name: "The Dragon Lord",
      role: "Cybernetic Cartel Boss & Genetic Patent Holder",
      appearance: "Terrifying fusion of ancient grace and obsidian-ceramic plating with gold titanium dragon scales. Liquid black cyber-eyes with gold rings.",
      clothing: "Traditional black silk kimono embroidered with gold-thread dragons, worn open over mechanical chest core.",
      props: "Patent Scepter displaying rotating holographic genetic double-helix.",
      colorPalette: "Obsidian Black (#0A0A0A), Imperial Gold (#FFD700)",
      visualEvolution: "Phase 1: Untouchable holographic titan. Phase 2: Full pneumatic dragon combat chassis in penthouse."
    }
  ] : []);

  const locations = rawLocations.length > 0 ? rawLocations : (isDemo ? [
    {
      name: "EXT. ST. JUDE'S PERIMETER BULWARK - DUSK",
      type: "Exterior / Gothic Barrier",
      architecture: "Reinforced concrete buttresses integrated with rusted steel girders under shimmering violet dome shield.",
      lighting: "Flickering violet defensive dome glow clashing with toxic sulfurous orange skyline.",
      colorPalette: "Violet (#8A2BE2), Rust Orange (#8B4513)",
      description: "Steaming concrete platform lashed by acidic rain, overlooking the neon sprawl of Neo-Kowloon."
    },
    {
      name: "EXT. THE LIMBO BAZAAR - NIGHT",
      type: "Exterior / Subterranean Slum-Tech",
      architecture: "Canyon of stacked shipping containers, corrugated iron shacks, and dense web of overhead power cables.",
      lighting: "High-contrast hot pink (#FF1493) and electric cyan (#00FFFF) advertisements slicing through black alleyways.",
      colorPalette: "Hot Pink (#FF1493), Electric Cyan (#00FFFF)",
      description: "Chaotic demilitarized black market under constant warm condensation rain and neon haze."
    },
    {
      name: "INT. CENTRAL TRANSIT COMMAND VAULT - NIGHT",
      type: "Interior / Ancient Tech Vault",
      architecture: "Circular seismic-isolation chamber lined with vacuum-tube terminal servers and amber phosphor CRT monitors.",
      lighting: "Pulsing amber cathode displays and emergency strobe beacons.",
      colorPalette: "Phosphor Amber (#FFBF00), Industrial Steel (#4682B4)",
      description: "Subterranean acoustic bunker containing the central seismic frequency crystal and transit schematics."
    }
  ] : []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl">
        <div>
          <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
            {projectTitle} • Visual Continuity
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Production Visual Bible & Dossiers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Character appearance evolutions, color palettes, signature props, and architectural location atlas.
          </p>
        </div>
      </div>

      {/* Characters */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4" /> Principal Character Dossiers & Visual Evolution ({characters.length})
        </h3>
        {characters.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#090e1d] border border-dashed border-[#1c263c] space-y-2">
            <Users className="w-8 h-8 text-indigo-400 mx-auto opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No Character Dossiers Generated Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run your project's AI swarm pipeline to automatically author tailored character bibles, wardrobe designs, and visual arc evolutions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((c: CharacterItem, idx: number) => (
              <div key={idx} className="cinema-card p-5 bg-[#090e1d] border-[#1c263c] space-y-3 rounded-2xl hover:border-indigo-500/40 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-base">{c.name}</h4>
                    {c.age && <span className="text-[10px] text-slate-400">Age: {c.age}</span>}
                  </div>
                  <span className="text-[9px] px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                    {c.role}
                  </span>
                </div>
                
                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <div>
                    <strong className="text-slate-400 font-bold">Appearance: </strong>
                    {c.appearance || c.description || c.visual}
                  </div>
                  {c.clothing && (
                    <div>
                      <strong className="text-slate-400 font-bold">Wardrobe: </strong>
                      {c.clothing} {c.hair ? `| Hair: ${c.hair}` : ""}
                    </div>
                  )}
                  {c.props && (
                    <div>
                      <strong className="text-amber-400 font-bold">Signature Props: </strong>
                      {Array.isArray(c.props) ? c.props.join(", ") : String(c.props)}
                    </div>
                  )}
                  {c.visualEvolution && (
                    <div className="p-2.5 rounded-xl bg-[#0e1529] border border-[#1d2b4f] text-[11px] text-indigo-200">
                      <strong className="text-amber-300 font-bold block mb-0.5">🎬 Visual Arc Evolution:</strong>
                      {c.visualEvolution}
                    </div>
                  )}
                  {c.colorPalette && (
                    <div className="text-[10px] font-mono text-slate-400 pt-1">
                      Palette: <span className="text-indigo-300">{c.colorPalette}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locations */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location Atlas & Production Architecture ({locations.length})
        </h3>
        {locations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#090e1d] border border-dashed border-[#1c263c] space-y-2">
            <MapPin className="w-8 h-8 text-cyan-400 mx-auto opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No Locations Generated Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run the Art Director agent to generate set architecture, environmental lighting, and location palettes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc: LocationItem, idx: number) => (
              <div key={idx} className="cinema-card p-5 bg-[#090e1d] border-[#1c263c] space-y-2 rounded-2xl hover:border-cyan-500/40 transition">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  {loc.type || "Cinematic Set"}
                </span>
                <h4 className="font-extrabold text-white text-xs">{loc.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{loc.description || loc.architecture}</p>
                {loc.lighting && (
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-cyan-400">Lighting: </strong>{loc.lighting}
                  </div>
                )}
                {loc.colorPalette && (
                  <div className="text-[10px] font-mono text-cyan-300/80 pt-1">
                    Palette: {loc.colorPalette}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* World Rules & Lore Canon */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" /> World Rules & Story Universe Canon ({worldRules.length})
        </h3>
        {worldRules.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#090e1d] border border-dashed border-[#1c263c] space-y-2">
            <Shield className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No World Rules Defined Yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run the Producer or Screenwriter agent to establish canon lore, dramatic constraints, and consequences.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {worldRules.map((r: WorldRuleItem, idx: number) => (
              <div key={idx} className="cinema-card p-5 bg-[#090e1d] border-[#1c263c] space-y-2.5 rounded-2xl hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                    RULE {idx + 1}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-xs">{r.rule}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{r.description || r.explanation}</p>
                {r.consequence && (
                  <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/90">
                    <strong className="text-amber-400 font-bold block mb-0.5">⚠️ Consequence / Invariant:</strong>
                    {r.consequence}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
