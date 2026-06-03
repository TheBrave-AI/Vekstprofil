"use client";

import { updateQuestion } from "@/app/actions";
import { useState, useTransition } from "react";

interface QuestionRow {
  q_id:     number;
  category: string;
  label:    string;
  type:     string;
}

export function QuestionsClient({ initial }: { initial: QuestionRow[] }) {
  const [questions, setQuestions]    = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleCategoryChange(q_id: number, category: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.q_id === q_id ? { ...q, category } : q))
    );
    startTransition(() => updateQuestion(q_id, { category: category || undefined }));
  }

  return (
    <div className="rounded-card bg-midnight shadow-card overflow-hidden">
      {isPending && (
        <div className="px-5 py-2 bg-accent/10 text-xs text-accent">Lagrer…</div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wider">
            <th className="px-5 py-3">ID</th>
            <th className="px-5 py-3">Kategori</th>
            <th className="px-5 py-3">Spørsmål</th>
            <th className="px-5 py-3">Type</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.q_id} className="border-b border-line last:border-0">
              <td className="px-5 py-3 text-muted font-mono text-xs">{q.q_id}</td>
              <td className="px-5 py-3">
                <input
                  defaultValue={q.category}
                  onBlur={(e) => handleCategoryChange(q.q_id, e.target.value)}
                  className="w-full rounded-lg border border-line bg-navy px-2 py-1 text-xs text-cloud focus:border-accent focus:outline-none"
                />
              </td>
              <td className="px-5 py-3 text-cloud max-w-xs truncate">{q.label}</td>
              <td className="px-5 py-3">
                <span className="font-mono text-xs text-mist">{q.type}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
