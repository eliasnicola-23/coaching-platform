# TaskMaster Platform

## Overview

TaskMaster is a modern enterprise platform built with React + TypeScript + TailwindCSS + shadcn/ui, focused on internal organization, task management, cases/CRM, and team performance tracking. The platform follows Clean Architecture and SOLID principles, featuring a modular structure with persistent dark/light theme, Kanban board, case management system, dashboard with metrics, and gamification features.

**Last Updated:** October 16, 2025  
**Technology Stack:** React 19, TypeScript, TailwindCSS, Zustand, React Router, Vite  
**Development Server:** Run with `npm run dev -- --host 0.0.0.0 --port 5000`

## Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS with custom design tokens and dark mode support
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router v6 for client-side navigation
- **Icons**: Lucide React for consistent iconography
- **UI Components**: Custom components following shadcn/ui patterns

### Directory Structure

```
src/
├── components/       # Shared UI components (Sidebar, Header, ThemeToggle, AppLayout)
├── features/        # Feature-specific modules (planned for future expansion)
├── hooks/           # Custom React hooks (planned)
├── lib/             # Utilities and helpers (cn function for class merging)
├── pages/           # Page components (Dashboard, Tasks, Cases, Users, Rankings, Settings)
├── store/           # Zustand stores (theme, user, project, task, case)
├── styles/          # Global styles and Tailwind configuration
├── types/           # TypeScript type definitions
├── utils/           # Helper functions (planned)
└── App.tsx          # Main application component with routing
```

### State Management

The application uses Zustand for global state management with the following stores:

1. **themeStore** - Dark/light theme with localStorage persistence
2. **userStore** - Current user, authentication, points, and achievements
3. **projectStore** - Project management and current project selection
4. **taskStore** - Task CRUD operations and Kanban board state
5. **caseStore** - Case/CRM management with status tracking

### Design System

- **Theme**: Dark mode by default, toggleable light mode
- **Colors**: CSS custom properties for theme-aware colors
- **Typography**: Inter font family with consistent sizing
- **Gradients**: Modern gradient styling (yellow-400 to yellow-600, blue-500 to indigo-600, etc.)
- **Borders**: Rounded corners (rounded-2xl) for cards and containers
- **Shadows**: Subtle elevation with shadow-md and shadow-lg
- **Spacing**: Consistent padding (p-4, p-6) and gaps

## Features

### Implemented Features

1. **Dark/Light Theme System**
   - Persistent theme selection using localStorage
   - Zustand store for global theme management
   - CSS custom properties for theme-aware styling
   - Theme toggle button in header

2. **Dashboard**
   - Statistics cards with gradients
   - Completed tasks, active tasks, open cases metrics
   - Recent activity feed
   - Progress indicators

3. **Kanban Board (Tasks)**
   - Three-column layout (Por Hacer, En Curso, Finalizado)
   - Task creation with inline forms
   - Task movement between columns
   - Task filtering and search (planned)
   - Priority indicators and tags

4. **Cases/CRM Module**
   - Complete CRUD operations
   - Case status (abierto, en_curso, cerrado)
   - Priority levels (baja, media, alta, urgente)
   - Filtering by status
   - Case history tracking (historial)
   - Responsible assignment

5. **Layout & Navigation**
   - Fixed sidebar with project and user information
   - Top header with search and notifications
   - Responsive design
   - React Router navigation

6. **User Management**
   - User profiles with roles (admin, miembro, invitado)
   - Points and leveling system
   - Achievements tracking
   - User initials avatars with gradient backgrounds

7. **Project Management**
   - Multiple project support
   - Project selection and switching
   - Project-specific tasks and data

### Planned Features

- Enhanced chat module with @mentions
- File attachments for messages and cases
- Advanced analytics and charts with Recharts
- User rankings and leaderboards
- Settings panel for customization
- Real-time collaboration features
- Backend API integration (future phase)

## Data Model

### Core Entities

- **User**: id, username, email, role, points, level, achievements
- **Project**: id, name, description, color, createdBy, createdAt
- **Task**: id, text, status, projectId, createdBy, assignedTo, priority, tags, dueDate
- **Case**: id, cliente, descripcion, estado, prioridad, responsable, notasInternas, historial
- **Message**: id, author, text, timestamp, projectId, mentions, attachments

All entities are currently stored in Zustand stores with localStorage persistence. Future phases will integrate a backend API (Supabase or custom REST API).

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow SOLID principles and Single Responsibility Principle
- Use type-only imports for TypeScript types (`import type { }`)
- Use meaningful component and variable names
- Keep components focused and modular

### Component Structure
- Place shared components in `src/components/`
- Place page components in `src/pages/`
- Use feature folders for complex modules (planned)
- Export components using named exports

### State Management
- Use Zustand stores for global state
- Persist important data to localStorage
- Keep store logic simple and focused
- Use selectors for derived state (when needed)

### Styling
- Use Tailwind utility classes
- Follow the design system color palette
- Use the `cn()` utility for conditional classes
- Maintain consistent spacing and sizing

## Running the Application

### Development

**IMPORTANT**: The workflow configuration in `.replit` still points to the old Flask app. You need to update it manually:

1. Open the `.replit` file
2. Find the `[[workflows.workflow.tasks]]` section for "Start application"
3. Change this line:
   ```
   args = "gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app"
   ```
   To:
   ```
   args = "npm run dev -- --host 0.0.0.0 --port 5000"
   ```

Alternatively, run manually:
```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5000
```

The application will run on `http://localhost:5000` (or port 5000 on Replit).

### Building for Production
```bash
npm run build
npm run preview
```

## User Preferences

- **Language**: Spanish (ES) for UI text
- **Design**: Modern, minimalist with gradients and rounded corners
- **Theme**: Dark mode by default
- **Visual Feedback**: Smooth transitions and hover states
- **Clean Code**: No unnecessary comments, self-documenting code

## Recent Updates (October 16, 2025)

### Completed Features
- ✅ Full React + TypeScript migration complete
- ✅ Persistent dark/light theme with Zustand + localStorage
- ✅ Kanban board with drag & drop using @dnd-kit
- ✅ Cases/CRM module with complete CRUD operations
- ✅ Secure chat module with @mention support (XSS vulnerability fixed)
- ✅ Gamification system with rankings, points, and achievements
- ✅ Modern gradients and visual polish throughout the UI

### Technical Details
- No dependencies on Flask or Python backend
- All state managed via Zustand with localStorage persistence
- Secure message rendering (no XSS vulnerabilities)
- Clean Architecture and SOLID principles followed
- Type-safe TypeScript throughout

### Next Steps
1. Update `.replit` workflow configuration (see Running the Application section)
2. Test all features in the browser
3. Optional: Add backend API integration (future phase)
4. Optional: Deploy to production when ready
