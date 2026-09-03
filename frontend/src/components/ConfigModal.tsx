"use client";

import React, { useState, useEffect } from "react";
import { X, Settings, Sliders } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: any;
  onSaveConfig: (configData: any) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onSaveConfig,
}) => {
  const [format, setFormat] = useState("Theatrical Feature");
  const [platform, setPlatform] = useState("Cinema & IMAX");
  const [scale, setScale] = useState("Hollywood Studio Tentpole");
  const [episodes, setEpisodes] = useState(1);
  const [audience, setAudience] = useState("PG-13 / YA");

  useEffect(() => {
    if (currentProject?.project) {
      setFormat(currentProject.project.format || "Theatrical Feature");
      setPlatform(currentProject.project.platform || "Cinema & IMAX");
      setScale(currentProject.project.productionScale || "Hollywood Studio Tentpole");
      setEpisodes(currentProject.project.episodeCount || 1);
      setAudience(currentProject.project.targetAudience || "PG-13 / YA");
    }
  }, [currentProject]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      format,
      platform,
      productionScale: scale,
      episodeCount: Number(episodes),
      targetAudience: audience,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1122] border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl">
            ⚙️
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Project Format & Scale Configuration</h3>
            <p className="text-xs text-slate-400">Configure format, platform, and episode parameters</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Production Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Theatrical Feature">Theatrical Feature</option>
                <option value="Limited Series">Limited Series (TV)</option>
                <option value="Streaming Film">Streaming Film</option>
                <option value="Short Film">Short Film</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Distribution Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Cinema & IMAX">Cinema & IMAX</option>
                <option value="Global Streaming">Global Streaming</option>
                <option value="Film Festivals">Film Festivals</option>
                <option value="Social Web">Social / Web</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Production Scale</label>
              <select
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Hollywood Studio Tentpole">Studio Tentpole</option>
                <option value="Mid-Budget Prestige">Mid-Budget Prestige</option>
                <option value="Independent Feature">Independent Feature</option>
                <option value="Micro-Budget">Micro-Budget</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Episode / Part Count</label>
              <input
                type="number"
                min={1}
                max={24}
                value={episodes}
                onChange={(e) => setEpisodes(Number(e.target.value))}
                className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
