"use client";

import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/primitives/Button";

export function CopyLinkButton({ token, animated }: { token: string; animated?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(`/k/${token}`);
  const [displayedUrl, setDisplayedUrl] = useState(animated ? "" : `/k/${token}`);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const fullUrl = `${window.location.origin}/k/${token}`;
    setUrl(fullUrl);

    if (!animated) {
      setDisplayedUrl(fullUrl);
      return;
    }

    setHighlight(true);
    const fadeTimer = setTimeout(() => setHighlight(false), 2500);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedUrl(fullUrl.slice(0, i));
      if (i >= fullUrl.length) clearInterval(interval);
    }, 24);

    return () => {
      clearTimeout(fadeTimer);
      clearInterval(interval);
    };
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted pl-3">Send denne lenken til kunden</p>
      <div className="flex items-center gap-0 rounded-xl border border-line bg-navy overflow-hidden">
        <span className="font-mono text-[12px] text-mist select-all px-4 py-2.5 flex-1 truncate min-w-0">
          {displayedUrl}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={[
            buttonVariants({ variant: copied ? "ghost" : "solid", size: "sm" }),
            "rounded-none border-0 border-l border-line text-[12.5px] transition-all duration-700",
          ].join(" ")}
        >
          {copied ? "Kopiert ✓" : "Kopier"}
        </button>
      </div>
    </div>
  );
}
