import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '../types';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (projectId: string, status: TaskStatus) => Task[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    text: 'Diseñar interfaz de usuario',
    status: 'todo',
    projectId: '1',
    createdBy: 'admin',
    createdAt: '2024-10-15T10:00:00Z',
    priority: 'high',
    tags: ['diseño', 'frontend'],
  },
  {
    id: '2',
    text: 'Configurar base de datos',
    status: 'inprogress',
    projectId: '1',
    createdBy: 'admin',
    assignedTo: 'admin',
    createdAt: '2024-10-14T09:00:00Z',
    priority: 'urgent',
    tags: ['backend', 'database'],
  },
  {
    id: '3',
    text: 'Implementar autenticación',
    status: 'done',
    projectId: '1',
    createdBy: 'admin',
    assignedTo: 'admin',
    createdAt: '2024-10-13T08:00:00Z',
    priority: 'high',
    tags: ['backend', 'security'],
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      addTask: (taskData) =>
        set((state) => {
          const newTask: Task = {
            ...taskData,
            id: `task_${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return { tasks: [...state.tasks, newTask] };
        }),
      moveTask: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      getTasksByProject: (projectId) =>
        get().tasks.filter((task) => task.projectId === projectId),
      getTasksByStatus: (projectId, status) =>
        get().tasks.filter(
          (task) => task.projectId === projectId && task.status === status
        ),
    }),
    {
      name: 'task-storage',
    }
  )
);
