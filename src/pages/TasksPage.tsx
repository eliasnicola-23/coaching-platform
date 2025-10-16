import { useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { useUserStore } from '../store/userStore';
import type { Task, TaskStatus } from '../types';

function DraggableTask({ task, columnId }: { task: Task; columnId: TaskStatus }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, columnId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div {...listeners} {...attributes} className="mt-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-medium mb-2">{task.text}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{task.createdBy}</span>
            {task.priority && (
              <span className="px-2 py-1 bg-muted rounded">{task.priority}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({
  id,
  title,
  color,
  tasks,
  onAddClick,
}: {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onAddClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { columnId: id },
  });

  return (
    <div className="flex flex-col">
      <div className={`p-4 rounded-t-2xl bg-gradient-to-r ${color} text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <span className="px-2 py-1 bg-white/20 rounded-lg text-sm">{tasks.length}</span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-4 bg-card border border-t-0 border-border rounded-b-2xl space-y-3 min-h-[400px] transition-colors ${
          isOver ? 'bg-primary/5 border-primary' : ''
        }`}
      >
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} columnId={id} />
        ))}

        <button
          onClick={onAddClick}
          className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Nueva Tarea</span>
        </button>
      </div>
    </div>
  );
}

export function TasksPage() {
  const { tasks, addTask, moveTask } = useTaskStore();
  const { currentProject } = useProjectStore();
  const { currentUser } = useUserStore();
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewTask, setShowNewTask] = useState<TaskStatus | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetColumn = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetColumn) {
      moveTask(taskId, targetColumn);
    }
  };

  const columns = [
    {
      id: 'todo' as TaskStatus,
      title: 'Por Hacer',
      tasks: todoTasks,
      color: 'from-red-400 to-red-600',
    },
    {
      id: 'inprogress' as TaskStatus,
      title: 'En Curso',
      tasks: inProgressTasks,
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      id: 'done' as TaskStatus,
      title: 'Finalizado',
      tasks: doneTasks,
      color: 'from-green-400 to-emerald-600',
    },
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={column.tasks}
              onAddClick={() => setShowNewTask(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-4 rounded-xl bg-card border-2 border-primary shadow-xl cursor-grabbing opacity-90">
              <p className="font-medium">{activeTask.text}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Nueva Tarea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe la tarea..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && showNewTask) handleAddTask(showNewTask);
                    if (e.key === 'Escape') setShowNewTask(null);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => showNewTask && handleAddTask(showNewTask)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Crear Tarea
                </button>
                <button
                  onClick={() => setShowNewTask(null)}
                  className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
