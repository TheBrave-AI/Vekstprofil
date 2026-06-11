import { IntroFormFields } from "./IntroFormFields";
import { SaveButton } from "@/components/ui/buttons/SaveButton";
import PaperIcon from "@/components/ui/primitives/PaperIcon";
import type { ReactNode } from "react";

interface Props {
  overline:      string;
  title:         string;
  status?:       "draft" | "active" | "submitted";
  templateName?: string | null;
  showInfo:      boolean;
  onToggleInfo:  () => void;
  isPending:     boolean;
  saved:         boolean;
  name:          string;
  introTitle:    string;
  introText:     string;
  onChange:      (field: "name" | "introTitle" | "introText", value: string) => void;
  onSaveInfo:    () => void;
  children?:     ReactNode;
}

function PencilButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${active ? "text-cloud bg-black/[0.08]" : "text-muted hover:text-cloud hover:bg-black/[0.06]"}`}
      title="Rediger informasjon"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M11.2 1.2C11.52 0.88 12.08 0.88 12.4 1.2L12.8 1.6C13.12 1.92 13.12 2.48 12.8 2.8L4.8 10.8C4.48 11.12 3.92 11.12 3.6 10.8L3.2 10.4C2.88 10.08 2.88 9.52 3.2 9.2L11.2 1.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.8 2.8L11.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export function EditEntityHeader({
  overline, title, status, templateName, showInfo, onToggleInfo, isPending, saved,
  name, introTitle, introText, onChange, onSaveInfo, children,
}: Props) {
  return (
    <>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mt-1.5">{overline}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <h1 className="font-display text-2xl text-cloud leading-tight">
            {title}
            {status && (
              <span className="font-sans text-[15px] font-normal text-muted ml-2">
                ({status === "active" ? "aktiv" : "ikke aktiv"})
              </span>
            )}
          </h1>
          {!templateName && <PencilButton onClick={onToggleInfo} active={showInfo} />}
        </div>
        {templateName && (
          <div className="flex items-center gap-2 mt-2">
            <PaperIcon size={16} />
            <span className="text-[16px] text-muted">{templateName}</span>
            <PencilButton onClick={onToggleInfo} active={showInfo} />
          </div>
        )}
      </div>

      {isPending && <p className="text-xs text-accent">Lagrer…</p>}
      {saved    && <p className="text-xs text-accent">✓ Lagret</p>}

      {children}

      {showInfo && (
        <div className="rounded-card bg-midnight p-6 shadow-card space-y-4">
          <IntroFormFields
            name={name} introTitle={introTitle} introText={introText}
            onChange={onChange}
          />
          <SaveButton type="button" onClick={onSaveInfo} loading={isPending} />
        </div>
      )}
    </>
  );
}
