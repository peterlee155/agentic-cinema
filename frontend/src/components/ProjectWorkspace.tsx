"use client";

import React, { useState } from "react";
import { useProject } from "../contexts/ProjectContext";
import { DEFAULT_WORKSPACE_SECTIONS } from "../lib/workspace-registry";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ProjectOverview } from "./ProjectOverview";
import { ProjectSummaryView } from "./ProjectSummaryView";
import { ChatView } from "./ChatView";
import { ScriptView } from "./ScriptView";
import { CastView } from "./CastView";
import { StoryboardView } from "./StoryboardView";
import { AgentsView } from "./AgentsView";
import { AssetsView } from "./AssetsView";
import { SettingsView } from "./SettingsView";
import { SwarmProgressModal } from "./SwarmProgressModal";
import { RevenueCatModal } from "./RevenueCatModal";

export const ProjectWorkspace: React.FC = () => {
  const { activeProject, clearActiveProject, activeProjectId } = useProject();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState(false);
  const [isRcOpen, setIsRcOpen] = useState(false);

  const handleRunSwarm = async () => {
    setIsSwarmRunning(true);
    setIsSwarmModalOpen(true);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: activeProjectId || "",
          force_regenerate: true,
        }),
      });
      if (!res.ok) {
        setIsSwarmRunning(false);
        setIsSwarmModalOpen(false);
        alert("Swarm Notice: Google AI servers busy. Please click Run Swarm again.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setIsSwarmRunning(false);
      }
    } catch (err) {
      setIsSwarmRunning(false);
      setIsSwarmModalOpen(false);
    }
  };

  const renderSectionComponent = () => {
    switch (activeTab) {
      case "summary":
        return <ProjectSummaryView currentProject={activeProject} />;
      case "overview":
        return (
          <ProjectOverview
            project={activeProject}
            onRunSwarm={handleRunSwarm}
            onSelectTab={setActiveTab}
          />
        );
      case "chat":
        return <ChatView currentProject={activeProject} activeModel="gemini-3.6-flash" onRunSwarm={handleRunSwarm} onOpenRevenueCat={() => setIsRcOpen(true)} onNavigateToScene={() => {}} />;
      case "script":
        return (
          <ScriptView
            currentProject={activeProject}
            activeSceneIndex={0}
            onSelectScene={() => {}}
            onDirectInChat={() => setActiveTab("chat")}
            onRunSwarm={handleRunSwarm}
          />
        );
      case "cast":
        return <CastView currentProject={activeProject} />;
      case "storyboard":
        return <StoryboardView currentProject={activeProject} />;
      case "agents":
        return (
          <AgentsView
            onRunSwarm={handleRunSwarm}
            isSwarmRunning={isSwarmRunning}
          />
        );
      case "assets":
      case "bible":
        return <AssetsView currentProject={activeProject} />;
      case "settings":
        return <SettingsView activeModel="gemini-3.6-flash" onModelChange={() => {}} onOpenRevenueCat={() => setIsRcOpen(true)} />;
      default:
        return (
          <ProjectOverview
            project={activeProject}
            onRunSwarm={handleRunSwarm}
            onSelectTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050711] text-slate-100 font-sans overflow-hidden">
      {/* Studio Header */}
      <Header
        currentProject={activeProject}
        onOpenNewMovie={clearActiveProject}
        onOpenConfig={() => {}}
        onOpenRevenueCat={() => setIsRcOpen(true)}
        onRunSwarm={handleRunSwarm}
        isSwarmRunning={isSwarmRunning}
        onBackToLibrary={clearActiveProject}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#050711]">
          {renderSectionComponent()}
        </main>
      </div>

      {/* Modals */}
      <SwarmProgressModal
        isOpen={isSwarmModalOpen}
        onClose={() => setIsSwarmModalOpen(false)}
        isSwarmRunning={isSwarmRunning}
      />

      <RevenueCatModal
        isOpen={isRcOpen}
        onClose={() => setIsRcOpen(false)}
        credits={202}
        plan="PRO"
      />
    </div>
  );
};
