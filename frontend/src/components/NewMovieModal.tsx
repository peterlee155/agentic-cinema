"use client";

import React, { useState } from "react";
import { X, Plus, Film } from "lucide-react";

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
    <div className="fixed inset-[#000] bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="cinema-card bg-[#090d1a] border-[#1c263c] w-full max-w-lg p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 rounded-3xl">
        <div className="flex items-center justify-between border-b border-[#1c263c] pb-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base tracking-wide">
              Create New Film Project
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Movie Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. THE LAST SPELL, NEXUS RISING"
              className="w-full bg-[#050813] border border-[#162138] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Genre & Sub-Genre
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Sci-Fi Supernatural Thriller"
              className="w-full bg-[#050813] border border-[#162138] rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Logline / High Concept Premise
            </label>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              rows={3}
              placeholder="A lone chronomancer must break an ancient spell before the realm fractures into eternal dark..."
              className="w-full bg-[#050813] border border-[#162138] rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Visual Optics Style
              </label>
              <input
                type="text"
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="w-full bg-[#050813] border border-[#162138] rounded-xl px-3 py-2 text-[11px] text-slate-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Estimated Runtime
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#050813] border border-[#162138] rounded-xl px-3 py-2 text-[11px] text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c263c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
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
