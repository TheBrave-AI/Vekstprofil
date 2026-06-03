"use server";

import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { SKIPPED } from "@/lib/types";

// ── Client-facing ────────────────────────────────────────────────────────────

/**
 * Called by the frontend Questionnaire on submit.
 * answers: Record<questionId (string slug), value | "__SKIPPED__">
 */
export async function submitQuestionnaire(
  link: string,
  answers: Record<string, string>
): Promise<{ ok: boolean }> {
  const questionnaire = await db.questionnaire.findUnique({ where: { link } });
  if (!questionnaire) return { ok: false };
  if (questionnaire.answer_ids !== null) return { ok: false };

  try {
    await db.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const claimed = await tx.questionnaire.updateMany({
        where: { qu_id: questionnaire.qu_id, answer_ids: { equals: null as any } },
        data:  { answer_ids: [] },
      });
      if (claimed.count === 0) throw new Error("ALREADY_SUBMITTED");

      // Look up q_id for each string slug
      const slugs = Object.keys(answers);
      const questions = await tx.question.findMany({
        where: { id: { in: slugs } },
        select: { q_id: true, id: true },
      });
      const slugToQid = Object.fromEntries(questions.map((q) => [q.id, q.q_id]));

      const created = await Promise.all(
        Object.entries(answers).map(([slug, rawValue]) => {
          const q_id = slugToQid[slug];
          if (!q_id) return null;
          const empty = rawValue === SKIPPED || rawValue === "";
          return tx.answer.create({
            data: { q_id, value: empty ? null : rawValue, empty },
          });
        })
      );

      const aIds = created.filter(Boolean).map((a) => a!.a_id);
      await tx.questionnaire.update({
        where: { qu_id: questionnaire.qu_id },
        data:  { answer_ids: aIds },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "ALREADY_SUBMITTED") return { ok: false };
    throw e;
  }

  return { ok: true };
}

// ── Admin: questionnaires ─────────────────────────────────────────────────────

export async function createQuestionnaire(
  t_id: number,
  customerName: string
): Promise<{ link: string }> {
  if (!customerName.trim()) throw new Error("Customer name is required");

  let customer = await db.customer.findFirst({ where: { name: customerName.trim() } });
  if (!customer) {
    customer = await db.customer.create({ data: { name: customerName.trim() } });
  }

  const link = randomUUID();
  await db.questionnaire.create({ data: { t_id, c_id: customer.c_id, link } });
  return { link };
}

// ── Admin: questions ──────────────────────────────────────────────────────────

export async function updateQuestion(
  q_id: number,
  data: Partial<{
    category:    string;
    label:       string;
    help:        string;
    placeholder: string;
    type:        string;
    prefix:      string | null;
    suffix:      string | null;
  }>
): Promise<void> {
  await db.question.update({ where: { q_id }, data });
}

// ── Admin: templates ──────────────────────────────────────────────────────────

export async function createTemplate(data: {
  title:        string;
  short_title?: string;
  description?: string;
  question_ids: number[];
}): Promise<{ t_id: number }> {
  if (!data.title.trim()) throw new Error("Title is required");
  const t = await db.template.create({
    data: {
      title:        data.title.trim(),
      short_title:  data.short_title?.trim() ?? null,
      description:  data.description?.trim() ?? null,
      question_ids: data.question_ids,
    },
  });
  return { t_id: t.t_id };
}
