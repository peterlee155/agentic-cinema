"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ProjectMetadata } from "../types/project";

interface ProjectContextType {
  activeProjectId: string | null;
  activeProject: any | null;
  projects: ProjectMetadata[];
  isLoadingProjects: boolean;
  isLoadingActiveProject: boolean;
  selectProject: (projectId: string) => Promise<void>;
  clearActiveProject: () => void;
  loadProjects: () => Promise<void>;
  createProject: (title: string, genre: string, logline: string, format: string) => Promise<any>;
  duplicateProject: (projectId: string) => Promise<boolean>;
  archiveProject: (projectId: string) => Promise<boolean>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingActiveProject, setIsLoadingActiveProject] = useState(false);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.warn("Failed to load projects metadata:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const selectProject = async (projectId: string) => {
    setIsLoadingActiveProject(true);
    setActiveProjectId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveProject(data);
      }
    } catch (err) {
      console.warn(`Failed to load project details for ${projectId}:`, err);
    } finally {
      setIsLoadingActiveProject(false);
    }
  };

  const clearActiveProject = () => {
    setActiveProjectId(null);
    setActiveProject(null);
  };

  const createProject = async (title: string, genre: string, logline: string, format: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, logline, format }),
      });
      if (res.ok) {
        const data = await res.json();
        await loadProjects();
        if (data.project_id) {
          await selectProject(data.project_id);
        }
        return data;
      }
    } catch (err) {
      console.warn("Failed to create project:", err);
    }
    return null;
  };

  const duplicateProject = async (projectId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
      if (res.ok) {
        await loadProjects();
        return true;
      }
    } catch (err) {
      console.warn("Failed to duplicate project:", err);
    }
    return false;
  };

  const archiveProject = async (projectId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        if (activeProjectId === projectId) {
          clearActiveProject();
        }
        await loadProjects();
        return true;
      }
    } catch (err) {
      console.warn("Failed to archive project:", err);
    }
    return false;
  };

  useEffect(() => {
    loadProjects();
  }, []);

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
        duplicateProject,
        archiveProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
