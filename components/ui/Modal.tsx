"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  maxWidth?: "sm" | "xl";
  showClose?: boolean;
  children: ReactNode;
}

export function Modal({ onClose, maxWidth = "xl", showClose = true, children }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth === "sm" ? "max-w-sm" : "max-w-xl"}`}
        onClick={e => e.stopPropagation()}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-midnight border border-line text-muted hover:text-cloud transition-colors"
            aria-label="Lukk"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
