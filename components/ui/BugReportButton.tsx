"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { reportBug } from "@/app/actions";
import { buttonVariants } from "@/components/ui/primitives/Button";

export function BugReportButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSubmit() {
    if (!message.trim()) return;
    startTransition(async () => {
      await reportBug(message.trim(), window.location.pathname);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage("");
        setOpen(false);
      }, 1800);
    });
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {/* Pop-up */}
        {open && (
          <div className="w-[300px] rounded-card bg-midnight shadow-card border border-line p-4 space-y-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">Rapporter en feil</p>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(); }}
              placeholder="Beskriv hva som skjedde..."
              rows={4}
              maxLength={1000}
              className="w-full bg-navy border border-line rounded-xl text-cloud text-[13px] placeholder:text-muted p-3 resize-none outline-none focus:border-accent transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !message.trim()}
                className={buttonVariants({ variant: sent ? "accent" : "solid", size: "sm" })}
              >
                {sent ? "Sendt ✓" : isPending ? "Sender…" : "Send"}
              </button>
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          title="Rapporter en feil"
          className="w-9 h-9 rounded-full bg-midnight border border-line shadow-card flex items-center justify-center text-muted hover:text-cloud hover:border-steel transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5C7.5 1.5 4 3 4 7.5C4 12 7.5 13.5 7.5 13.5C7.5 13.5 11 12 11 7.5C11 3 7.5 1.5 7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M2 5.5L4.5 6.5M13 5.5L10.5 6.5M2 9.5L4.5 8.5M13 9.5L10.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </>
  );
}
