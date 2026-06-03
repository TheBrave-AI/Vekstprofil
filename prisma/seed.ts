import { PrismaClient } from "@prisma/client";
import { QUESTIONS } from "../lib/questions";

const db = new PrismaClient();

async function main() {
  // Seed questions
  console.log("Seeding questions...");
  const createdQuestions = [];
  for (const q of QUESTIONS) {
    const created = await db.question.create({
      data: {
        question:    q.question,
        hint:        q.hint        ?? null,
        placeholder: q.placeholder ?? null,
        suffix:      q.suffix      ?? null,
        prefix:      q.prefix      ?? null,
        category:    q.category    ?? null,
        answer_type: q.answer_type,
      },
    });
    createdQuestions.push(created);
  }
  console.log(`Seeded ${createdQuestions.length} questions.`);

  // Seed default template with all questions
  const questionIds = createdQuestions.map((q) => q.q_id);
  const template = await db.template.create({
    data: {
      title:        "Brave Nullpunkt",
      short_title:  "Nullpunkt",
      description:  "Kartlegging av salgs- og markedssituasjon",
      question_ids: questionIds,
    },
  });
  console.log(`Seeded template: "${template.title}" (t_id=${template.t_id})`);

  // Seed test customer and questionnaire
  const customer = await db.customer.create({
    data: { name: "Eksempel AS" },
  });

  await db.questionnaire.create({
    data: {
      t_id:       template.t_id,
      c_id:       customer.c_id,
      link: "test-onboarding-demo",
    },
  });
  console.log(`Seeded test questionnaire: /k/test-onboarding-demo`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
