export function relativeTime(d: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (seconds < 60)        return "akkurat nå";
  if (seconds < 3600)      return `${Math.floor(seconds / 60)} min siden`;
  if (seconds < 86400)     return `${Math.floor(seconds / 3600)}t siden`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} d siden`;
  return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export function fullDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export function timeOnly(d: Date | string): string {
  return new Date(d).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}
