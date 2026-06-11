"use server";

import { nanoid } from "nanoid";
import { unstable_cache, revalidateTag, revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { SKIPPED } from "@/lib/types";
import type { Question } from "@/lib/types";
import { mapQuestion } from "@/lib/mapQuestion";

// ── Helpers ───────────────────────────────────────────────────────────────────


async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

async function requireDraftSurvey(surveyId: string): Promise<void> {
  const survey = await db.survey.findUnique({ where: { id: surveyId }, select: { status: true } });
  if (!survey || survey.status !== "draft") throw new Error("Survey must be in draft to edit questions");
}

function invalidateSidebar() {
  revalidateTag("sidebar", {});
}

function invalidateSurveys() {
  revalidateTag("surveys", {});
  revalidateTag("customers", {});
  invalidateSidebar();
  revalidatePath("/admin/customers");
  revalidatePath("/admin/surveys");
}

function invalidateCustomers(id?: string) {
  revalidateTag("customers", {});
  invalidateSidebar();
  revalidatePath("/admin/customers");
  if (id) revalidatePath(`/admin/customers/${id}`);
}

function invalidateTemplates() {
  revalidateTag("templates", {});
}

function invalidateQuestions() {
  revalidateTag("questions", {});
}

// ── Cache: DB queries (auth checked separately in each action) ────────────────
//
// Cache strategy:
//   questions  — invalidated by createQuestion / updateQuestion
//   templates  — invalidated by createTemplate / updateTemplate
//   customers  — invalidated by createCustomer
//   surveys    — invalidated by createSurvey / activateSurvey / submitSurvey
//                             / addQuestionToSurvey / removeQuestionFromSurvey
//
// NOT cached: getSurvey (client form needs fresh answers),
//             getSurveyAdmin (admin detail needs fresh answers),
//             saveAnswer / submitSurvey (mutations)

const cachedQuestions = unstable_cache(
  () => db.question.findMany({ orderBy: { createdAt: "asc" } }),
  ["questions"],
  { tags: ["questions"] }
);

const cachedTemplates = unstable_cache(
  () => db.template.findMany({
    where:   { active: true },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  }),
  ["templates"],
  { tags: ["templates"] }
);

const cachedCustomers = unstable_cache(
  () => db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      surveys: {
        orderBy: { createdAt: "desc" },
        select:  { id: true, status: true, createdAt: true, sentAt: true, submittedAt: true, token: true, templateId: true },
      },
    },
  }),
  ["customers"],
  { tags: ["customers"] }
);

const cachedSurveys = unstable_cache(
  () => db.survey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, companyName: true } },
      template: { select: { name: true } },
      _count:   { select: { answers: { where: { skipped: false, value: { not: null } } }, questions: true } },
    },
  }),
  ["surveys"],
  { tags: ["surveys"] }
);

// Sidebar data — loaded on every admin page via layout.tsx
const cachedSidebarData = unstable_cache(
  async () => {
    const [active, submitted, draftCount, customerCount] = await Promise.all([
      db.survey.findMany({
        where:   { status: "active" },
        include: {
          customer: { select: { companyName: true } },
          template: { select: { name: true } },
          _count:   { select: { answers: { where: { skipped: false, value: { not: null } } }, questions: true } },
        },
        orderBy: { sentAt: "desc" },
        take:    20,
      }),
      db.survey.findMany({
        where:   { status: "submitted" },
        include: {
          customer: { select: { companyName: true } },
          template: { select: { name: true } },
          _count:   { select: { answers: { where: { skipped: false, value: { not: null } } }, questions: true } },
        },
        orderBy: { submittedAt: "desc" },
        take:    8,
      }),
      db.survey.count({ where: { status: "draft" } }),
      db.customer.count(),
    ]);
    return { active, submitted, draftCount, customerCount };
  },
  ["sidebar"],
  { tags: ["sidebar"] }
);

// ── Customer-facing ───────────────────────────────────────────────────────────

