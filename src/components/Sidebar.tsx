import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Briefcase,
  Users,
  Settings,
  Trophy,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useUserStore } from '../store/userStore';
import { useProjectStore } from '../store/projectStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tareas', href: '/tasks', icon: KanbanSquare },
  { name: 'Casos', href: '/cases', icon: Briefcase },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Rankings', href: '/rankings', icon: Trophy },
  { name: 'Usuarios', href: '/users', icon: Users },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useUserStore();
  const { currentProject } = useProjectStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-3xl font-extrabold gradient-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          CoachingPlatform
        </h1>
      </div>

      {currentUser && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {currentUser.initials}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{currentUser.username}</p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Nivel {currentUser.level}</span>
            <span className="font-semibold">{currentUser.points} pts</span>
          </div>
        </div>
      )}

      {currentProject && (
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">Proyecto Actual</p>
          <div
            className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            style={{ borderLeftColor: currentProject.color, borderLeftWidth: '4px' }}
          >
            <p className="font-semibold text-sm">{currentProject.name}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="w-full px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
