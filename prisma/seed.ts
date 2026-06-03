import { PrismaClient, Prisma } from "@prisma/client";
import { QUESTIONS } from "../lib/questions";

const db = new PrismaClient();

async function main() {
  // 1. Seed global Question catalog
  console.log("Seeding questions...");
  const created: { id: string; order: number }[] = [];
  for (const [i, q] of QUESTIONS.entries()) {
    const row = await db.question.upsert({
      where:  { id: q.id },
      update: {
        label: q.label, type: q.type, category: q.category ?? null,
        help: q.help ?? null, placeholder: q.placeholder ?? null,
        prefix: q.prefix ?? null, suffix: q.suffix ?? null,
        options: q.options ? q.options as Prisma.InputJsonValue : Prisma.JsonNull,
        slider:  q.slider  ? q.slider  as Prisma.InputJsonValue : Prisma.JsonNull,
      },
      create: {
        id: q.id,
        label: q.label, type: q.type, category: q.category ?? null,
        help: q.help ?? null, placeholder: q.placeholder ?? null,
        prefix: q.prefix ?? null, suffix: q.suffix ?? null,
        options: q.options ? q.options as Prisma.InputJsonValue : Prisma.JsonNull,
        slider:  q.slider  ? q.slider  as Prisma.InputJsonValue : Prisma.JsonNull,
      },
    });
    created.push({ id: row.id, order: i });
  }
  console.log(`Seeded ${created.length} questions.`);

  // 2. Default Template
  const template = await db.template.upsert({
    where:  { id: "default-template" },
    update: {},
    create: { id: "default-template", name: "Brave Nullpunkt", description: "Kartlegging av salgs- og markedssituasjon" },
  });
  for (const q of created) {
    await db.templateQuestion.upsert({
      where:  { templateId_questionId: { templateId: template.id, questionId: q.id } },
      update: { order: q.order },
      create: { templateId: template.id, questionId: q.id, order: q.order },
    });
  }
  console.log(`Seeded template: "${template.name}"`);

  // 3. Test Customer + Survey (active so /k/test-onboarding-demo works)
  const customer = await db.customer.upsert({
    where:  { id: "test-customer-001" },
    update: {},
    create: { id: "test-customer-001", companyName: "Eksempel AS", contactName: "Ola Nordmann", contactEmail: "ola@eksempel.no" },
  });

  let survey = await db.survey.findUnique({ where: { token: "test-onboarding-demo" } });
  if (!survey) {
    survey = await db.survey.create({
      data: { customerId: customer.id, templateId: template.id, token: "test-onboarding-demo", status: "active", sentAt: new Date() },
    });
    await db.surveyQuestion.createMany({
      data: created.map((q) => ({ surveyId: survey!.id, questionId: q.id, order: q.order })),
    });
    console.log("Seeded test survey: /k/test-onboarding-demo (status: active)");
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
