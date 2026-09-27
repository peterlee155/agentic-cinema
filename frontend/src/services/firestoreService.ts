import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { ProjectMetadata } from "../types/project";

export const getUserProjects = async (userId: string): Promise<ProjectMetadata[]> => {
  try {
    if (!db || !userId) return [];
    const q = query(
      collection(db, "users", userId, "projects"),
      orderBy("updatedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ProjectMetadata[];
  } catch (err) {
    console.warn("[firestoreService] getUserProjects notice:", err);
    return [];
  }
};

export const getProjectById = async (userId: string, projectId: string): Promise<Record<string, unknown> | null> => {
  try {
    if (!db || !userId || !projectId) return null;
    const ref = doc(db, "users", userId, "projects", projectId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (err) {
    console.warn("[firestoreService] getProjectById notice:", err);
    return null;
  }
};

export const createProjectDoc = async (
  userId: string,
  userMeta: { name?: string; email?: string },
  projectData: Record<string, unknown>
): Promise<Record<string, unknown> | null> => {
  try {
    if (!db || !userId) return null;
    const projId = `proj_${Date.now()}`;
    const ref = doc(db, "users", userId, "projects", projId);
    const payload = {
      id: projId,
      ...projectData,
      ownerId: userId,
      ownerName: userMeta?.name || "Director",
      ownerEmail: userMeta?.email || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sceneCount: (projectData.sceneCount as number) || 5,
      characterCount: (projectData.characterCount as number) || 4,
      status: "PRODUCTION_READY",
    };
    await setDoc(ref, payload);
    return payload;
  } catch (err) {
    console.warn("[firestoreService] createProjectDoc notice:", err);
    return null;
  }
};

export const updateProjectDoc = async (
  userId: string,
  projectId: string,
  updates: Record<string, unknown>
): Promise<void> => {
  try {
    if (!db || !userId || !projectId) return;
    const ref = doc(db, "users", userId, "projects", projectId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[firestoreService] updateProjectDoc notice:", err);
  }
};

export const deleteProjectDoc = async (userId: string, projectId: string): Promise<void> => {
  try {
    if (!db || !userId || !projectId) return;
    const ref = doc(db, "users", userId, "projects", projectId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn("[firestoreService] deleteProjectDoc notice:", err);
  }
};
