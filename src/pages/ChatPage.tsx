import { ChatPanel } from '../components/ChatPanel';

export function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold gradient-text bg-gradient-to-r from-green-400 to-green-600 mb-2">
          Chat del Equipo
        </h2>
        <p className="text-muted-foreground">
          Comunícate con tu equipo en tiempo real
        </p>
      </div>

      <div className="max-w-4xl">
        <ChatPanel />
      </div>
    </div>
  );
}
