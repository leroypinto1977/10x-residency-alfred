"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

interface BookCallModalContextValue {
  isOpen: boolean;
  openModal: (triggerEl?: HTMLElement | null) => void;
  closeModal: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const BookCallModalContext = createContext<BookCallModalContextValue | null>(null);

export function BookCallModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openModal = useCallback((triggerEl?: HTMLElement | null) => {
    triggerRef.current = triggerEl ?? (document.activeElement as HTMLElement | null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <BookCallModalContext.Provider value={{ isOpen, openModal, closeModal, triggerRef }}>
      {children}
    </BookCallModalContext.Provider>
  );
}

export function useBookCallModal() {
  const ctx = useContext(BookCallModalContext);
  if (!ctx) {
    throw new Error("useBookCallModal must be used within a BookCallModalProvider");
  }
  return ctx;
}
