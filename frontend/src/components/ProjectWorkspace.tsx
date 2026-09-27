"use client";

import React, { useState, useEffect } from "react";
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
import { SoundView } from "./SoundView";
import { DevpostFocusView } from "./DevpostFocusView";
import { AgentsView } from "./AgentsView";
import { AssetsView } from "./AssetsView";
import { SettingsView } from "./SettingsView";
import { SwarmProgressModal } from "./SwarmProgressModal";
import { RevenueCatModal } from "./RevenueCatModal";
import { getAuthHeaders } from "../contexts/ProjectContext";

export const ProjectWorkspace: React.FC = () => {
  const { activeProject, clearActiveProject, activeProjectId, selectProject, loadProjects } = useProject();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState(false);
  const [isRcOpen, setIsRcOpen] = useState(false);
  const [credits, setCredits] = useState(202);
  const [plan, setPlan] = useState("PRO");

  const refreshRevenueCat = async () => {
    try {
      const res = await fetch("/api/revenuecat/status", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.credits_available === "number") {
          setCredits(data.credits_available);
        }
        if (data && data.plan) {
          setPlan(data.plan);
        }
      }
    } catch (err) {
      console.warn("Error refreshing RevenueCat status:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshRevenueCat();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRunSwarm = async () => {
    setIsSwarmRunning(true);
    setIsSwarmModalOpen(true);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
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
      if (data.error === "INSUFFICIENT_CREDITS") {
        setIsSwarmRunning(false);
        setIsSwarmModalOpen(false);
        alert(`⚠️ ${data.message || "Insufficient credits!"}`);
        setIsRcOpen(true);
        return;
      }
      if (data.success) {
        setIsSwarmRunning(false);
        refreshRevenueCat();
        if (activeProjectId) {
          await selectProject(activeProjectId);
        }
        await loadProjects();
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
        return (
          <ChatView
            currentProject={activeProject}
            activeModel="gemini-3.5-flash"
            onRunSwarm={handleRunSwarm}
            onOpenRevenueCat={() => setIsRcOpen(true)}
            onNavigateToScene={() => {}}
          />
        );
      case "script":
        return (
          <ScriptView
            currentProject={activeProject}
            activeSceneIndex={0}
            onSelectScene={() => {}}
            onDirectInChat={() => setActiveTab("chat")}
            onRunSwarm={handleRunSwarm}
            onRefresh={async () => {
              if (activeProjectId) {
                await selectProject(activeProjectId);
                await loadProjects();
              }
            }}
          />
        );
      case "storyboard":
        return (
          <StoryboardView
            currentProject={activeProject}
            onDirectInChat={() => setActiveTab("chat")}
            onRunSwarm={handleRunSwarm}
            onOpenNewMovie={clearActiveProject}
          />
        );
      case "sound":
        return (
          <SoundView
            currentProject={activeProject}
            onDirectInChat={() => setActiveTab("chat")}
            onRunSwarm={handleRunSwarm}
            onOpenNewMovie={clearActiveProject}
          />
        );
      case "cast":
        return (
          <CastView
            currentProject={activeProject}
            onDirectInChat={() => setActiveTab("chat")}
            onOpenNewMovie={clearActiveProject}
          />
        );
      case "devpost":
        return <DevpostFocusView currentProject={activeProject} activeModel="gemini-3.5-flash" />;
      case "agents":
        return (
          <AgentsView
            currentProject={activeProject}
            onRunSwarm={handleRunSwarm}
            isSwarmRunning={isSwarmRunning}
            onOpenSwarmProgress={() => setIsSwarmModalOpen(true)}
          />
        );
      case "assets":
      case "bible":
        return <AssetsView currentProject={activeProject} />;
      case "settings":
        return (
          <SettingsView
            activeModel="gemini-3.6-flash"
            onModelChange={() => {}}
            onOpenRevenueCat={() => setIsRcOpen(true)}
            credits={credits}
            plan={plan}
          />
        );
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
        onOpenSwarmProgress={() => setIsSwarmModalOpen(true)}
        onBackToLibrary={clearActiveProject}
        credits={credits}
        plan={plan}
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
        projectId={activeProjectId}
        projectTitle={activeProject?.project?.title || activeProject?.title || "Film Project"}
      />

      <RevenueCatModal
        isOpen={isRcOpen}
        onClose={() => setIsRcOpen(false)}
        credits={credits}
        plan={plan}
        onUpgrade={(newPlan, newCredits) => {
          setPlan(newPlan);
          if (typeof newCredits === "number") {
            setCredits(newCredits);
          } else {
            refreshRevenueCat();
          }
        }}
      />
    </div>
  );
};
