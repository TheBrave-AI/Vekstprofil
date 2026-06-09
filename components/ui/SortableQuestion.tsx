"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableQuestionItem {
  id:          string;
  label:       string;
  category:    string | null;
  type?:       string;
  help?:       string | null;
  placeholder?: string | null;
  prefix?:     string | null;
  suffix?:     string | null;
  options?:    unknown;
}

interface Props {
  item:      SortableQuestionItem;
  index:     number;
  onRemove:  () => void;
  onEdit?:   (item: SortableQuestionItem) => void;
}

export function SortableQuestion({ item, index, onRemove, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="flex items-center gap-4 px-5 py-3 border-b border-line last:border-0 bg-midnight"
    >
      {/* Index */}
      <span className="text-xs text-muted font-mono w-4 shrink-0">{index + 1}</span>

      {/* Question info */}
      <div className="flex-1 min-w-0">
        {item.category && <p className="text-xs text-accent uppercase tracking-widest">{item.category}</p>}
        <p className="text-sm text-cloud">{item.label}</p>
      </div>

      {/* Right side: Edit | Drag | Remove */}
      <div className="flex items-center gap-3 shrink-0">

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="text-muted hover:text-cloud transition"
            aria-label="Rediger spørsmål"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.2 1.2C11.52 0.88 12.08 0.88 12.4 1.2L12.8 1.6C13.12 1.92 13.12 2.48 12.8 2.8L4.8 10.8C4.48 11.12 3.92 11.12 3.6 10.8L3.2 10.4C2.88 10.08 2.88 9.52 3.2 9.2L11.2 1.2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.8 2.8L11.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <button
          type="button"
          className="text-muted hover:text-cloud transition cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          aria-label="Dra for å sortere"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4.5" cy="3.5" r="1.2" fill="currentColor"/>
            <circle cx="4.5" cy="7"   r="1.2" fill="currentColor"/>
            <circle cx="4.5" cy="10.5" r="1.2" fill="currentColor"/>
            <circle cx="9.5" cy="3.5" r="1.2" fill="currentColor"/>
            <circle cx="9.5" cy="7"   r="1.2" fill="currentColor"/>
            <circle cx="9.5" cy="10.5" r="1.2" fill="currentColor"/>
          </svg>
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="text-muted hover:text-coral transition"
          aria-label="Fjern"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2L11 11M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

      </div>
    </div>
  );
}
