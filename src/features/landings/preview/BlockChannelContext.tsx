"use client";

import * as React from "react";

type BlockEventHandler = (payload?: any) => void;

type BlockChannel = {
  emit: (event: string, payload?: any) => void;
  on: (event: string, handler: BlockEventHandler) => () => void; // 👈 retourne off()
};

const BlockChannelContext = React.createContext<BlockChannel | null>(null);

export const useBlockChannel = (): BlockChannel => {
  const ctx = React.useContext(BlockChannelContext);
  if (!ctx) {
    throw new Error("useBlockChannel must be used inside <BlockChannelProvider />");
  }
  return ctx;
};

export function BlockChannelProvider({ children }: { children: React.ReactNode }) {
  const handlersRef = React.useRef<Record<string, BlockEventHandler[]>>({});

  const emit = React.useCallback((event: string, payload?: any) => {
    const handlers = handlersRef.current[event];
    if (!handlers || handlers.length === 0) return;
    handlers.forEach((handler) => handler(payload));
  }, []);

  const on = React.useCallback((event: string, handler: BlockEventHandler) => {
    if (!handlersRef.current[event]) {
      handlersRef.current[event] = [];
    }
    handlersRef.current[event].push(handler);

    // retourne une fonction pour se désabonner
    return () => {
      handlersRef.current[event] = handlersRef.current[event].filter(
        (h) => h !== handler,
      );
    };
  }, []);

  const value = React.useMemo(
    () => ({
      emit,
      on,
    }),
    [emit, on],
  );

  return (
    <BlockChannelContext.Provider value={value}>
      {children}
    </BlockChannelContext.Provider>
  );
}
