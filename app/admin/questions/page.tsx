import { listQuestions } from "@/app/actions";

export default async function QuestionsPage() {
  const questions = await listQuestions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-cloud">Spørsmålskatalog</h1>
        <p className="text-sm text-mist mt-1">
          Alle spørsmål deles på tvers av maler og surveys. Endringer gjelder retroaktivt.
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-mist">
          Ingen spørsmål. Kjør{" "}
          <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">npx prisma db seed</code>
        </p>
      ) : (
        <div className="overflow-hidden rounded-card bg-midnight shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted uppercase tracking-wider">
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Spørsmål</th>
                <th className="px-5 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-xs font-medium uppercase tracking-widest text-accent whitespace-nowrap">
                    {q.category ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-cloud max-w-sm">{q.label}</td>
                  <td className="px-5 py-3 font-mono text-xs text-mist">{q.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
