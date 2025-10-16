import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteMessage: (messageId: string) => void;
  getMessagesByProject: (projectId: string) => Message[];
}

const mockMessages: Message[] = [
  {
    id: '1',
    author: 'admin',
    text: 'Bienvenidos al chat del proyecto!',
    timestamp: '2024-10-15T10:00:00Z',
    projectId: '1',
  },
  {
    id: '2',
    author: 'admin',
    text: 'Pueden usar @usuario para mencionar a alguien',
    timestamp: '2024-10-15T10:05:00Z',
    projectId: '1',
    mentions: ['usuario'],
  },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: mockMessages,
      addMessage: (messageData) =>
        set((state) => {
          const mentions = extractMentions(messageData.text);
          const newMessage: Message = {
            ...messageData,
            id: `msg_${Date.now()}`,
            timestamp: new Date().toISOString(),
            mentions,
          };
          return { messages: [...state.messages, newMessage] };
        }),
      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        })),
      getMessagesByProject: (projectId) =>
        get().messages.filter((m) => m.projectId === projectId),
    }),
    {
      name: 'chat-storage',
    }
  )
);

function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}
