'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  isChatOpen: false,
  setChatOpen: () => {},
  toggleChat: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const setChatOpen = useCallback((open: boolean) => {
    setIsChatOpen(open);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  return (
    <ChatContext.Provider value={{ isChatOpen, setChatOpen, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