export async function getSurvey(token: string): Promise<{
  status: "not_found" | "draft" | "submitted" | "ok";
  survey?: {
    id: string;
    companyName: string;
    name: string | null;
    introTitle: string | null;
    introText: string | null;
    questions: Array<Question & { order: number }>;
    answers: Record<string, { value: string | null; skipped: boolean }>;
  };
}> {
  const survey = await db.survey.findUnique({
    where:   { token },
    include: {
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      answers:   true,
      template:  { select: { name: true, introTitle: true, introText: true } },
      customer:  { select: { companyName: true } },
    },
  });

  if (!survey)                   return { status: "not_found" };
  if (survey.status === "draft") return { status: "draft" };

  const questions = survey.questions.map((sq) => ({
    ...mapQuestion(sq.question),
    order: sq.order,
  }));

  const answers = Object.fromEntries(
    survey.answers.map((a) => [a.questionId, { value: a.value, skipped: a.skipped }])
  );

  return {
    status: survey.status === "submitted" ? "submitted" : "ok",
    survey: {
      id:          survey.id,
      companyName: survey.customer.companyName,
      name:        survey.name       ?? survey.template?.name       ?? null,
      introTitle:  survey.introTitle ?? survey.template?.introTitle ?? null,
      introText:   survey.introText  ?? survey.template?.introText  ?? null,
      questions,
      answers,
    },
  };
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

  invalidateSurveys();
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
  const customer = await db.customer.create({
    data: {
      companyName:  data.companyName.trim(),
      contactName:  data.contactName.trim(),
      contactEmail: data.contactEmail?.trim() || null,
    },
  });
  invalidateCustomers();
  return customer;
}

export async function listCustomers() {
  await requireAuth();
  return cachedCustomers();
}

export async function deleteCustomer(id: string): Promise<void> {
  await requireAuth();
  await db.$transaction(async (tx) => {
    await tx.survey.deleteMany({ where: { customerId: id } });
    await tx.customer.deleteMany({ where: { id } });
  });
  invalidateSurveys();
  invalidateCustomers(id);
}

export async function getSidebarData() {
  await requireAuth();
  return cachedSidebarData();
}

const cachedGetCustomer = unstable_cache(
  (id: string) => db.customer.findUnique({
    where:   { id },
    include: {
      surveys: {
        orderBy: { createdAt: "desc" },
        include: { template: { select: { name: true } }, _count: { select: { answers: true } } },
      },
    },
  }),
  ["customer"],
  { tags: ["customers"] }
);

export async function getCustomer(id: string) {
  await requireAuth();
  return cachedGetCustomer(id);
}

// ── Admin: surveys ────────────────────────────────────────────────────────────

type SurveyIntroData = { shortName?: string; name?: string; introTitle?: string; introText?: string };

