"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

import { ProjectBibleData, StoryForMeCharacter } from "../types/project";

interface StoryForMeViewProps {
  currentProject: ProjectBibleData | null;
  onOpenAdvancedRules?: () => void;
  onOpenScript?: () => void;
}

export const StoryForMeView: React.FC<StoryForMeViewProps> = ({
  currentProject,
  onOpenAdvancedRules,
  onOpenScript,
}) => {
  const projectTitle = currentProject?.title || currentProject?.project?.title || "Our Movie";
  const story = currentProject?.storyForMe || currentProject?.story_for_me || {};

  // Fallback data if storyForMe is still initializing
  const whatIsAbout =
    story.whatIsThisAbout ||
    currentProject?.logline ||
    currentProject?.project?.logline ||
    `An exciting adventure called "${projectTitle}" where unexpected heroes work together to solve a big challenge!`;

  const importantPeople = story.importantPeople || (
    currentProject?.characters && currentProject.characters.length > 0
      ? currentProject.characters.map((c: any, idx: number) => ({
          name: c.name || `Character ${idx + 1}`,
          role: c.role || "Key Character",
          friendlyDescription: c.description || `An important figure in the story of ${projectTitle}.`,
          goal: c.goal || "To help achieve the story's main objective.",
          fear: c.flaw || "Overcoming personal doubts.",
          signatureObject: c.props || "A special item from their journey",
        }))
      : [
          {
            name: `Hero of ${projectTitle}`,
            role: "The Brave Lead",
            friendlyDescription: `The main protagonist leading the story of ${projectTitle}.`,
            goal: "To overcome the central challenge.",
            fear: "Failing their mission.",
            signatureObject: "A signature keepsake",
          },
          {
            name: "The Loyal Ally",
            role: "The Trusted Companion",
            friendlyDescription: `A steadfast partner supporting the journey in ${projectTitle}.`,
            goal: "To help the team succeed.",
            fear: "Losing their way in the adventure.",
            signatureObject: "A lucky compass",
          }
        ]
  );

  const whatHappens = story.whatHappens || {
    first: `First: Our heroes discover that their world in ${projectTitle} is facing a major challenge and they embark on an epic quest.`,
    next: "Next: They journey forward, facing unexpected obstacles, learning each other's strengths, and unearthing surprising secrets.",
    last: "Last: In an unforgettable climax, they combine their unique talents to triumph and bring victory home.",
  };

  const whatToRemember = story.whatToRemember || [
    "Rule 1: Always stick together — teamwork is the strongest power.",
    "Rule 2: Listen carefully to clues, every challenge offers a valuable lesson.",
    "Rule 3: Courage is not having no fear; it is doing the right thing anyway.",
  ];

  const mysteries = story.unresolvedMysteries || [
    `What will happen next in the world of ${projectTitle}?`,
    "What unexpected discoveries await our heroes on their next adventure?",
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-[#0d1326] to-purple-950/60 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Story For Me — Beginner Guide
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {projectTitle}
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Here is everything you need to know about your movie in simple, friendly words!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenScript && (
              <button
                onClick={onOpenScript}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read Full Script</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenAdvancedRules && (
              <button
                onClick={onOpenAdvancedRules}
                className="bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Filmmaker Rules</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. What Is This Movie About? */}
      <div className="cinema-card bg-[#090e1d] border-[#1c263c] p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
            🌟
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white">
              What Is This Movie About?
            </h2>
            <p className="text-xs text-slate-400">The big adventure in a nutshell</p>
          </div>
        </div>

        <div className="bg-[#0e162b] p-5 rounded-2xl border border-indigo-500/20 text-slate-200 text-sm md:text-base leading-relaxed font-medium">
          {whatIsAbout}
        </div>
      </div>

      {/* 2. Who Are The Important People? */}
      <div className="cinema-card bg-[#090e1d] border-[#1c263c] p-6 md:p-8 rounded-3xl shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl text-indigo-400">
            👥
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white">
              Who Are The Important People?
            </h2>
            <p className="text-xs text-slate-400">Meet the heroes and guides of our story</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {importantPeople.map((person: StoryForMeCharacter, idx: number) => (
            <div
              key={idx}
              className="bg-[#0c1224] border border-[#1b2742] hover:border-indigo-500/40 rounded-2xl p-5 space-y-3 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-base">{person.name}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {person.role || "Hero"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {person.friendlyDescription}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-2.5 space-y-0.5">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <span>🎯</span> Goal
                  </div>
                  <div className="text-slate-200 text-[11px] font-medium">{person.goal}</div>
                </div>

                <div className="bg-rose-950/40 border border-rose-500/20 rounded-xl p-2.5 space-y-0.5">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                    <span>😨</span> Fear
                  </div>
                  <div className="text-slate-200 text-[11px] font-medium">{person.fear}</div>
                </div>

                {person.signatureObject && (
                  <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-2.5 space-y-0.5">
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <span>🗝️</span> Special Item
                    </div>
                    <div className="text-slate-200 text-[11px] font-medium">{person.signatureObject}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. What Happens First, Next, and Last? */}
      <div className="cinema-card bg-[#090e1d] border-[#1c263c] p-6 md:p-8 rounded-3xl shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
            🗺️
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-white">
              What Happens First, Next, and Last?
            </h2>
            <p className="text-xs text-slate-400">The three parts of our movie adventure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* First */}
          <div className="bg-[#0c1224] border border-[#1b2742] rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sm font-extrabold text-indigo-300">
              1
            </div>
            <h3 className="text-sm font-extrabold text-indigo-300 uppercase tracking-wider">
              First (The Beginning)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {whatHappens.first}
            </p>
          </div>

          {/* Next */}
          <div className="bg-[#0c1224] border border-[#1b2742] rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-sm font-extrabold text-purple-300">
              2
            </div>
            <h3 className="text-sm font-extrabold text-purple-300 uppercase tracking-wider">
              Next (The Big Adventure)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {whatHappens.next}
            </p>
          </div>

          {/* Last */}
          <div className="bg-[#0c1224] border border-[#1b2742] rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm font-extrabold text-amber-300">
              3
            </div>
            <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
              Last (The Grand Finale)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {whatHappens.last}
            </p>
          </div>
        </div>
      </div>

      {/* 4. What Should I Remember & Big Secrets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules */}
        <div className="cinema-card bg-[#090e1d] border-[#1c263c] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <h2 className="text-base md:text-lg font-black text-white">
              What Should I Remember?
            </h2>
          </div>
          <div className="space-y-2.5">
            {whatToRemember.map((rule: string, i: number) => (
              <div
                key={i}
                className="bg-[#0c1224] border border-[#1b2742] rounded-xl p-3.5 text-xs text-slate-200 font-medium flex items-start gap-2.5"
              >
                <span className="text-indigo-400 font-bold shrink-0 mt-0.5">✦</span>
                <span className="leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mysteries */}
        <div className="cinema-card bg-[#090e1d] border-[#1c263c] p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔍</span>
            <h2 className="text-base md:text-lg font-black text-white">
              Big Secrets & Mysteries
            </h2>
          </div>
          <div className="space-y-2.5">
            {mysteries.map((m: string, i: number) => (
              <div
                key={i}
                className="bg-[#0c1224] border border-[#1b2742] rounded-xl p-3.5 text-xs text-slate-200 font-medium flex items-start gap-2.5"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">?</span>
                <span className="leading-relaxed">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
