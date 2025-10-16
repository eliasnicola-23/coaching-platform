import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useCaseStore } from '../store/caseStore';
import { useUserStore } from '../store/userStore';
import type { CaseStatus, CasePriority } from '../types';

export function CasesPage() {
  const { cases, addCase, updateCase } = useCaseStore();
  const { currentUser } = useUserStore();
  const [filter, setFilter] = useState<CaseStatus | 'all'>('all');
  const [showNewCase, setShowNewCase] = useState(false);
  const [newCase, setNewCase] = useState({
    cliente: '',
    descripcion: '',
    prioridad: 'media' as CasePriority,
  });

  const filteredCases = filter === 'all' ? cases : cases.filter((c) => c.estado === filter);

  const handleAddCase = () => {
    if (!newCase.cliente.trim() || !newCase.descripcion.trim() || !currentUser) return;

    addCase({
      cliente: newCase.cliente,
      descripcion: newCase.descripcion,
      estado: 'abierto',
      prioridad: newCase.prioridad,
      responsable: currentUser.username,
      notasInternas: '',
    });

    setNewCase({ cliente: '', descripcion: '', prioridad: 'media' });
    setShowNewCase(false);
  };

  const statusColors = {
    abierto: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    en_curso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    cerrado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  };

  const priorityColors = {
    baja: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    urgente: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-purple-600 mb-2">
            Gestión de Casos
          </h2>
          <p className="text-muted-foreground">
            Sistema de atención al cliente y soporte
          </p>
        </div>
        <button
          onClick={() => setShowNewCase(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Caso
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar casos por cliente o descripción..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'abierto', 'en_curso', 'cerrado'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCases.map((caso) => (
          <div
            key={caso.id}
            className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{caso.cliente}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {caso.descripcion}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[caso.estado]}`}>
                {caso.estado.charAt(0).toUpperCase() + caso.estado.slice(1).replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityColors[caso.prioridad]}`}>
                {caso.prioridad.charAt(0).toUpperCase() + caso.prioridad.slice(1)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Responsable: <span className="font-medium text-foreground">{caso.responsable}</span>
              </span>
            </div>

            {caso.estado !== 'cerrado' && (
              <div className="mt-4 flex gap-2">
                {caso.estado === 'abierto' && (
                  <button
                    onClick={() => updateCase(caso.id, { estado: 'en_curso' })}
                    className="flex-1 px-3 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Iniciar
                  </button>
                )}
                {caso.estado === 'en_curso' && (
                  <button
                    onClick={() => updateCase(caso.id, { estado: 'cerrado' })}
                    className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showNewCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Nuevo Caso</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <input
                  type="text"
                  value={newCase.cliente}
                  onChange={(e) => setNewCase({ ...newCase, cliente: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nombre del cliente..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={newCase.descripcion}
                  onChange={(e) => setNewCase({ ...newCase, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={4}
                  placeholder="Describe el caso..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prioridad</label>
                <select
                  value={newCase.prioridad}
                  onChange={(e) => setNewCase({ ...newCase, prioridad: e.target.value as CasePriority })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddCase}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Crear Caso
                </button>
                <button
                  onClick={() => setShowNewCase(false)}
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
