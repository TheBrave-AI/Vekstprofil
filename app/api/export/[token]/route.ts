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

  const answerByQid = Object.fromEntries(answers.map((a) => [a.q_id, a]));

  const templateQuestionIds = questionnaire.template.question_ids as number[];
  const allQuestions = await db.question.findMany({
    where: { q_id: { in: templateQuestionIds } },
  });
  const questions: Question[] = templateQuestionIds
    .map((id) => allQuestions.find((q) => q.q_id === id))
    .filter((q): q is NonNullable<typeof q> => q !== undefined)
    .map((q) => ({
      q_id: q.q_id, question: q.question, hint: q.hint,
      placeholder: q.placeholder, suffix: q.suffix, prefix: q.prefix,
      category: q.category, answer_type: q.answer_type as Question["answer_type"],
    }));

  const rows: string[][] = [
    ["Kunde", "Mal", "Spørsmål ID", "Spørsmål", "Svar", "Tom"],
  ];

  for (const q of questions) {
    const a = answerByQid[q.q_id];
    rows.push([
      questionnaire.customer.name,
      questionnaire.template.short_title ?? questionnaire.template.title,
      String(q.q_id),
      q.question,
      a?.value ?? "",
      a?.empty ? "Ja" : "Nei",
    ]);
  }

  function escapeCell(v: string): string {
    return `"${v.replace(/"/g, '""')}"`;
  }

  const csv = rows.map((r) => r.map(escapeCell).join(",")).join("\n");

  const safeName = questionnaire.customer.name
    .replace(/[^\w\s.-]/g, "_")
    .trim()
    .replace(/\s+/g, "_");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.csv"`,
    },
  });
}
