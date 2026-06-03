import { listTemplates } from "@/app/actions";
import Link from "next/link";

export default async function TemplatesPage() {
  const templates = await listTemplates();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-cloud">Maler</h1>
          <p className="text-sm text-mist mt-1">Maler definerer hvilke spørsmål som sendes til kunder.</p>
        </div>
        <Link href="/admin/templates/new" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-onbrand hover:bg-brand-deep transition">
          + Ny mal
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-mist">Ingen maler. Kjør <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">npx prisma db seed</code></p>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-5 py-3">Navn</th>
                <th className="px-5 py-3">Beskrivelse</th>
                <th className="px-5 py-3">Spørsmål</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 font-medium text-cloud">{t.name}</td>
                  <td className="px-5 py-4 text-mist">{t.description ?? "—"}</td>
                  <td className="px-5 py-4 text-mist">{t._count.questions}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/templates/${t.id}/edit`} className="text-accent hover:underline text-xs font-medium">
                      Rediger →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
