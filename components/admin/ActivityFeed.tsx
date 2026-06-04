"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ActivityEvent } from "@/app/api/admin/activity/route";

{/* REMOVED FOR NOW - UNNECCESARY FEATURE THAT CAN BE ADDED LATER */}
function relativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "akkurat nå";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min siden`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}t siden`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} d siden`;
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/activity");
        if (res.ok) setEvents(await res.json());
      } catch {}
    };

    fetchEvents();
    const pollInterval = setInterval(fetchEvents, 30_000);
    const tickInterval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="border-t border-line p-4 shrink-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-3">
        Aktivitet
      </p>
      <div className="flex flex-col gap-3">
        {events.slice(0, 5).map((e) => (
          <Link
            key={`${e.type}-${e.surveyId}-${e.timestamp}`}
            href={`/admin/surveys/${e.surveyId}`}
            className="flex items-start gap-2 group"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[4px] ${
                e.type === "submit" ? "bg-marker" : "bg-accent"
              }`}
            />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-cloud leading-snug truncate group-hover:text-brand transition-colors">
                {e.companyName}
              </p>
              <p className="text-[11px] text-muted leading-snug truncate">
                {e.type === "submit" ? "leverte inn vekstprofilen" : e.questionLabel}
              </p>
              <p className="text-[10.5px] text-muted/60 mt-0.5">{relativeTime(e.timestamp)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
