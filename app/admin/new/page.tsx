import { db } from "@/lib/db";
import { NewSubmissionForm } from "./NewSubmissionForm";

export default async function NewSubmissionPage() {
  const templates = await db.template.findMany({
    orderBy: { t_id: "asc" },
    select: { t_id: true, title: true, short_title: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-cloud">Ny kartlegging</h1>
        <p className="text-sm text-mist mt-1">
          Velg en mal og oppgi kundenavn — lenken genereres automatisk.
        </p>
      </div>
      {templates.length === 0 ? (
        <p className="text-sm text-mist">
          Ingen maler funnet. Kjør{" "}
          <code className="font-mono text-xs bg-steel/30 px-1.5 py-0.5 rounded">
            npx prisma db seed
          </code>{" "}
          for å opprette standardmalen.
        </p>
      ) : (
        <NewSubmissionForm templates={templates} />
      )}
    </div>
  );
}
