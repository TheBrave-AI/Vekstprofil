"use server";

import { nanoid } from "nanoid";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SKIPPED } from "@/lib/types";
import type { Question } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapQuestion(q: {
  id: string; label: string; type: string; category: string | null;
  help: string | null; placeholder: string | null; prefix: string | null;
  suffix: string | null; options: unknown; slider: unknown;
}): Question {
  return {
    id:          q.id,
    label:       q.label,
    type:        q.type as Question["type"],
    category:    q.category    ?? "",
    help:        q.help        ?? "",
    placeholder: q.placeholder ?? "",
    prefix:      q.prefix      ?? undefined,
    suffix:      q.suffix      ?? undefined,
    options:     q.options ? (q.options as string[]) : undefined,
    slider:      q.slider  ? (q.slider  as Question["slider"]) : undefined,
  };
}

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

// ── Customer-facing ───────────────────────────────────────────────────────────

export async function getSurvey(token: string): Promise<{
  status: "not_found" | "draft" | "submitted" | "ok";
  survey?: {
    id: string;
    questions: Array<Question & { order: number }>;
    answers: Record<string, { value: string | null; skipped: boolean }>;
  };
}> {
  const survey = await db.survey.findUnique({
    where:   { token },
    include: {
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      answers:   true,
    },
  });

  if (!survey)                        return { status: "not_found" };
  if (survey.status === "draft")      return { status: "draft" };
  if (survey.status === "submitted")  return { status: "submitted" };

  const questions = survey.questions.map((sq) => ({
    ...mapQuestion(sq.question),
    order: sq.order,
  }));

  const answers = Object.fromEntries(
    survey.answers.map((a) => [a.questionId, { value: a.value, skipped: a.skipped }])
  );

  return { status: "ok", survey: { id: survey.id, questions, answers } };
}

export async function saveAnswer(
  token: string,
  questionId: string,
  value: string | typeof SKIPPED
): Promise<{ ok: boolean }> {
  const survey = await db.survey.findUnique({
    where:   { token },
    include: { questions: { where: { questionId }, select: { id: true } } },
  });
  if (!survey || survey.status !== "active") return { ok: false };
  if (survey.questions.length === 0) return { ok: false };

  const skipped = value === SKIPPED;
  await db.answer.upsert({
    where:  { surveyId_questionId: { surveyId: survey.id, questionId } },
    create: { surveyId: survey.id, questionId, value: skipped ? null : value, skipped },
    update: { value: skipped ? null : value, skipped },
  });

  return { ok: true };
}

export async function submitSurvey(token: string): Promise<{ ok: boolean }> {
  const survey = await db.survey.findUnique({ where: { token } });
  if (!survey || survey.status !== "active") return { ok: false };

  await db.survey.update({
    where: { id: survey.id },
    data:  { status: "submitted", submittedAt: new Date() },
  });

  return { ok: true };
}

// ── Admin: customers ──────────────────────────────────────────────────────────

export async function createCustomer(data: {
  companyName:  string;
  contactName:  string;
  contactEmail?: string;
}) {
  await requireAuth();
  if (!data.companyName.trim() || !data.contactName.trim()) {
    throw new Error("Company name and contact name are required");
  }
  return db.customer.create({
    data: {
      companyName:  data.companyName.trim(),
      contactName:  data.contactName.trim(),
      contactEmail: data.contactEmail?.trim() || null,
    },
  });
}

export async function listCustomers() {
  await requireAuth();
  return db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      surveys: {
        orderBy: { createdAt: "desc" },
        select:  { id: true, status: true, createdAt: true, sentAt: true, submittedAt: true, token: true, templateId: true },
      },
    },
  });
}

// ── Admin: surveys ────────────────────────────────────────────────────────────

export async function createSurvey(
  customerId: string,
  templateId?: string
): Promise<{ token: string; id: string }> {
  await requireAuth();
  const token = nanoid(10);
  let surveyId = "";

  await db.$transaction(async (tx) => {
    const survey = await tx.survey.create({
      data: { customerId, templateId: templateId ?? null, token, status: "draft" },
    });
    surveyId = survey.id;

    if (templateId) {
      const tqs = await tx.templateQuestion.findMany({
        where:   { templateId },
        orderBy: { order: "asc" },
      });
      await tx.surveyQuestion.createMany({
        data: tqs.map((tq) => ({
          surveyId:   survey.id,
          questionId: tq.questionId,
          order:      tq.order,
        })),
      });
    }
  });

  return { token, id: surveyId };
}

export async function activateSurvey(surveyId: string): Promise<void> {
  await requireAuth();
  await db.survey.update({
    where: { id: surveyId, status: "draft" },
    data:  { status: "active", sentAt: new Date() },
  });
}

