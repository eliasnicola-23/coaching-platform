export type UserRole = 'admin' | 'miembro' | 'invitado';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  initials: string;
  points: number;
  level: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  dateEarned: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  createdBy: string;
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  projectId: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  dueDate?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export type CaseStatus = 'abierto' | 'en_curso' | 'cerrado';
export type CasePriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface Case {
  id: string;
  cliente: string;
  descripcion: string;
  estado: CaseStatus;
  prioridad: CasePriority;
  responsable?: string;
  notasInternas: string;
  historial: CaseUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseUpdate {
  id: string;
  caseId: string;
  autor: string;
  accion: string;
  descripcion: string;
  timestamp: string;
}

export interface Message {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  projectId?: string;
  mentions?: string[];
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface Stats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  completionRate: number;
  totalProjects: number;
  totalCases: number;
  openCases: number;
  closedCases: number;
}