async function _buildSurveyTx(
  tx: Prisma.TransactionClient,
  params: {
    customerId:   string;
    templateId?:  string;
    token:        string;
    status:       "draft" | "active";
    sentAt?:      Date;
    introData?:   SurveyIntroData;
    questionIds?: string[];
  }
): Promise<string> {
  const { customerId, templateId, token, status, sentAt, introData, questionIds } = params;

  const survey = await tx.survey.create({
    data: {
      customerId,
      templateId:  templateId ?? null,
      token,
      status,
      sentAt:      sentAt ?? null,
      shortName:   introData?.shortName?.trim()  ?? null,
      name:        introData?.name?.trim()        ?? null,
      introTitle:  introData?.introTitle?.trim()  ?? null,
      introText:   introData?.introText?.trim()   ?? null,
    },
  });

  if (questionIds && questionIds.length > 0) {
    await tx.surveyQuestion.createMany({
      data: questionIds.map((qid, i) => ({
        surveyId:   survey.id,
        questionId: qid,
        order:      i,
      })),
    });
  } else if (templateId) {
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

  return survey.id;
}

export async function createSurvey(
  customerId: string,
  templateId?: string,
  introData?: SurveyIntroData,
  questionIds?: string[]
): Promise<{ token: string; id: string }> {
  await requireAuth();
  if (!customerId) throw new Error("customerId is required");
  const customer = await db.customer.findUnique({ where: { id: customerId }, select: { id: true } });
  if (!customer) throw new Error(`Customer not found: ${customerId}`);
  const token = nanoid(10);
  const id = await db.$transaction((tx) =>
    _buildSurveyTx(tx, { customerId, templateId, token, status: "draft", introData, questionIds })
  );
  invalidateSurveys();
  return { token, id };
}

export async function updateSurvey(
  id: string,
  data: Pick<Prisma.SurveyUpdateInput, "shortName" | "name" | "introTitle" | "introText">
): Promise<void> {
  await requireAuth();
  await db.survey.update({ where: { id }, data });
  invalidateSurveys();
}

export async function activateSurvey(surveyId: string): Promise<{ activated: boolean }> {
  await requireAuth();
  const result = await db.survey.updateMany({
    where: { id: surveyId, status: "draft" },
    data:  { status: "active", sentAt: new Date() },
  });
  if (result.count > 0) {
    invalidateSurveys();
  }
  return { activated: result.count > 0 };
}

export async function createAndActivateSurvey(
  customerId: string,
  templateId?: string,
  introData?: SurveyIntroData,
  questionIds?: string[]
): Promise<{ token: string; id: string }> {
  await requireAuth();
  const token = nanoid(10);
  const id = await db.$transaction((tx) =>
    _buildSurveyTx(tx, { customerId, templateId, token, status: "active", sentAt: new Date(), introData, questionIds })
  );
  invalidateSurveys();
  return { token, id };
}

export async function addQuestionToSurvey(
  surveyId: string,
  questionId: string
): Promise<void> {
  await requireAuth();
  await requireDraftSurvey(surveyId);

  await db.$transaction(async (tx) => {
    const last = await tx.surveyQuestion.findFirst({
      where:   { surveyId },
      orderBy: { order: "desc" },
    });
    await tx.surveyQuestion.create({
      data: { surveyId, questionId, order: (last?.order ?? -1) + 1 },
    });
  });

  revalidateTag("surveys", {});
}

export async function removeQuestionFromSurvey(
  surveyId: string,
  questionId: string
): Promise<void> {
  await requireAuth();
  await requireDraftSurvey(surveyId);

  await db.surveyQuestion.deleteMany({ where: { surveyId, questionId } });
  revalidateTag("surveys", {});
}

export async function setSurveyQuestions(
  surveyId: string,
  orderedQuestionIds: string[]
): Promise<void> {
  await requireAuth();
  await requireDraftSurvey(surveyId);

  await db.$transaction(async (tx) => {
    await tx.surveyQuestion.deleteMany({ where: { surveyId } });
    await tx.surveyQuestion.createMany({
      data: orderedQuestionIds.map((questionId, order) => ({ surveyId, questionId, order })),
    });
  });
  revalidateTag("surveys", {});
}

export async function reorderSurveyQuestions(
  surveyId: string,
  orderedQuestionIds: string[]
): Promise<void> {
  await requireAuth();
  await requireDraftSurvey(surveyId);

  await db.$transaction(
    orderedQuestionIds.map((questionId, order) =>
      db.surveyQuestion.updateMany({ where: { surveyId, questionId }, data: { order } })
    )
  );
  revalidateTag("surveys", {});
}

export async function getSurveyAdmin(surveyId: string) {
  await requireAuth();
  return db.survey.findUnique({
    where:   { id: surveyId },
    include: {
      customer:  { select: { companyName: true } },
      template:  { select: { name: true, shortName: true, introTitle: true, introText: true } },
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      answers:   true,
    },
  });
}

// ── Admin: templates ──────────────────────────────────────────────────────────

export async function listTemplates() {
  await requireAuth();
  return cachedTemplates();
}

const cachedGetTemplate = unstable_cache(
  (id: string) => db.template.findUnique({
    where:   { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: true },
      },
    },
  }),
  ["template"],
  { tags: ["templates"] }
);

const cachedListTemplatesWithQuestions = unstable_cache(
  () => db.template.findMany({
    where:   { active: true },
    orderBy: { createdAt: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select:  { questionId: true },
      },
    },
  }),
  ["templates-with-questions"],
  { tags: ["templates"] }
);

export async function listTemplatesWithQuestions() {
  await requireAuth();
  return cachedListTemplatesWithQuestions();
}

export async function getTemplate(id: string) {
  await requireAuth();
  return cachedGetTemplate(id);
}

