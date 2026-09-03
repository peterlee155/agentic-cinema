"use client";

import React, { useState } from "react";
import { X, Plus, Film, Sparkles, Sliders } from "lucide-react";

interface NewMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMovie?: (title: string, genre: string, logline: string, format: string) => void;
  onCreateProject?: (projectData: any, genre?: string, logline?: string, format?: string) => void;
}

export const NewMovieModal: React.FC<NewMovieModalProps> = ({
  isOpen,
  onClose,
  onCreateMovie,
  onCreateProject,
}) => {
  const [title, setTitle] = useState("");
  const [logline, setLogline] = useState("");
  const [genre, setGenre] = useState("Sci-Fi Supernatural Thriller");
  const [tone, setTone] = useState("Dark, Visceral, High-Stakes");
  const [visualStyle, setVisualStyle] = useState("35mm Anamorphic, Chiaroscuro Rim Lighting");
  const [duration, setDuration] = useState("115 Minutes");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !logline.trim()) {
      alert("Please enter a Movie Title and Logline.");
      return;
    }
    const payload = {
      title: title.trim(),
      genre: genre.trim() || "Sci-Fi Supernatural Thriller",
      logline: logline.trim(),
      tone: tone.trim() || "Dark, Visceral, High-Stakes",
      visual_style: visualStyle.trim() || "35mm Anamorphic, Chiaroscuro Rim Lighting",
      target_duration: duration.trim() || "115 Minutes",
      language: "English",
    };
    if (onCreateProject) {
      onCreateProject(payload);
    } else if (onCreateMovie) {
      onCreateMovie(payload.title, payload.genre, payload.logline, "Feature");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="cinema-card bg-[#090d1c] border border-[#1e2a47] w-full max-w-xl mx-auto p-6 sm:p-8 space-y-6 shadow-2xl relative rounded-3xl z-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1c263c] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400">
              🎬
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wide flex items-center gap-2">
                <span>Create New Film Project</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40">
                  STUDIO LOT
                </span>
              </h3>
              <p className="text-xs text-slate-400">Initialize canonical universe rules and 3-act story bible</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Movie Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. THE LAST SPELL, ECLIPSE HORIZON"
              className="w-full bg-[#050813] border border-[#1e2a47] focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none font-bold transition shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Genre & Category
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Sci-Fi Supernatural Thriller"
                className="w-full bg-[#050813] border border-[#1e2a47] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Dramatic Tone
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Dark, Visceral, High-Stakes"
                className="w-full bg-[#050813] border border-[#1e2a47] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Logline / Core Narrative Premise <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              rows={3}
              placeholder="A disgraced cybernetic archaeologist discovers an ancient orbital spell that can manipulate local gravity..."
              className="w-full bg-[#050813] border border-[#1e2a47] focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none leading-relaxed transition shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Visual Optics & Style
              </label>
              <input
                type="text"
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="e.g. 35mm Anamorphic, Chiaroscuro"
                className="w-full bg-[#050813] border border-[#1e2a47] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Estimated Runtime
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 115 Minutes"
                className="w-full bg-[#050813] border border-[#1e2a47] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#1c263c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer border border-transparent hover:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xl flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Project Bible</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
