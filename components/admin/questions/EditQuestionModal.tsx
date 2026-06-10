"use client";

import { useEffect } from "react";
import { EditQuestionForm } from "./EditQuestionForm";

export interface EditableQuestion {
  id: string;
  label: string;
  category: string | null;
  type: string;
  help: string | null;
  placeholder: string | null;
  prefix: string | null;
  suffix: string | null;
  options: unknown;
}

export function EditQuestionModal({ question, onClose }: { question: EditableQuestion | null; onClose: () => void }) {
  useEffect(() => {
    if (!question) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, onClose]);

  if (!question) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
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
        
        <EditQuestionForm question={question} onSaved={onClose} onClose={onClose} />
      </div>
    </div>
  );
}
