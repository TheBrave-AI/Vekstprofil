"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/app/actions";
import { DeleteButton } from "@/components/ui/buttons/DeleteButton";
import Button from "@/components/ui/primitives/Button";

export function DeleteCustomerButton({
  customerId,
  customerName,
  surveyCount,
}: {
  customerId:   string;
  customerName: string;
  surveyCount:  number;
}) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [error, setError]     = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const confirmed = input.trim() === customerName.trim();

  function handleDelete() {
    if (!confirmed) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteCustomer(customerId);
        router.push("/admin/customers");
      } catch {
        setError("Noe gikk galt. Prøv igjen.");
      }
    });
  }

  if (!open) {
    return <DeleteButton onClick={() => setOpen(true)}>Slett kunde</DeleteButton>;
  }

  return (
    <div className="rounded-card bg-midnight border border-coral/30 shadow-card p-5 space-y-4 max-w-sm">
      <div className="space-y-1">
        <p className="text-[13.5px] font-semibold text-cloud">Slett kunde permanent?</p>
        <p className="text-[12.5px] text-muted leading-relaxed">
          Dette sletter <strong className="text-cloud">{customerName}</strong> og alle
          {surveyCount > 0 && <> <strong className="text-coral">{surveyCount} undersøkelse{surveyCount === 1 ? "" : "r"}</strong> med svar</>}.
          {" "}Handlingen kan ikke angres.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] text-muted">
          Skriv <strong className="text-cloud">{customerName}</strong> for å bekrefte
        </label>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={customerName}
          autoFocus
          className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-[13px] text-cloud placeholder:text-muted focus:border-coral focus:outline-none transition"
        />
      </div>

      {error && <p className="text-[12px] text-coral">{error}</p>}

      <div className="flex gap-2">
        <Button
          variant="coral"
          onClick={handleDelete}
          disabled={!confirmed || isPending}
          fullWidth
        >
          {isPending ? "Sletter…" : "Slett permanent"}
        </Button>
        <button
          type="button"
          onClick={() => { setOpen(false); setInput(""); setError(""); }}
          disabled={isPending}
          className="px-4 py-2 text-[13px] font-medium text-muted hover:text-cloud transition-colors"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
