import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Case, CaseStatus, CaseUpdate } from '../types';

interface CaseState {
  cases: Case[];
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'historial'>) => void;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  addCaseUpdate: (caseId: string, update: Omit<CaseUpdate, 'id' | 'caseId' | 'timestamp'>) => void;
  deleteCase: (caseId: string) => void;
  getCasesByStatus: (status: CaseStatus) => Case[];
}

const mockCases: Case[] = [
  {
    id: '1',
    cliente: 'Empresa ABC',
    descripcion: 'Problema con el sistema de facturación',
    estado: 'abierto',
    prioridad: 'alta',
    responsable: 'admin',
    notasInternas: 'Cliente reporta errores en cálculos',
    historial: [
      {
        id: '1',
        caseId: '1',
        autor: 'admin',
        accion: 'Creación',
        descripcion: 'Caso creado por contacto telefónico',
        timestamp: '2024-10-15T10:00:00Z',
      },
    ],
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-10-15T10:00:00Z',
  },
  {
    id: '2',
    cliente: 'Cliente XYZ',
    descripcion: 'Solicitud de nueva funcionalidad',
    estado: 'en_curso',
    prioridad: 'media',
    responsable: 'admin',
    notasInternas: 'En análisis de viabilidad',
    historial: [
      {
        id: '2',
        caseId: '2',
        autor: 'admin',
        accion: 'Creación',
        descripcion: 'Caso creado desde formulario web',
        timestamp: '2024-10-14T09:00:00Z',
      },
      {
        id: '3',
        caseId: '2',
        autor: 'admin',
        accion: 'Actualización',
        descripcion: 'Cambio de estado a en curso',
        timestamp: '2024-10-15T11:00:00Z',
      },
    ],
    createdAt: '2024-10-14T09:00:00Z',
    updatedAt: '2024-10-15T11:00:00Z',
  },
];

export const useCaseStore = create<CaseState>()(
  persist(
    (set, get) => ({
      cases: mockCases,
      addCase: (caseData) =>
        set((state) => {
          const now = new Date().toISOString();
          const newCase: Case = {
            ...caseData,
            id: `case_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
            historial: [
              {
                id: `update_${Date.now()}`,
                caseId: '',
                autor: caseData.responsable || 'system',
                accion: 'Creación',
                descripcion: 'Caso creado',
                timestamp: now,
              },
            ],
          };
          return { cases: [...state.cases, newCase] };
        }),
      updateCase: (caseId, updates) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, ...updates, updatedAt: new Date().toISOString() }
              : c
          ),
        })),
      addCaseUpdate: (caseId, updateData) =>
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id === caseId) {
              const newUpdate: CaseUpdate = {
                ...updateData,
                id: `update_${Date.now()}`,
                caseId,
                timestamp: new Date().toISOString(),
              };
              return {
                ...c,
                historial: [...c.historial, newUpdate],
                updatedAt: new Date().toISOString(),
              };
            }
            return c;
          }),
        })),
      deleteCase: (caseId) =>
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== caseId),
        })),
      getCasesByStatus: (status) =>
        get().cases.filter((c) => c.estado === status),
    }),
    {
      name: 'case-storage',
    }
  )
);
