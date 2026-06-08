"use client";
import { useSidebar } from "./AdminShellContext";

export default function SidebarToggle() {
  const { collapsed, onOpen } = useSidebar();
  if (!collapsed) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-center w-6 h-6 rounded-md text-muted hover:text-cloud hover:bg-black/[0.06] transition-colors"
      title="Vis sidebar"
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
