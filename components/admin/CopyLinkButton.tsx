"use client";

import { useState } from "react";

const BASE = "https://vekstprofil.thebrave.no";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE}/k/${token}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-0 rounded-xl border border-line bg-navy overflow-hidden">
      <span className="font-mono text-[12px] text-mist select-all px-4 py-2.5 flex-1 truncate min-w-0">
        {url}
      </span>
      <button
        onClick={handleCopy}
        className={`shrink-0 px-4 py-2.5 text-[12.5px] font-medium border-l border-line transition-colors ${
          copied ? "text-accent bg-accent/5" : "text-muted hover:text-cloud hover:bg-black/[0.03]"
        }`}
      >
        {copied ? "Kopiert ✓" : "Kopier"}
      </button>
    </div>
  );
}
