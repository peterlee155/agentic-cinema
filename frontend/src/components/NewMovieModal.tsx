"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Film,
  Wand2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  Lightbulb,
} from "lucide-react";

interface NewMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetData?: Record<string, unknown> | null;
  onCreateMovie?: (title: string, genre: string, logline: string, format: string) => void;
  onCreateProject?: (projectData: Record<string, unknown>, genre?: string, logline?: string, format?: string) => void;
}

interface StyleOption {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  genre: string;
  tone: string;
  visualStyle: string;
  gradient: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "3d-animation",
    name: "3D Colorful Animation",
    icon: "🎨",
    badge: "Most Popular",
    description: "Bright, joyful Pixar-style 3D world with vibrant colors and rich textures",
    genre: "Family Animated Adventure",
    tone: "Joyful, whimsical, courageous, heartfelt",
    visualStyle: "High-end 3D CGI animation, vivid saturated palette, subsurface scattering, cinematic lighting",
    gradient: "from-amber-500/20 via-orange-500/20 to-pink-500/20 border-amber-500/50 text-amber-200",
  },
  {
    id: "watercolor-storybook",
    name: "Watercolor Storybook",
    icon: "📖",
    badge: "Magical",
    description: "Soft, magical hand-painted storybook art with enchanting fairytale glow",
    genre: "Fairytale Fantasy",
    tone: "Poetic, gentle, wondrous, inspiring",
    visualStyle: "Hand-painted watercolor animation, textured paper grain, dreamy pastel tones, golden hour glow",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/50 text-emerald-200",
  },
  {
    id: "sci-fi-wonder",
    name: "Retro Sci-Fi Wonder",
    icon: "🚀",
    badge: "Epic",
    description: "Starships, glowing neon holograms, alien worlds, and cosmic exploration",
    genre: "Sci-Fi Space Adventure",
    tone: "Awe-inspiring, thrilling, expansive, futuristic",
    visualStyle: "35mm anamorphic widescreen, cyan and magenta bioluminescence, volumetric starlight",
    gradient: "from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border-cyan-500/50 text-cyan-200",
  },
  {
    id: "fantasy-realm",
    name: "Epic Fantasy Realm",
    icon: "⚡",
    badge: "Heroic",
    description: "Mythical dragons, glowing magic spells, ancient castles, and heroic quests",
    genre: "High Fantasy",
    tone: "Heroic, legendary, tense, magical",
    visualStyle: "Epic cinematic feature, golden rim lighting, misty ancient forests, glowing runes",
    gradient: "from-purple-500/20 via-fuchsia-500/20 to-indigo-500/20 border-purple-500/50 text-purple-200",
  },
  {
    id: "spooky-mystery",
    name: "Spooky Mystery",
    icon: "🕵️",
    badge: "Thrilling",
    description: "Secret passages, glowing lanterns, clever clues, and thrilling nighttime mysteries",
    genre: "Mystery & Adventure",
    tone: "Suspenseful, clever, cozy, thrilling",
    visualStyle: "Moody low-key lighting, warm amber candlelight, deep velvety shadows, foggy cobblestone",
    gradient: "from-slate-500/20 via-indigo-500/20 to-emerald-500/20 border-slate-500/50 text-slate-200",
  },
];

const QUICK_IDEAS = [
  {
    title: "The Firefly Band",
    idea: "A shy dragon starts a school band with friendly forest creatures to save their music festival.",
    styleId: "3d-animation",
  },
  {
    title: "The Floating Town",
    idea: "Two best friends discover that their quiet town is secretly floating in deep space.",
    styleId: "sci-fi-wonder",
  },
  {
    title: "The Magic Paintbrush",
    idea: "A lonely robot finds an ancient magic paintbrush that brings whatever it paints to life.",
    styleId: "watercolor-storybook",
  },
  {
    title: "The Moon Detective",
    idea: "A detective dog and an owl solve the mystery of why the moon disappeared from the sky.",
    styleId: "spooky-mystery",
  },
  {
    title: "The Library Kingdom",
    idea: "A secret doorway behind the school library bookshelf leads to a hidden kingdom made entirely of candy.",
    styleId: "fantasy-realm",
  },
];

