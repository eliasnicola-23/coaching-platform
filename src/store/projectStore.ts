import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  setCurrentProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Desarrollo Web',
    description: 'Proyecto principal de desarrollo',
    color: '#667eea',
    createdAt: '2024-10-01',
    createdBy: 'admin',
  },
  {
    id: '2',
    name: 'Marketing',
    description: 'Campaña de marketing digital',
    color: '#48cae4',
    createdAt: '2024-10-05',
    createdBy: 'admin',
  },
];

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: mockProjects,
      currentProject: mockProjects[0],
      addProject: (projectData) =>
        set((state) => {
          const newProject: Project = {
            ...projectData,
            id: `proj_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return {
            projects: [...state.projects, newProject],
            currentProject: newProject,
          };
        }),
      setCurrentProject: (projectId) =>
        set((state) => ({
          currentProject:
            state.projects.find((p) => p.id === projectId) || null,
        })),
      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId
              ? state.projects[0] || null
              : state.currentProject,
        })),
    }),
    {
      name: 'project-storage',
    }
  )
);
