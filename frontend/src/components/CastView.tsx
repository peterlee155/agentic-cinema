"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Plus, Edit2, Trash2, FileText, Sparkles, MessageSquare, X, Check, Eye } from "lucide-react";

interface CastViewProps {
  currentProject: any;
  onOpenNewMovie?: () => void;
  onDirectInChat?: () => void;
}

export const CastView: React.FC<CastViewProps> = ({ currentProject, onOpenNewMovie }) => {
  const [castList, setCastList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [activeScript, setActiveScript] = useState<any>(null);
  const [loadingScript, setLoadingScript] = useState(false);

  const [formPerformer, setFormPerformer] = useState("");
  const [formCharacter, setFormCharacter] = useState("");
  const [formRole, setFormRole] = useState("Lead Actor");
  const [formNotes, setFormNotes] = useState("");

  const project_id = currentProject?.project_id || currentProject?.project?.id;

  useEffect(() => {
    if (project_id) {
      fetchCast();
    }
  }, [project_id, currentProject]);

  const fetchCast = async () => {
    if (!project_id) return;
    try {
      const res = await fetch(`/api/projects/${project_id}/cast`);
      const data = await res.json();
      if (data.success && data.cast) {
        setCastList(data.cast);
      }
    } catch (err) {
      console.error("Error fetching cast:", err);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project_id || !formPerformer || !formCharacter) return;

    try {
      const res = await fetch(`/api/projects/${project_id}/cast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          performer_name: formPerformer,
          character_name: formCharacter,
          role_type: formRole,
          notes: formNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormPerformer("");
        setFormCharacter("");
        fetchCast();
      }
    } catch (err) {
      console.error("Error saving cast:", err);
    }
  };

  const handleDeleteCast = async (castId: string, performer: string) => {
    if (!confirm(`Remove ${performer} from cast assignments?`)) return;
    try {
      const res = await fetch(`/api/projects/${project_id}/cast/${castId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchCast();
      }
    } catch (err) {
      console.error("Error deleting cast:", err);
    }
  };

  const handleViewActorScript = async (castId: string) => {
    if (!project_id) return;
    setLoadingScript(true);
    setIsScriptModalOpen(true);
    try {
      const res = await fetch(`/api/projects/${project_id}/cast/${castId}/script`);
      const data = await res.json();
      setLoadingScript(false);
      if (data.success && data.actor_script) {
        setActiveScript(data.actor_script);
      }
    } catch (err) {
      setLoadingScript(false);
      console.error("Error fetching actor script:", err);
    }
  };

  if (!currentProject) {
    return (
      <div className="text-center py-20 cinema-card bg-[#090e1d] border-[#1c263c] space-y-5 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-3xl text-indigo-400">
          🎭
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white">No Film Project Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create or select a film project to manage canonical performer assignments and generate actor scripts.
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

  const existingCharacters = currentProject?.characters || [
    { name: "Kaelen Vance", role: "Lead Protagonist" },
    { name: "Lyra Vance", role: "Supporting Actress" },
    { name: "Elias", role: "Antagonist" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between bg-[#0d1322] border border-[#1c263c] rounded-2xl px-6 py-4 shadow-xl gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Canonical Cast Directory & Actor Scripts</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
              {castList.length} CONFIRMED CAST
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Assign real performers to canonical fictional characters. Generates tailored actor scripts and production directories.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cast Assignment</span>
        </button>
      </div>

      {/* Natural Language Hint Card */}
      <div className="bg-[#0e1629]/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200/90 shadow-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            💡
          </div>
          <div>
            <strong className="text-white block">Natural Language Casting Active</strong>
            You can cast performers directly in Studio Chat! Say: <code className="bg-black/50 px-2 py-0.5 rounded text-amber-300 font-mono">"My main actor is Peter"</code> or <code className="bg-black/50 px-2 py-0.5 rounded text-amber-300 font-mono">"Anna plays Lyra"</code>.
          </div>
        </div>
      </div>

      {/* Cast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {castList.length === 0 && (
          <div className="text-center py-16 cinema-card bg-[#090e1d] border-[#1c263c] col-span-full space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mx-auto flex items-center justify-center text-2xl text-indigo-400">
              🎭
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">No Cast Assignments Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Assign performers to fictional characters above or type in chat <code className="text-indigo-300 font-mono">"Peter plays Kaelen"</code>.
              </p>
            </div>
          </div>
        )}

        {castList.map((c: any, idx: number) => {
          const sceneCount = (c.sceneNumbers || []).length;
          return (
            <div
              key={c.id || idx}
              className="cinema-card p-5 flex flex-col justify-between space-y-4 bg-[#090e1d] border-[#1c263c] hover:border-indigo-500/50 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                    {c.status || "CONFIRMED"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{c.roleType || "Actor"}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">PERFORMER</div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>{c.performerName}</span>
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-[#0e1628] border border-[#1d2b4a] space-y-1 text-xs">
                  <span className="text-slate-400 block text-[10px]">CANONICAL CHARACTER</span>
                  <strong className="text-indigo-300 text-sm block">→ {c.characterName}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-[#11182c] p-2.5 rounded-xl border border-[#212f52] text-center">
                    <span className="text-[10px] text-slate-400 block">APPEARANCES</span>
                    <strong className="text-white font-mono text-sm">{sceneCount} scenes</strong>
                  </div>
                  <div className="bg-[#11182c] p-2.5 rounded-xl border border-[#212f52] text-center">
                    <span className="text-[10px] text-slate-400 block">DIALOGUE</span>
                    <strong className="text-amber-300 font-mono text-sm">{c.dialogueCount || 0} lines</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#1c263c] space-y-2">
                <button
                  onClick={() => handleViewActorScript(c.id)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Actor Script</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFormPerformer(c.performerName);
                      setFormCharacter(c.characterName);
                      setFormRole(c.roleType || "Lead Actor");
                      setFormNotes(c.notes || "");
                      setIsModalOpen(true);
                    }}
                    className="flex-1 bg-[#162038] hover:bg-[#202c4b] border border-[#2d3d63] text-slate-300 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCast(c.id, c.performerName)}
                    className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs transition cursor-pointer"
                    title="Remove Cast Assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1122] border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl">
                🎭
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Assign Cast Performer</h3>
                <p className="text-xs text-slate-400">Link a real performer to a fictional character</p>
              </div>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Performer Name (Real Actor)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Lee"
                  value={formPerformer}
                  onChange={(e) => setFormPerformer(e.target.value)}
                  className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Canonical Fictional Character</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaelen Vance"
                  value={formCharacter}
                  onChange={(e) => setFormCharacter(e.target.value)}
                  className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none mb-1"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {existingCharacters.map((ch: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormCharacter(ch.name)}
                      className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 cursor-pointer"
                    >
                      {ch.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Role Type</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full bg-[#11182c] border border-[#212f52] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Lead Actor">Lead Actor</option>
                  <option value="Supporting Actor">Supporting Actor</option>
                  <option value="Antagonist / Villain">Antagonist / Villain</option>
                  <option value="Special Guest">Special Guest</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Save Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actor Script Modal View */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080d1b] border border-amber-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setIsScriptModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingScript ? (
              <div className="py-20 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <span className="text-xs text-amber-300 font-bold block">Generating Tailored Actor Script...</span>
              </div>
            ) : activeScript ? (
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Script Header */}
                <div className="pb-4 border-b border-[#1c263c] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                      OFFICIAL ACTOR SCRIPT
                    </span>
                    <span className="text-xs font-mono text-slate-400">{activeScript.totalScenes} Active Scenes</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">
                    {activeScript.performerName} <span className="text-amber-400 font-sans text-lg">as</span> {activeScript.characterName}
                  </h2>
                  <div className="text-xs text-slate-300 font-sans">{activeScript.characterSummary}</div>
                  <div className="text-xs bg-[#11182c] p-3 rounded-xl border border-[#212f52] text-amber-200">
                    <strong>Character Arc:</strong> {activeScript.characterArc}
                  </div>
                </div>

                {/* Scene-by-Scene Actor Breakdown */}
                <div className="space-y-6">
                  {activeScript.scenes && activeScript.scenes.map((sc: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#0d1427] border border-amber-500/30 space-y-4 text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-[#1c263c] pb-2 font-sans">
                        <span className="font-extrabold text-amber-300 text-sm">
                          SCENE {sc.sceneNumber} — {sc.slugline}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {sc.act}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-sans">
                        <div className="bg-[#080d19] p-3 rounded-xl border border-[#1b2640]">
                          <strong className="text-indigo-300 block mb-0.5">DRAMATIC OBJECTIVE:</strong>
                          <span className="text-slate-200">{sc.objective}</span>
                        </div>
                        <div className="bg-[#080d19] p-3 rounded-xl border border-[#1b2640]">
                          <strong className="text-purple-300 block mb-0.5">EMOTIONAL STATE & SUBTEXT:</strong>
                          <span className="text-slate-200">{sc.emotionalState} | {sc.subtext}</span>
                        </div>
                      </div>

                      <div className="bg-[#070b16] p-3 rounded-xl border border-[#152037] text-[11px] font-sans text-slate-400">
                        <strong className="text-slate-300 block mb-0.5">PRECEDING CONTEXT:</strong>
                        {sc.previousContext}
                      </div>

                      <div className="space-y-2 font-mono">
                        <div className="text-[10px] text-slate-400 uppercase font-sans font-bold">SCENE ACTION & DIALOGUE</div>
                        <pre className="bg-[#040711] p-4 rounded-xl border border-[#152037] text-amber-200/90 whitespace-pre-wrap leading-relaxed">
                          {sc.dialogue}
                        </pre>
                      </div>

                      <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-[11px] font-sans text-amber-300">
                        <strong>PERFORMANCE NOTE:</strong> {sc.performanceNotes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