export async function createTemplate(data: {
  name:         string;
  shortName?:   string;
  introTitle?:  string;
  introText?:   string;
  questionIds:  string[];
}): Promise<{ id: string }> {
  await requireAuth();
  if (!data.name.trim()) throw new Error("Template name is required");

  const template = await db.$transaction(async (tx) => {
    const created = await tx.template.create({
      data: {
        name:       data.name.trim(),
        shortName:  data.shortName?.trim()  ?? null,
        introTitle: data.introTitle?.trim() ?? null,
        introText:  data.introText?.trim()  ?? null,
      },
    });
    await tx.templateQuestion.createMany({
      data: data.questionIds.map((questionId, i) => ({
        templateId: created.id, questionId, order: i,
      })),
    });
    return created;
  });

  invalidateTemplates();
  return { id: template.id };
}

export async function updateTemplate(
  id: string,
  data: Partial<{ name: string; shortName: string | null; introTitle: string | null; introText: string | null; active: boolean }>
): Promise<void> {
  await requireAuth();
  await db.template.update({ where: { id }, data });
  invalidateTemplates();
}

export async function removeQuestionFromTemplate(
  templateId: string,
  questionId: string
): Promise<void> {
  await requireAuth();
  await db.templateQuestion.deleteMany({ where: { templateId, questionId } });
  invalidateTemplates();
}

export async function setTemplateQuestions(
  templateId: string,
  orderedQuestionIds: string[]
): Promise<void> {
  await requireAuth();
  await db.$transaction(async (tx) => {
    await tx.templateQuestion.deleteMany({ where: { templateId } });
    await tx.templateQuestion.createMany({
      data: orderedQuestionIds.map((questionId, order) => ({ templateId, questionId, order })),
    });
  });
  invalidateTemplates();
}

export async function reorderTemplateQuestions(
  templateId: string,
  orderedQuestionIds: string[]
): Promise<void> {
  await requireAuth();
  await db.$transaction(
    orderedQuestionIds.map((questionId, order) =>
      db.templateQuestion.updateMany({ where: { templateId, questionId }, data: { order } })
    )
  );
  invalidateTemplates();
}

// ── Admin: questions ──────────────────────────────────────────────────────────

export async function listQuestions() {
  await requireAuth();
  return cachedQuestions();
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
  invalidateQuestions();
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
    options:     string[] | null;
  }>
): Promise<void> {
  await requireAuth();
  const { options, ...rest } = data;
  await db.question.update({
    where: { id },
    data: {
      ...rest,
      ...(options !== undefined && { options: options ?? Prisma.JsonNull }),
    },
  });
  invalidateQuestions();
}

export async function deleteQuestion(id: string): Promise<void> {
  await requireAuth();
  await db.$transaction(async (tx) => {
    await tx.answer.deleteMany({ where: { questionId: id } });
    await tx.surveyQuestion.deleteMany({ where: { questionId: id } });
    await tx.question.delete({ where: { id } });
  });
  invalidateQuestions();
  revalidatePath("/admin/questions");
}

export async function listSurveys() {
  await requireAuth();
  return cachedSurveys();
}

export async function getDashboardData() {
  await requireAuth();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [needsFollowUp, recentSubmitted] = await Promise.all([
    db.survey.findMany({
      where:   { status: "active", sentAt: { not: null, lt: sevenDaysAgo } },
      orderBy: { sentAt: "asc" },
      include: { customer: { select: { companyName: true } } },
    }),
    db.survey.findMany({
      where:   { status: "submitted" },
      orderBy: { submittedAt: "desc" },
      take:    5,
      include: { customer: { select: { companyName: true } } },
    }),
  ]);
  return { needsFollowUp, recentSubmitted };
}

export async function deleteSurvey(id: string): Promise<void> {
  await requireAuth();
  await db.survey.delete({ where: { id } });
  invalidateSurveys();
  revalidatePath("/admin/surveys");
}

export async function deleteTemplate (id: string): Promise<void> {
  await requireAuth();
  await db.template.delete({ where: { id } });
  invalidateTemplates();
  revalidatePath("/admin/templates");
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

// ── Bug reporting ─────────────────────────────────────────────────────────────

export async function reportBug(message: string, url: string): Promise<void> {
  await requireAuth();
  const webhookUrl = process.env.SLACK_BUG_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("SLACK_BUG_WEBHOOK_URL is not set");

  await fetch(webhookUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      text: `🐛 *Bug rapport*\n*Side:* ${url}\n*Melding:* ${message}`,
    }),
  });
}
