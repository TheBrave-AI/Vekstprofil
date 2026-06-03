import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const survey = await db.survey.findUnique({
    where:   { token },
    include: {
      customer:  true,
      template:  true,
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      answers:   true,
    },
  });

  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answerByQid = Object.fromEntries(survey.answers.map((a) => [a.questionId, a]));

  const rows: string[][] = [
    ["Bedrift", "Kontakt", "Mal", "Spørsmål", "Kategori", "Svar", "Hoppet over"],
  ];

  for (const sq of survey.questions) {
    const q = sq.question;
    const a = answerByQid[q.id];
    rows.push([
      survey.customer.companyName,
      survey.customer.contactName,
      survey.template?.name ?? "",
      q.label,
      q.category ?? "",
      a?.value ?? "",
      a?.skipped ? "Ja" : "Nei",
    ]);
  }

  const escapeCell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escapeCell).join(",")).join("\n");
  const safeName = survey.customer.companyName.replace(/[^\w\s.-]/g, "_").trim().replace(/\s+/g, "_");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.csv"`,
    },
  });
}
