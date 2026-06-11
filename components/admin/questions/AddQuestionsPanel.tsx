"use client";

import { useState } from "react";
import { NewQuestionForm } from "@/components/admin/questions/NewQuestionForm";
import { Modal } from "@/components/ui/Modal";

interface QuestionRow { id: string; label: string; category: string | null; }

interface Props {
  available: QuestionRow[];
  onAdd: (q: QuestionRow) => void;
}

export function AddQuestionsPanel({ available, onAdd }: Props) {
  const [showModal, setShowModal] = useState(false);

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
        <Modal onClose={() => setShowModal(false)}>
          <NewQuestionForm
            onCreated={(q) => {
              onAdd(q);
              setShowModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
