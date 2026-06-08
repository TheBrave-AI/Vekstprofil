"use client";

import { useState, useEffect } from "react";
import { NewQuestionForm } from "@/components/admin/NewQuestionForm";

interface QuestionRow { id: string; label: string; category: string | null; }

interface Props {
  available: QuestionRow[];
  onAdd: (q: QuestionRow) => void;
}

export function AddQuestionsPanel({ available, onAdd }: Props) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setShowModal(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl text-cloud">Legg til spørsmål</h2>

      <div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent/70 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Lag nytt spørsmål
        </button>
      </div>

      {available.length > 0 && (
        <div className="rounded-card bg-midnight shadow-card overflow-hidden relative z-0">
          {available.map((q) => (
            <div key={q.id} className="flex items-center justify-between px-5 py-3 border-b border-line last:border-0">
              <div>
                {q.category && <p className="text-xs text-accent uppercase tracking-widest">{q.category}</p>}
                <p className="text-sm text-cloud">{q.label}</p>
              </div>
              <button type="button" onClick={() => onAdd(q)} className="text-accent hover:underline text-xs font-medium">
                + Legg til
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-midnight border border-line text-muted hover:text-cloud transition-colors"
              aria-label="Lukk"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <NewQuestionForm
              onCreated={(q) => {
                onAdd(q);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
