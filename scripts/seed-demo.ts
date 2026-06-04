/**
 * Demo seed script — replaces junk test data with realistic Norwegian B2B demo customers.
 * Keeps test-customer-001 and test-onboarding-demo intact (used for dev/QA).
 * Run: npx ts-node --skip-project scripts/seed-demo.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// All question IDs in order (matches lib/questions.ts)
const QUESTION_IDS = [
  "teamSize", "tenure", "avgAge", "icp", "meetingsPerRep",
  "closeRate", "dealSize", "salesCycle", "crm", "coldOutreach",
  "proposals", "leadSources", "salesProcess", "conversionTracking", "bottleneck",
];

const DEMO_CUSTOMERS = [
  {
    companyName: "[Demo] Nordtek Solutions AS",
    contactName: "Marte Hagen",
    contactEmail: "marte.hagen@nordtek.no",
    surveys: [
      {
        status: "submitted" as const,
        daysAgo: 45,
        answers: {
          teamSize: "6",
          tenure: "3",
          avgAge: "34",
          icp: "SaaS-selskaper med 50–200 ansatte i Norden, beslutningstaker er CTO eller salgsdirektør",
          meetingsPerRep: "10",
          closeRate: "28",
          dealSize: "120000",
          salesCycle: "45",
          crm: "HubSpot",
          coldOutreach: "Ca. 15 kalde LinkedIn-meldinger og 10 e-poster per uke per selger. Lite telefonbruk.",
          proposals: "8–10 tilbud per måned, pipeline på ca. 3,2 mill kr",
          leadSources: "Inbound (nettside, innhold)\nAnbefalinger / referrals",
          salesProcess: "Ja\nVi har en 5-stegs prosess: prospektering, discovery, demo, tilbud, closing. Ikke alt er dokumentert.",
          conversionTracking: "Vi følger SQL og close rate månedlig i HubSpot. MQL-til-SQL er ikke godt definert ennå.",
          bottleneck: "For lang tid fra tilbud til svar. Mange deals henger i «vurderer» i 3–6 uker uten fremdrift.",
        },
      },
      {
        status: "active" as const,
        daysAgo: 5,
        answers: {},
      },
    ],
  },
  {
    companyName: "[Demo] Bergvik Industri AS",
    contactName: "Tor Eriksen",
    contactEmail: "tor.eriksen@bergvik.no",
    surveys: [
      {
        status: "submitted" as const,
        daysAgo: 90,
        answers: {
          teamSize: "3",
          tenure: "7",
          avgAge: "48",
          icp: "Mellomstore industribedrifter (100–500 ansatte) i Norge og Sverige som kjøper vedlikeholdstjenester og reservedeler",
          meetingsPerRep: "6",
          closeRate: "40",
          dealSize: "350000",
          salesCycle: "90",
          crm: "Excel / regneark",
          coldOutreach: "Nesten ingenting. Vi lever på relasjoner og eksisterende kunder. Noe telefonprospektion mot nye.",
          proposals: "5–6 tilbud per måned, pipeline på ca. 8 mill kr",
          leadSources: "Anbefalinger / referrals\nEvents / messer",
          salesProcess: "Nei",
          conversionTracking: "Vi bruker ikke noe system. Salgsdirektør har oversikt i hodet og et Excel-ark.",
          bottleneck: "Vi mangler nye leads. Eksisterende kunder er lojale, men vi sliter med å nå nye prospekter.",
        },
      },
      {
        status: "submitted" as const,
        daysAgo: 10,
        answers: {
          teamSize: "4",
          tenure: "6",
          avgAge: "46",
          icp: "Mellomstore industribedrifter (100–500 ansatte) i Norge og Sverige som kjøper vedlikeholdstjenester og reservedeler",
          meetingsPerRep: "8",
          closeRate: "42",
          dealSize: "380000",
          salesCycle: "75",
          crm: "Pipedrive",
          coldOutreach: "Vi har ansatt en SDR som tar ca. 20 kalde samtaler per uke og sender 15 e-poster.",
          proposals: "7–8 tilbud per måned, pipeline på ca. 11 mill kr",
          leadSources: "Anbefalinger / referrals\nOutbound (kald kontakt)\nEvents / messer",
          salesProcess: "Ja\nVi har implementert en enkel playbook basert på Brave-anbefalingene.",
          conversionTracking: "Vi bruker nå Pipedrive og rapporterer SQL og close rate månedlig.",
          bottleneck: "Onboarding av den nye SDR-en tar lenger tid enn forventet. Fortsatt ikke full kapasitet.",
        },
      },
    ],
  },
  {
    companyName: "[Demo] Solberg & Partners AS",
    contactName: "Ingrid Solberg",
    contactEmail: "ingrid@solbergpartners.no",
    surveys: [
      {
        status: "submitted" as const,
        daysAgo: 30,
        answers: {
          teamSize: "2",
          tenure: "5",
          avgAge: "41",
          icp: "CFO og daglig leder i mellomstore norske selskaper (50–300 ansatte) som trenger strategisk rådgivning innen økonomi og drift",
          meetingsPerRep: "12",
          closeRate: "55",
          dealSize: "180000",
          salesCycle: "30",
          crm: "Pipedrive",
          coldOutreach: "Primært LinkedIn. Ca. 10–15 meldinger per uke, følger opp med e-post.",
          proposals: "4–5 tilbud per måned, pipeline på ca. 2,8 mill kr",
          leadSources: "Anbefalinger / referrals\nInbound (nettside, innhold)",
          salesProcess: "Ja\nVi har en tydelig discovery-fase før vi sender tilbud. Bruker spørsmålsrammeverk basert på MEDDIC.",
          conversionTracking: "Vi måler antall møter, tilbud og signerte kontrakter per kvartal. Ingen automatisering ennå.",
          bottleneck: "Vi to partnerne er også de eneste selgerne. Kapasitet er den største begrensningen for vekst.",
        },
      },
    ],
  },
  {
    companyName: "[Demo] Kystlogistikk AS",
    contactName: "Per Andersen",
    contactEmail: "per.andersen@kystlogistikk.no",
    surveys: [
      {
        status: "active" as const,
        daysAgo: 3,
        answers: {
          teamSize: "8",
          tenure: "4",
          avgAge: "37",
        },
      },
    ],
  },
  {
    companyName: "[Demo] Fjord Media Group AS",
    contactName: "Silje Dahl",
    contactEmail: "silje.dahl@fjordmedia.no",
    surveys: [
      {
        status: "submitted" as const,
        daysAgo: 14,
        answers: {
          teamSize: "5",
          tenure: "2",
          avgAge: "29",
          icp: "Norske merkevarer og e-handelsbedrifter med omsetning over 20 mill kr som ønsker å vokse digitalt",
          meetingsPerRep: "14",
          closeRate: "22",
          dealSize: "85000",
          salesCycle: "21",
          crm: "HubSpot",
          coldOutreach: "Mye. Vi kjører ca. 30 kalde LinkedIn-henvendelser og 40 e-poster per selger per uke. Pluss paid ads som genererer inbound.",
          proposals: "15–20 tilbud per måned, pipeline på ca. 4,5 mill kr",
          leadSources: "Inbound (nettside, innhold)\nOutbound (kald kontakt)\nAnbefalinger / referrals",
          salesProcess: "Ja\nVi bruker en standardisert discovery-template og tilbudsmal i HubSpot.",
          conversionTracking: "Vi har full trakt-tracking i HubSpot: MQL → SQL → tilbud → signert. Rapporterer ukentlig.",
          bottleneck: "Høy churn i første kontraktsår. Vi vinner dealsene, men mister kunder etter 6–12 måneder.",
        },
      },
      {
        status: "draft" as const,
        daysAgo: 1,
        answers: {},
      },
    ],
  },
  {
    companyName: "[Demo] Vinmonopolets Leverandør AS",
    contactName: "Håkon Bakke",
    contactEmail: "hakon.bakke@vl-as.no",
    surveys: [
      {
        status: "active" as const,
        daysAgo: 7,
        answers: {
          teamSize: "12",
          tenure: "6",
          avgAge: "44",
          icp: "Dagligvarekjeder og HoReCa-kjøpere i Skandinavia",
          meetingsPerRep: "7",
        },
      },
    ],
  },
];

async function main() {
  console.log("Cleaning up junk test data (keeping test-customer-001)...");

  // Delete in dependency order (no DB-level cascade in Neon)
  const surveysToDelete = await db.survey.findMany({
    where: { customer: { id: { not: "test-customer-001" } } },
    select: { id: true },
  });
  const surveyIds = surveysToDelete.map((s) => s.id);

  await db.answer.deleteMany({ where: { surveyId: { in: surveyIds } } });
  await db.surveyQuestion.deleteMany({ where: { surveyId: { in: surveyIds } } });
  await db.survey.deleteMany({ where: { id: { in: surveyIds } } });
  await db.customer.deleteMany({ where: { id: { not: "test-customer-001" } } });
  console.log(`  Deleted ${surveyIds.length} surveys and their answers, plus non-seed customers.`);

  // Get all question IDs that actually exist in DB (they should all be there from seed)
  const existingQuestions = await db.question.findMany({ select: { id: true } });
  const existingQuestionIds = new Set(existingQuestions.map((q) => q.id));
  const validQuestionIds = QUESTION_IDS.filter((id) => existingQuestionIds.has(id));

  console.log(`\nCreating ${DEMO_CUSTOMERS.length} demo customers...`);

  for (const customerData of DEMO_CUSTOMERS) {
    const customer = await db.customer.create({
      data: {
        companyName: customerData.companyName,
        contactName: customerData.contactName,
        contactEmail: customerData.contactEmail,
      },
    });
    console.log(`  Created: ${customer.companyName}`);

    for (const surveyData of customerData.surveys) {
      const sentAt = new Date(Date.now() - surveyData.daysAgo * 24 * 60 * 60 * 1000);
      const submittedAt = surveyData.status === "submitted"
        ? new Date(sentAt.getTime() + 3 * 24 * 60 * 60 * 1000) // submitted 3 days after sent
        : null;

      const token = Math.random().toString(36).slice(2, 12);

      const survey = await db.survey.create({
        data: {
          customerId: customer.id,
          token,
          status: surveyData.status,
          sentAt: surveyData.status !== "draft" ? sentAt : null,
          submittedAt,
          templateId: "default-template",
        },
      });

      // Add all questions to the survey
      await db.surveyQuestion.createMany({
        data: validQuestionIds.map((qId, i) => ({
          surveyId: survey.id,
          questionId: qId,
          order: i,
        })),
      });

      // Create answers for answered questions
      const answerEntries = Object.entries(surveyData.answers);
      if (answerEntries.length > 0) {
        await db.answer.createMany({
          data: answerEntries
            .filter(([qId]) => existingQuestionIds.has(qId))
            .map(([questionId, value]) => ({
              surveyId: survey.id,
              questionId,
              value: value as string,
              skipped: false,
            })),
        });
      }

      console.log(`    Survey [${survey.status}] token=${token} answers=${answerEntries.length}`);
    }
  }

  console.log("\nDone! Demo data seeded successfully.");
  console.log("Kept: /k/test-onboarding-demo (test-customer-001)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
