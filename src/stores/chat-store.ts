import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatStore {
  messages: ChatMessage[];
  isThinking: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setThinking: (thinking: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isThinking: false,
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  setThinking: (thinking) => set({ isThinking: thinking }),
  clearMessages: () => set({ messages: [] }),
}));
