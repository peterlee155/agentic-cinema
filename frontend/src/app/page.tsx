"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LoginView } from "../components/LoginView";
import { ProjectLibraryPage } from "../components/ProjectLibraryPage";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { ChatView } from "../components/ChatView";
import { ScriptView } from "../components/ScriptView";
import { CastView } from "../components/CastView";
import { AgentsView } from "../components/AgentsView";
import { AssetsView } from "../components/AssetsView";
import { SettingsView } from "../components/SettingsView";
import { ProjectSummaryView } from "../components/ProjectSummaryView";
import { SwarmProgressModal } from "../components/SwarmProgressModal";
import { RevenueCatModal } from "../components/RevenueCatModal";
import { NewMovieModal } from "../components/NewMovieModal";
import { ConfigModal } from "../components/ConfigModal";

function CinemaApp() {
  const { user, isAuthenticated, isLoading: isLoadingAuth, logout } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeModel, setActiveModel] = useState("gemini-3.6-flash");
  const [credits, setCredits] = useState(250);
  const [plan, setPlan] = useState("CREATOR");
  const [isRcOpen, setIsRcOpen] = useState(false);
  const [isNewMovieOpen, setIsNewMovieOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn("Error loading projects:", err);
    }
  };

  const loadCurrentProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentProject(data.data);
      }
    } catch (err) {
      console.warn("Error loading project detail:", err);
    }
  };

  const handleSelectProject = async (projectId: string) => {
    setSelectedProjectId(projectId);
    await loadCurrentProject(projectId);
    setActiveTab("chat");
  };

  const handleCreateProject = async (
    titleOrData: any,
    genreArg?: string,
    loglineArg?: string,
    formatArg?: string
  ) => {
    let payload: any = {};
    if (typeof titleOrData === "object" && titleOrData !== null) {
      payload = {
        title: titleOrData.title || "Untitled Film",
        logline: titleOrData.logline || "A new cinematic production.",
        genre: titleOrData.genre || "Sci-Fi Supernatural Thriller",
        tone: titleOrData.tone || "Dark, Visceral, High-Stakes",
        visual_style: titleOrData.visual_style || "35mm Anamorphic, Chiaroscuro Rim Lighting",
        target_duration: titleOrData.target_duration || "115 Minutes",
        language: titleOrData.language || "English",
      };
    } else {
      payload = {
        title: String(titleOrData || "Untitled Film").trim(),
        logline: String(loglineArg || "A new cinematic production.").trim(),
        genre: String(genreArg || "Sci-Fi Supernatural Thriller").trim(),
        tone: "Dark, Visceral, High-Stakes",
        visual_style: "35mm Anamorphic, Chiaroscuro Rim Lighting",
        target_duration: "115 Minutes",
        language: "English",
      };
    }

    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.project_id) {
        await loadProjects();
        await handleSelectProject(data.project_id);
        setIsNewMovieOpen(false);
      } else {
        alert("Failed to create project: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error creating project: " + err);
    }
  };

  const handleRenameProject = async (id?: string, oldTitle?: string) => {
    const targetId = id || currentProject?.project_id || selectedProjectId;
    const currentTitle = oldTitle || currentProject?.project?.title || "Untitled Film";
    const newTitle = prompt("Enter new title for this film project:", currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === currentTitle) return;

    try {
      const res = await fetch(`/api/projects/${targetId}/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        await loadProjects();
        if (selectedProjectId === targetId) {
          await loadCurrentProject(targetId);
        }
      }
    } catch (err) {
      alert("Error renaming project: " + err);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await loadProjects();
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
          setCurrentProject(null);
        }
      }
    } catch (err) {
      alert("Error deleting project: " + err);
    }
  };

  const handleSaveConfig = async (configData: any) => {
    if (!currentProject?.project_id) return;
    try {
      const res = await fetch(`/api/projects/${currentProject.project_id}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      });
      const data = await res.json();
      if (data.success) {
        await loadCurrentProject(currentProject.project_id);
        alert("⚙️ Project configuration saved!");
      }
    } catch (err) {
      alert("Error saving config: " + err);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setActiveModel(newModel);
    try {
      await fetch("/api/settings/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: newModel }),
      });
    } catch (err) {
      console.warn("Model change sync error:", err);
    }
  };

  const handleRunSwarm = async () => {
    setIsSwarmRunning(true);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: currentProject?.project_id || "",
          idea: currentProject?.project?.logline || "",
          force_regenerate: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.bible) {
        setCurrentProject(data.bible);
      }
    } catch (err) {
      console.warn("Swarm error:", err);
    }
  };

  // 1. Loading Authentication State
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#050711] flex items-center justify-center text-white font-mono">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-indigo-300">AUTHENTICATING CINEMA SESSION...</p>
        </div>
      </div>
    );
  }

  // 2. Google / Email Auth First
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // 3. Project Library First (Before Entering Studio)
  if (!selectedProjectId) {
    return (
      <>
        <ProjectLibraryPage
          projects={projects}
          onSelectProject={handleSelectProject}
          onOpenNewMovie={() => setIsNewMovieOpen(true)}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onLogout={logout}
          user={user}
        />

        <NewMovieModal
          isOpen={isNewMovieOpen}
          onClose={() => setIsNewMovieOpen(false)}
          onCreateProject={handleCreateProject}
        />
      </>
    );
  }

  // 4. The Main Place: Studio Workspace
  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans">
      {/* Studio Header with Back to Library Button */}
      <Header
        currentProject={currentProject}
        activeModel={activeModel}
        onModelChange={handleModelChange}
        onRenameProject={() => handleRenameProject()}
        onOpenRevenueCat={() => setIsRcOpen(true)}
        onOpenNewMovie={() => setIsNewMovieOpen(true)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onRunSwarm={handleRunSwarm}
        isSwarmRunning={isSwarmRunning}
        credits={credits}
        plan={plan}
        onBackToLibrary={() => setSelectedProjectId(null)}
      />

      {/* Main Place Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "chat" && (
            <ChatView
              currentProject={currentProject}
              activeModel={activeModel}
              onRunSwarm={handleRunSwarm}
              onOpenRevenueCat={() => setIsRcOpen(true)}
              onNavigateToScene={(scNum) => {
                const idx = (currentProject?.scenes || []).findIndex(
                  (s: any) => s.sceneNumber === scNum
                );
                if (idx !== -1) setActiveSceneIndex(idx);
                setActiveTab("script");
              }}
            />
          )}

          {activeTab === "script" && (
            <ScriptView
              currentProject={currentProject}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={setActiveSceneIndex}
              onDirectInChat={() => setActiveTab("chat")}
              onRunSwarm={handleRunSwarm}
              onOpenNewMovie={() => setIsNewMovieOpen(true)}
            />
          )}

          {activeTab === "cast" && (
            <CastView
              currentProject={currentProject}
              onOpenNewMovie={() => setIsNewMovieOpen(true)}
            />
          )}

          {activeTab === "summary" && (
            <ProjectSummaryView
              currentProject={currentProject}
              onSelectScene={(idx) => {
                setActiveSceneIndex(idx);
                setActiveTab("script");
              }}
            />
          )}

          {activeTab === "agents" && (
            <AgentsView currentProject={currentProject} activeModel={activeModel} />
          )}

          {activeTab === "assets" && (
            <AssetsView currentProject={currentProject} />
          )}

          {activeTab === "settings" && (
            <SettingsView activeModel={activeModel} onOpenRevenueCat={() => setIsRcOpen(true)} />
          )}
        </main>
      </div>

      {/* Studio Modals */}
      <SwarmProgressModal
        isOpen={isSwarmRunning}
        onClose={() => setIsSwarmRunning(false)}
        projectTitle={currentProject?.project?.title || "Film Project"}
        onComplete={() => {
          setIsSwarmRunning(false);
          loadCurrentProject(currentProject?.project_id);
        }}
        onSkip={() => {
          setIsSwarmRunning(false);
          loadCurrentProject(currentProject?.project_id);
        }}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentProject={currentProject}
        onSaveConfig={handleSaveConfig}
      />

      <RevenueCatModal
        isOpen={isRcOpen}
        onClose={() => setIsRcOpen(false)}
        credits={credits}
        plan={plan}
        onUpgrade={(newPlan) => setPlan(newPlan)}
      />

      <NewMovieModal
        isOpen={isNewMovieOpen}
        onClose={() => setIsNewMovieOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <CinemaApp />
    </AuthProvider>
  );
}
