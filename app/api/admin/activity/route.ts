import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type ActivityEvent = {
  type: "answer" | "submit";
  companyName: string;
  surveyId: string;
  questionLabel?: string;
  timestamp: string;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.email?.endsWith("@thebrave.no")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [answers, submissions] = await Promise.all([
    db.answer.findMany({
      where: {
        updatedAt: { gte: since },
        survey: { status: "active" },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        survey: { include: { customer: { select: { companyName: true } } } },
        question: { select: { label: true } },
      },
    }),
    db.survey.findMany({
      where: { status: "submitted", submittedAt: { gte: since } },
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: { customer: { select: { companyName: true } } },
    }),
  ]);

  const events: ActivityEvent[] = [
    ...answers.map((a) => ({
      type: "answer" as const,
      companyName: a.survey.customer.companyName,
      surveyId: a.surveyId,
      questionLabel: a.question.label,
      timestamp: a.updatedAt.toISOString(),
    })),
    ...submissions.map((s) => ({
      type: "submit" as const,
      companyName: s.customer.companyName,
      surveyId: s.id,
      timestamp: (s.submittedAt ?? s.createdAt).toISOString(),
    })),
  ];

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(events.slice(0, 15));
}
