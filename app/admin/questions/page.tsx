import { db } from "@/lib/db";
import { QuestionsClient } from "./QuestionsClient";

export default async function QuestionsPage() {
  const questions = await db.question.findMany({ orderBy: { q_id: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-cloud">Spørsmålskatalog</h1>
        <p className="text-sm text-mist mt-1">Alle tilgjengelige spørsmål.</p>
      </div>
      {questions.length === 0 ? (
        <p className="text-sm text-mist">
          Ingen spørsmål. Kjør{" "}
          <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">
            npx prisma db seed
          </code>
        </p>
      ) : (
        <QuestionsClient
          initial={questions.map((q) => ({
            q_id:     q.q_id,
            category: q.category,
            label:    q.label,
            type:     q.type,
          }))}
        />
      )}
    </div>
  );
}
