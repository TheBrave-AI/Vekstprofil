import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Question } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const questionnaire = await db.questionnaire.findUnique({
    where:   { link: token },
    include: { customer: true, template: true },
  });
  if (!questionnaire) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answerIds = questionnaire.answer_ids as number[] | null;
  const answers = answerIds && answerIds.length > 0
    ? await db.answer.findMany({ where: { a_id: { in: answerIds } }, include: { question: true } })
    : [];

  const templateQuestionIds = questionnaire.template.question_ids as number[];
  const allQuestions = await db.question.findMany({
    where: { q_id: { in: templateQuestionIds } },
  });

  const questions: Question[] = templateQuestionIds
    .map((qid) => allQuestions.find((q) => q.q_id === qid))
    .filter((q): q is NonNullable<typeof q> => q !== undefined)
    .map((q) => ({
      id:          q.id,
      category:    q.category,
      label:       q.label,
      help:        q.help,
      placeholder: q.placeholder,
      type:        q.type as Question["type"],
      prefix:      q.prefix  ?? undefined,
      suffix:      q.suffix  ?? undefined,
    }));

  const answerBySlug = Object.fromEntries(
    answers.map((a) => [a.question.id, a])
  );

  const rows: string[][] = [
    ["Kunde", "Mal", "Spørsmål ID", "Spørsmål", "Svar", "Tom"],
  ];

  for (const q of questions) {
    const a = answerBySlug[q.id];
    rows.push([
      questionnaire.customer.name,
      questionnaire.template.short_title ?? questionnaire.template.title,
      q.id,
      q.label,
      a?.value ?? "",
      a?.empty ? "Ja" : "Nei",
    ]);
  }

  function escapeCell(v: string): string {
    return `"${v.replace(/"/g, '""')}"`;
  }

  const csv = rows.map((r) => r.map(escapeCell).join(",")).join("\n");
  const safeName = questionnaire.customer.name.replace(/[^\w\s.-]/g, "_").trim().replace(/\s+/g, "_");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.csv"`,
    },
  });
}
