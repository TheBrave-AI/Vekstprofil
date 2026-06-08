"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditQuestionForm } from "./EditQuestionForm";
import { NewQuestionForm } from "./NewQuestionForm";
import EmptyState from "@/components/admin/EmptyState";
import { deleteQuestion } from "@/app/actions";

interface Question {
  id:          string;
  label:       string;
  type:        string;
  category:    string | null;
  help:        string | null;
  placeholder: string | null;
  prefix:      string | null;
  suffix:      string | null;
  options:     unknown;
}

export function QuestionsClient({ questions }: { questions: Question[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState<Question | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      await deleteQuestion(deleting.id);
      setDeleting(null);
      router.refresh();
    });
  }

  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setEditing(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  useEffect(() => {
    if (!deleting) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setDeleting(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting]);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl text-cloud">Spørsmålskatalog</h1>
          <p className="text-[12.5px] text-muted mt-0.5">
            Alle spørsmål deles på tvers av maler og undersøkelser. Endringer gjelder retroaktivt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-onbrand hover:bg-brand-deep transition"
        >
          + Nytt spørsmål
        </button>
      </div>

      {questions.length === 0 ? (
        <EmptyState>
          Ingen spørsmål ennå.{" "}
          <Link href="/admin/questions/new" className="text-accent hover:underline">
            Opprett det første
          </Link>{" "}
          eller kjør{" "}
          <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">npx prisma db seed</code>.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Kategori</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Spørsmål</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-line last:border-0 hover:bg-black/[0.03] transition-colors">
                  <td className="px-5 py-3 text-[11.5px] font-medium uppercase tracking-widest text-accent whitespace-nowrap">
                    {q.category ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-[13.5px] text-cloud max-w-sm">
                    {q.label}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-mist whitespace-nowrap">{q.type}</td>
                  <td className="px-3 py-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleting(q)}
                      className="text-muted hover:text-coral transition"
                      aria-label="Slett spørsmål"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(q)}
                      className="text-muted hover:text-cloud transition"
                      aria-label="Rediger spørsmål"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.2 1.2C11.52 0.88 12.08 0.88 12.4 1.2L12.8 1.6C13.12 1.92 13.12 2.48 12.8 2.8L4.8 10.8C4.48 11.12 3.92 11.12 3.6 10.8L3.2 10.4C2.88 10.08 2.88 9.52 3.2 9.2L11.2 1.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.8 2.8L11.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCreating(false)}
        >
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-midnight border border-line text-muted hover:text-cloud transition-colors"
              aria-label="Lukk"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <NewQuestionForm
              onCreated={() => {
                setCreating(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}

      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleting(null)}
        >
          <div
            className="w-full max-w-sm rounded-card bg-midnight p-7 shadow-card space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-widest uppercase text-coral">Slett spørsmål</p>
              <h2 className="font-display text-lg text-cloud">Er du sikker?</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              <span className="text-cloud">"{deleting.label}"</span> vil bli permanent slettet — inkludert alle svar knyttet til spørsmålet.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="rounded-xl bg-coral/90 px-5 py-2.5 text-sm font-medium text-white hover:bg-coral disabled:opacity-50 transition"
              >
                {isPending ? "Sletter…" : "Slett"}
              </button>
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="text-sm text-muted hover:text-cloud transition"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditing(null)}
        >
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-midnight border border-line text-muted hover:text-cloud transition-colors"
              aria-label="Lukk"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <EditQuestionForm
              question={editing}
              onSaved={() => setEditing(null)}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