export const NewMovieModal: React.FC<NewMovieModalProps> = ({
  isOpen,
  onClose,
  presetData,
  onCreateMovie,
  onCreateProject,
}) => {
  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState("3d-animation");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Advanced fields (hidden by default)
  const [runtimeMinutes, setRuntimeMinutes] = useState(110);
  const [cinematography, setCinematography] = useState("35mm Anamorphic Widescreen (2.39:1)");
  const [lensOptics, setLensOptics] = useState("Master Anamorphic 2x Primes");
  const [lightingScheme, setLightingScheme] = useState("Low-Key Chiaroscuro with Motivated Practicals");
  const [colorPalette, setColorPalette] = useState("Cyan Undertones, Oxidized Bronze & Tungsten");
  const [dramaticIntensity, setDramaticIntensity] = useState(7);
  const [aiCreativity, setAiCreativity] = useState(85);
  const [aiOriginality, setAiOriginality] = useState(90);
  const [aiEmotionalDepth, setAiEmotionalDepth] = useState(80);
  const [aiIdeaPreservation, setAiIdeaPreservation] = useState(95);

  useEffect(() => {
    if (presetData && isOpen) {
      const timer = setTimeout(() => {
        setTitle((presetData.title as string) || "");
        setIdea((presetData.logline as string) || "");
        if (presetData.styleId) {
          setSelectedStyleId(presetData.styleId as string);
        }
      }, 0);
      return () => clearTimeout(timer);
    } else if (isOpen && !idea && !title) {
      const timer = setTimeout(() => {
        setTitle("");
        setIdea("");
        setSelectedStyleId("3d-animation");
        setShowAdvanced(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [presetData, isOpen]);

  if (!isOpen) return null;

  const selectedStyle =
    STYLE_OPTIONS.find((s) => s.id === selectedStyleId) || STYLE_OPTIONS[0];

  const handleSelectQuickIdea = (item: (typeof QUICK_IDEAS)[0]) => {
    setTitle(item.title);
    setIdea(item.idea);
    setSelectedStyleId(item.styleId);
  };

  const handleMakeMyMovie = async () => {
    const finalIdea = idea.trim() || "An unforgettable cinematic adventure with unexpected heroes.";
    let finalTitle = title.trim();
    if (!finalTitle) {
      // Clean, automatic title derived from idea
      const words = finalIdea.split(" ").slice(0, 5).join(" ");
      finalTitle = words.charAt(0).toUpperCase() + words.slice(1);
      if (finalTitle.length > 30) {
        finalTitle = finalTitle.slice(0, 27) + "...";
      }
    }

    setIsSubmitting(true);
    try {
      const projectPayload = {
        title: finalTitle,
        logline: finalIdea,
        genre: selectedStyle.genre,
        tone: selectedStyle.tone,
        visual_style: selectedStyle.visualStyle,
        target_duration: `${runtimeMinutes} Minutes`,
        format: "Theatrical Feature",
        language: "English",
        story_direction: "Character-Driven & High-Concept Hook",
        dramatic_intensity: dramaticIntensity,
        cinematography,
        lens: lensOptics,
        lighting: lightingScheme,
        color_palette: colorPalette,
        ai_preferences: {
          creativity: aiCreativity,
          originality: aiOriginality,
          emotional_depth: aiEmotionalDepth,
          idea_preservation: aiIdeaPreservation,
        },
      };

      if (onCreateProject) {
        await onCreateProject(projectPayload);
      } else if (onCreateMovie) {
        await onCreateMovie(finalTitle, selectedStyle.genre, finalIdea, "Theatrical Feature");
      }
      onClose();
    } catch (err) {
      console.error("Failed to create movie:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090d1a] border border-[#1f2a44] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0d1424] border-b border-[#1c263c] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg text-lg">
              🎬
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Make A New Movie
              </h2>
              <p className="text-[11px] text-slate-400">
                Type an idea, pick a style, and your movie will be created automatically!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Quick Inspiration Ideas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              1-Click Fun Ideas (Click to Try!)
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_IDEAS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickIdea(item)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                    idea === item.idea
                      ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md"
                      : "bg-[#0e1629] border-[#1f2c4a] hover:border-indigo-500/40 text-slate-300 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Movie Idea Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>💭</span> What happens in your movie?
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Just 1-2 sentences is plenty!
              </span>
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A lonely robot finds a magic paintbrush that brings whatever it paints to life..."
              rows={3}
              className="w-full bg-[#0c1224] border border-[#1d2946] focus:border-indigo-500 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition resize-none"
            />
          </div>

          {/* 3. Movie Title (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🏷️</span> Movie Title (Optional)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Leave blank and we&apos;ll create a great title for you!
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Robot's Magic Brush"
              className="w-full bg-[#0c1224] border border-[#1d2946] focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
            />
          </div>

          {/* 4. Movie Visual Style Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <span>🎨</span> Pick A Movie Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`text-left p-3.5 rounded-2xl border transition relative flex flex-col justify-between space-y-2 cursor-pointer ${
                      isSelected
                        ? `bg-[#101933] border-2 shadow-xl ${style.gradient}`
                        : "bg-[#0c1224] border-[#1c263c] hover:border-slate-600 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{style.icon}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {style.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-extrabold ${
                          isSelected ? "text-white" : "text-slate-200"
                        }`}
                      >
                        {style.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Collapsible Advanced Studio Controls */}
          <div className="border border-[#1c263c] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full bg-[#0c1224] hover:bg-[#101830] px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>⚙️ Advanced Studio Controls (For Filmmakers)</span>
              </div>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-[#080c18] space-y-4 border-t border-[#1c263c] text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Camera & Lens Optics
                    </label>
                    <input
                      type="text"
                      value={cinematography}
                      onChange={(e) => setCinematography(e.target.value)}
                      className="w-full bg-[#0c1224] border border-[#1c263c] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Lighting & Palette
                    </label>
                    <input
                      type="text"
                      value={lightingScheme}
                      onChange={(e) => setLightingScheme(e.target.value)}
                      className="w-full bg-[#0c1224] border border-[#1c263c] rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Target Duration ({runtimeMinutes} mins)
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="5"
                      value={runtimeMinutes}
                      onChange={(e) => setRuntimeMinutes(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Dramatic Intensity ({dramaticIntensity}/10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={dramaticIntensity}
                      onChange={(e) => setDramaticIntensity(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Giant Glowing CTA */}
        <div className="bg-[#0c1224] border-t border-[#1c263c] px-6 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white transition px-4 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleMakeMyMovie}
            className="flex-1 max-w-sm bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Wand2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Creating Your Movie World...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-amber-300" />
                <span>🎬 Make My Movie</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
