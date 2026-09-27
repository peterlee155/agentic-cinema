"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ProjectMetadata, ProjectBibleData } from "../types/project";

export const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("agentic_cinema_token") || "guest_demo_token";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

interface ProjectContextType {
  activeProjectId: string | null;
  activeProject: ProjectBibleData | null;
  projects: ProjectMetadata[];
  isLoadingProjects: boolean;
  isLoadingActiveProject: boolean;
  selectProject: (projectId: string) => Promise<void>;
  clearActiveProject: () => void;
  loadProjects: () => Promise<void>;
  createProject: (
    titleOrPayload: string | Record<string, unknown>,
    genre?: string,
    logline?: string,
    format?: string,
    extra?: Record<string, unknown>
  ) => Promise<ProjectBibleData | null>;
  updateActiveProject: (updates: Record<string, unknown>) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<boolean>;
  archiveProject: (projectId: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectBibleData | null>(null);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingActiveProject, setIsLoadingActiveProject] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/projects", {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        const list: ProjectMetadata[] = data.projects.map((p: Record<string, unknown>) => ({
          id: p.id || p.project_id,
          title: p.title || "Untitled Film",
          logline: p.logline || "A new cinematic production.",
          genre: p.genre || "Sci-Fi Supernatural Thriller",
          format: p.format || "Theatrical Feature",
          status: p.stage || "PRODUCTION_READY",
          updatedAt: p.updated_at || new Date().toISOString(),
          createdAt: p.updated_at || new Date().toISOString(),
          sceneCount: p.scene_count || 0,
          characterCount: p.character_count || 0,
        }));
        setProjects(list);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.warn("[ProjectContext] Failed to load projects:", err);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    let isMounted = true;
    const initLoad = async () => {
      if (isMounted) {
        await loadProjects();
      }
    };
    initLoad();
    return () => {
      isMounted = false;
    };
  }, [loadProjects]);

  const selectProject = async (projectId: string) => {
    if (!projectId || projectId === "undefined" || projectId === "null") return;
    setIsLoadingActiveProject(true);
    setActiveProjectId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveProject(data.data);
      } else {
        console.warn(`[ProjectContext] Project ${projectId} not found`);
        setActiveProject(null);
      }
    } catch (err) {
      console.error(`[ProjectContext] Error selecting project ${projectId}:`, err);
    } finally {
      setIsLoadingActiveProject(false);
    }
  };

  const clearActiveProject = () => {
    setActiveProjectId(null);
    setActiveProject(null);
  };

  const createProject = async (
    titleOrPayload: string | Record<string, unknown>,
    genre?: string,
    logline?: string,
    format: string = "Theatrical Feature",
    extra?: Record<string, unknown>
  ): Promise<ProjectBibleData | null> => {
    try {
      let bodyData: Record<string, unknown>;
      if (typeof titleOrPayload === "object" && titleOrPayload !== null) {
        bodyData = {
          title: titleOrPayload.title || "Untitled Film",
          genre: titleOrPayload.genre || genre || "Sci-Fi",
          logline: titleOrPayload.logline || logline || "A new cinematic production.",
          format: titleOrPayload.format || format || "Theatrical Feature",
          tone: titleOrPayload.tone || "Cinematic, High-Stakes",
          visual_style: titleOrPayload.visual_style || "35mm Anamorphic Widescreen",
          target_duration: titleOrPayload.target_duration || "115 Minutes",
          language: titleOrPayload.language || "English",
          ...titleOrPayload,
        };
      } else {
        bodyData = {
          title: (titleOrPayload || "").trim() || "Untitled Film",
          genre: (genre || "").trim() || "Sci-Fi Supernatural Thriller",
          logline: (logline || "").trim() || "A new cinematic production.",
          format: format || "Theatrical Feature",
          tone: extra?.tone || "Cinematic, High-Stakes",
          visual_style: extra?.visual_style || "35mm Anamorphic Widescreen",
          target_duration: extra?.target_duration || "115 Minutes",
          language: extra?.language || "English",
          ...(extra || {}),
        };
      }

      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (data.success && data.project_id) {
        await loadProjects();
        await selectProject(data.project_id);
        return data.data;
      }
    } catch (err) {
      console.error("[ProjectContext] Failed to create project via API:", err);
    }
    return null;
  };

  const updateActiveProject = async (updates: Record<string, unknown>): Promise<void> => {
    setActiveProject((prev: ProjectBibleData | null) => (prev ? ({ ...prev, ...updates } as ProjectBibleData) : (updates as ProjectBibleData)));
  };

  const duplicateProject = async (projectId: string): Promise<boolean> => {
    try {
      const orig = activeProject && (activeProject.id === projectId || activeProject.project_id === projectId)
        ? activeProject
        : null;

      const dupTitle = `${orig?.title || orig?.project?.title || "Film"} (Copy)`;
      await createProject(
        dupTitle,
        orig?.genre || orig?.project?.genre || "Sci-Fi",
        orig?.logline || orig?.project?.logline || "",
        orig?.format || orig?.project?.format || "Theatrical Feature",
        {
          tone: orig?.project?.tone,
          visual_style: orig?.project?.visualStyle,
          target_duration: orig?.project?.targetDuration,
          language: orig?.project?.language,
        }
      );
      return true;
    } catch (err) {
      console.error("[ProjectContext] Failed to duplicate project:", err);
      return false;
    }
  };

  const archiveProject = async (projectId: string): Promise<boolean> => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (activeProjectId === projectId) {
        clearActiveProject();
      }
      await loadProjects();
      return true;
    } catch (err) {
      console.error("[ProjectContext] Failed to delete project:", err);
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProjectId,
        activeProject,
        projects,
        isLoadingProjects,
        isLoadingActiveProject,
        selectProject,
        clearActiveProject,
        loadProjects,
        createProject,
        updateActiveProject,
        duplicateProject,
        archiveProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
