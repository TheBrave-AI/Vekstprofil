"use server";

import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { AnswerPayload } from "@/lib/types";

// ── Client-facing ────────────────────────────────────────────────────────────

/**
 * Called by the frontend Questionnaire on submit.
 * answers: array of { q_id, value, empty } — one per question
 */
export async function submitQuestionnaire(
  link: string,
  answers: AnswerPayload[]
): Promise<{ ok: boolean }> {
  const questionnaire = await db.questionnaire.findUnique({ where: { link } });
  if (!questionnaire) return { ok: false };

  // Already submitted if answer_ids is not null
  if (questionnaire.answer_ids !== null) return { ok: false };

  try {
    await db.$transaction(async (tx) => {
      // Atomic claim — only succeeds if still null (not submitted yet)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const claimed = await tx.questionnaire.updateMany({
        where: { qu_id: questionnaire.qu_id, answer_ids: { equals: null as any } },
        data:  { answer_ids: [] },
      });
      if (claimed.count === 0) throw new Error("ALREADY_SUBMITTED");

      // Create one answer row per question
      const created = await Promise.all(
        answers.map(({ q_id, value, empty }) =>
          tx.answer.create({ data: { q_id, value: value ?? null, empty } })
        )
      );

      // Store the answer IDs back on the questionnaire
      await tx.questionnaire.update({
        where: { qu_id: questionnaire.qu_id },
        data:  { answer_ids: created.map((a) => a.a_id) },
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

  // Find or create the customer
  let customer = await db.customer.findFirst({
    where: { name: customerName.trim() },
  });
  if (!customer) {
    customer = await db.customer.create({ data: { name: customerName.trim() } });
  }

  const link = randomUUID();
  await db.questionnaire.create({
    data: { t_id, c_id: customer.c_id, link },
  });

  return { link };
}

// ── Admin: templates ──────────────────────────────────────────────────────────

export async function createTemplate(data: {
  title: string;
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

export async function updateTemplateQuestions(
  t_id: number,
  question_ids: number[]
): Promise<void> {
  await db.template.update({
    where: { t_id },
    data:  { question_ids },
  });
}

// ── Admin: questions ──────────────────────────────────────────────────────────

export async function updateQuestion(
  q_id: number,
  data: Partial<{
    question:    string;
    hint:        string | null;
    placeholder: string | null;
    suffix:      string | null;
    prefix:      string | null;
    category:    string | null;
    answer_type: "yes_no" | "open" | "numeric";
  }>
): Promise<void> {
  await db.question.update({ where: { q_id }, data });
}
