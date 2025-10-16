import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useUserStore } from '../store/userStore';
import type { TaskStatus } from '../types';

export function TasksPage() {
  const { tasks, addTask, moveTask } = useTaskStore();
  const { currentProject } = useProjectStore();
  const { currentUser } = useUserStore();
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewTask, setShowNewTask] = useState<TaskStatus | null>(null);

  const projectTasks = tasks.filter((t) => t.projectId === currentProject?.id);
  const todoTasks = projectTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'inprogress');
  const doneTasks = projectTasks.filter((t) => t.status === 'done');

  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskText.trim() || !currentProject || !currentUser) return;

    addTask({
      text: newTaskText,
      status,
      projectId: currentProject.id,
      createdBy: currentUser.username,
    });

    setNewTaskText('');
    setShowNewTask(null);
  };

  const columns = [
    { id: 'todo' as TaskStatus, title: 'Por Hacer', tasks: todoTasks, color: 'from-red-400 to-red-600' },
    { id: 'inprogress' as TaskStatus, title: 'En Curso', tasks: inProgressTasks, color: 'from-yellow-400 to-yellow-600' },
    { id: 'done' as TaskStatus, title: 'Finalizado', tasks: doneTasks, color: 'from-green-400 to-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2">
            Tablero Kanban
          </h2>
          <p className="text-muted-foreground">
            {currentProject?.name || 'Selecciona un proyecto'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className={`p-4 rounded-t-2xl bg-gradient-to-r ${column.color} text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <span className="px-2 py-1 bg-white/20 rounded-lg text-sm">
                  {column.tasks.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-4 bg-card border border-t-0 border-border rounded-b-2xl space-y-3 min-h-[400px]">
              {column.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <p className="font-medium mb-2">{task.text}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.createdBy}</span>
                    {task.priority && (
                      <span className="px-2 py-1 bg-muted rounded">
                        {task.priority}
                      </span>
                    )}
                  </div>

                  {column.id !== 'done' && (
                    <button
                      onClick={() => {
                        const nextStatus: TaskStatus = column.id === 'todo' ? 'inprogress' : 'done';
                        moveTask(task.id, nextStatus);
                      }}
                      className="mt-3 w-full px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Mover a {column.id === 'todo' ? 'En Curso' : 'Finalizado'}
                    </button>
                  )}
                </div>
              ))}

              {showNewTask === column.id ? (
                <div className="p-4 rounded-xl bg-background border-2 border-dashed border-primary">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Nombre de la tarea..."
                    className="w-full px-3 py-2 mb-2 bg-transparent border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask(column.id);
                      if (e.key === 'Escape') setShowNewTask(null);
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="flex-1 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setShowNewTask(null)}
                      className="flex-1 px-3 py-1 text-xs bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewTask(column.id)}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Nueva Tarea</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
