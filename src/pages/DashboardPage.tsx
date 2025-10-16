import { BarChart3, CheckCircle2, Clock, Users } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useCaseStore } from '../store/caseStore';
import { useProjectStore } from '../store/projectStore';

export function DashboardPage() {
  const { tasks } = useTaskStore();
  const { cases } = useCaseStore();
  const { currentProject } = useProjectStore();

  const projectTasks = tasks.filter((t) => t.projectId === currentProject?.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const activeTasks = projectTasks.filter((t) => t.status !== 'done').length;
  const openCases = cases.filter((c) => c.estado !== 'cerrado').length;

  const stats = [
    {
      name: 'Tareas Completadas',
      value: completedTasks,
      icon: CheckCircle2,
      gradient: 'from-green-400 to-emerald-600',
    },
    {
      name: 'Tareas Activas',
      value: activeTasks,
      icon: Clock,
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      name: 'Casos Abiertos',
      value: openCases,
      icon: BarChart3,
      gradient: 'from-purple-400 to-purple-600',
    },
    {
      name: 'Proyectos',
      value: 1,
      icon: Users,
      gradient: 'from-yellow-400 to-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
          Dashboard
        </h2>
        <p className="text-muted-foreground">
          Resumen de tu actividad y rendimiento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
          <h3 className="text-xl font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Tarea completada</p>
                <p className="text-xs text-muted-foreground">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo caso creado</p>
                <p className="text-xs text-muted-foreground">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
          <h3 className="text-xl font-semibold mb-4">Progreso Semanal</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Tareas</span>
                <span className="font-semibold">{completedTasks}/{projectTasks.length}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all"
                  style={{
                    width: `${projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
