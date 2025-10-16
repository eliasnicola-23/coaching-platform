import { Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useTaskStore } from '../store/taskStore';

export function RankingsPage() {
  const { users, currentUser } = useUserStore();
  const { tasks } = useTaskStore();

  const userStats = users.map((user) => {
    const userTasks = tasks.filter((t) => t.createdBy === user.username);
    const completedTasks = userTasks.filter((t) => t.status === 'done').length;
    const score = user.points + (completedTasks * 20);

    return {
      ...user,
      completedTasks,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getRankGradient = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600';
      case 1:
        return 'from-gray-300 to-gray-500';
      case 2:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
          Rankings y Logros
        </h2>
        <p className="text-muted-foreground">
          Clasificación de usuarios por rendimiento y puntos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg">
          <Trophy className="h-12 w-12 mb-4" />
          <p className="text-2xl font-bold">{currentUser?.points || 0}</p>
          <p className="text-sm opacity-90">Tus Puntos Totales</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg">
          <TrendingUp className="h-12 w-12 mb-4" />
          <p className="text-2xl font-bold">Nivel {currentUser?.level || 1}</p>
          <p className="text-sm opacity-90">Nivel Actual</p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg">
          <Star className="h-12 w-12 mb-4" />
          <p className="text-2xl font-bold">{currentUser?.achievements.length || 0}</p>
          <p className="text-sm opacity-90">Logros Desbloqueados</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tabla de Clasificación</h3>
        {userStats.map((user, index) => {
          const isCurrentUser = user.username === currentUser?.username;
          return (
            <div
              key={user.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCurrentUser
                  ? 'bg-primary/10 border-primary shadow-md'
                  : 'bg-card border-border shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getRankGradient(index)} flex items-center justify-center text-white font-bold shadow-md`}>
                  {index + 1}
                </div>

                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {user.initials}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{user.username}</h4>
                    {index < 3 && getRankIcon(index)}
                    {isCurrentUser && (
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-lg">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold">{user.score}</p>
                      <p className="text-xs text-muted-foreground">Puntos</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-muted rounded-xl">
                      <p className="text-lg font-semibold">{user.level}</p>
                      <p className="text-xs text-muted-foreground">Nivel</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-xl">
                      <p className="text-lg font-semibold">{user.completedTasks}</p>
                      <p className="text-xs">Tareas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tus Logros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentUser?.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h4 className="font-semibold mb-1">{achievement.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {achievement.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Desbloqueado: {achievement.dateEarned}
              </p>
            </div>
          ))}
          {(!currentUser?.achievements || currentUser.achievements.length === 0) && (
            <div className="p-6 rounded-2xl bg-card border-2 border-dashed border-border text-center col-span-full">
              <p className="text-muted-foreground">
                Aún no has desbloqueado logros. ¡Sigue trabajando!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
