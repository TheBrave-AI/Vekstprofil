"use client";

import { useState, useTransition } from "react";
import { DeleteButton } from "@/components/ui/buttons/DeleteButton";
import Button from "@/components/ui/primitives/Button";
import { Modal } from "@/components/ui/Modal";

interface Props {
  label: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteButton({ label, description, onConfirm }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      await onConfirm();
    });
  }

  return (
    <>
      <DeleteButton onClick={() => setConfirming(true)}>{label}</DeleteButton>

      {confirming && (
        <Modal onClose={() => setConfirming(false)} maxWidth="sm" showClose={false}>
          <div className="rounded-card bg-midnight p-7 shadow-card space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-widest uppercase text-coral">{label}</p>
              <h2 className="font-display text-lg text-cloud">Er du sikker?</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">{description}</p>
            <div className="flex items-center gap-3 pt-1">
              <Button variant="coral" onClick={confirmDelete} disabled={isPending}>
                {isPending ? "Sletter…" : "Slett"}
              </Button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-sm text-muted hover:text-cloud transition"
              >
                Avbryt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
