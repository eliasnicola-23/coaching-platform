import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface UserState {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  logout: () => void;
  addPoints: (points: number) => void;
}

const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  initials: 'AD',
  points: 150,
  level: 2,
  achievements: [
    {
      id: '1',
      name: 'Primera Tarea',
      icon: '🎯',
      description: 'Completaste tu primera tarea',
      dateEarned: '2024-10-15',
    },
  ],
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: mockUser,
      users: [mockUser],
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      addPoints: (points) =>
        set((state) => {
          if (!state.currentUser) return state;
          const newPoints = state.currentUser.points + points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          return {
            currentUser: {
              ...state.currentUser,
              points: newPoints,
              level: newLevel,
            },
          };
        }),
    }),
    {
      name: 'user-storage',
    }
  )
);
