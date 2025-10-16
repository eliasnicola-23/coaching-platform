import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useProjectStore } from '../store/projectStore';
import { format } from 'date-fns';

export function ChatPanel({ onClose }: { onClose?: () => void }) {
  const [message, setMessage] = useState('');
  const { messages, addMessage } = useChatStore();
  const { currentUser } = useUserStore();
  const { currentProject } = useProjectStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const projectMessages = messages.filter((m) => m.projectId === currentProject?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [projectMessages]);

  const handleSendMessage = () => {
    if (!message.trim() || !currentUser || !currentProject) return;

    addMessage({
      author: currentUser.username,
      text: message,
      projectId: currentProject.id,
    });

    setMessage('');
  };

  const renderMessageText = (text: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) {
      return <span>{text}</span>;
    }

    const parts: Array<{ text: string; isMention: boolean }> = [];
    let lastIndex = 0;

    mentions.forEach((mention) => {
      const mentionText = `@${mention}`;
      const index = text.indexOf(mentionText, lastIndex);
      
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: text.substring(lastIndex, index), isMention: false });
        }
        parts.push({ text: mentionText, isMention: true });
        lastIndex = index + mentionText.length;
      }
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), isMention: false });
    }

    return (
      <>
        {parts.map((part, index) => (
          part.isMention ? (
            <span key={index} className="text-primary font-semibold">
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        ))}
      </>
    );
  };

  const renderMessage = (msg: typeof projectMessages[0]) => {
    const isOwn = msg.author === currentUser?.username;
    const time = format(new Date(msg.timestamp), 'HH:mm');

    return (
      <div
        key={msg.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          } rounded-2xl px-4 py-2 shadow-sm`}
        >
          {!isOwn && (
            <p className="text-xs font-semibold mb-1 opacity-70">{msg.author}</p>
          )}
          <p className="text-sm break-words">
            {renderMessageText(msg.text, msg.mentions)}
          </p>
          <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {time}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-card border border-border rounded-2xl shadow-lg">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Chat del Proyecto</h3>
          <p className="text-xs text-muted-foreground">
            {currentProject?.name || 'Sin proyecto'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {projectMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        ) : (
          <>
            {projectMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <button
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Adjuntar archivo (simulado)"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Escribe un mensaje... (usa @usuario para mencionar)"
            className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={500}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Consejo: Usa @ para mencionar usuarios
        </p>
      </div>
    </div>
  );
}