export async function addQuestionToSurvey(
  surveyId: string,
  questionId: string
): Promise<void> {
  await requireAuth();
  const survey = await db.survey.findUnique({ where: { id: surveyId }, select: { status: true } });
  if (!survey || survey.status !== "draft") throw new Error("Survey must be in draft to edit questions");

  await db.$transaction(async (tx) => {
    const last = await tx.surveyQuestion.findFirst({
      where:   { surveyId },
      orderBy: { order: "desc" },
    });
    await tx.surveyQuestion.create({
      data: { surveyId, questionId, order: (last?.order ?? -1) + 1 },
    });
  });
}

export async function removeQuestionFromSurvey(
  surveyId: string,
  questionId: string
): Promise<void> {
  await requireAuth();
  const survey = await db.survey.findUnique({ where: { id: surveyId }, select: { status: true } });
  if (!survey || survey.status !== "draft") throw new Error("Survey must be in draft to edit questions");

  await db.surveyQuestion.deleteMany({ where: { surveyId, questionId } });
}

export async function getSurveyAdmin(surveyId: string) {
  await requireAuth();
  return db.survey.findUnique({
    where:   { id: surveyId },
    include: {
      customer:  true,
      template:  true,
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      answers:   true,
    },
  });
}

// ── Admin: templates ──────────────────────────────────────────────────────────

export async function listTemplates() {
  await requireAuth();
  return db.template.findMany({
    where:   { active: true },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  });
}

export async function createTemplate(data: {
  name:         string;
  description?: string;
  questionIds:  string[];
}): Promise<{ id: string }> {
  await requireAuth();
  if (!data.name.trim()) throw new Error("Template name is required");

  const t = await db.$transaction(async (tx) => {
    const template = await tx.template.create({
      data: { name: data.name.trim(), description: data.description?.trim() ?? null },
    });
    await tx.templateQuestion.createMany({
      data: data.questionIds.map((questionId, i) => ({
        templateId: template.id, questionId, order: i,
      })),
    });
    return template;
  });

  return { id: t.id };
}

export async function updateTemplate(
  id: string,
  data: Partial<{ name: string; description: string | null; active: boolean }>
): Promise<void> {
  await requireAuth();
  await db.template.update({ where: { id }, data });
}

// ── Admin: questions ──────────────────────────────────────────────────────────

export async function listQuestions() {
  await requireAuth();
  return db.question.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createQuestion(data: {
  label:        string;
  type:         string;
  category?:    string;
  help?:        string;
  placeholder?: string;
  prefix?:      string;
  suffix?:      string;
  options?:     string[];
}): Promise<{ id: string }> {
  await requireAuth();
  if (!data.label.trim()) throw new Error("Label is required");
  const { options, ...rest } = data;
  const q = await db.question.create({
    data: { ...rest, options: options && options.length > 0 ? options : undefined },
  });
  return { id: q.id };
}

export async function updateQuestion(
  id: string,
  data: Partial<{
    label:       string;
    type:        string;
    category:    string | null;
    help:        string | null;
    placeholder: string | null;
    prefix:      string | null;
    suffix:      string | null;
  }>
): Promise<void> {
  await requireAuth();
  await db.question.update({ where: { id }, data });
}

export async function listSurveys() {
  await requireAuth();
  return db.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, companyName: true } },
      template: { select: { name: true } },
      _count:   { select: { answers: true, questions: true } },
    },
  });
}

// ── Admin: comparison ─────────────────────────────────────────────────────────

type SurveySnapshot = {
  id:        string;
  createdAt: Date;
  questions: Array<{ id: string; label: string; category: string; answer: string | null; skipped: boolean }>;
};

export async function compareSurveys(
  surveyId1: string,
  surveyId2: string
): Promise<{ survey1: SurveySnapshot; survey2: SurveySnapshot }> {
  await requireAuth();

  const [s1, s2] = await Promise.all([
    db.survey.findUnique({
      where:   { id: surveyId1 },
      include: {
        questions: { orderBy: { order: "asc" }, include: { question: true } },
        answers:   true,
      },
    }),
    db.survey.findUnique({
      where:   { id: surveyId2 },
      include: {
        questions: { orderBy: { order: "asc" }, include: { question: true } },
        answers:   true,
      },
    }),
  ]);

  if (!s1) throw new Error(`Survey not found: ${surveyId1}`);
  if (!s2) throw new Error(`Survey not found: ${surveyId2}`);
  if (s1.customerId !== s2.customerId) throw new Error("Surveys must belong to the same customer");

  function toSnapshot(s: NonNullable<typeof s1>): SurveySnapshot {
    const answerByQid = Object.fromEntries(s.answers.map((a) => [a.questionId, a]));
    return {
      id:        s.id,
      createdAt: s.createdAt,
      questions: s.questions.map((sq) => {
        const a = answerByQid[sq.questionId];
        return {
          id:       sq.question.id,
          label:    sq.question.label,
          category: sq.question.category ?? "",
          answer:   a?.skipped ? null : (a?.value ?? null),
          skipped:  a?.skipped ?? false,
        };
      }),
    };
  }

  return { survey1: toSnapshot(s1), survey2: toSnapshot(s2) };
}
