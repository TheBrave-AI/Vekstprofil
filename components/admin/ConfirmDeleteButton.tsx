"use client";

import { useState, useEffect, useTransition } from "react";
import AdminButton from "@/components/ui/AdminButton";

interface Props {
  label: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteButton({ label, description, onConfirm }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!confirming) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirming(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  function confirmDelete() {
    startTransition(async () => {
      await onConfirm();
    });
  }

  return (
    <>
      <AdminButton variant="danger" onClick={() => setConfirming(true)}>
        {label}
      </AdminButton>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-sm rounded-card bg-midnight p-7 shadow-card space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-widest uppercase text-coral">{label}</p>
              <h2 className="font-display text-lg text-cloud">Er du sikker?</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
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
                onClick={() => setConfirming(false)}
                className="text-sm text-muted hover:text-cloud transition"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
