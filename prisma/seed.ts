import { PrismaClient, Prisma } from "@prisma/client";
import { QUESTIONS } from "../lib/questions";

const db = new PrismaClient();

async function main() {
  console.log("Seeding questions...");
  const createdQuestions = [];

  for (const q of QUESTIONS) {
    const created = await db.question.upsert({
      where:  { id: q.id },
      update: {
        category:    q.category,
        label:       q.label,
        help:        q.help,
        placeholder: q.placeholder,
        type:        q.type,
        prefix:      q.prefix  ?? null,
        suffix:      q.suffix  ?? null,
        options:     q.options ? q.options as Prisma.InputJsonValue : Prisma.JsonNull,
        slider:      q.slider  ? q.slider  as Prisma.InputJsonValue : Prisma.JsonNull,
      },
      create: {
        id:          q.id,
        category:    q.category,
        label:       q.label,
        help:        q.help,
        placeholder: q.placeholder,
        type:        q.type,
        prefix:      q.prefix  ?? null,
        suffix:      q.suffix  ?? null,
        options:     q.options ? q.options as Prisma.InputJsonValue : Prisma.JsonNull,
        slider:      q.slider  ? q.slider  as Prisma.InputJsonValue : Prisma.JsonNull,
      },
    });
    createdQuestions.push(created);
  }
  console.log(`Seeded ${createdQuestions.length} questions.`);

  const questionIds = createdQuestions.map((q) => q.q_id);
  const template = await db.template.upsert({
    where:  { t_id: 1 },
    update: { question_ids: questionIds },
    create: {
      title:        "Brave Nullpunkt",
      short_title:  "Nullpunkt",
      description:  "Kartlegging av salgs- og markedssituasjon",
      question_ids: questionIds,
    },
  });
  console.log(`Seeded template: "${template.title}" (t_id=${template.t_id})`);

  const customer = await db.customer.upsert({
    where:  { c_id: 1 },
    update: {},
    create: { name: "Eksempel AS" },
  });

  await db.questionnaire.upsert({
    where:  { link: "test-onboarding-demo" },
    update: {},
    create: { t_id: template.t_id, c_id: customer.c_id, link: "test-onboarding-demo" },
  });
  console.log("Seeded test questionnaire: /k/test-onboarding-demo");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
