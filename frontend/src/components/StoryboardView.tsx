"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Video, Sparkles, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";

import { ProjectBibleData, StoryboardFrame } from "../types/project";

interface StoryboardViewProps {
  currentProject: ProjectBibleData | null;
  onDirectInChat?: (prompt: string) => void;
  onRunSwarm?: () => void;
  onOpenNewMovie?: () => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  currentProject,
  onOpenNewMovie,
}) => {
  const [loadingMap, setLoadingMap] = useState<Record<string, string>>({});
  const [framesData, setFramesData] = useState<StoryboardFrame[]>([]);
  const [jobStatus, setJobStatus] = useState<{
    isRunning: boolean;
    total: number;
    completed: number;
    currentScene: number;
  }>({
    isRunning: false,
    total: 0,
    completed: 0,
    currentScene: 1,
  });

  const projId = currentProject?.id || currentProject?.project_id || currentProject?.project?.id;
  const projectTitle = currentProject?.title || currentProject?.project?.title || "NO FILM SELECTED";

  useEffect(() => {
    const sb = currentProject?.storyboard || [];
    if (sb.length > 0) {
      const timer = setTimeout(() => {
        setFramesData(sb);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentProject]);

  const checkStatus = useCallback(async () => {
    if (!projId) return;
    try {
      const res = await fetch(`/api/projects/${projId}/storyboard-status`);
      const data = await res.json();
      if (data.success) {
        setJobStatus({
          isRunning: data.isRunning,
          total: data.totalFrames,
          completed: data.completedFrames,
          currentScene: data.currentScene || 1,
        });

        if (data.frames && data.frames.length > 0) {
          setFramesData(data.frames);
        }

        const anyHasImages = data.frames && data.frames.some((f: StoryboardFrame) => f.imageUrl);
        if (!data.isRunning && !anyHasImages && data.totalFrames > 0) {
          fetch(`/api/projects/${projId}/generate-storyboard`, { method: "POST" }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Could not check storyboard status:", err);
    }
  }, [projId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkStatus();
    }, 0);
    const interval = setInterval(() => {
      checkStatus();
    }, 2500);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkStatus]);

  if (!currentProject) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          🎨
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">No Movie Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Choose a movie from your library or make a new one to see its pictures.
          </p>
        </div>
        <button
          onClick={onOpenNewMovie}
          className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg cursor-pointer inline-flex items-center gap-2"
        >
          <span>+ Make A New Movie</span>
        </button>
      </div>
    );
  }

  const handleRetryImage = async (sceneNum: number, frameNum: number, index: number) => {
    const key = `${sceneNum}_${frameNum}`;
    setLoadingMap((prev) => ({ ...prev, [key]: "image" }));

    try {
      const res = await fetch(`/api/projects/${projId}/storyboard/retry-frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene: sceneNum,
          frame: frameNum,
        }),
      });
      const data = await res.json();
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));

      if (data.result?.url || data.result?.image_url) {
        const url = data.result.url || data.result.image_url;
        setFramesData((prev) => {
          const updated = [...prev];
          updated[index] = { ...(updated[index] || {}), imageUrl: url, imageStatus: "COMPLETE" };
          return updated;
        });
      }
    } catch (err) {
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));
      console.error("Frame retry error:", err);
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
          project_id: projId,
          scene: sceneNum,
          frame: frameNum,
          aspect_ratio: "16:9",
          model: "cinematic-motion-v1",
        }),
      });
      const data = await res.json();

      if (data.job_id) {
        for (let attempt = 0; attempt < 30; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          try {
            const pollRes = await fetch(`/api/jobs/${data.job_id}`);
            const pollData = await pollRes.json();
            if (pollData.status === "COMPLETE" && pollData.video_url) {
              setFramesData((prev) => {
                const updated = [...prev];
                updated[index] = { ...(updated[index] || {}), videoUrl: pollData.video_url };
                return updated;
              });
              break;
            } else if (pollData.status === "FAILED") {
              break;
            }
          } catch (pollErr) {
            console.warn("Video poll attempt error:", pollErr);
          }
        }
      } else if (data.video_url || data.url) {
        const url = data.video_url || data.url;
        setFramesData((prev) => {
          const updated = [...prev];
          updated[index] = { ...(updated[index] || {}), videoUrl: url };
          return updated;
        });
      }
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));
    } catch (err) {
      setLoadingMap((prev) => ({ ...prev, [key]: "" }));
      console.error("Video generation error:", err);
    }
  };

  const currentFrames: StoryboardFrame[] =
    framesData.length > 0 ? framesData : (currentProject?.storyboard || []);
  const total = jobStatus.total || currentFrames.length;
  const completed = jobStatus.completed || currentFrames.filter((f: StoryboardFrame) => f.imageUrl).length;
  const progressPercent = Math.min(100, Math.round((completed / (total || 1)) * 100));

  return (
    <div className="space-y-6">
      <div className="bg-[#0d1322] border border-[#1c263c] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {projectTitle} — Movie Pictures
              </h2>
              {jobStatus.isRunning ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Painting Scene {jobStatus.currentScene}...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" />
                  All Pictures Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pictures for each scene generate automatically in the background. You can change any picture with one click!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetch(`/api/projects/${projId}/generate-storyboard`, { method: "POST" })
                  .then(() => checkStatus())
                  .catch(() => {});
              }}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Pictures</span>
            </button>
          </div>
        </div>

        {jobStatus.isRunning && (
          <div className="space-y-1.5 bg-[#090e1d] p-3 rounded-xl border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Making your movie pictures ({completed}/{total} ready)
              </span>
              <span className="font-mono text-slate-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentFrames.map((f: StoryboardFrame, idx: number) => {
          const frameObj = f as Record<string, unknown>;
          const key = `${frameObj.scene || f.sceneNumber || idx + 1}_${f.frameNumber || 1}`;
          const currentLoading = loadingMap[key];
          const hasImage = !!f.imageUrl;

          return (
            <div
              key={idx}
              className="cinema-card overflow-hidden flex flex-col justify-between p-4 space-y-3 bg-[#090e1d] border-[#1c263c] rounded-2xl hover:border-indigo-500/40 transition shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    SCENE {f.scene || idx + 1}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    READY TO WATCH
                  </span>
                </div>

                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl bg-black flex items-center justify-center group">
                  {currentLoading ? (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 space-y-2 z-10">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-xs font-bold text-amber-300">
                        {currentLoading === "image"
                          ? "Painting new picture..."
                          : "Synthesizing motion video..."}
                      </span>
                    </div>
                  ) : null}

                  {f.videoUrl ? (
                    <video
                      src={f.videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : hasImage ? (
                    <img
                      src={f.imageUrl}
                      alt={`Scene ${f.scene || idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/static/img/the_last_spell_poster.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/80 p-4 text-center space-y-2">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span className="text-xs text-slate-300 font-medium">
                        Painting picture for Scene {f.scene || idx + 1}...
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                      {f.shotTitle || f.shot || `Scene ${f.scene || idx + 1} Picture`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {f.camera || "Wide Lens"}
                    </span>
                  </div>
                  {f.imagePrompt && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {f.imagePrompt}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1c263c] flex gap-2">
                <button
                  disabled={!!currentLoading}
                  onClick={() => handleRetryImage(Number(f.scene) || idx + 1, Number(f.frame) || 1, idx)}
                  className="flex-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 disabled:opacity-40 text-indigo-200 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Try another picture for this scene"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🎨 Try Another Picture</span>
                </button>

                <button
                  disabled={!!currentLoading}
                  onClick={() => handleGenVideo(Number(f.scene) || idx + 1, Number(f.frame) || 1, idx)}
                  className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 disabled:opacity-40 text-cyan-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Make this picture move like a real movie!"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Motion</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
