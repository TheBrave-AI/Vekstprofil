"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableQuestionItem {
  id: string;
  label: string;
  category: string | null;
}

interface Props {
  item: SortableQuestionItem;
  index: number;
  action?: React.ReactNode;
}

export function SortableQuestion({ item, index, action }: Props) {
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

      {/* Right side: action + drag handle */}
      <div className="flex items-center gap-3 shrink-0">
        {action}
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
      </div>
    </div>
  );
}
