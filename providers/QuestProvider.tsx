'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuests } from '@/hooks/useQuests';

interface QuestContextType {
  trackAction: (action: string, metadata?: any) => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

interface QuestProviderProps {
  children: ReactNode;
}

export function QuestProvider({ children }: QuestProviderProps) {
  const { trackAction } = useQuests();

  return (
    <QuestContext.Provider value={{ trackAction }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuestTracking() {
  const context = useContext(QuestContext);
  if (!context) {
    // Return a no-op function if not within provider
    return { trackAction: () => {} };
  }
  return context;
}