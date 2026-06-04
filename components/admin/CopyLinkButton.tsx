"use client";

import { useState } from "react";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `https://vekstprofil.thebrave.no/k/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-cloud hover:bg-midnight transition"
    >
      {copied ? "Kopiert! ✓" : "Kopier kundelenke"}
    </button>
  );
}
