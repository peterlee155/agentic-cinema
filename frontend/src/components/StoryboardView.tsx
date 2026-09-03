"use client";

import React, { useState } from "react";
import { Image, Video, Sparkles, Loader2, Play } from "lucide-react";

interface StoryboardViewProps {
  currentProject: any;
  onDirectInChat?: (prompt: string) => void;
  onRunSwarm?: () => void;
  onOpenNewMovie?: () => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  currentProject,
  onDirectInChat,
  onRunSwarm,
  onOpenNewMovie,
}) => {
  const [loadingMap, setLoadingMap] = useState<Record<string, string>>({});
  const [framesData, setFramesData] = useState<any[]>([]);

  const storyboard = currentProject?.storyboard || [];
  const projectTitle = currentProject?.project?.title || "NO FILM SELECTED";

  if (!currentProject) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          🎨
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">No Film Project Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create or select a film project to generate 8K visual keyframes and 24fps motion videos.
          </p>
        </div>
        <button
          onClick={onOpenNewMovie}
          className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg cursor-pointer inline-flex items-center gap-2"
        >
          <span>+ Create New Movie</span>
        </button>
      </div>
    );
  }

  if (storyboard.length === 0) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          🎨
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">Storyboard Frames Not Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Project <strong className="text-indigo-300">"{projectTitle}"</strong> does not have storyboard frames yet. Run the 10-Agent Swarm to generate visual keyframes.
          </p>
        </div>
        <button
          onClick={onRunSwarm}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-xl cursor-pointer inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Run 10-Agent Swarm to Generate Storyboard</span>
        </button>
      </div>
    );
  }

  const handleGenImage = async (sceneNum: number, frameNum: number, index: number) => {
    const key = `${sceneNum}_${frameNum}`;
    setLoadingMap((prev) => ({ ...prev, [key]: "image" }));

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id,
          scene: sceneNum,
          frame: frameNum,
          aspect_ratio: "16:9",
          model: "gemini-3.6-flash",
        }),
      });
      const data = await res.json();
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));

      if (data.url || data.image_url) {
        const url = data.url || data.image_url;
        setFramesData((prev) => {
          const updated = [...prev];
          updated[index] = { ...(updated[index] || storyboard[index]), imageUrl: url, videoUrl: "" };
          return updated;
        });
      }
    } catch (err) {
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));
      console.error("Image generation error:", err);
    }
  };

  const handleGenVideo = async (sceneNum: number, frameNum: number, index: number) => {
    const key = `${sceneNum}_${frameNum}`;
    setLoadingMap((prev) => ({ ...prev, [key]: "video" }));

    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id,
          scene: sceneNum,
          frame: frameNum,
          aspect_ratio: "16:9",
          model: "cinematic-motion-v1",
        }),
      });
      const data = await res.json();
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));

      if (data.video_url || data.url) {
        const url = data.video_url || data.url;
        setFramesData((prev) => {
          const updated = [...prev];
          updated[index] = { ...(updated[index] || storyboard[index]), videoUrl: url };
          return updated;
        });
      }
    } catch (err) {
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));
      console.error("Video generation error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{projectTitle} — Visual Storyboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct visual output rendered from Gemini 3.5+ & 24fps motion synthesis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storyboard.map((f: any, idx: number) => {
          const activeFrame = framesData[idx] || f;
          const key = `${f.scene || idx + 1}_${f.frame || 1}`;
          const currentLoading = loadingMap[key];

          return (
            <div
              key={idx}
              className="cinema-card overflow-hidden flex flex-col justify-between p-4 space-y-3 bg-[#090e1d] border-[#1c263c]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    SCENE {f.scene || idx + 1}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">24 FPS MOTION</span>
                </div>

                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-amber-500/30 shadow-2xl bg-black flex items-center justify-center">
                  {currentLoading ? (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 space-y-2 z-10">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-xs font-bold text-amber-300">
                        {currentLoading === "image"
                          ? "Rendering 8K Gemini Image..."
                          : "Synthesizing 24fps Motion Video..."}
                      </span>
                    </div>
                  ) : null}

                  {activeFrame.videoUrl ? (
                    <video
                      src={activeFrame.videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={activeFrame.imageUrl || "/static/img/the_last_spell_poster.jpg"}
                      alt={`Scene ${f.scene || idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-white text-xs">{f.shotTitle || `Scene ${f.scene || idx + 1} Frame`}</span>
                  <span className="text-[10px] font-mono text-slate-400">{f.camera || "24mm Anamorphic"}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1c263c] flex gap-2">
                <button
                  disabled={!!currentLoading}
                  onClick={() => handleGenImage(f.scene || idx + 1, f.frame || 1, idx)}
                  className="flex-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 disabled:opacity-40 text-indigo-200 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>Generate Image</span>
                </button>

                <button
                  disabled={!!currentLoading}
                  onClick={() => handleGenVideo(f.scene || idx + 1, f.frame || 1, idx)}
                  className="flex-1 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 disabled:opacity-40 text-cyan-200 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Generate Video</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
