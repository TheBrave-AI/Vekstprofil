"use client";

import { createCustomer } from "@/app/actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function NewCustomerForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const customer = await createCustomer({
        companyName:  (formData.get("companyName")  as string).trim(),
        contactName:  (formData.get("contactName")  as string).trim(),
        contactEmail: (formData.get("contactEmail") as string).trim() || undefined,
      });
      router.push(`/admin/surveys/new?customerId=${customer.id}`);
    });
  }

  return (
    <form action={handleSubmit} className="rounded-card bg-midnight p-8 shadow-card space-y-5 max-w-lg">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-widest uppercase text-accent">Ny kunde</p>
        <h2 className="font-display text-xl text-cloud">Opprett kundeprofil</h2>
      </div>
      <div className="space-y-4">
        {[
          { name: "companyName",  label: "Bedriftsnavn",     placeholder: "Eksempel AS",      required: true },
          { name: "contactName",  label: "Kontaktperson",    placeholder: "Ola Nordmann",      required: true },
          { name: "contactEmail", label: "E-post (valgfri)", placeholder: "ola@eksempel.no",  required: false },
        ].map((f) => (
          <label key={f.name} className="block space-y-1.5">
            <span className="text-sm font-medium text-cloud">{f.label}</span>
            <input
              name={f.name}
              required={f.required}
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-line bg-navy px-4 py-2.5 text-sm text-cloud placeholder:text-muted focus:border-accent focus:outline-none transition"
            />
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-medium text-onbrand hover:bg-brand-deep disabled:opacity-50 transition"
      >
        {isPending ? "Oppretter…" : "Opprett kunde"}
      </button>
    </form>
  );
}
