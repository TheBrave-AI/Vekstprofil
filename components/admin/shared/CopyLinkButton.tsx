"use client";

import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/primitives/Button";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/k/${token}`);

  useEffect(() => {
    setUrl(`${window.location.origin}/k/${token}`);
  }, [token]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted pl-3">Kundes lenke</p>
      <div className="flex items-center gap-0 rounded-xl border border-line bg-navy overflow-hidden">
        <span className="font-mono text-[12px] text-mist select-all px-4 py-2.5 flex-1 truncate min-w-0">
          {url}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={[
            buttonVariants({ variant: "ghost", size: "sm" }),
            "rounded-none border-0 border-l border-line text-[12.5px]",
            copied ? "text-accent bg-accent/5 hover:text-accent hover:bg-accent/5" : "",
          ].filter(Boolean).join(" ")}
        >
          {copied ? "Kopiert ✓" : "Kopier"}
        </button>
      </div>
    </div>
  );
}
