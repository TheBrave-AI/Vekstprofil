"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadCustomerLogo, removeCustomerLogo, setCustomerShowLogoLabel } from "@/app/actions";
import { SaveButton } from "@/components/ui/buttons/SaveButton";
import { ConfirmDeleteButton } from "@/components/admin/shared/ConfirmDeleteButton";

interface Props {
  customerId: string;
  customerName: string;
  logoUrl: string | null;
  showLogoLabel: boolean;
}

export function CustomerLogoUpload({ customerId, customerName, logoUrl, showLogoLabel }: Props) {
  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl);
  const [currentShowLogoLabel, setCurrentShowLogoLabel] = useState(showLogoLabel ?? false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const { logoUrl: newLogoUrl } = await uploadCustomerLogo(customerId, formData);
        setCurrentLogoUrl(newLogoUrl);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  async function handleRemove() {
    await removeCustomerLogo(customerId);
    setCurrentLogoUrl(null);
    router.refresh();
  }

  function handleToggleLabel(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setCurrentShowLogoLabel(next);
    startToggleTransition(async () => {
      await setCustomerShowLogoLabel(customerId, next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      {currentLogoUrl && (
        <img
          src={currentLogoUrl}
          alt={`${customerName} logo`}
          className="h-12 w-12 rounded-lg object-contain bg-navy border border-line p-1.5"
        />
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
            id="customer-logo-input"
          />
          <SaveButton
            type="button"
            loading={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {isPending ? "Laster opp…" : currentLogoUrl ? "Bytt logo" : "Last opp logo"}
          </SaveButton>

          {currentLogoUrl && (
            <ConfirmDeleteButton
              label="Fjern logo"
              description={`Dette fjerner logoen til ${customerName}. Kunden vil vises med tekstlabel i undersøkelsen igjen.`}
              onConfirm={handleRemove}
            />
          )}

          <label className="flex items-center gap-1.5 text-[12.5px] text-muted select-none">
            <input
              type="checkbox"
              checked={currentShowLogoLabel}
              onChange={handleToggleLabel}
              disabled={isTogglePending}
              className="h-3.5 w-3.5 rounded border-line accent-accent"
            />
            Vis navn under logo
          </label>
        </div>
        {error && <p className="text-[12px] text-coral">{error}</p>}
      </div>
    </div>
  );
}
