export function validateNumber(val: string): string | null {
  if (!val.trim()) return null;
  return /^-?\d+([.,]\d+)?$/.test(val.trim()) ? null : "Skriv inn et gyldig tall";
}
